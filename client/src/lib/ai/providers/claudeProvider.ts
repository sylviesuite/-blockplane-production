import type { InsightProvider, MaterialInsightInput } from "@/lib/ai/insightProviderTypes";

export const claudeProvider: InsightProvider = {
  async generateMaterialInsight(input: MaterialInsightInput) {
    const res = await fetch("/api/insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lis: input.lis,
        ris: input.ris,
        cpi: input.cpi,
        materialName: input.materialName,
        useAI: true,
        // required by insight route — derive safe defaults from scores
        quadrant: "transitional",
        risComponents: { carbonRecovery: 50, durability: 50 },
        parisAlignment: 50,
      }),
    });
    if (!res.ok) throw new Error(`Insight API error: ${res.status}`);
    const data = await res.json();
    const t = data.insightText;
    const parts: string[] = [];
    if (t?.headline) parts.push(t.headline);
    if (Array.isArray(t?.bullets) && t.bullets.length) parts.push(...t.bullets.map((b: string) => `• ${b}`));
    else if (t?.body) parts.push(t.body);
    return { text: parts.join("\n") };
  },
};

