const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const AGENT_MODEL = "claude-sonnet-4-20250514";
const QUERY_DELAY_MS = 90_000;

const SYSTEM_PROMPT = `You are a building materials research assistant for a US residential architecture tool. Search the web to find ONE specific, real building material product sourced or commonly used in Northern Michigan. Return ONLY a valid JSON object with no other text, no markdown, and no code fences. If you cannot find exact embodied carbon data, use a reasonable industry estimate and set confidenceLevel to "Low" — never return prose or an explanation instead of JSON.

Use imperial units for functionalUnit — the correct unit by material type:
- Dimensional lumber, framing, beams, rebar, structural members → "linear ft"
- Plywood, OSB, sheet goods, cladding, siding, roofing, flooring, insulation batts/board, masonry, wall systems → "sq ft"
- Concrete, ready-mix, grout, earth, soil → "cubic yard"
- Spray foam insulation, loose-fill insulation → "cubic ft"
- Windows, doors, mechanical equipment (heat pumps, HRVs, boilers) → "each"
- Paint, primers, sealers, liquid finishes → "gallon"
- Landscaping, ground cover, lawn → "sq ft"

Required fields:
{
  "name": "standardized product name — format: [Species/Material] [Product Type] [Dimension/Grade], dimensions and sizes ALWAYS last. Examples: 'Northern Michigan White Pine Dimensional Lumber 2x6', 'Northern Michigan Eastern White Pine Board & Batten Siding 1x10', 'ROCKWOOL ComfortBatt Stone Wool Insulation R-15'. NEVER lead with a dimension or size (e.g. NOT '2x6 White Pine Lumber', NOT '1x10 Eastern White Pine...'). Always include regional qualifier 'Northern Michigan' or 'Michigan' where applicable.",
  "category": "one of: Timber, Steel, Concrete, Earth, Insulation, Composites, Masonry, Roofing, Cladding, Flooring, Windows, Mechanical, Finishes, Foundation, Landscaping",
  "functionalUnit": "imperial unit from the list above, e.g. linear ft, sq ft, cubic yard, each, gallon",
  "totalCarbon": number (kg CO₂e per functional unit, cradle to gate),
  "costPerUnit": number (USD per functional unit),
  "risScore": integer 0–100 derived from the material's actual ecological profile — NEVER use 65 as a default. Assign using these calibration anchors:
    0–24  High-impact: petroleum-derived or heavily processed (asphalt shingles, closed-cell spray foam with HFO blowing agents, PVC siding, conventional synthetic carpet, rubber membrane roofing)
    25–49 Standard: commodity materials with no special environmental benefit (standard ready-mix concrete, CMU block, conventional gypsum drywall, fiberglass batt insulation, standard aluminum, structural steel from virgin ore)
    50–74 Low-impact: measurably reduced burden or high recycled content (mineral wool / rockwool insulation, EAF recycled-content steel, fiber cement cladding, triple-pane glass, cellulose insulation, engineered wood products like LVL or I-joists, high-recycled-content materials)
    75–100 Regenerative: actively sequesters carbon, restores ecosystems, or enables true circularity (sustainably harvested timber, CLT and mass timber with long-term carbon lock-in, hempcrete, cork, reclaimed or salvaged materials, green/living roof systems, bamboo, mycelium composites)
    A score in the 60–69 range is only valid if the material genuinely falls in the Low-impact band with specific justification. When uncertain, pick the most appropriate tier based on material category and known ecological properties — never default to 65,
  "lisScore": integer 0-100 (higher = better lifecycle performance),
  "isRegenerative": 0 or 1 — set to 1 ONLY if the material actively sequesters carbon, restores ecosystems, or improves environmental conditions. Qualifying materials: rammed earth, compressed earth blocks (natural composition, minimal processing, carbon-stable mass wall), hemp-based products, hempcrete, mycelium, cork, green roof systems, sustainably harvested timber (carbon storage in wood), CLT and mass timber (long-term carbon lock-in), reclaimed wood (no new harvest). Do NOT set to 1 for: concrete variants (ready-mix, precast, ICF, CMU), steel, insulation (fiberglass, mineral wool, spray foam, cellulose), mechanical systems (heat pumps, HRVs), energy-efficient products, low-VOC coatings, recycled-content plastics or synthetics, or any material whose primary benefit is reduced impact rather than active restoration,
  "description": "1-2 sentences describing the material and its Northern Michigan relevance",
  "manufacturer": "manufacturer or regional supplier name",
  "region": "Northern Michigan",
  "source": "URL or source name where carbon data was found",
  "confidenceLevel": "High, Medium, or Low",
  "a1a3": number (kg CO₂e, manufacturing A1-A3),
  "a4": number (kg CO₂e, transport A4),
  "a5": number (kg CO₂e, installation A5),
  "b": number (kg CO₂e, use phase B),
  "c1c4": number (kg CO₂e, end of life C1-C4),
  "transportMethod": "e.g. truck, rail, ship, local",
  "transportDistanceKm": number (estimated km from supplier to Northern Michigan job site)
}`;

