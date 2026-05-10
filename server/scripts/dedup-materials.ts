/**
 * Near-duplicate dedup for the materials table.
 *
 * Groups materials in the same category whose names are highly similar
 * (Jaccard similarity on normalized token sets >= THRESHOLD). Within each
 * group, keeps the record with the highest RIS score (tie-break: highest
 * data_quality_score, then has carbon data), and deletes the rest including
 * all child rows.
 *
 * Usage:
 *   npx tsx server/scripts/dedup-materials.ts           # live run
 *   npx tsx server/scripts/dedup-materials.ts --dry-run # preview only
 */

import { config } from "dotenv";
config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const THRESHOLD = 0.75; // Jaccard similarity threshold
const DRY_RUN = process.argv.includes("--dry-run");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Supabase REST helpers
// ---------------------------------------------------------------------------

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
  if (DRY_RUN) {
    console.log(`  [dry-run] would DELETE ${path}`);
    return;
  }
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

// ---------------------------------------------------------------------------
// Similarity helpers
// ---------------------------------------------------------------------------

/** Normalized token set: lowercase, & → and, strip punctuation, split on whitespace. */
function tokenSet(name: string): Set<string> {
  return new Set(
    name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : intersection / union;
}

// ---------------------------------------------------------------------------
// Union-Find for transitive grouping
// ---------------------------------------------------------------------------

function makeUF(n: number) {
  const p = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => (p[x] === x ? x : (p[x] = find(p[x])));
  const union = (x: number, y: number) => { p[find(x)] = find(y); };
  return { find, union };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (DRY_RUN) console.log("DRY RUN — no changes will be made\n");

  console.log("Fetching materials...");
  const materials: { id: string; name: string; category: string; data_quality_score: number | null }[] =
    await rest("materials?select=id,name,category,data_quality_score&limit=2000");
  console.log(`  ${materials.length} materials fetched`);

  console.log("Fetching carbon_footprints...");
  const carbons: { material_id: string; total_carbon_cradle_to_gate: number }[] =
    await rest("carbon_footprints?select=material_id,total_carbon_cradle_to_gate&limit=2000");
  const carbonByMat = new Map(carbons.map((c) => [c.material_id, c.total_carbon_cradle_to_gate]));

  console.log("Fetching lis_ris_scores...");
  const scores: { material_id: string; ris_score: number | null }[] =
    await rest("lis_ris_scores?select=material_id,ris_score&limit=2000");
  const risByMat = new Map(scores.map((s) => [s.material_id, s.ris_score ?? 0]));

  // Group by category first so comparisons are O(n²) within each category, not globally
  const byCategory = new Map<string, typeof materials>();
  for (const m of materials) {
    if (!byCategory.has(m.category)) byCategory.set(m.category, []);
    byCategory.get(m.category)!.push(m);
  }

  const toDelete: string[] = [];
  let dupGroupCount = 0;

  for (const [category, group] of byCategory) {
    const n = group.length;
    if (n < 2) continue;

    const tokens = group.map((m) => tokenSet(m.name));
    const uf = makeUF(n);

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (jaccard(tokens[i], tokens[j]) >= THRESHOLD) {
          uf.union(i, j);
        }
      }
    }

    // Collect connected components (each is a near-duplicate group)
    const components = new Map<number, number[]>();
    for (let i = 0; i < n; i++) {
      const root = uf.find(i);
      if (!components.has(root)) components.set(root, []);
      components.get(root)!.push(i);
    }

    for (const indices of components.values()) {
      if (indices.length < 2) continue;
      dupGroupCount++;

      const rows = indices.map((i) => ({
        ...group[i],
        ris: risByMat.get(group[i].id) ?? 0,
        dqs: group[i].data_quality_score ?? 0,
        hasCarbon: (carbonByMat.get(group[i].id) ?? 0) > 0,
      }));

      // Keep: highest RIS → highest DQS → has carbon data
      rows.sort((a, b) => {
        if (b.ris !== a.ris) return b.ris - a.ris;
        if (b.dqs !== a.dqs) return b.dqs - a.dqs;
        return Number(b.hasCarbon) - Number(a.hasCarbon);
      });

      const [keep, ...remove] = rows;
      console.log(`\n  [${category}] Near-duplicate group (${rows.length} records):`);
      console.log(`    KEEP:   "${keep.name}" (id=${keep.id}, RIS=${keep.ris}, DQS=${keep.dqs})`);
      for (const r of remove) {
        console.log(`    REMOVE: "${r.name}" (id=${r.id}, RIS=${r.ris}, DQS=${r.dqs})`);
        toDelete.push(r.id);
      }
    }
  }

  if (toDelete.length === 0) {
    console.log("\nNo near-duplicates found — nothing to delete.");
    return;
  }

  console.log(`\n${dupGroupCount} duplicate group(s) found, ${toDelete.length} row(s) to remove.`);

  if (DRY_RUN) {
    console.log("\nDry run complete. Rerun without --dry-run to apply changes.");
    return;
  }

  const ids = toDelete.map((id) => encodeURIComponent(id)).join(",");

  console.log("\nDeleting child rows (FK order)...");
  await restDelete(`regional_data?material_id=in.(${ids})`);
  await restDelete(`lis_ris_scores?material_id=in.(${ids})`);
  await restDelete(`carbon_footprints?material_id=in.(${ids})`);

  console.log("Deleting materials rows...");
  await restDelete(`materials?id=in.(${ids})`);

  console.log(`\nDone — ${toDelete.length} near-duplicate row(s) removed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
