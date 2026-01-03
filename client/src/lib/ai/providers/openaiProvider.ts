import type { InsightProvider, MaterialInsightInput } from "@/lib/ai/insightProviderTypes";

// TODO: Move real OpenAI requests to a secure server-side route. Never call OpenAI directly from the browser with production keys.
export const openaiProvider: InsightProvider = {
  async generateMaterialInsight(_input: MaterialInsightInput) {
    throw new Error("OpenAI provider is not available in this build. Route insights through your backend.");
  },
};

