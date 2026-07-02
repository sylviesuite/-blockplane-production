/**
 * Phase 4 E2E verification script.
 * Tests Path A (manual carbon value) and Path B (AI estimate, null carbon_value)
 * submission flow through the live tRPC API, then checks admin queue.
 *
 * Usage: node --env-file=.env scripts/verify-phase4.mjs
 */

const API = process.env.VITE_API_URL ?? "https://blockplane-production.onrender.com";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;

const TRPC = `${API}/api/trpc`;

// ── helpers ────────────────────────────────────────────────────────────────

function log(label, value) {
  console.log(`\n[${label}]`, typeof value === "string" ? value : JSON.stringify(value, null, 2));
}

async function trpcQuery(proc, input) {
  const params = encodeURIComponent(JSON.stringify({ "0": { json: input } }));
  const res = await fetch(`${TRPC}/${proc}?batch=1&input=${params}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok || data?.[0]?.error) throw new Error(data?.[0]?.error?.message ?? `HTTP ${res.status}`);
  return data[0].result.data.json;
}

async function trpcMutate(proc, input) {
  const res = await fetch(`${TRPC}/${proc}?batch=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "0": { json: input } }),
  });
  const data = await res.json();
  if (data?.[0]?.error) throw new Error(JSON.stringify(data[0].error));
  return data[0].result.data.json;
}

