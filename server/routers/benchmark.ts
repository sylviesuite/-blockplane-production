import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { BENCHMARK_HOUSE, BENCHMARK_ASSEMBLIES, BENCHMARK_REFERENCE_TOTAL_KG } from "../data/benchmark2000";

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((p: any) => p?.type === "text")
      .map((p: any) => p.text ?? "")
      .join("");
  }
  return "";
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
      const result = await invokeLLM({
        messages: [{
          role: "user",
          content:
`You are a sustainable building materials expert for Northern Michigan residential construction (Climate Zone 6, heavy snow, high moisture risk).

Evaluate this building assembly and identify whether better material alternatives exist:
- Assembly: ${input.assemblyName}
- Current embodied carbon: ${input.carbonTotal.toLocaleString()} kg CO₂e total (${input.carbonPerSqFt.toFixed(2)} kg CO₂e/sq ft)
- RIS (Regenerative Impact Score): ${input.ris}/100 — ${input.ris >= 70 ? "Regenerative" : input.ris >= 40 ? "Low-impact" : input.ris >= 25 ? "Standard" : "High-impact"}

Rules:
- Only recommend alternatives that would meaningfully reduce embodied carbon (>10% improvement)
- Include 1–3 recommendations maximum — do not pad with weak or marginal suggestions
- Each recommendation must be practically applicable to Climate Zone 6
- Be specific: name actual materials, not generic categories
- If the current material is already performing well or no meaningful alternative exists, be honest about it

Respond with ONLY valid JSON — no markdown, no preamble:

If alternatives exist:
{"hasRecommendations":true,"recommendations":[{"material":"specific material name","carbonImpact":"~X% lower embodied carbon","rationale":"1–2 sentences on why this works for this assembly","climateNote":"1 sentence on cold-climate performance"}]}

If no meaningful alternative:
{"hasRecommendations":false,"noAlternativeMessage":"Specific explanation of why the current material is already performing well or why no meaningful swap exists."}`,
        }],
      });

      const text = extractText(result.choices[0]?.message?.content);
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return {
          hasRecommendations: false as const,
          noAlternativeMessage: "Unable to generate recommendations right now. Please try again.",
        };
      }

      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.hasRecommendations) {
          return {
            hasRecommendations: false as const,
            noAlternativeMessage:
              parsed.noAlternativeMessage ??
              "No significant improvement found for this assembly.",
          };
        }
        const recs = ((parsed.recommendations ?? []) as any[]).slice(0, 3).map((r: any) => ({
          material: String(r.material ?? ""),
          carbonImpact: String(r.carbonImpact ?? ""),
          rationale: String(r.rationale ?? ""),
          climateNote: r.climateNote ? String(r.climateNote) : undefined,
        }));
        return { hasRecommendations: true as const, recommendations: recs };
      } catch {
        return {
          hasRecommendations: false as const,
          noAlternativeMessage: "Unable to parse recommendations. Please try again.",
        };
      }
    }),
});
