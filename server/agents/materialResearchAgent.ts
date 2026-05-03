const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const AGENT_MODEL = "claude-sonnet-4-20250514";
const QUERY_DELAY_MS = 10_000;

const SYSTEM_PROMPT = `You are a building materials research assistant. Search the web to find ONE specific, real building material product sourced or commonly used in Northern Michigan. Return ONLY a valid JSON object with no other text, no markdown, and no code fences.

Required fields:
{
  "name": "specific product name, e.g. Michigan White Pine Dimensional Lumber 2x4",
  "category": "one of: Timber, Steel, Concrete, Earth, Insulation, Composites, Masonry, Roofing, Cladding, Flooring, Windows, Mechanical, Finishes, Foundation, Landscaping",
  "functionalUnit": "unit of measure, e.g. m³, m², kg, linear meter, unit",
  "totalCarbon": number (kg CO₂e per functional unit),
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
  "c1c4": number (kg CO₂e, end of life C1-C4)
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

// ---------------------------------------------------------------------------
// Database writes via Supabase REST
// ---------------------------------------------------------------------------

async function insertMaterial(data: MaterialData): Promise<{ inserted: boolean; skipped: boolean }> {
  const name = data.name.slice(0, 255);

  // Insert material, ignoring duplicate names
  const inserted = await supabaseRest("/rest/v1/materials", {
    method: "POST",
    headers: { Prefer: "return=representation,resolution=ignore-duplicates" },
    body: JSON.stringify({
      name,
      category: data.category,
      functionalUnit: (data.functionalUnit ?? "m²").slice(0, 50),
      totalCarbon: safeNum(data.totalCarbon),
      description: data.description ?? null,
      confidenceLevel: data.confidenceLevel ?? "Low",
      isRegenerative: data.isRegenerative === 1 ? 1 : 0,
    }),
  });

  // Resolve material ID — may be empty if duplicate was ignored
  let materialId: number | string | null = null;
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

  // Lifecycle values
  const phases = [
    { phase: "A1-A3", value: safeNum(data.a1a3) },
    { phase: "A4",    value: safeNum(data.a4) },
    { phase: "A5",    value: safeNum(data.a5) },
    { phase: "B",     value: safeNum(data.b) },
    { phase: "C1-C4", value: safeNum(data.c1c4) },
  ];
  for (const row of phases) {
    await supabaseRest("/rest/v1/lifecycleValues", {
      method: "POST",
      headers: { Prefer: "return=minimal,resolution=ignore-duplicates" },
      body: JSON.stringify({ materialId, ...row }),
    }).catch((e) => console.warn(`[MaterialResearchAgent] lifecycleValues insert skipped: ${e.message}`));
  }

  // Pricing
  await supabaseRest("/rest/v1/pricing", {
    method: "POST",
    headers: { Prefer: "return=minimal,resolution=ignore-duplicates" },
    body: JSON.stringify({ materialId, costPerUnit: safeNum(data.costPerUnit), currency: "USD" }),
  }).catch((e) => console.warn(`[MaterialResearchAgent] pricing insert skipped: ${e.message}`));

  // RIS scores
  await supabaseRest("/rest/v1/risScores", {
    method: "POST",
    headers: { Prefer: "return=minimal,resolution=ignore-duplicates" },
    body: JSON.stringify({
      materialId,
      risScore: clampInt(data.risScore, 0, 100),
      lisScore: clampInt(data.lisScore, 0, 100),
    }),
  }).catch((e) => console.warn(`[MaterialResearchAgent] risScores insert skipped: ${e.message}`));

  // EPD metadata
  await supabaseRest("/rest/v1/epdMetadata", {
    method: "POST",
    headers: { Prefer: "return=minimal,resolution=ignore-duplicates" },
    body: JSON.stringify({
      materialId,
      source: (data.source ?? "Web research").slice(0, 255),
      manufacturer: data.manufacturer ? data.manufacturer.slice(0, 255) : null,
      region: (data.region ?? "Northern Michigan").slice(0, 100),
    }),
  }).catch((e) => console.warn(`[MaterialResearchAgent] epdMetadata insert skipped: ${e.message}`));

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
