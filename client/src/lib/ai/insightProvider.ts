import type {
  InsightProvider,
  MaterialInsightInput,
  InsightGenerationResult,
  AIProviderName,
} from "@/lib/ai/insightProviderTypes";
import { claudeProvider } from "@/lib/ai/providers/claudeProvider";
import { openaiProvider } from "@/lib/ai/providers/openaiProvider";

const hasOpenAiKey = Boolean(import.meta.env.VITE_OPENAI_API_KEY);

const providerPreference = (import.meta.env.VITE_AI_PROVIDER as AIProviderName | undefined) ?? "mock";

const mockProvider: InsightProvider = {
  async generateMaterialInsight(input: MaterialInsightInput): Promise<InsightGenerationResult> {
    const parts: string[] = [];
    if (input.materialName) parts.push(`Material: ${input.materialName}`);
    if (input.lis !== undefined) parts.push(`LIS ${input.lis}`);
    if (input.ris !== undefined) parts.push(`RIS ${input.ris}`);
    if (input.cpi !== undefined) parts.push(`CPI ${input.cpi}`);
    if (input.context?.region) parts.push(`Region: ${input.context.region}`);
    const summary = parts.length > 0 ? parts.join(" • ") : "Mixed material data";
    return Promise.resolve({
      text: `Mock insight: ${summary}. Treat this as a placeholder until the backend AI route is configured.`,
    });
  },
};

const providerMap: Record<AIProviderName, InsightProvider> = {
  mock: mockProvider,
  openai: openaiProvider,
  claude: claudeProvider,
};

const resolvedProviderName: AIProviderName = (() => {
  if (providerPreference === "openai" && hasOpenAiKey) return "openai";
  // claudeProvider proxies to /api/insight — no client-side key needed
  if (providerPreference === "claude") return "claude";
  return "mock";
})();

export const defaultInsightProvider: InsightProvider = providerMap[resolvedProviderName];

export function getInsightProvider(name?: AIProviderName): InsightProvider {
  return providerMap[name ?? resolvedProviderName] ?? mockProvider;
}

