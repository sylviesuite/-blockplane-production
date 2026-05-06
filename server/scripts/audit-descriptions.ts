/**
 * Audit: find materials with missing or placeholder descriptions.
 *
 * Reports count and sample of materials where description is:
 *   - NULL
 *   - empty string
 *   - "Material from data collection"
 *
 * Run:  npx tsx server/scripts/audit-descriptions.ts
 */

import { config } from "dotenv";
config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.");
  process.exit(1);
}

async function rest(path: string): Promise<any[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text}`);
  return text ? JSON.parse(text) : [];
}

async function main() {
  const PLACEHOLDER = "Material from data collection";
  const fields = "id,name,category,description";

  const [nullRows, emptyRows, placeholderRows] = await Promise.all([
    rest(`materials?description=is.null&select=${fields}&limit=500`),
    rest(`materials?description=eq.&select=${fields}&limit=500`),
    rest(`materials?description=eq.${encodeURIComponent(PLACEHOLDER)}&select=${fields}&limit=500`),
  ]);

  // Deduplicate by id
  const seen = new Set<string>();
  const all: any[] = [];
  for (const row of [...nullRows, ...emptyRows, ...placeholderRows]) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      all.push(row);
    }
  }

  console.log(`\n=== Description Audit ===`);
  console.log(`NULL description:        ${nullRows.length}`);
  console.log(`Empty description:       ${emptyRows.length}`);
  console.log(`Placeholder description: ${placeholderRows.length}`);
  console.log(`Total unique affected:   ${all.length}\n`);

  if (all.length === 0) {
    console.log("No affected materials found.");
    return;
  }

  const sample = all.slice(0, 25);
  console.log(`Sample (first ${sample.length}):`);
  for (const m of sample) {
    const desc = m.description == null ? "(null)" : m.description === "" ? "(empty)" : `"${m.description}"`;
    console.log(`  [${m.category}] ${m.name} — ${desc}`);
  }

  if (all.length > 25) {
    console.log(`  ... and ${all.length - 25} more`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
