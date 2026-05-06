/**
 * Backfill carbon_footprints (and lis_ris_scores) for materials that have no
 * carbon data. Calls the Claude API directly — no web search needed since these
 * are all well-documented common building products.
 *
 * Run:  npx tsx server/scripts/backfill-carbon.ts
 */

import { config } from "dotenv";
config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY!;
const CLAUDE_MODEL = "claude-haiku-4-5-20251001"; // fast + cheap for factual lookups

if (!SUPABASE_URL || !SUPABASE_KEY || !CLAUDE_API_KEY) {
  console.error("Missing SUPABASE_URL, SUPABASE_SERVICE_KEY, or CLAUDE_API_KEY");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function supabase(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

function safeNum(v: unknown): number {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

function clampInt(v: unknown, min: number, max: number): number {
  return Math.min(Math.max(Math.round(Number(v) || 0), min), max);
}

function imperialUnit(category: string, name: string): string {
  const cat = category.toLowerCase();
  const nm = name.toLowerCase();
  if (cat === "windows") return "each";
  if (cat === "mechanical") return "each";
  if (cat === "doors") return "each";
  if (cat === "electrical") return "each";
  if (cat === "plumbing") return "each";
  if (cat === "finishes" || cat === "coatings") return "gallon";
  if (cat === "adhesives" || cat === "sealants") return "gallon";
  if (cat === "concrete" || cat === "foundation" || cat === "structural") {
    if (nm.includes("panel") || nm.includes("sip") || nm.includes("drywall") || nm.includes("wallboard")) return "sq ft";
    if (nm.includes("rebar") || nm.includes("steel") || nm.includes("lumber") || nm.includes("beam") || nm.includes("joist") || nm.includes("lvl")) return "linear ft";
    return "cubic yard";
  }
  if (cat === "earth") return "cubic yard";
  if (cat === "insulation") {
    if (nm.includes("spray") || nm.includes("loose") || nm.includes("blown")) return "cubic ft";
    return "sq ft";
  }
  if (cat === "timber" || cat === "steel" || cat === "engineered_wood") {
    const linear = ["lumber", "framing", "2x", "beam", "rafter", "joist", "stud", "post", "column", "rebar", "wide flange", "w-beam", "log", "lvl", "i-joist"];
    if (linear.some((kw) => nm.includes(kw))) return "linear ft";
    return "sq ft";
  }
  return "sq ft";
}

// ---------------------------------------------------------------------------
// Claude API — single material carbon lookup
// ---------------------------------------------------------------------------

const SYSTEM = `You are a building materials lifecycle assessment (LCA) expert. When given a material name and category, return ONLY a valid JSON object with embodied carbon data based on published EPDs, industry databases (Inventory of Carbon and Energy, ATHENA, EC3), and IPCC/ISO 14040 standards. Use imperial functional units. No markdown, no explanation — raw JSON only.`;

interface CarbonEstimate {
  a1a3: number;
  a4: number;
  a5: number;
  b: number;
  c1c4: number;
  totalCarbon: number;
  risScore: number;
  lisScore: number;
  confidenceLevel: "High" | "Medium" | "Low";
  source: string;
}

async function estimateCarbon(
  name: string,
  category: string,
  functionalUnit: string
): Promise<CarbonEstimate | null> {
  const prompt = `Material: "${name}"
Category: ${category}
Functional unit: ${functionalUnit}

Return a JSON object with these fields (all numbers are kg CO₂e per ${functionalUnit}):
{
  "a1a3": <manufacturing embodied carbon A1-A3>,
  "a4": <transport to site A4>,
  "a5": <installation A5>,
  "b": <use phase B, often 0 for passive materials>,
  "c1c4": <end-of-life C1-C4>,
  "totalCarbon": <a1a3 + a4 + a5, cradle to gate>,
  "risScore": <integer 0-100, Regenerative Impact Score — higher means more regenerative/sustainable>,
  "lisScore": <integer 0-100, Lifecycle Impact Score — higher means better overall lifecycle performance>,
  "confidenceLevel": <"High" if well-documented EPD exists, "Medium" if industry average, "Low" if estimated>,
  "source": <primary LCA database or standard referenced, e.g. "ICE Database v3.0", "EC3", "ATHENA">
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Claude API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data: any = await res.json();
  const raw = data.content?.[0]?.text ?? "";

  // Extract JSON from response
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as CarbonEstimate;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Fetching materials and existing carbon data...");

  const [allMaterials, allCarbon, allScores] = await Promise.all([
    supabase("materials?select=id,name,category&limit=500"),
    supabase("carbon_footprints?select=material_id&limit=500"),
    supabase("lis_ris_scores?select=material_id&limit=500"),
  ]);

  const withCarbon = new Set((allCarbon as any[]).map((r) => r.material_id));
  const withScores = new Set((allScores as any[]).map((r) => r.material_id));

  const needsCarbon = (allMaterials as any[]).filter((m) => !withCarbon.has(m.id));
  const total = needsCarbon.length;

  if (total === 0) {
    console.log("All materials already have carbon data.");
    return;
  }

  console.log(`Found ${total} materials needing carbon data. Starting backfill...\n`);

  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < needsCarbon.length; i++) {
    const m = needsCarbon[i];
    const unit = imperialUnit(m.category ?? "", m.name ?? "");
    const prefix = `[${i + 1}/${total}]`;

    process.stdout.write(`${prefix} ${m.name} (${m.category}) → `);

    let estimate: CarbonEstimate | null = null;
    try {
      estimate = await estimateCarbon(m.name, m.category ?? "", unit);
    } catch (e: any) {
      console.log(`ERROR: ${e.message}`);
      failed++;
      continue;
    }

    if (!estimate) {
      console.log("SKIP: could not parse response");
      failed++;
      continue;
    }

    const totalCarbon = safeNum(estimate.totalCarbon);
    const c1c4 = safeNum(estimate.c1c4);

    // Insert carbon_footprints (plain INSERT — these materials have no existing row)
    try {
      await supabase("carbon_footprints", {
        method: "POST",
        headers: { Prefer: "return=minimal" } as any,
        body: JSON.stringify({
          material_id: m.id,
          a1_a3_manufacturing: safeNum(estimate.a1a3),
          a4_transport: safeNum(estimate.a4),
          a5_installation: safeNum(estimate.a5),
          b1_b7_use_phase: safeNum(estimate.b),
          c1_c4_end_of_life: c1c4,
          total_carbon_cradle_to_gate: totalCarbon,
          total_carbon_cradle_to_grave: totalCarbon + c1c4,
          functional_unit: unit,
          source: (estimate.source ?? "Claude LCA estimate").slice(0, 255),
          verification_status: "self_declared",
        }),
      });
    } catch (e: any) {
      console.log(`CARBON ERROR: ${e.message}`);
      failed++;
      continue;
    }

    // Insert lis_ris_scores if also missing
    if (!withScores.has(m.id)) {
      try {
        await supabase("lis_ris_scores", {
          method: "POST",
          headers: { Prefer: "return=minimal" } as any,
          body: JSON.stringify({
            material_id: m.id,
            lis_score: clampInt(estimate.lisScore, 0, 100),
            ris_score: clampInt(estimate.risScore, 0, 100),
            baseline_region: "Great Lakes",
            calculation_version: "1.0",
            calculation_date: new Date().toISOString().split("T")[0],
          }),
        });
      } catch (e: any) {
        // Non-fatal — carbon is the priority
        console.warn(`  lis_ris_scores skipped: ${e.message}`);
      }
    }

    console.log(`✓  ${totalCarbon.toFixed(2)} kg CO₂e/${unit}  [${estimate.confidenceLevel}]`);
    inserted++;
  }

  console.log(`\n=== Backfill complete ===`);
  console.log(`Inserted: ${inserted}  Failed: ${failed}  Total: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