// 25 queries — best coverage across all 15 categories, Northern Michigan specificity prioritized
const SEARCH_QUERIES: Array<{ category: string; query: string }> = [
  // Timber (3) — local mills and mass timber
  { category: "Timber", query: "Northern Michigan white pine framing lumber 2x6 embodied carbon kg CO2e per m3 supplier Traverse City" },
  { category: "Timber", query: "Northern Michigan reclaimed barn wood salvaged timber embodied carbon building reuse supplier" },
  { category: "Timber", query: "Michigan cross-laminated timber CLT panel mass timber embodied carbon kg CO2e per m3 manufacturer" },

  // Steel (1)
  { category: "Steel", query: "Northern Michigan structural steel wide flange W-beam embodied carbon EPD kg CO2e per tonne fabricator" },

  // Concrete (2)
  { category: "Concrete", query: "Northern Michigan ready-mix concrete 4000 psi embodied carbon kg CO2e per m3 local batch plant Petoskey" },
  { category: "Concrete", query: "Northern Michigan insulating concrete forms ICF polystyrene embodied carbon kg CO2e per m2" },

  // Earth (1)
  { category: "Earth", query: "Northern Michigan rammed earth wall construction embodied carbon kg CO2e per m3 contractor builder" },

  // Insulation (2) — cold climate critical
  { category: "Insulation", query: "Northern Michigan blown cellulose insulation recycled paper embodied carbon kg CO2e per m2 installer" },
  { category: "Insulation", query: "Michigan mineral wool rockwool batts board insulation embodied carbon kg CO2e per m2 supplier" },

  // Composites (1)
  { category: "Composites", query: "Northern Michigan fiber cement board siding James Hardie HardiePlank embodied carbon kg CO2e per m2 supplier" },

  // Masonry (2) — fieldstone is hyperlocal
  { category: "Masonry", query: "Northern Michigan fieldstone rubble stone masonry embodied carbon kg CO2e per m3 local quarry" },
  { category: "Masonry", query: "Northern Michigan concrete masonry unit CMU 8-inch block embodied carbon kg CO2e per unit local supplier" },

  // Roofing (2) — standing seam and cedar both common in NM
  { category: "Roofing", query: "Northern Michigan standing seam metal roof steel Galvalume embodied carbon kg CO2e per m2 installer" },
  { category: "Roofing", query: "Northern Michigan white cedar shake shingle roofing embodied carbon kg CO2e per m2 local mill" },

  // Cladding (2) — cedar and board-and-batten define NM vernacular
  { category: "Cladding", query: "Northern Michigan white cedar bevel siding wood cladding embodied carbon kg CO2e per m2 local mill" },
  { category: "Cladding", query: "Michigan board and batten pine siding vertical wood cladding embodied carbon kg CO2e per m2" },

  // Flooring (1)
  { category: "Flooring", query: "Northern Michigan hard maple hardwood flooring solid 3/4 inch embodied carbon kg CO2e per m2 local mill" },

  // Windows (2) — cold climate demands high-performance glazing
  { category: "Windows", query: "Northern Michigan triple-pane fiberglass window Pella Marvin embodied carbon kg CO2e per m2 supplier" },
  { category: "Windows", query: "Michigan wood-clad double-pane window assembly embodied carbon kg CO2e per m2 manufacturer local" },

  // Mechanical (2) — heat pumps and HRV essential for tight NM homes
  { category: "Mechanical", query: "Northern Michigan cold-climate air source heat pump Mitsubishi Bosch embodied carbon kg CO2e per unit installer" },
  { category: "Mechanical", query: "Michigan heat recovery ventilator HRV energy recovery ventilation embodied carbon kg CO2e per unit supplier" },

  // Finishes (1)
  { category: "Finishes", query: "Northern Michigan zero-VOC interior latex paint Benjamin Moore Sherwin-Williams embodied carbon kg CO2e per liter" },

  // Foundation (1)
  { category: "Foundation", query: "Northern Michigan poured concrete frost wall foundation 8-inch wall embodied carbon kg CO2e per m2 contractor" },

  // Landscaping (1)
  { category: "Landscaping", query: "Northern Michigan native prairie grass seed mix landscaping embodied carbon kg CO2e per m2 local nursery" },
];

