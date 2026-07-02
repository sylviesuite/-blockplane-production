/**
 * Applies a SQL migration file via Supabase REST API (rpc/query endpoint).
 * Usage:  node scripts/run-migration.mjs <path-to-sql-file>
 */
import { readFileSync } from "fs";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey  = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set");
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) { console.error("Usage: node run-migration.mjs <file.sql>"); process.exit(1); }

const sqlText = readFileSync(filePath, "utf8");

// Supabase Management API — execute arbitrary SQL via the query endpoint.
const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
const res = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ query: sqlText }),
  }
);

const body = await res.text();
if (!res.ok) {
  console.error(`Migration failed (HTTP ${res.status}):`, body);
  process.exit(1);
}
console.log("Migration applied successfully:", body.slice(0, 200));
