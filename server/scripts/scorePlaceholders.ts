/**
 * scorePlaceholders.ts
 *
 * Agent scoring pass over all materials where score_confidence = 'placeholder'.
 * Estimates LIS, RIS, and CPI band via Claude, writes LIS/RIS to lis_ris_scores,
 * and sets score_confidence = 'estimated' on the materials table.
 *
 * Run:
 *   npx tsx server/scripts/scorePlaceholders.ts --dry-run   # preview only
 *   npx tsx server/scripts/scorePlaceholders.ts             # write to DB
 */

import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const _dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(_dir, "../../.env") });

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const AGENT_MODEL = "claude-sonnet-4-20250514";
const DELAY_MS = 2_000;

const DRY_RUN = process.argv.includes("--dry-run");

// ---------------------------------------------------------------------------
// Supabase REST
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
// Fetch placeholder materials
// ---------------------------------------------------------------------------

interface PlaceholderMaterial {
  id: string;
  name: string;
  category: string;
  manufacturer: string | null;
  description: string | null;
  carbon_footprints: Array<{
    total_carbon_cradle_to_gate: number | null;
    functional_unit: string | null;
  }>;
  lis_ris_scores: Array<{
    lis_score: number | null;
    ris_score: number | null;
  }>;
}

async function fetchPlaceholderMaterials(): Promise<PlaceholderMaterial[]> {
  const rows = await supabaseRest(
    "/rest/v1/materials?score_confidence=eq.placeholder" +
      "&select=id,name,category,manufacturer,description," +
      "carbon_footprints(total_carbon_cradle_to_gate,functional_unit)," +
      "lis_ris_scores(lis_score,ris_score)" +
      "&limit=200"
  );
  return rows ?? [];
}

// ---------------------------------------------------------------------------
// Score a material via Claude
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a building materials lifecycle scorer for Great Lakes region construction projects. Given material details, return ONLY a valid JSON object — no markdown, no code fences, no explanation.

Return exactly this shape:
{
  "lisScore": integer 0–100,
  "risScore": integer 0–100,
  "cpiBand": "good" | "watch" | "warning" | "extreme",
  "reasoning": "one sentence"
}

LIS (Lifecycle Impact Score): 0 = worst lifecycle impact, 100 = best. Invert carbon intensity — low-carbon materials score high. If carbon data is provided, weight it heavily.

RIS (Regenerative Impact Score) anchors:
  0–24   High-impact: petroleum-derived or heavily processed (asphalt shingles, closed-cell spray foam, PVC, synthetic carpet, rubber membrane)
  25–49  Standard: commodity materials with no environmental benefit (ready-mix concrete, CMU, gypsum drywall, fiberglass batt, standard aluminum, virgin-ore steel)
  50–74  Low-impact: reduced burden or high recycled content (mineral wool, EAF steel, fiber cement, triple-pane glass, cellulose insulation, engineered wood/LVL)
  75–100 Regenerative: sequesters carbon, restores ecosystems, true circularity (sustainably harvested timber, CLT, hempcrete, cork, reclaimed materials, bamboo, mycelium)

CPI (Cost Performance Index — cost per tonne CO2e avoided):
  good    ≤ $50/tCO2e
  watch   $51–150/tCO2e
  warning $151–300/tCO2e
  extreme > $300/tCO2e (or material has poor carbon performance relative to cost)

