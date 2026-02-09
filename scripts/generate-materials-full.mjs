/**
 * Generates client/src/data/materialsFull.ts from the canonical seed
 * so the Materials Explorer mock can show the full inventory (85+).
 * Run: node scripts/generate-materials-full.mjs
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
  return name
    .toLowerCase()
    .replace(/\s*[\(\[].*?[\)\]]\s*/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "material";
}

const fullMaterials = [];
rawBlocks.forEach((block, index) => {
  const name = extractField(block, "name")?.replace(/^"|"$/g, "").replace(/\\"/g, '"') ?? "Unnamed";
  const category = extractField(block, "category")?.replace(/^"|"$/g, "") ?? "Other";
  const desc = extractField(block, "description")?.replace(/^"|"$/g, "").replace(/\\"/g, '"') ?? "";
  const totalCarbon = parseFloat(extractField(block, "totalCarbon") ?? "0") || 0;
  const cost = parseFloat(extractField(block, "cost") ?? "0") || 0;
  const ris = parseInt(extractField(block, "ris") ?? "0", 10) || 0;
  const lis = parseInt(extractField(block, "lis") ?? "0", 10) || 0;
  const isRegen = block.includes("isRegenerative: 1");
  const carbonKgPerM2 = totalCarbon;
  const costPerM2 = cost;
  const cpi = totalCarbon > 0 ? Number((cost / totalCarbon).toFixed(2)) : 0;
  const id = slug(name) || `material-${index + 1}`;
  fullMaterials.push({
    id,
    name,
    category,
    description: desc,
    carbonKgPerM2,
    costPerM2,
    ris,
    lis,
    cpi,
    regenerative: isRegen,
    tags: [],
  });
});

const outPath = join(__dirname, "..", "client", "src", "data", "materialsFull.ts");
const esc = (s) => (s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const entries = fullMaterials.map(
  (m) =>
    `  { id: ${JSON.stringify(m.id)}, name: ${JSON.stringify(m.name)}, category: ${JSON.stringify(m.category)}, description: ${JSON.stringify(m.description)}, carbonKgPerM2: ${m.carbonKgPerM2}, costPerM2: ${m.costPerM2}, ris: ${m.ris}, lis: ${m.lis}, cpi: ${m.cpi}, regenerative: ${m.regenerative}, tags: [] },`
);
const content = [
  "// AUTO-GENERATED from scripts/seed-materials.mjs — run: node scripts/generate-materials-full.mjs",
  "// Used by the Materials Explorer mock to show the full inventory (85+).",
  "",
  "import type { LocalMaterial } from \"./materials\";",
  "",
  "export const fullMaterialsFromSeed: LocalMaterial[] = [",
  ...entries,
  "];",
  "",
  `export const FULL_MATERIALS_COUNT = ${fullMaterials.length};`,
  "",
].join("\n");
writeFileSync(outPath, content, "utf-8");
console.log("Wrote", fullMaterials.length, "materials to", outPath);
