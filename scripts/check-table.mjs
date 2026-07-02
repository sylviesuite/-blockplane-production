const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Test each column by trying to select it
const allColumns = [
  "id", "name", "category", "description", "carbon_value",
  "functional_unit", "source", "manufacturer", "submitter_name",
  "submitter_email", "status", "reviewer_notes", "reviewed_at", "created_at"
];

const present = [];
const missing = [];

for (const col of allColumns) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/material_submissions?select=${col}&limit=1`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
  );
  if (res.ok) {
    present.push(col);
  } else {
    const err = await res.json();
    missing.push(`${col} (${err.message ?? err.code})`);
  }
}

console.log("\nPresent columns:", present.join(", "));
console.log("\nMissing columns:", missing.join("\n  "));
