const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const AGENT_MODEL = "claude-sonnet-4-20250514";
const QUERY_DELAY_MS = 65_000;

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

const SEARCH_QUERIES: Record<string, string> = {
  Timber: "Northern Michigan timber framing lumber dimensional lumber embodied carbon kg CO2e per m3 local supplier",
  Steel: "Northern Michigan structural steel wide flange beam embodied carbon EPD kg CO2e per tonne supplier",
  Concrete: "Northern Michigan ready mix concrete 4000 psi embodied carbon kg CO2e per m3 local batch plant",
  Earth: "Northern Michigan rammed earth compressed earth block embodied carbon building material supplier",
  Insulation: "Northern Michigan cellulose blown insulation embodied carbon kg CO2e per m2 local supplier",
  Composites: "Northern Michigan fiber cement composite cladding panel embodied carbon kg CO2e per m2",
  Masonry: "Northern Michigan concrete masonry unit CMU block embodied carbon kg CO2e per unit local supplier",
  Roofing: "Northern Michigan asphalt shingle metal roofing embodied carbon kg CO2e per m2 local supplier",
  Cladding: "Northern Michigan cedar wood siding cladding embodied carbon kg CO2e per m2 local supplier",
  Flooring: "Northern Michigan hardwood maple oak flooring embodied carbon kg CO2e per m2 local mill",
  Windows: "Northern Michigan triple pane window assembly embodied carbon kg CO2e per m2 local supplier",
  Mechanical: "Northern Michigan heat pump HVAC system embodied carbon kg CO2e per unit local supplier",
  Finishes: "Northern Michigan interior latex paint low VOC embodied carbon kg CO2e per liter supplier",
  Foundation: "Northern Michigan insulated concrete form ICF foundation embodied carbon kg CO2e per m2",
  Landscaping: "Northern Michigan native plant landscaping stone mulch embodied carbon kg CO2e per m2",
};

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

function confidenceToVerification(level: string): string {
  return level === "High" ? "verified" : "unverified";
}

// ---------------------------------------------------------------------------
// Database writes via Supabase REST
// Real table names (inspected from Supabase):
//   materials        — name, category, manufacturer, description, data_quality_score, source
//   carbon_footprints — material_id, a1_a3_manufacturing, a4_transport, a5_installation,
//                       b1_b7_use_phase, c1_c4_end_of_life, total_carbon_cradle_to_gate,
//                       total_carbon_cradle_to_grave, functional_unit, source, verification_status
//   lis_ris_scores   — material_id, lis_score, ris_score, baseline_region,
//                       calculation_version, calculation_date
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
      source: data.source ? data.source.slice(0, 255) : null,
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
      availability_status: "available",
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
  const entries = Object.entries(SEARCH_QUERIES);

  for (let i = 0; i < entries.length; i++) {
    const [category, query] = entries[i];
    summary.queriesRun++;

    try {
      console.log(`[MaterialResearchAgent] Researching: ${category}`);
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
      console.error(`[MaterialResearchAgent] Error for ${category}:`, message);
      summary.errors.push({ category, error: message });
    }

    // Delay between queries to stay under the 30k token/min rate limit
    if (i < entries.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, QUERY_DELAY_MS));
    }
  }

  return summary;
}
