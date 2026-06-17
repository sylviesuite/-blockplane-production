/**
 * Benchmark 2000 — EC3 Industry Average Research Script
 *
 * Phase 1 (research): calls Claude with web search for each of the 7 Benchmark
 * 2000 assemblies. Results are saved to benchmark-2000-results.json regardless
 * of database availability.
 *
 * Phase 2 (upload): pushes each row to Supabase benchmark_2000_research table.
 * If the table isn't ready, results stay in the JSON file.
 *
 * Usage:
 *   node scripts/benchmark-research.js              # research + upload
 *   node scripts/benchmark-research.js --upload-only # re-upload from JSON
 *
 * Requires: CLAUDE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY in .env
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFileSync, readFileSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const dotenv = require("dotenv");
dotenv.config({ path: join(__dirname, "../.env") });

const JSON_PATH = join(__dirname, "../benchmark-2000-results.json");

// ── Config ────────────────────────────────────────────────────────────────────

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const FETCH_TIMEOUT_MS = 120_000;
const DELAY_MS = 15_000;

// ── Assemblies ────────────────────────────────────────────────────────────────

const ASSEMBLIES = [
  {
    assembly_name: "Foundation",
    description: "Poured concrete basement walls and slab for a 2,000 sq ft two-story home",
    search_hint: "poured concrete basement wall slab residential foundation EC3 industry average GWP",
  },
  {
    assembly_name: "Framing",
    description: "2x6 dimensional lumber framing at 16\" o.c. for a 2,000 sq ft two-story home",
    search_hint: "2x6 dimensional lumber framing residential wood frame EC3 embodied carbon",
  },
  {
    assembly_name: "Sheathing",
    description: "OSB sheathing and subfloor for a 2,000 sq ft two-story home",
    search_hint: "OSB oriented strand board sheathing subfloor residential EC3 EPD GWP",
  },
  {
    assembly_name: "Insulation",
    description: "Fiberglass batt insulation R-21 walls and R-49 attic for a 2,000 sq ft two-story home",
    search_hint: "fiberglass batt insulation residential EC3 EPD embodied carbon kg CO2e",
  },
  {
    assembly_name: "Roofing",
    description: "Asphalt shingles roofing for a 2,000 sq ft two-story home",
    search_hint: "asphalt shingle roofing residential EC3 EPD GWP kg CO2e",
  },
  {
    assembly_name: "Cladding",
    description: "Vinyl siding cladding for a 2,000 sq ft two-story home",
    search_hint: "vinyl siding PVC residential EC3 EPD embodied carbon GWP",
  },
  {
    assembly_name: "Windows",
    description: "Double-pane vinyl windows for a 2,000 sq ft two-story home",
    search_hint: "double-pane vinyl window residential EC3 EPD GWP kg CO2e",
  },
];

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a building materials lifecycle carbon researcher. Research EC3 (Building Transparency) industry average GWP values for building assemblies and estimate quantities for a 2,000 sq ft two-story Northern Michigan home.

CRITICAL: Output ONLY the raw JSON object below. No prose before it. No prose after it. No markdown fences. Start your response with { and end with }.

JSON schema (all fields required):
{
  "material_name": "specific product name, e.g. Ready-Mix Concrete 4000 psi or Fiberglass Batt R-21",
  "ec3_avg_kgco2e_per_unit": <number — EC3 industry average GWP in kg CO₂e per declared unit>,
  "unit": "declared unit string, e.g. 1 m3 or 1 m2 or 1 t",
  "quantity_estimate": <number — realistic quantity for a 2,000 sq ft two-story home in that unit>,
  "total_kgco2e": <number — ec3_avg_kgco2e_per_unit × quantity_estimate>,
  "confidence": "high or medium or low",
  "source_notes": "1-2 sentences citing the EC3 category or benchmark used and key quantity assumptions"
}

Reference takeoffs for a 2,000 sq ft two-story home:
- Footprint: ~185 m2 (2,000 sq ft)
- Total floor area: ~370 m2 (4,000 sq ft)
- Roof area: ~215 m2 (2,300 sq ft with overhang)
- Exterior wall area: ~260 m2 (2,800 sq ft)
- Perimeter: ~55 m (180 LF)
- Basement: ~185 m2 floor + walls ~1.2m tall × 55m perimeter = ~66 m2 wall area
- Windows: ~20 units, ~1.4 m2 each = ~28 m2 total

EC3 category averages to use where available:
- Ready-Mix Concrete: ~300–400 kg CO₂e/m3
- Dimensional Lumber: ~150–200 kg CO₂e/m3
- OSB: ~450–550 kg CO₂e/m3
- Fiberglass Batt: ~2–4 kg CO₂e/m2 per inch of thickness
- Asphalt Shingles: ~3–5 kg CO₂e/m2
- Vinyl Siding: ~4–8 kg CO₂e/m2
- Double-pane Vinyl Window: ~150–250 kg CO₂e/m2`;

// ── Claude web-search ─────────────────────────────────────────────────────────

async function research(assembly) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");

  const userMessage = `Assembly: ${assembly.assembly_name}
Spec: ${assembly.description}
Search: ${assembly.search_hint}

Find the EC3 industry average GWP for this assembly. Return ONLY the JSON object — start with { on the very first character.`;

  const messages = [{ role: "user", content: userMessage }];

  for (let turn = 0; turn < 8; turn++) {
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
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }],
        messages,
      }),
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Claude API ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();

    if (data.stop_reason === "end_turn") {
      const textBlock = (data.content ?? []).find((c) => c.type === "text");
      return textBlock?.text ?? null;
    }

    if (data.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: data.content });
      const toolResults = data.content
        .filter((c) => c.type === "tool_use")
        .map((c) => ({ type: "tool_result", tool_use_id: c.id, content: "" }));
      messages.push({ role: "user", content: toolResults });
      continue;
    }

    break;
  }
  return null;
}

// ── JSON extraction ───────────────────────────────────────────────────────────

function extractJson(text) {
  const raw = (text ?? "").trim().replace(/^﻿/, "");

  const candidates = [];

  // Code fence
  const fenceMatch = raw.match(/```(?:json)?[ \t]*\r?\n?([\s\S]*?)```/i);
  if (fenceMatch?.[1]) candidates.push(fenceMatch[1].trim());

  // Outermost braces
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first !== -1 && last > first) candidates.push(raw.slice(first, last + 1));

  // Raw
  candidates.push(raw);

  for (const c of candidates) {
    if (!c) continue;
    try {
      const p = JSON.parse(c);
      if (typeof p.material_name !== "string") continue;
      if (typeof p.ec3_avg_kgco2e_per_unit !== "number") continue;
      return p;
    } catch { /* try next */ }
  }
  return null;
}

