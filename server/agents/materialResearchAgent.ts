const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const AGENT_MODEL = "claude-sonnet-4-20250514";
const QUERY_DELAY_MS = 90_000;

const SYSTEM_PROMPT = `You are a building materials research assistant. Search the web to find ONE specific, real building material product sourced or commonly used in Northern Michigan. Return ONLY a valid JSON object with no other text, no markdown, and no code fences.

Required fields:
{
  "name": "specific product name, e.g. Michigan White Pine Dimensional Lumber 2x4",
  "category": "one of: Timber, Steel, Concrete, Earth, Insulation, Composites, Masonry, Roofing, Cladding, Flooring, Windows, Mechanical, Finishes, Foundation, Landscaping",
  "functionalUnit": "unit of measure, e.g. m³, m², kg, linear meter, unit",
  "totalCarbon": number (kg CO₂e per functional unit, cradle to gate),
  "costPerUnit": number (USD per functional unit),
  "risScore": integer 0-100 (higher = more regenerative),
  "lisScore": integer 0-100 (higher = better lifecycle performance),
  "isRegenerative": 0 or 1,
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

// 50 queries — ~3-4 per category, each targeting a distinct product angle
const SEARCH_QUERIES: Array<{ category: string; query: string }> = [
  // Timber (4)
  { category: "Timber", query: "Northern Michigan white pine framing lumber 2x6 embodied carbon kg CO2e per m3 supplier Traverse City" },
  { category: "Timber", query: "Michigan engineered LVL laminated veneer lumber beam embodied carbon EPD kg CO2e per m3" },
  { category: "Timber", query: "Northern Michigan reclaimed barn wood salvaged timber embodied carbon building reuse supplier" },
  { category: "Timber", query: "Michigan cross-laminated timber CLT panel mass timber embodied carbon kg CO2e per m3 manufacturer" },

  // Steel (3)
  { category: "Steel", query: "Northern Michigan structural steel wide flange W-beam embodied carbon EPD kg CO2e per tonne fabricator" },
  { category: "Steel", query: "Michigan light gauge steel framing cold-formed steel stud embodied carbon kg CO2e per kg supplier" },
  { category: "Steel", query: "Michigan rebar deformed steel reinforcing bar embodied carbon kg CO2e per tonne local supplier" },

  // Concrete (4)
  { category: "Concrete", query: "Northern Michigan ready-mix concrete 4000 psi embodied carbon kg CO2e per m3 local batch plant Petoskey" },
  { category: "Concrete", query: "Michigan precast concrete panel wall system embodied carbon kg CO2e per m2 manufacturer" },
  { category: "Concrete", query: "Northern Michigan insulating concrete forms ICF polystyrene embodied carbon kg CO2e per m2" },
  { category: "Concrete", query: "Michigan fly ash supplementary cementitious material concrete mix embodied carbon reduction kg CO2e per m3" },

  // Earth (3)
  { category: "Earth", query: "Northern Michigan rammed earth wall construction embodied carbon kg CO2e per m3 contractor builder" },
  { category: "Earth", query: "Michigan compressed stabilized earth block CSEB adobe brick embodied carbon kg CO2e per unit" },
  { category: "Earth", query: "Michigan natural clay plaster earthen wall finish embodied carbon kg CO2e per m2 supplier" },

  // Insulation (4)
  { category: "Insulation", query: "Northern Michigan blown cellulose insulation recycled paper embodied carbon kg CO2e per m2 installer" },
  { category: "Insulation", query: "Michigan mineral wool rockwool batts board insulation embodied carbon kg CO2e per m2 supplier" },
  { category: "Insulation", query: "Northern Michigan closed-cell spray polyurethane foam insulation embodied carbon kg CO2e per m2" },
  { category: "Insulation", query: "Michigan rigid EPS expanded polystyrene foam board insulation embodied carbon kg CO2e per m2" },

  // Composites (3)
  { category: "Composites", query: "Northern Michigan fiber cement board siding James Hardie HardiePlank embodied carbon kg CO2e per m2 supplier" },
  { category: "Composites", query: "Michigan fiberglass composite structural panel FRP embodied carbon kg CO2e per m2 manufacturer" },
  { category: "Composites", query: "Michigan wood-plastic composite WPC decking embodied carbon kg CO2e per m2 supplier Northern Michigan" },

  // Masonry (4)
  { category: "Masonry", query: "Northern Michigan concrete masonry unit CMU 8-inch block embodied carbon kg CO2e per unit local supplier" },
  { category: "Masonry", query: "Michigan clay brick residential veneer embodied carbon kg CO2e per unit manufacturer Midwest" },
  { category: "Masonry", query: "Northern Michigan fieldstone rubble stone masonry embodied carbon kg CO2e per m3 local quarry" },
  { category: "Masonry", query: "Michigan split-face block decorative concrete masonry unit embodied carbon kg CO2e per m2" },

  // Roofing (4)
  { category: "Roofing", query: "Northern Michigan standing seam metal roof steel Galvalume embodied carbon kg CO2e per m2 installer" },
  { category: "Roofing", query: "Michigan asphalt architectural shingle 30-year roofing embodied carbon kg CO2e per m2 supplier" },
  { category: "Roofing", query: "Northern Michigan white cedar shake shingle roofing embodied carbon kg CO2e per m2 local mill" },
  { category: "Roofing", query: "Michigan TPO thermoplastic polyolefin membrane flat roof embodied carbon kg CO2e per m2 supplier" },

  // Cladding (3)
  { category: "Cladding", query: "Northern Michigan white cedar bevel siding wood cladding embodied carbon kg CO2e per m2 local mill" },
  { category: "Cladding", query: "Michigan board and batten pine siding vertical wood cladding embodied carbon kg CO2e per m2" },
  { category: "Cladding", query: "Northern Michigan corrugated steel metal panel cladding Corten weathering steel embodied carbon kg CO2e per m2" },

  // Flooring (3)
  { category: "Flooring", query: "Northern Michigan hard maple hardwood flooring solid 3/4 inch embodied carbon kg CO2e per m2 local mill" },
  { category: "Flooring", query: "Michigan white oak engineered hardwood flooring embodied carbon kg CO2e per m2 manufacturer" },
  { category: "Flooring", query: "Michigan polished concrete floor slab residential embodied carbon kg CO2e per m2 contractor" },

  // Windows (3)
  { category: "Windows", query: "Northern Michigan triple-pane fiberglass window Pella Marvin embodied carbon kg CO2e per m2 supplier" },
  { category: "Windows", query: "Michigan wood-clad double-pane window assembly embodied carbon kg CO2e per m2 manufacturer local" },
  { category: "Windows", query: "Northern Michigan aluminum-clad wood window fixed picture window embodied carbon kg CO2e per m2" },

  // Mechanical (4)
  { category: "Mechanical", query: "Northern Michigan cold-climate air source heat pump Mitsubishi Bosch embodied carbon kg CO2e per unit installer" },
  { category: "Mechanical", query: "Michigan ground-source geothermal heat pump system embodied carbon kg CO2e per unit contractor" },
  { category: "Mechanical", query: "Northern Michigan wood pellet boiler biomass heating system embodied carbon kg CO2e per unit supplier" },
  { category: "Mechanical", query: "Michigan heat recovery ventilator HRV energy recovery ventilation embodied carbon kg CO2e per unit supplier" },

  // Finishes (3)
  { category: "Finishes", query: "Northern Michigan zero-VOC interior latex paint Benjamin Moore Sherwin-Williams embodied carbon kg CO2e per liter" },
  { category: "Finishes", query: "Michigan lime putty plaster interior wall finish embodied carbon kg CO2e per m2 supplier" },
  { category: "Finishes", query: "Northern Michigan linseed oil wood finish natural oil penetrating sealer embodied carbon kg CO2e per liter" },

  // Foundation (3)
  { category: "Foundation", query: "Northern Michigan poured concrete frost wall foundation 8-inch wall embodied carbon kg CO2e per m2 contractor" },
  { category: "Foundation", query: "Michigan grade beam slab on grade concrete foundation embodied carbon kg CO2e per m2 residential" },
  { category: "Foundation", query: "Northern Michigan helical pier screw pile steel foundation embodied carbon kg CO2e per unit installer" },

  // Landscaping (3)
  { category: "Landscaping", query: "Northern Michigan native prairie grass seed mix landscaping embodied carbon kg CO2e per m2 local nursery" },
  { category: "Landscaping", query: "Michigan natural limestone gravel permeable driveway paving embodied carbon kg CO2e per tonne local quarry" },
  { category: "Landscaping", query: "Northern Michigan rain garden bioswale native plantings stormwater management embodied carbon kg CO2e per m2" },
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

async function callClaudeWithWebSearch(userQuery: string): Promise<string | null> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");

  const messages: any[] = [{ role: "user", content: userQuery }];

  for (let turn = 0; turn < 6; turn++) {
    const res = await fetch(CLAUDE_API_URL, {
      method: "POST",
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
    });

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

function extractJson(text: string): MaterialData | null {
  const raw = text.trim();
  const candidates = [
    raw,
    raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""),
    (raw.match(/\{[\s\S]*\}/) ?? [])[0] ?? "",
  ];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed.name === "string" && typeof parsed.totalCarbon === "number") {
        return parsed as MaterialData;
      }
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
      functional_unit: (data.functionalUnit ?? "m²").slice(0, 50),
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

  await supabaseRest("/rest/v1/regional_data", {
    method: "POST",
    headers: { Prefer: "return=minimal,resolution=ignore-duplicates" },
    body: JSON.stringify({
      material_id: materialId,
      region: "Northern Michigan",
      state_province: "MI",
      country: "US",
      supplier_name: data.manufacturer ? data.manufacturer.slice(0, 255) : null,
      price_per_unit: safeNum(data.costPerUnit),
      currency: "USD",
      unit: (data.functionalUnit ?? "m²").slice(0, 50),
      transport_method: data.transportMethod ? data.transportMethod.slice(0, 100) : null,
      transport_distance_km: data.transportDistanceKm ? Math.round(safeNum(data.transportDistanceKm)) : null,
      availability_status: "in_stock",
      last_updated: new Date().toISOString().split("T")[0],
    }),
  }).catch((e) => console.warn(`[MaterialResearchAgent] regional_data skipped: ${e.message}`));

  return { inserted: wasNew, skipped: !wasNew };
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
    } catch (err: any) {
      const message = err?.message ?? String(err);
      console.error(`[MaterialResearchAgent] Error [${category}]:`, message);
      summary.errors.push({ category, error: message });
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
