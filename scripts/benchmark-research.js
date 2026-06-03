/**
 * Benchmark 2000 — EC3 Industry Average Research Script
 *
 * Researches each assembly in the Benchmark 2000 reference home spec using
 * Claude with web search, targeting EC3 (Building Transparency) industry
 * averages. Writes results to the benchmark_2000_research Supabase table
 * and prints a summary table to console.
 *
 * Usage:
 *   node scripts/benchmark-research.js
 *
 * Requires: CLAUDE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY in .env
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Load .env from project root
const dotenv = require("dotenv");
dotenv.config({ path: join(__dirname, "../.env") });

// ── Config ───────────────────────────────────────────────────────────────────

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const FETCH_TIMEOUT_MS = 120_000;
const DELAY_BETWEEN_ASSEMBLIES_MS = 15_000;

// ── Benchmark 2000 assembly definitions ──────────────────────────────────────

const ASSEMBLIES = [
  {
    assembly_name: "Foundation",
    description: "Poured concrete basement walls and slab for a 2,000 sq ft two-story home",
    search_hint: "poured concrete basement wall slab residential foundation",
  },
  {
    assembly_name: "Framing",
    description: "2x6 dimensional lumber framing at 16\" o.c. for a 2,000 sq ft two-story home",
    search_hint: "2x6 dimensional lumber framing residential wood frame",
  },
  {
    assembly_name: "Sheathing",
    description: "OSB sheathing and subfloor for a 2,000 sq ft two-story home",
    search_hint: "OSB oriented strand board sheathing subfloor residential",
  },
  {
    assembly_name: "Insulation",
    description: "Fiberglass batt insulation R-21 walls and R-49 attic for a 2,000 sq ft two-story home",
    search_hint: "fiberglass batt insulation R-21 R-49 residential",
  },
  {
    assembly_name: "Roofing",
    description: "Asphalt shingles roofing for a 2,000 sq ft two-story home",
    search_hint: "asphalt shingle roofing residential",
  },
  {
    assembly_name: "Cladding",
    description: "Vinyl siding cladding for a 2,000 sq ft two-story home",
    search_hint: "vinyl siding PVC residential cladding",
  },
  {
    assembly_name: "Windows",
    description: "Double-pane vinyl windows for a 2,000 sq ft two-story home",
    search_hint: "double-pane vinyl window residential IGU",
  },
];

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a building materials lifecycle carbon researcher. Your task is to find EC3 (Building Transparency, buildingtransparency.org) industry average GWP values for specific building assemblies, and estimate realistic quantities for a standard 2,000 sq ft two-story Northern Michigan residence.

Return ONLY a valid JSON object — no prose, no markdown fences, no extra text.

Required JSON schema:
{
  "material_name": "specific material product name (e.g. 'Ready-Mix Concrete 4000 psi', 'OSB 7/16\" sheathing')",
  "ec3_avg_kgco2e_per_unit": number (EC3 industry average GWP in kg CO₂e per the declared unit),
  "unit": "the declared unit from EC3 (e.g. '1 m3', '1 m2', '1 t', 'MSF', '1 kg')",
  "quantity_estimate": number (realistic quantity for a 2,000 sq ft two-story home in that unit),
  "total_kgco2e": number (ec3_avg_kgco2e_per_unit × quantity_estimate),
  "confidence": "high" | "medium" | "low",
  "source_notes": "1-2 sentences: what EC3 category/benchmark was used, key assumptions for the quantity estimate, and any important caveats"
}

Guidelines:
- ec3_avg_kgco2e_per_unit: use the EC3 industry benchmark (category average or 10th/50th percentile) — not a specific product EPD. If EC3 publishes a benchmark PDF or transparency report, prefer that value. For Ready-Mix Concrete the EC3 industry average is ~300–400 kg CO₂e/m3; for OSB ~450–550 kg CO₂e/m3; use comparable verified industry data for other materials.
- unit: use exactly the EC3 declared unit for that category (usually SI).
- quantity_estimate: base it on standard residential construction takeoffs. A 2,000 sq ft two-story home has ~2,000 sq ft footprint, ~4,000 sq ft total floor area, ~1,200 sq ft roof area, perimeter ~180 LF, exterior wall area ~2,800 sq ft, ~20 windows at ~15 sq ft each.
- confidence: "high" if EC3 publishes a verified industry benchmark; "medium" if derived from multiple EPDs or a credible LCA database; "low" if estimated from literature or proxy data.
- source_notes: be specific — cite the EC3 category name, any benchmark document, and the key assumptions behind the quantity.`;

// ── Claude web-search call ────────────────────────────────────────────────────

async function callClaudeWithWebSearch(assembly) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");

  const userMessage = `Research the EC3 industry average embodied carbon for this building assembly and estimate quantities for a 2,000 sq ft two-story home:

Assembly: ${assembly.assembly_name}
Spec: ${assembly.description}
Search focus: ${assembly.search_hint} EC3 industry average GWP kg CO2e embodied carbon EPD

Search EC3 (buildingtransparency.org), ICE database, or other authoritative LCA sources. Return the JSON object described in the system prompt.`;

  const messages = [{ role: "user", content: userMessage }];

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
        model: CLAUDE_MODEL,
        max_tokens: 1024,
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
  const raw = text.trim().replace(/^﻿/, "");

  const candidates = [];

  const fenceMatch = raw.match(/```(?:json)?[ \t]*\r?\n?([\s\S]*?)```/i);
  if (fenceMatch?.[1]) candidates.push(fenceMatch[1].trim());

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(raw.slice(firstBrace, lastBrace + 1));
  }

  candidates.push(raw);

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate);
      if (typeof parsed.material_name !== "string") continue;
      if (typeof parsed.ec3_avg_kgco2e_per_unit !== "number") continue;
      return parsed;
    } catch {
      // try next
    }
  }
  return null;
}

// ── Supabase REST helper ──────────────────────────────────────────────────────

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
    throw new Error(`Supabase ${res.status}: ${text}`);
  }
}

// ── Summary table printer ─────────────────────────────────────────────────────

function printSummary(results) {
  const COL = {
    assembly: 14,
    material: 38,
    avg: 12,
    unit: 12,
    qty: 10,
    total: 12,
    conf: 8,
  };

  const pad = (s, n) => String(s ?? "").slice(0, n).padEnd(n);
  const padL = (s, n) => String(s ?? "").slice(0, n).padStart(n);
  const hr = "─".repeat(
    COL.assembly + COL.material + COL.avg + COL.unit + COL.qty + COL.total + COL.conf + 13
  );

  console.log("\n" + hr);
  console.log(
    `│ ${pad("Assembly", COL.assembly)} │ ${pad("Material", COL.material)} │ ${padL("kgCO₂e/unit", COL.avg)} │ ${pad("Unit", COL.unit)} │ ${padL("Qty", COL.qty)} │ ${padL("Total kgCO₂e", COL.total)} │ ${pad("Conf", COL.conf)} │`
  );
  console.log(hr);

  let grandTotal = 0;
  for (const r of results) {
    if (r.error) {
      console.log(`│ ${pad(r.assembly_name, COL.assembly)} │ ${"ERROR: " + r.error.slice(0, COL.material - 7).padEnd(COL.material)} │ ${" ".repeat(COL.avg)} │ ${" ".repeat(COL.unit)} │ ${" ".repeat(COL.qty)} │ ${" ".repeat(COL.total)} │ ${" ".repeat(COL.conf)} │`);
      continue;
    }
    grandTotal += r.total_kgco2e ?? 0;
    console.log(
      `│ ${pad(r.assembly_name, COL.assembly)} │ ${pad(r.material_name, COL.material)} │ ${padL(r.ec3_avg_kgco2e_per_unit?.toFixed(1), COL.avg)} │ ${pad(r.unit, COL.unit)} │ ${padL(r.quantity_estimate?.toFixed(1), COL.qty)} │ ${padL(r.total_kgco2e?.toFixed(0), COL.total)} │ ${pad(r.confidence, COL.conf)} │`
    );
  }

  console.log(hr);
  console.log(
    `│ ${"TOTAL".padEnd(COL.assembly)} │ ${" ".repeat(COL.material)} │ ${" ".repeat(COL.avg)} │ ${" ".repeat(COL.unit)} │ ${" ".repeat(COL.qty)} │ ${padL(grandTotal.toFixed(0) + " kg", COL.total)} │ ${" ".repeat(COL.conf)} │`
  );
  console.log(hr + "\n");

  console.log("Source notes:");
  for (const r of results) {
    if (r.error) continue;
    console.log(`  [${r.assembly_name}] ${r.source_notes}`);
  }
  console.log();
}

// ── Table readiness check ─────────────────────────────────────────────────────

async function ensureTable() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY not set");

  // A HEAD request to the table endpoint returns 200 if it exists, 404 if not.
  const res = await fetch(`${url}/rest/v1/benchmark_2000_research?limit=0`, {
    method: "HEAD",
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });

  if (res.ok) {
    console.log("Table benchmark_2000_research exists — ready.");
    return;
  }

  // Table doesn't exist yet — print the migration SQL and abort.
  console.error(`\nTable benchmark_2000_research not found (HTTP ${res.status}).`);
  console.error("Apply the migration first via the Supabase SQL editor:\n");
  console.error("  supabase/migrations/20260603_benchmark_2000_research.sql\n");
  console.error("Or paste this SQL into https://supabase.com/dashboard → SQL Editor:\n");
  console.error(`CREATE TABLE IF NOT EXISTS benchmark_2000_research (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  assembly_name            text        NOT NULL,
  material_name            text        NOT NULL,
  ec3_avg_kgco2e_per_unit  numeric     NOT NULL,
  unit                     text        NOT NULL,
  quantity_estimate        numeric     NOT NULL,
  total_kgco2e             numeric     NOT NULL,
  confidence               text        NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
  source_notes             text,
  researched_at            timestamptz NOT NULL DEFAULT now()
);\n`);
  process.exit(1);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await ensureTable();
  console.log("Benchmark 2000 — EC3 Industry Average Research");
  console.log(`Model: ${CLAUDE_MODEL} with web search`);
  console.log(`Assemblies: ${ASSEMBLIES.length}`);
  console.log("─".repeat(60));

  const results = [];

  for (let i = 0; i < ASSEMBLIES.length; i++) {
    const assembly = ASSEMBLIES[i];
    console.log(`\n[${i + 1}/${ASSEMBLIES.length}] Researching: ${assembly.assembly_name}...`);

    try {
      const rawText = await callClaudeWithWebSearch(assembly);
      if (!rawText) throw new Error("Empty response from Claude");

      const parsed = extractJson(rawText);
      if (!parsed) throw new Error(`Could not parse JSON:\n${rawText.slice(0, 300)}`);

      const row = {
        assembly_name: assembly.assembly_name,
        material_name: parsed.material_name,
        ec3_avg_kgco2e_per_unit: Number(parsed.ec3_avg_kgco2e_per_unit),
        unit: parsed.unit,
        quantity_estimate: Number(parsed.quantity_estimate),
        total_kgco2e: Number(parsed.total_kgco2e),
        confidence: parsed.confidence,
        source_notes: parsed.source_notes,
        researched_at: new Date().toISOString(),
      };

      await supabaseInsert(row);
      results.push(row);
      console.log(`  ✓ ${row.material_name}: ${row.total_kgco2e.toFixed(0)} kg CO₂e total (${row.confidence} confidence)`);
    } catch (err) {
      console.error(`  ✗ ${assembly.assembly_name}: ${err.message}`);
      results.push({ assembly_name: assembly.assembly_name, error: err.message });
    }

    if (i < ASSEMBLIES.length - 1) {
      console.log(`  Waiting ${DELAY_BETWEEN_ASSEMBLIES_MS / 1000}s before next assembly...`);
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_ASSEMBLIES_MS));
    }
  }

  printSummary(results);

  const succeeded = results.filter((r) => !r.error).length;
  const failed = results.filter((r) => r.error).length;
  console.log(`Done — ${succeeded} succeeded, ${failed} failed. Results written to benchmark_2000_research table.`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
