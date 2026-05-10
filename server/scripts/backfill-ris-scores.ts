/**
 * backfill-ris-scores.ts
 *
 * Scores the 115 materials missing a RIS score.
 * Follows the same pattern as materialResearchAgent.ts.
 *
 * Run with:
 *   npx tsx server/scripts/backfill-ris-scores.ts
 */

import * as dotenv from "dotenv";
dotenv.config();

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const AGENT_MODEL = "claude-sonnet-4-20250514";
const DELAY_MS = 2_000; // 2s between calls — no web search so much faster

const SCORING_SYSTEM_PROMPT = `You are a building materials sustainability scorer. Given a material name, category, and description, return ONLY a valid JSON object with no other text, no markdown, and no code fences.

Return exactly this shape:
{
  "risScore": integer 0–100,
  "lisScore": integer 0–100
}

RIS scoring anchors (use these precisely — never default to 65):
  0–24   High-impact: petroleum-derived or heavily processed (asphalt shingles, closed-cell spray foam, PVC, conventional synthetic carpet, rubber membrane)
  25–49  Standard: commodity materials with no special environmental benefit (standard ready-mix concrete, CMU block, gypsum drywall, fiberglass batt, standard aluminum, virgin-ore structural steel)
  50–74  Low-impact: measurably reduced burden or high recycled content (mineral wool, EAF recycled-content steel, fiber cement, triple-pane glass, cellulose insulation, engineered wood like LVL/I-joists)
  75–100 Regenerative: actively sequesters carbon, restores ecosystems, or enables true circularity (sustainably harvested timber, CLT/mass timber, hempcrete, cork, reclaimed/salvaged materials, green/living roof, bamboo, mycelium)

LIS scoring: 0 = worst lifecycle impact, 100 = best. Invert the carbon intensity — low-carbon materials score high.`;

// ---------------------------------------------------------------------------
// Supabase REST (identical to materialResearchAgent.ts)
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
// Fetch materials missing a RIS score
// ---------------------------------------------------------------------------

interface PendingMaterial {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

async function fetchPendingMaterials(): Promise<PendingMaterial[]> {
  // Materials that have a lis_ris_scores row but ris_score is null
  const withNullScore = await supabaseRest(
    "/rest/v1/lis_ris_scores?ris_score=is.null&select=material_id"
  );

  // Materials that have NO lis_ris_scores row at all
  // We'll get all material IDs and subtract the ones that already have scores
  const allScored = await supabaseRest(
    "/rest/v1/lis_ris_scores?select=material_id"
  );

  const scoredIds = new Set(
    (allScored ?? []).map((r: any) => r.material_id)
  );
  const nullIds = (withNullScore ?? []).map((r: any) => r.material_id);

  // Fetch all materials
  const allMaterials = await supabaseRest(
    "/rest/v1/materials?select=id,name,category,description&limit=1000"
  );

  // Return those with null scores OR no score row at all
  return (allMaterials ?? []).filter(
    (m: any) => nullIds.includes(m.id) || !scoredIds.has(m.id)
  );
}

// ---------------------------------------------------------------------------
// Score a single material via Claude
// ---------------------------------------------------------------------------

async function scoreMaterial(
  material: PendingMaterial
): Promise<{ risScore: number; lisScore: number } | null> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");

  const userMessage = `Material name: ${material.name}
Category: ${material.category}
Description: ${material.description ?? "No description available"}

Return the JSON object with risScore and lisScore.`;

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
      system: SCORING_SYSTEM_PROMPT,
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

  // Try to extract JSON from the response
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace <= firstBrace) return null;

  try {
    const parsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    const risScore = Math.min(100, Math.max(0, Math.round(Number(parsed.risScore) || 0)));
    const lisScore = Math.min(100, Math.max(0, Math.round(Number(parsed.lisScore) || 0)));
    return { risScore, lisScore };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Upsert score into lis_ris_scores
// ---------------------------------------------------------------------------

async function upsertScore(
  materialId: string,
  risScore: number,
  lisScore: number
): Promise<void> {
  // Check if row exists
  const existing = await supabaseRest(
    `/rest/v1/lis_ris_scores?material_id=eq.${materialId}&select=material_id&limit=1`
  );

  if (Array.isArray(existing) && existing.length > 0) {
    // Update existing row
    await supabaseRest(
      `/rest/v1/lis_ris_scores?material_id=eq.${materialId}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          ris_score: risScore,
          lis_score: lisScore,
          calculation_date: new Date().toISOString().split("T")[0],
        }),
      }
    );
  } else {
    // Insert new row
    await supabaseRest("/rest/v1/lis_ris_scores", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        material_id: materialId,
        ris_score: risScore,
        lis_score: lisScore,
        baseline_region: "Great Lakes",
        calculation_version: "1.0",
        calculation_date: new Date().toISOString().split("T")[0],
      }),
    });
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("[RIS Backfill] Starting...");

  const pending = await fetchPendingMaterials();
  console.log(`[RIS Backfill] Found ${pending.length} materials needing scores`);

  if (pending.length === 0) {
    console.log("[RIS Backfill] Nothing to do.");
    return;
  }

  let scored = 0;
  let errors = 0;

  for (let i = 0; i < pending.length; i++) {
    const material = pending[i];
    process.stdout.write(
      `[RIS Backfill] [${i + 1}/${pending.length}] ${material.name.slice(0, 60)}... `
    );

    try {
      const scores = await scoreMaterial(material);
      if (!scores) {
        console.log("SKIP (no score returned)");
        errors++;
      } else {
        await upsertScore(material.id, scores.risScore, scores.lisScore);
        console.log(`RIS=${scores.risScore} LIS=${scores.lisScore}`);
        scored++;
      }
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
      errors++;
    }

    // Delay between calls
    if (i < pending.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log(
    `[RIS Backfill] Done — ${scored} scored, ${errors} errors out of ${pending.length} total`
  );
}

main().catch((err) => {
  console.error("[RIS Backfill] Fatal:", err);
  process.exit(1);
});