import type { InsightProvider, MaterialInsightInput } from "@/lib/ai/insightProviderTypes";

export const claudeProvider: InsightProvider = {
  async generateMaterialInsight(input: MaterialInsightInput) {
    const base = import.meta.env.VITE_API_URL ?? "";
    const res = await fetch(`${base}/api/insight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        materialName: input.materialName,
        lis: input.lis,
        ris: input.ris,
        cpi: input.cpi,
      }),
    });
    if (!res.ok) throw new Error(`Insight API error: ${res.status}`);
    const data = await res.json();
    return { text: data.text ?? "" };
  },
};