Never default to middle values. Use the anchors precisely.`;

interface ScoreResult {
  lisScore: number;
  risScore: number;
  cpiBand: string;
  reasoning: string;
}

async function scoreMaterial(mat: PlaceholderMaterial): Promise<ScoreResult | null> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");

  const carbon = mat.carbon_footprints?.[0];
  const carbonLine = carbon?.total_carbon_cradle_to_gate != null
    ? `Carbon (cradle-to-gate): ${carbon.total_carbon_cradle_to_gate} kgCO2e / ${carbon.functional_unit ?? "sq ft"}`
    : "Carbon data: not available";

  const userMessage = [
    `Material: ${mat.name}`,
    `Category: ${mat.category}`,
    `Manufacturer: ${mat.manufacturer ?? "unknown"}`,
    `Description: ${mat.description ?? "none"}`,
    carbonLine,
    "",
    "Return the JSON object with lisScore, risScore, cpiBand, and reasoning.",
  ].join("\n");

  const res = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: AGENT_MODEL,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Claude API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data: any = await res.json();
  const textBlock = (data.content ?? []).find((c: any) => c.type === "text");
  if (!textBlock?.text) return null;

  const raw = textBlock.text.trim();
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace <= firstBrace) return null;

  try {
    const parsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    return {
      lisScore: Math.min(100, Math.max(0, Math.round(Number(parsed.lisScore) || 0))),
      risScore: Math.min(100, Math.max(0, Math.round(Number(parsed.risScore) || 0))),
      cpiBand: String(parsed.cpiBand ?? "watch"),
      reasoning: String(parsed.reasoning ?? ""),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Upsert lis_ris_scores
// ---------------------------------------------------------------------------

async function upsertScore(materialId: string, lisScore: number, risScore: number): Promise<void> {
  const existing = await supabaseRest(
    `/rest/v1/lis_ris_scores?material_id=eq.${materialId}&select=material_id&limit=1`
  );

  if (Array.isArray(existing) && existing.length > 0) {
    await supabaseRest(`/rest/v1/lis_ris_scores?material_id=eq.${materialId}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        lis_score: lisScore,
        ris_score: risScore,
        calculation_date: new Date().toISOString().split("T")[0],
      }),
    });
  } else {
    await supabaseRest("/rest/v1/lis_ris_scores", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        material_id: materialId,
        lis_score: lisScore,
        ris_score: risScore,
        baseline_region: "Great Lakes",
        calculation_version: "1.0",
        calculation_date: new Date().toISOString().split("T")[0],
      }),
    });
  }
}

// ---------------------------------------------------------------------------
// Update score_confidence on materials table
// ---------------------------------------------------------------------------

async function markEstimated(materialId: string): Promise<void> {
  await supabaseRest(`/rest/v1/materials?id=eq.${materialId}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ score_confidence: "estimated" }),
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`[ScorePlaceholders] Starting${DRY_RUN ? " (DRY RUN — no writes)" : ""}...`);

  const materials = await fetchPlaceholderMaterials();
  console.log(`[ScorePlaceholders] Found ${materials.length} placeholder materials\n`);

  if (materials.length === 0) {
    console.log("[ScorePlaceholders] Nothing to do.");
    return;
  }

  let scored = 0;
  let errors = 0;

  for (let i = 0; i < materials.length; i++) {
    const mat = materials[i];
    const oldLis = mat.lis_ris_scores?.[0]?.lis_score ?? null;
    const oldRis = mat.lis_ris_scores?.[0]?.ris_score ?? null;

    process.stdout.write(
      `[${i + 1}/${materials.length}] ${mat.name.slice(0, 55).padEnd(55)} `
    );

    try {
      const result = await scoreMaterial(mat);
      if (!result) {
        console.log("SKIP (no score returned)");
        errors++;
      } else {
        const oldStr = `LIS=${oldLis ?? "—"} RIS=${oldRis ?? "—"}`;
        const newStr = `LIS=${result.lisScore} RIS=${result.risScore} CPI=${result.cpiBand}`;
        console.log(`${oldStr} → ${newStr}`);
        if (result.reasoning) {
          console.log(`           ${result.reasoning}`);
        }

        if (!DRY_RUN) {
          await upsertScore(mat.id, result.lisScore, result.risScore);
          await markEstimated(mat.id);
        }
        scored++;
      }
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
      errors++;
    }

    if (i < materials.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log(
    `\n[ScorePlaceholders] Done — ${scored} scored, ${errors} errors` +
      (DRY_RUN ? " (dry run, no writes)" : " (written to DB)")
  );
}

main().catch((err) => {
  console.error("[ScorePlaceholders] Fatal:", err);
  process.exit(1);
});
