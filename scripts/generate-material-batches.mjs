/**
 * Generates client/src/data/materialBatches.ts from the canonical seed.
 * Splits materials into 3 batches: 25 / 25 / rest.
 * Run: node scripts/generate-material-batches.mjs
 * Re-run when scripts/seed-materials.mjs changes.
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, "seed-materials.mjs");
const seedContent = readFileSync(seedPath, "utf-8");

let pos = seedContent.indexOf("const materialsData = [");
if (pos === -1) {
  console.error("Could not find materialsData in seed file");
  process.exit(1);
}
pos = seedContent.indexOf("[", pos) + 1;
const arrayEnd = seedContent.indexOf("\n];", pos);
const arraySection = seedContent.slice(pos, arrayEnd);
const rawBlocks = arraySection
  .split(/\n  \},\s*\n/)
  .map((b) => b.replace(/^\s*\/\/[^\n]*\n/gm, "").trim())
  .filter((b) => b.length > 0 && b.includes("name:"));

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

function slug(name) {
  return (
    name
      .toLowerCase()
      .replace(/\s*[\(\[].*?[\)\]]\s*/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "material"
  );
}

const materials = [];
rawBlocks.forEach((block, index) => {
  const name = extractField(block, "name")?.replace(/^"|"$/g, "").replace(/\\"/g, '"') ?? "Unnamed";
  const category = extractField(block, "category")?.replace(/^"|"$/g, "") ?? "Other";
  const id = slug(name) || `material-${index + 1}`;
  materials.push({ id, name, category });
});

// Deterministic sort: category, then name
materials.sort((a, b) => {
  const c = a.category.localeCompare(b.category);
  if (c !== 0) return c;
  return a.name.localeCompare(b.name);
});

const BATCH_1_SIZE = 25;
const BATCH_2_SIZE = 25;

const batch1Ids = materials.slice(0, BATCH_1_SIZE).map((m) => m.id);
const batch2Ids = materials.slice(BATCH_1_SIZE, BATCH_1_SIZE + BATCH_2_SIZE).map((m) => m.id);
const batch3Ids = materials.slice(BATCH_1_SIZE + BATCH_2_SIZE).map((m) => m.id);

const outPath = join(__dirname, "..", "client", "src", "data", "materialBatches.ts");
const content = [
  "// AUTO-GENERATED from scripts/seed-materials.mjs — run: node scripts/generate-material-batches.mjs",
  "// Internal work batches (25 / 25 / rest). Do not edit by hand.",
  "",
  "export const MATERIAL_BATCHES = {",
  "  1: " + JSON.stringify(batch1Ids) + " as const,",
  "  2: " + JSON.stringify(batch2Ids) + " as const,",
  "  3: " + JSON.stringify(batch3Ids) + " as const,",
  "} as const;",
  "",
  "export type MaterialBatchId = keyof typeof MATERIAL_BATCHES;",
  "",
].join("\n");

writeFileSync(outPath, content, "utf-8");
console.log(
  "Wrote",
  outPath,
  "| Batch 1:",
  batch1Ids.length,
  "| Batch 2:",
  batch2Ids.length,
  "| Batch 3:",
  batch3Ids.length
);
