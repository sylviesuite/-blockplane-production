/**
 * One-time migration: update carbon_footprints.functional_unit from metric to imperial.
 *
 * Rules (matches the agent SYSTEM_PROMPT):
 *   Timber (framing/lumber/beam/rafter/log)  → linear ft
 *   Timber (other / sheet / panel)            → sq ft
 *   Steel                                     → linear ft
 *   Concrete / Foundation / Earth             → cubic yard
 *   Insulation (spray foam / loose-fill)      → cubic ft
 *   Insulation (other)                        → sq ft
 *   Masonry / Composites / Cladding / Roofing
 *     / Flooring / Landscaping               → sq ft
 *   Windows / Mechanical                      → each
 *   Finishes                                  → gallon
 *   m³ fallback                               → cubic yard
 *   m² fallback                               → sq ft
 *
 * Run:  npx tsx server/scripts/migrate-functional-units.ts
 */

import { config } from "dotenv";
config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.");
  process.exit(1);
}

async function rest(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

const METRIC_UNITS = ["m²", "m2", "m³", "m3", "sqm", "cbm"];

function imperialUnit(category: string, name: string, currentUnit: string): string {
  const cat = category.toLowerCase();
  const nm = name.toLowerCase();

  if (cat === "windows") return "each";
  if (cat === "mechanical") return "each";
  if (cat === "finishes") return "gallon";

  if (cat === "concrete" || cat === "foundation") return "cubic yard";
  if (cat === "earth") return "cubic yard";

  if (cat === "insulation") {
    if (nm.includes("spray") || nm.includes("loose") || nm.includes("blown cellulose") || nm.includes("loose-fill")) {
      return "cubic ft";
    }
    return "sq ft";
  }

  if (cat === "timber" || cat === "steel") {
    const linearKeywords = [
      "lumber", "framing", "2x", "dimensional", "beam", "rafter",
      "joist", "stud", "post", "column", "rebar", "wide flange", "w-beam",
      "log", "timber frame",
    ];
    if (linearKeywords.some((kw) => nm.includes(kw))) return "linear ft";
    return "sq ft";
  }

  // Volume fallback for m³ inputs
  if (currentUnit === "m³" || currentUnit === "m3" || currentUnit === "cbm") return "cubic yard";

  // Area-based default
  return "sq ft";
}

async function main() {
  console.log("Fetching carbon_footprints with metric functional_unit...");

  // Fetch all records where functional_unit looks metric
  // Supabase REST: use `in` filter
  const metricFilter = METRIC_UNITS.map((u) => `"${u}"`).join(",");
  const rows: any[] = await rest(
    `carbon_footprints?functional_unit=in.(${METRIC_UNITS.join(",")})&select=id,material_id,functional_unit&limit=1000`,
    { headers: { Prefer: "return=representation" } }
  );

  if (!rows || rows.length === 0) {
    console.log("No metric functional_unit records found. Nothing to migrate.");
    return;
  }

  console.log(`Found ${rows.length} records with metric units.`);

  // Fetch corresponding materials in one shot
  const materialIds = [...new Set(rows.map((r) => r.material_id))];
  const materialsRaw: any[] = await rest(
    `materials?id=in.(${materialIds.join(",")})&select=id,name,category&limit=1000`,
    { headers: { Prefer: "return=representation" } }
  );
  const materialsMap = new Map(materialsRaw.map((m) => [m.id, m]));

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const mat = materialsMap.get(row.material_id);
    if (!mat) {
      console.warn(`  SKIP id=${row.id}: material ${row.material_id} not found`);
      skipped++;
      continue;
    }

    const newUnit = imperialUnit(mat.category ?? "", mat.name ?? "", row.functional_unit);
    console.log(
      `  ${mat.name} (${mat.category}) | ${row.functional_unit} → ${newUnit}`
    );

    await rest(`carbon_footprints?id=eq.${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ functional_unit: newUnit }),
    });
    updated++;
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
