import type { InsightProvider, MaterialInsightInput } from "@/lib/ai/insightProviderTypes";

// TODO: Implement Claude via a backend-only route. Browser builds should not ship real Claude keys.
export const claudeProvider: InsightProvider = {
  async generateMaterialInsight(_input: MaterialInsightInput) {
    throw new Error("Claude provider is not available in this build. Use a server-side proxy.");
  },
};

