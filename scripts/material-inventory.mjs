/**
 * CSO PRIORITY #1 — MATERIAL INVENTORY (READ-ONLY)
 * Produces a factual inventory from the canonical seed data.
 * Does not modify any data or connect to the database.
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, "seed-materials.mjs");
const seedContent = readFileSync(seedPath, "utf-8");

// Parse material blocks: each block starts with "  {" and ends with "  },"
// Extract name, category, ris, lis, cost, confidenceLevel, isRegenerative, epd from each
const blockRegex = /^\s*\{\s*$/gm;
const blocks = [];
let pos = seedContent.indexOf("const materialsData = [");
if (pos === -1) {
  console.error("Could not find materialsData in seed file");
  process.exit(1);
}
pos = seedContent.indexOf("[", pos) + 1;
const arrayEnd = seedContent.indexOf("\n];", pos);
const arraySection = seedContent.slice(pos, arrayEnd);

// Split by newline + "  },", which is the material-level close (not nested "    },"
const rawBlocks = arraySection.split(/\n  \},\s*\n/).map((b) => b.replace(/^\s*\/\/[^\n]*\n/gm, "").trim()).filter((b) => b.length > 0 && b.includes("name:"));

function extractField(block, key) {
  const keyStr = key + ":";
  const start = block.indexOf(keyStr);
  if (start === -1) return undefined;
  let i = start + keyStr.length;
  while (block[i] === " " || block[i] === '"') i++;
  if (block[i - 1] === '"') {
    const end = block.indexOf('"', i);
    return end === -1 ? undefined : block.slice(i, end);
  }
  const numMatch = block.slice(start).match(new RegExp(key + ":\\s*([^,\n]+)"));
  return numMatch ? numMatch[1].trim() : undefined;
}

const inventory = [];
rawBlocks.forEach((block, index) => {
  const name = extractField(block, "name")?.replace(/^"|"$/g, "") ?? "(unnamed)";
  const category = extractField(block, "category")?.replace(/^"|"$/g, "") ?? "(uncategorized)";
  const hasLifecycle = block.includes("lifecycle:") && block.includes("A1-A3");
  const hasLIS = block.includes("lis:") && /lis:\s*\d+/.test(block);
  const hasRIS = block.includes("ris:") && /ris:\s*\d+/.test(block);
  const hasCost = block.includes("cost:");
  const hasTotalCarbon = block.includes("totalCarbon:");
  const cpiDerivable = hasCost && hasTotalCarbon;
  const tags = [];
  if (block.includes("confidenceLevel:")) {
    const c = extractField(block, "confidenceLevel")?.replace(/^"|"$/g, "");
    if (c && c !== "Medium") tags.push(`confidence:${c}`);
  }
  if (block.includes("isRegenerative: 1")) tags.push("isRegenerative");
  if (block.includes("epd:") && block.includes("source:")) tags.push("hasEPD");
  const completeness =
    hasLIS && hasRIS && cpiDerivable && hasLifecycle
      ? "full"
      : hasLIS || hasRIS || cpiDerivable || hasLifecycle
        ? "partial"
        : "experimental";

  inventory.push({
    index: index + 1,
    id: `seed-${index + 1}`,
    name,
    category,
    functionalUnit: extractField(block, "functionalUnit")?.replace(/^"|"$/g, "") ?? null,
    tags: tags.length ? tags : null,
    hasLIS,
    hasRIS,
    hasCPI: cpiDerivable,
    hasLifecyclePhases: hasLifecycle,
    completeness,
  });
});

// Summary
const byCategory = {};
inventory.forEach((entry) => {
  const c = entry.category;
  byCategory[c] = (byCategory[c] ?? 0) + 1;
});
const byCompleteness = { full: 0, partial: 0, experimental: 0 };
inventory.forEach((entry) => {
  byCompleteness[entry.completeness]++;
});

// Output: temporary JSON file
const outPath = join(__dirname, "material-inventory.json");
const output = {
  generatedAt: new Date().toISOString(),
  source: "scripts/seed-materials.mjs (canonical seed data)",
  totalCount: inventory.length,
  byCategory,
  byCompleteness,
  inventory,
  note: "client/src/dev/placeholders/materials.placeholder.ts contains 3 dev-only placeholder materials (not in DB seed).",
};
writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
console.log("Wrote:", outPath);

// Console summary
console.log("\n--- MATERIAL INVENTORY (READ-ONLY) ---\n");
console.log("Canonical source: scripts/seed-materials.mjs (DB seed)");
console.log("App loads materials via: server/db.ts getAllMaterials() → tRPC materials.getAll / materials.list");
console.log("Note: client/src/dev/placeholders/materials.placeholder.ts has 3 dev-only placeholder materials (excluded from this count).\n");
console.log("Total material count:", inventory.length);
console.log("\nCount by category:");
Object.entries(byCategory)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([cat, count]) => console.log("  ", cat, count));
console.log("\nCount by completeness:");
console.log("  full (LIS + RIS + CPI + lifecycle):", byCompleteness.full);
console.log("  partial:", byCompleteness.partial);
console.log("  experimental:", byCompleteness.experimental);
console.log("\nFirst 5 entries (id, name, category, tags, LIS/RIS/CPI):");
inventory.slice(0, 5).forEach((e) => {
  console.log("  ", e.id, "|", e.name, "|", e.category, "|", e.tags ?? "-", "| LIS:", e.hasLIS, "RIS:", e.hasRIS, "CPI:", e.hasCPI);
});
console.log("\nDone.");
