/** Run the full material research agent and print a summary. */
import { config } from "dotenv";
config();
import { runMaterialResearchAgent } from "../agents/materialResearchAgent.js";

console.log("Starting full agent run (25 queries, ~38 min)...\n");
const start = Date.now();

const summary = await runMaterialResearchAgent();

const elapsed = Math.round((Date.now() - start) / 1000);
console.log(`\nCompleted in ${elapsed}s`);
console.log(`  Queries run: ${summary.queriesRun}`);
console.log(`  Inserted:    ${summary.inserted}`);
console.log(`  Skipped:     ${summary.skipped}`);
console.log(`  Errors:      ${summary.errors.length}`);

if (summary.errors.length > 0) {
  console.log("\nErrors:");
  for (const e of summary.errors) console.log(`  [${e.category}] ${e.error}`);
  process.exit(1);
}