// Direct Supabase REST call with service key (for verifying DB state)
async function supabase(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── tests ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, label, detail = "") {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ": " + detail : ""}`);
    failed++;
  }
}

// ── Path A: manual carbon value ────────────────────────────────────────────

console.log("\n═══ PATH A: user provides real carbon value ═══");

const nameA = `Verify-PathA-Cedar-${Date.now()}`;
let resultA;
try {
  resultA = await trpcMutate("materialAPI.submitMaterial", {
    name: nameA,
    category: "Timber",
    description: "E2E test submission — Path A with real carbon value",
    carbonValue: 1.234,
    functionalUnit: "sq ft",
    source: "Test EPD document",
    manufacturer: "Verification Lumber Co",
    submitterName: "Phase4 Test",
    submitterEmail: "",
    honeypot: "",
  });
  log("Path A submit response", resultA);
  assert(resultA?.success === true, "submitMaterial returns success:true");
} catch (err) {
  console.error("  ❌ Path A submit threw:", err.message);
  failed++;
}

// Verify it landed in Supabase with correct carbon_value
let rowA;
try {
  const rows = await supabase(
    `material_submissions?name=eq.${encodeURIComponent(nameA)}&select=id,name,carbon_value,status,source&limit=1`
  );
  rowA = rows[0];
  log("Path A DB row", rowA);
  assert(rowA, "Row exists in material_submissions");
  assert(rowA?.status === "pending", "Status is pending");
  assert(Number(rowA?.carbon_value) === 1.234, `carbon_value is 1.234 (got ${rowA?.carbon_value})`);
  assert(rowA?.source?.includes("Test EPD"), `source contains submitter text (got ${rowA?.source})`);
} catch (err) {
  console.error("  ❌ Path A DB check threw:", err.message);
  failed++;
}

// ── Path B: AI estimate (carbon_value must be null) ────────────────────────

console.log("\n═══ PATH B: user skips carbon value (AI estimate path) ═══");

const nameB = `Verify-PathB-Straw-${Date.now()}`;
const aiReasoningText = "[AI preview estimate: 0.150 kg CO₂e/sq ft — estimated from industry data]";

let resultB;
try {
  // Simulate exactly what the modal sends for Path B:
  // carbonValue is undefined, AI estimate is embedded in description
  resultB = await trpcMutate("materialAPI.submitMaterial", {
    name: nameB,
    category: "Insulation",
    description: `Northern Michigan straw bale\n\n${aiReasoningText}`,
    // carbonValue intentionally omitted (undefined → not sent)
    functionalUnit: "sq ft",
    source: "AI-estimated from user description",
    honeypot: "",
  });
  log("Path B submit response", resultB);
  assert(resultB?.success === true, "submitMaterial returns success:true");
} catch (err) {
  console.error("  ❌ Path B submit threw:", err.message);
  failed++;
}

let rowB;
try {
  const rows = await supabase(
    `material_submissions?name=eq.${encodeURIComponent(nameB)}&select=id,name,carbon_value,description,source,status&limit=1`
  );
  rowB = rows[0];
  log("Path B DB row", rowB);
  assert(rowB, "Row exists in material_submissions");
  assert(rowB?.status === "pending", "Status is pending");
  assert(rowB?.carbon_value === null, `carbon_value is NULL (got ${rowB?.carbon_value}) — AI estimate did NOT leak into verified field`);
  assert(rowB?.description?.includes("[AI preview estimate"), "AI estimate text is in description field only");
  assert(rowB?.source === "AI-estimated from user description", "source correctly labeled as AI-estimated");
} catch (err) {
  console.error("  ❌ Path B DB check threw:", err.message);
  failed++;
}

// ── Admin queue: both submissions visible ──────────────────────────────────

console.log("\n═══ ADMIN QUEUE: submissions visible ═══");

// We can't call adminProcedure without an admin session cookie,
// so query Supabase directly with the service key
try {
  const pending = await supabase(
    "material_submissions?status=eq.pending&select=id,name,carbon_value,status&order=created_at.desc&limit=20"
  );
  log("Pending submissions (last 20)", pending.map(r => `${r.name} | carbon_value=${r.carbon_value}`));
  const hasA = pending.some(r => r.name === nameA);
  const hasB = pending.some(r => r.name === nameB);
  assert(hasA, "Path A submission appears in pending queue");
  assert(hasB, "Path B submission appears in pending queue");
} catch (err) {
  console.error("  ❌ Admin queue check threw:", err.message);
  failed++;
}

// ── Reject Path B: verify it stays out of live catalog ────────────────────

console.log("\n═══ REJECT: rejected submission must not enter catalog ═══");

try {
  // PATCH Path B submission to rejected via service key
  const rejectRes = await fetch(
    `${SUPABASE_URL}/rest/v1/material_submissions?id=eq.${rowB?.id}`,
    {
      method: "PATCH",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ status: "rejected", reviewer_notes: "E2E test rejection", reviewed_at: new Date().toISOString() }),
    }
  );
  assert(rejectRes.ok, `PATCH rejected (HTTP ${rejectRes.status})`);

  // Confirm not in live materials catalog
  const inCatalog = await supabase(`materials?name=eq.${encodeURIComponent(nameB)}&select=id,name&limit=1`);
  assert(inCatalog.length === 0, "Rejected submission NOT in live materials catalog");
} catch (err) {
  console.error("  ❌ Reject check threw:", err.message);
  failed++;
}

// ── Honeypot: bot submissions are silently swallowed ──────────────────────

console.log("\n═══ HONEYPOT: bot submissions silently dropped ═══");

const botName = `Bot-Submission-${Date.now()}`;
try {
  const botResult = await trpcMutate("materialAPI.submitMaterial", {
    name: botName,
    category: "Timber",
    honeypot: "i-am-a-bot",  // honeypot filled
  });
  // Should return success:true (silent drop)
  assert(botResult?.success === true, "Honeypot-filled submission returns success:true (silent)");

  // But must NOT exist in DB
  const botRows = await supabase(
    `material_submissions?name=eq.${encodeURIComponent(botName)}&select=id&limit=1`
  );
  assert(botRows.length === 0, "Honeypot submission NOT written to database");
} catch (err) {
  console.error("  ❌ Honeypot check threw:", err.message);
  failed++;
}

// ── Cleanup ────────────────────────────────────────────────────────────────

try {
  if (rowA?.id) {
    await fetch(`${SUPABASE_URL}/rest/v1/material_submissions?id=eq.${rowA.id}`, {
      method: "DELETE",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
  }
  if (rowB?.id) {
    await fetch(`${SUPABASE_URL}/rest/v1/material_submissions?id=eq.${rowB.id}`, {
      method: "DELETE",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
  }
} catch {}

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${"═".repeat(50)}`);
console.log(`Result: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log("✅ ALL CHECKS PASSED");
else console.log("❌ SOME CHECKS FAILED");
