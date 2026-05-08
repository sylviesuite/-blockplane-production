/**
 * Dedup materials table: for rows sharing (name, category, carbon), keep the
 * one with the highest RIS score and delete the rest (including all child rows
 * in carbon_footprints, lis_ris_scores, regional_data).
 *
 * Run once:  npx tsx server/scripts/dedup-materials.ts
 */

import { config } from "dotenv";
config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

async function rest(path: string, init: RequestInit = {}): Promise<any> {
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

async function restDelete(path: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "return=minimal",
    },
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status} ${await res.text()}`);
}

async function main() {
  console.log("Fetching all materials...");
  const materials: { id: string; name: string; category: string }[] = await rest(
    "materials?select=id,name,category&limit=2000"
  );
  console.log(`  ${materials.length} materials fetched`);

  console.log("Fetching carbon_footprints...");
  const carbons: { material_id: string; total_carbon_cradle_to_gate: number }[] = await rest(
    "carbon_footprints?select=material_id,total_carbon_cradle_to_gate&limit=2000"
  );
  const carbonByMaterial = new Map(carbons.map((c) => [c.material_id, c.total_carbon_cradle_to_gate]));

  console.log("Fetching lis_ris_scores...");
  const scores: { material_id: string; ris_score: number }[] = await rest(
    "lis_ris_scores?select=material_id,ris_score&limit=2000"
  );
  const risByMaterial = new Map(scores.map((s) => [s.material_id, s.ris_score]));

  // Build enriched list
  type Row = { id: string; name: string; category: string; carbon: number; ris: number };
  const rows: Row[] = materials.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    carbon: carbonByMaterial.get(m.id) ?? 0,
    ris: risByMaterial.get(m.id) ?? 0,
  }));

  // Group by (name, category, carbon) — round carbon to 4 dp to handle float noise
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = `${row.name}||${row.category}||${row.carbon.toFixed(4)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  const toDelete: string[] = [];
  let dupGroups = 0;

  for (const [key, group] of groups) {
    if (group.length <= 1) continue;
    dupGroups++;
    // Sort by RIS descending — keep the first (highest), delete the rest
    group.sort((a, b) => b.ris - a.ris);
    const [keep, ...remove] = group;
    console.log(
      `  Duplicate: "${keep.name}" (${keep.category}) carbon=${keep.carbon.toFixed(4)} — keeping id=${keep.id} (RIS ${keep.ris}), removing ${remove.length}`
    );
    for (const r of remove) toDelete.push(r.id);
  }

  if (toDelete.length === 0) {
    console.log("\nNo duplicates found — nothing to delete.");
    return;
  }

  console.log(`\n${dupGroups} duplicate groups, ${toDelete.length} rows to remove.`);

  // Delete child rows first (FK order), then materials
  const ids = toDelete.map((id) => encodeURIComponent(id)).join(",");

  console.log("  Deleting regional_data...");
  await restDelete(`regional_data?material_id=in.(${ids})`);

  console.log("  Deleting lis_ris_scores...");
  await restDelete(`lis_ris_scores?material_id=in.(${ids})`);

  console.log("  Deleting carbon_footprints...");
  await restDelete(`carbon_footprints?material_id=in.(${ids})`);

  console.log("  Deleting materials...");
  await restDelete(`materials?id=in.(${ids})`);

  console.log(`\nDone — ${toDelete.length} duplicate rows removed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