// ── Supabase insert ───────────────────────────────────────────────────────────

async function supabaseInsert(row) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY not set");

  const res = await fetch(`${url}/rest/v1/benchmark_2000_research`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${res.status}: ${text.slice(0, 200)}`);
  }
}

// ── Summary printer ───────────────────────────────────────────────────────────

function printSummary(rows) {
  const W = { a: 14, m: 36, v: 13, u: 10, q: 9, t: 13, c: 8 };
  const hr = "─".repeat(Object.values(W).reduce((s, n) => s + n, 0) + Object.keys(W).length * 3 + 1);
  const p  = (s, n) => String(s ?? "").slice(0, n).padEnd(n);
  const pr = (s, n) => String(s ?? "").slice(0, n).padStart(n);

  console.log("\n" + hr);
  console.log(`│ ${p("Assembly",W.a)} │ ${p("Material",W.m)} │ ${pr("kgCO₂e/unit",W.v)} │ ${p("Unit",W.u)} │ ${pr("Qty",W.q)} │ ${pr("Total kgCO₂e",W.t)} │ ${p("Conf",W.c)} │`);
  console.log(hr);

  let total = 0;
  for (const r of rows) {
    if (r.research_error) {
      console.log(`│ ${p(r.assembly_name,W.a)} │ ${p("RESEARCH ERROR: " + r.research_error, W.m)} │ ${" ".repeat(W.v)} │ ${" ".repeat(W.u)} │ ${" ".repeat(W.q)} │ ${" ".repeat(W.t)} │ ${" ".repeat(W.c)} │`);
      continue;
    }
    // Show data even if DB write failed (db_error is non-fatal for display)
    total += r.total_kgco2e ?? 0;
    const dbFlag = r.db_error ? "*" : r.db_saved ? "✓" : "";
    console.log(`│ ${p(r.assembly_name,W.a)} │ ${p(r.material_name,W.m)} │ ${pr(r.ec3_avg_kgco2e_per_unit?.toFixed(1),W.v)} │ ${p(r.unit,W.u)} │ ${pr(r.quantity_estimate?.toFixed(1),W.q)} │ ${pr(r.total_kgco2e?.toFixed(0),W.t)} │ ${p(r.confidence,W.c)} │`);
  }

  console.log(hr);
  console.log(`│ ${p("GRAND TOTAL",W.a)} │ ${" ".repeat(W.m)} │ ${" ".repeat(W.v)} │ ${" ".repeat(W.u)} │ ${" ".repeat(W.q)} │ ${pr(total.toFixed(0) + " kg",W.t)} │ ${" ".repeat(W.c)} │`);
  console.log(hr + "\n");

  const hasNotes = rows.filter(r => r.source_notes);
  if (hasNotes.length) {
    console.log("Source notes:");
    for (const r of hasNotes) console.log(`  [${r.assembly_name}] ${r.source_notes}`);
    console.log();
  }
}

// ── Upload phase ──────────────────────────────────────────────────────────────

async function uploadToSupabase(rows) {
  console.log("\n── Uploading to Supabase ────────────────────────────────────");
  let ok = 0, fail = 0;
  for (const row of rows) {
    if (row.research_error) continue;
    const { db_error, research_error, ...clean } = row;
    try {
      await supabaseInsert(clean);
      row.db_saved = true;
      ok++;
      console.log(`  ✓ ${row.assembly_name}`);
    } catch (e) {
      row.db_error = e.message.slice(0, 120);
      fail++;
      console.error(`  ✗ ${row.assembly_name}: ${row.db_error}`);
    }
  }
  console.log(`Upload complete — ${ok} saved, ${fail} failed.\n`);
  return fail === 0;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const uploadOnly = process.argv.includes("--upload-only");

  let rows;

  if (uploadOnly) {
    if (!existsSync(JSON_PATH)) {
      console.error("No benchmark-2000-results.json found. Run without --upload-only first.");
      process.exit(1);
    }
    rows = JSON.parse(readFileSync(JSON_PATH, "utf8"));
    console.log(`Loaded ${rows.length} rows from benchmark-2000-results.json`);
  } else {
    // ── Phase 1: Research ──────────────────────────────────────────────────────
    console.log("Benchmark 2000 — EC3 Industry Average Research");
    console.log(`Model: ${CLAUDE_MODEL} + web search  |  Assemblies: ${ASSEMBLIES.length}`);
    console.log("─".repeat(60));

    rows = [];

    for (let i = 0; i < ASSEMBLIES.length; i++) {
      const assembly = ASSEMBLIES[i];
      process.stdout.write(`\n[${i + 1}/${ASSEMBLIES.length}] ${assembly.assembly_name}... `);

      try {
        const rawText = await research(assembly);
        if (!rawText) throw new Error("Empty response from Claude");

        const parsed = extractJson(rawText);
        if (!parsed) {
          // Log the raw response for debugging and throw
          console.error(`\n  Raw response (first 500 chars):\n  ${rawText.slice(0, 500)}`);
          throw new Error("Could not extract JSON from response");
        }

        const row = {
          assembly_name: assembly.assembly_name,
          material_name: String(parsed.material_name),
          ec3_avg_kgco2e_per_unit: Number(parsed.ec3_avg_kgco2e_per_unit),
          unit: String(parsed.unit),
          quantity_estimate: Number(parsed.quantity_estimate),
          total_kgco2e: Number(parsed.total_kgco2e),
          confidence: String(parsed.confidence),
          source_notes: String(parsed.source_notes ?? ""),
          researched_at: new Date().toISOString(),
        };
        rows.push(row);
        console.log(`✓  ${row.total_kgco2e.toFixed(0)} kg CO₂e (${row.confidence})`);
      } catch (err) {
        console.error(`✗  ${err.message.slice(0, 100)}`);
        rows.push({ assembly_name: assembly.assembly_name, research_error: err.message.slice(0, 200) });
      }

      if (i < ASSEMBLIES.length - 1) {
        process.stdout.write(`  ⏱  waiting ${DELAY_MS / 1000}s...\n`);
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }

    // Always save JSON after research, before any DB attempt
    writeFileSync(JSON_PATH, JSON.stringify(rows, null, 2));
    const researched = rows.filter(r => !r.research_error).length;
    console.log(`\nResearch complete — ${researched}/${ASSEMBLIES.length} succeeded.`);
    console.log(`Results saved → benchmark-2000-results.json`);
  }

  // ── Phase 2: Upload ────────────────────────────────────────────────────────
  const allOk = await uploadToSupabase(rows);

  // Re-save JSON with db_saved / db_error flags
  writeFileSync(JSON_PATH, JSON.stringify(rows, null, 2));

  // ── Phase 3: Summary ───────────────────────────────────────────────────────
  printSummary(rows);

  if (!allOk) {
    console.log("Some rows failed to upload. Re-run with --upload-only once the table is ready.");
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
