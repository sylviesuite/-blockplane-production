import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { BENCHMARK_HOUSE, BENCHMARK_ASSEMBLIES, BENCHMARK_REFERENCE_TOTAL_KG } from "../data/benchmark2000";

const FALLBACK = {
  hasRecommendations: false as const,
  noAlternativeMessage: "AI recommendation service unavailable. Please try again later.",
};

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY is not configured");

  const model = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Claude API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data: any = await res.json();
  return data.content?.[0]?.text ?? "";
}

export const benchmarkRouter = router({
  getSpec: publicProcedure.query(() => {
    return {
      house: BENCHMARK_HOUSE,
      assemblies: BENCHMARK_ASSEMBLIES,
      referenceTotal: BENCHMARK_REFERENCE_TOTAL_KG,
    };
  }),

  getRecommendations: publicProcedure
    .input(z.object({
      assemblyName: z.string(),
      carbonTotal: z.number(),
      carbonPerSqFt: z.number(),
      ris: z.number(),
    }))
    .mutation(async ({ input }) => {
      const risLabel = input.ris >= 70 ? "Regenerative"
        : input.ris >= 40 ? "Low-impact"
        : input.ris >= 25 ? "Standard"
        : "High-impact";

      const prompt =
`You are a sustainable building materials expert for Northern Michigan residential construction (Climate Zone 6, heavy snow, high moisture risk).

Evaluate this building assembly and identify whether better material alternatives exist:
- Assembly: ${input.assemblyName}
- Current embodied carbon: ${input.carbonTotal.toLocaleString()} kg CO₂e total (${input.carbonPerSqFt.toFixed(2)} kg CO₂e/sq ft)
- RIS (Regenerative Impact Score): ${input.ris}/100 — ${risLabel}

Rules:
- Only recommend alternatives that would meaningfully reduce embodied carbon (>10% improvement)
- Include 1–3 recommendations maximum — do not pad with weak or marginal suggestions
- Each recommendation must be practically applicable to Climate Zone 6
- Be specific: name actual materials, not generic categories
- If the current material is already performing well or no meaningful alternative exists, be honest about it

Respond with ONLY valid JSON — no markdown, no preamble:

If alternatives exist:
{"hasRecommendations":true,"recommendations":[{"material":"specific material name","carbonImpact":"~X% lower embodied carbon","rationale":"1–2 sentences on why this works for this assembly","climateNote":"1 sentence on cold-climate performance","reclaimed":false}]}

Set "reclaimed":true for any material that is typically salvaged, reclaimed, or of unknown/variable provenance (e.g. reclaimed timber, salvaged brick, used steel). These require code compliance verification before specification.

If no meaningful alternative:
{"hasRecommendations":false,"noAlternativeMessage":"Specific explanation of why the current material is already performing well or why no meaningful swap exists."}`;

      let text: string;
      try {
        text = await callClaude(prompt);
      } catch (err) {
        console.error("[benchmark.getRecommendations] Claude call failed:", err);
        return FALLBACK;
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return FALLBACK;

      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.hasRecommendations) {
          return {
            hasRecommendations: false as const,
            noAlternativeMessage:
              parsed.noAlternativeMessage ?? "No significant improvement found for this assembly.",
          };
        }
        const recs = ((parsed.recommendations ?? []) as any[]).slice(0, 3).map((r: any) => ({
          material: String(r.material ?? ""),
          carbonImpact: String(r.carbonImpact ?? ""),
          rationale: String(r.rationale ?? ""),
          climateNote: r.climateNote ? String(r.climateNote) : undefined,
          reclaimed: r.reclaimed === true,
        }));
        return { hasRecommendations: true as const, recommendations: recs };
      } catch {
        return FALLBACK;
      }
    }),
});