interface MaterialData {
  name: string;
  category: string;
  functionalUnit: string;
  totalCarbon: number;
  costPerUnit: number;
  risScore: number;
  lisScore: number;
  isRegenerative: number;
  description: string;
  manufacturer: string;
  region: string;
  source: string;
  confidenceLevel: "High" | "Medium" | "Low";
  a1a3: number;
  a4: number;
  a5: number;
  b: number;
  c1c4: number;
  transportMethod: string;
  transportDistanceKm: number;
}

// ---------------------------------------------------------------------------
// Supabase REST helper (same pattern as server/lib/auth.ts)
// ---------------------------------------------------------------------------

async function supabaseRest(
  path: string,
  options: RequestInit & { headers?: Record<string, string> } = {}
): Promise<any> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");

  const res = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers ?? {}),
    },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// ---------------------------------------------------------------------------
// Job logging
// ---------------------------------------------------------------------------

async function createJobLog(): Promise<string | null> {
  try {
    const rows = await supabaseRest("/rest/v1/agent_job_logs", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status: "running" }),
    });
    return Array.isArray(rows) && rows.length > 0 ? rows[0].id : null;
  } catch (e: any) {
    console.warn("[MaterialResearchAgent] Could not create job log:", e.message);
    return null;
  }
}

async function finalizeJobLog(
  jobId: string | null,
  summary: AgentSummary,
  status: "completed" | "failed"
): Promise<void> {
  if (!jobId) return;
  try {
    await supabaseRest(`/rest/v1/agent_job_logs?id=eq.${jobId}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        completed_at: new Date().toISOString(),
        queries_run: summary.queriesRun,
        inserted: summary.inserted,
        skipped: summary.skipped,
        errors: summary.errors,
        status,
      }),
    });
  } catch (e: any) {
    console.warn("[MaterialResearchAgent] Could not finalize job log:", e.message);
  }
}

// ---------------------------------------------------------------------------
// Claude web search
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT_MS = 120_000; // 120s per API turn — allows multi-turn web search

async function callClaudeWithWebSearch(userQuery: string): Promise<string | null> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");

  const messages: any[] = [{ role: "user", content: userQuery }];

  for (let turn = 0; turn < 6; turn++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(CLAUDE_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05",
      },
      body: JSON.stringify({
        model: AGENT_MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
        messages,
      }),
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Claude API ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data: any = await res.json();

    if (data.stop_reason === "end_turn") {
      const textBlock = (data.content ?? []).find((c: any) => c.type === "text");
      return textBlock?.text ?? null;
    }

    if (data.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: data.content });
      const toolResults = (data.content as any[])
        .filter((c) => c.type === "tool_use")
        .map((c) => ({
          type: "tool_result",
          tool_use_id: c.id,
          content: "",
        }));
      messages.push({ role: "user", content: toolResults });
      continue;
    }

    break;
  }

  return null;
}

// ---------------------------------------------------------------------------
// JSON parsing helpers
// ---------------------------------------------------------------------------

/**
 * Coerce a value that Claude may return as a string or number to a number.
 * Returns 0 if the value is missing or unparseable.
 */
function coerceNum(v: unknown): number {
  if (typeof v === "number") return isNaN(v) ? 0 : v;
  const n = parseFloat(String(v ?? ""));
  return isNaN(n) ? 0 : n;
}

export function extractJson(text: string): MaterialData | null {
  // Strip BOM and outer whitespace
  const raw = text.trim().replace(/^﻿/, "");

  const candidates: string[] = [];

  // 1. Content captured inside any markdown code fence (non-greedy)
  //    Handles: ```json\n{...}\n``` and ```\n{...}\n```
  const fenceMatch = raw.match(/```(?:json)?[ \t]*\r?\n?([\s\S]*?)```/i);
  if (fenceMatch?.[1]) candidates.push(fenceMatch[1].trim());

  // 2. Outermost {...} using first-open / last-close brace.
  //    More reliable than a greedy /\{[\s\S]*\}/ which extends to the
  //    last } in the entire string, including any trailing prose.
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(raw.slice(firstBrace, lastBrace + 1));
  }

  // 3. Raw text as-is (already-clean JSON responses)
  candidates.push(raw);

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate);
      if (!parsed || typeof parsed.name !== "string") continue;

      // Accept totalCarbon as a number OR a numeric string
      const totalCarbon = coerceNum(parsed.totalCarbon);
      if (totalCarbon === 0 && parsed.totalCarbon == null) continue;
      parsed.totalCarbon = totalCarbon;

      // Coerce remaining numeric fields — Claude occasionally returns strings
      for (const field of [
        "costPerUnit", "risScore", "lisScore", "isRegenerative",
        "a1a3", "a4", "a5", "b", "c1c4", "transportDistanceKm",
      ] as const) {
        if (parsed[field] !== undefined) parsed[field] = coerceNum(parsed[field]);
      }

      return parsed as MaterialData;
    } catch {
      // try next candidate
    }
  }
  return null;
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = Math.round(Number(value) || 0);
  return Math.min(Math.max(n, min), max);
}

function safeNum(value: unknown): number {
  const n = parseFloat(String(value));
  return isNaN(n) ? 0 : n;
}

function confidenceToScore(level: string): number {
  if (level === "High") return 85;
  if (level === "Medium") return 60;
  return 30;
}

function confidenceToVerification(_level: string): string {
  return "self_declared";
}

// ---------------------------------------------------------------------------
// Database writes via Supabase REST
// Real table names (inspected from Supabase):
//   materials         — name, category, manufacturer, description, data_quality_score, source
//   carbon_footprints — material_id, a1_a3_manufacturing, a4_transport, a5_installation,
//                       b1_b7_use_phase, c1_c4_end_of_life, total_carbon_cradle_to_gate,
//                       total_carbon_cradle_to_grave, functional_unit, source, verification_status
//   lis_ris_scores    — material_id, lis_score, ris_score, baseline_region,
//                       calculation_version, calculation_date
//   regional_data     — material_id, region, state_province, country, supplier_name,
//                       price_per_unit, currency, unit, transport_method,
//                       transport_distance_km, availability_status
// ---------------------------------------------------------------------------

async function insertMaterial(data: MaterialData): Promise<{ inserted: boolean; skipped: boolean }> {
  const name = data.name.slice(0, 255);

  const inserted = await supabaseRest("/rest/v1/materials", {
    method: "POST",
    headers: { Prefer: "return=representation,resolution=ignore-duplicates" },
    body: JSON.stringify({
      name,
      category: data.category.toLowerCase(),
      manufacturer: data.manufacturer ? data.manufacturer.slice(0, 255) : null,
      description: data.description ?? null,
      data_quality_score: confidenceToScore(data.confidenceLevel),
      source: data.source ? data.source.slice(0, 255) : null,
    }),
  });

  // Resolve UUID — may be empty array if duplicate was ignored
  let materialId: string | null = null;
  if (Array.isArray(inserted) && inserted.length > 0) {
    materialId = inserted[0].id;
  } else {
    const existing = await supabaseRest(
      `/rest/v1/materials?name=eq.${encodeURIComponent(name)}&select=id&limit=1`
    );
    materialId = Array.isArray(existing) && existing.length > 0 ? existing[0].id : null;
  }

  if (!materialId) return { inserted: false, skipped: true };

  const wasNew = Array.isArray(inserted) && inserted.length > 0;
  const totalCarbon = safeNum(data.totalCarbon);
  const c1c4 = safeNum(data.c1c4);

  await supabaseRest("/rest/v1/carbon_footprints", {
    method: "POST",
    headers: { Prefer: "return=minimal,resolution=ignore-duplicates" },
    body: JSON.stringify({
      material_id: materialId,
      a1_a3_manufacturing: safeNum(data.a1a3),
      a4_transport: safeNum(data.a4),
      a5_installation: safeNum(data.a5),
      b1_b7_use_phase: safeNum(data.b),
      c1_c4_end_of_life: c1c4,
      total_carbon_cradle_to_gate: totalCarbon,
      total_carbon_cradle_to_grave: totalCarbon + c1c4,
      functional_unit: (data.functionalUnit ?? "sq ft").slice(0, 50),
      source: (data.source ?? "Web research").slice(0, 255),
      verification_status: confidenceToVerification(data.confidenceLevel),
    }),
  }).catch((e) => console.warn(`[MaterialResearchAgent] carbon_footprints skipped: ${e.message}`));

  await supabaseRest("/rest/v1/lis_ris_scores", {
    method: "POST",
    headers: { Prefer: "return=minimal,resolution=ignore-duplicates" },
    body: JSON.stringify({
      material_id: materialId,
      lis_score: clampInt(data.lisScore, 0, 100),
      ris_score: clampInt(data.risScore, 0, 100),
      baseline_region: "Great Lakes",
      calculation_version: "1.0",
      calculation_date: new Date().toISOString().split("T")[0],
    }),
  }).catch((e) => console.warn(`[MaterialResearchAgent] lis_ris_scores skipped: ${e.message}`));

  // regional_data has no unique constraint on (material_id, region), so
  // resolution=ignore-duplicates would do nothing. Guard with an existence
  // check instead to prevent duplicate rows accumulating across runs.
  const rdExists = await supabaseRest(
    `/rest/v1/regional_data?material_id=eq.${materialId}&region=eq.${encodeURIComponent("Northern Michigan")}&select=id&limit=1`
  );
  if (!Array.isArray(rdExists) || rdExists.length === 0) {
    await supabaseRest("/rest/v1/regional_data", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        material_id: materialId,
        region: "Northern Michigan",
        state_province: "MI",
        country: "US",
        supplier_name: data.manufacturer ? data.manufacturer.slice(0, 255) : null,
        price_per_unit: safeNum(data.costPerUnit),
        currency: "USD",
        unit: (data.functionalUnit ?? "sq ft").slice(0, 50),
        transport_method: data.transportMethod ? data.transportMethod.slice(0, 100) : null,
        transport_distance_km: data.transportDistanceKm ? Math.round(safeNum(data.transportDistanceKm)) : null,
        availability_status: "in_stock",
      }),
    });
  }

  return { inserted: wasNew, skipped: !wasNew };
}

// ---------------------------------------------------------------------------
// Single-material targeted research (used by the admin approval flow)
// ---------------------------------------------------------------------------

export async function researchAndInsertSingleMaterial(submission: {
  name: string;
  category: string;
  carbonValue?: number | null;
  functionalUnit?: string | null;
  description?: string | null;
  manufacturer?: string | null;
  source?: string | null;
}): Promise<{ inserted: boolean; skipped: boolean; researched: boolean }> {
  const { name, category } = submission;
  const query = `"${name}" embodied carbon kg CO2e per unit EPD data building material Northern Michigan`;

  console.log(`[MaterialResearchAgent] Targeted research: "${name}" (${category})`);

  try {
    const rawText = await callClaudeWithWebSearch(query);
    if (!rawText) throw new Error("Empty response from Claude");

    const data = extractJson(rawText);
    if (!data) throw new Error(`Could not parse JSON: ${rawText.slice(0, 120)}`);

    // Pin name and category to the submission values so naming convention is preserved
    data.name = name;
    data.category = category;

    const result = await insertMaterial(data);
    console.log(`[MaterialResearchAgent] Targeted insert ${result.inserted ? "succeeded" : "skipped (duplicate)"}: "${name}"`);
    return { ...result, researched: true };
  } catch (err: any) {
    console.warn(`[MaterialResearchAgent] Targeted research failed for "${name}": ${err?.message}`);

    // Fall back to submitter-provided carbon data if present
    if (submission.carbonValue != null && submission.carbonValue > 0) {
      console.log(`[MaterialResearchAgent] Inserting "${name}" with submission fallback data (Low confidence)`);
      const fallback: MaterialData = {
        name,
        category,
        functionalUnit: submission.functionalUnit ?? "sq ft",
        totalCarbon: submission.carbonValue,
        costPerUnit: 0,
        risScore: 0,
        lisScore: 0,
        isRegenerative: 0,
        description: submission.description ?? "",
        manufacturer: submission.manufacturer ?? "",
        region: "Northern Michigan",
        source: submission.source ?? "Community submission",
        confidenceLevel: "Low",
        a1a3: submission.carbonValue * 0.9,
        a4: submission.carbonValue * 0.1,
        a5: 0,
        b: 0,
        c1c4: 0,
        transportMethod: "truck",
        transportDistanceKm: 200,
      };
      const result = await insertMaterial(fallback);
      return { ...result, researched: false };
    }

    throw err;
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export interface AgentSummary {
  queriesRun: number;
  inserted: number;
  skipped: number;
  errors: { category: string; error: string }[];
}

export async function runMaterialResearchAgent(): Promise<AgentSummary> {
  const summary: AgentSummary = { queriesRun: 0, inserted: 0, skipped: 0, errors: [] };

  const jobId = await createJobLog();
  console.log(`[MaterialResearchAgent] Job started — log id: ${jobId ?? "unavailable"}`);

  // Initial delay to avoid rate limit hit from any recent API activity
  console.log("[MaterialResearchAgent] Waiting 30s before first query...");
  await new Promise((resolve) => setTimeout(resolve, 30_000));

  for (let i = 0; i < SEARCH_QUERIES.length; i++) {
    const { category, query } = SEARCH_QUERIES[i];
    summary.queriesRun++;

    let attempt = 0;
    let succeeded = false;
    while (attempt < 2 && !succeeded) {
      if (attempt > 0) {
        console.log(`[MaterialResearchAgent] Retrying [${category}] after 15s...`);
        await new Promise((resolve) => setTimeout(resolve, 15_000));
      }
      try {
        console.log(`[MaterialResearchAgent] [${i + 1}/${SEARCH_QUERIES.length}] ${category}: ${query.slice(0, 60)}...`);
        const rawText = await callClaudeWithWebSearch(query);
        if (!rawText) throw new Error("Empty response from Claude");

        const data = extractJson(rawText);
        if (!data) throw new Error(`Could not parse JSON: ${rawText.slice(0, 120)}`);

        data.category = category;
        const result = await insertMaterial(data);
        if (result.inserted) {
          summary.inserted++;
          console.log(`[MaterialResearchAgent] Inserted: ${data.name}`);
        } else {
          summary.skipped++;
          console.log(`[MaterialResearchAgent] Skipped (duplicate): ${data.name}`);
        }
        succeeded = true;
      } catch (err: any) {
        const message = err?.message ?? String(err);
        if (attempt === 0) {
          console.warn(`[MaterialResearchAgent] Attempt 1 failed [${category}]: ${message}`);
        } else {
          console.error(`[MaterialResearchAgent] Error [${category}]:`, message);
          summary.errors.push({ category, error: message });
        }
      }
      attempt++;
    }

    // Delay between queries to stay under the 30k token/min rate limit
    if (i < SEARCH_QUERIES.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, QUERY_DELAY_MS));
    }
  }

  const finalStatus = summary.errors.length === SEARCH_QUERIES.length ? "failed" : "completed";
  await finalizeJobLog(jobId, summary, finalStatus);
  console.log(`[MaterialResearchAgent] Done — ${summary.inserted} inserted, ${summary.skipped} skipped, ${summary.errors.length} errors`);

  return summary;
}
