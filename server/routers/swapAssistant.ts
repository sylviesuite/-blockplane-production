import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { materials } from "../../drizzle/schema";
import { eq, sql, and, or } from "drizzle-orm";

/**
 * Material Swap Assistant Router
 * 
 * AI-powered conversational interface for material recommendations.
 * Takes natural language queries and returns structured recommendations
 * with carbon savings, cost differences, and actionable next steps.
 */

export const swapAssistantRouter = router({
  /**
   * Get material recommendations based on natural language query
   */
  getRecommendations: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(1000),
        region: z.string().optional().default("national"),
        projectArea: z.number().optional().default(1000),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Step 1: Use LLM to extract structured information from query
      const extractionPrompt = `You are a construction materials expert. Extract structured information from this query:

Query: "${input.query}"

Extract and return ONLY a JSON object with these fields:
{
  "materialType": "the type of material mentioned (e.g., 'studs', 'insulation', 'concrete', 'steel')",
  "category": "the broad category: Timber, Steel, Concrete, Earth, Insulation, Composites, or Masonry",
  "specifications": "any specific requirements (e.g., '2x6', 'R-value 19', '4000 PSI')",
  "location": "city or region mentioned, or null",
  "projectType": "residential, commercial, or industrial, or null",
  "projectSize": "approximate size mentioned, or null",
  "priority": "cost, carbon, or balanced - infer from query tone"
}

Return ONLY the JSON object, no explanation.`;

      const extractionResponse = await invokeLLM({
        messages: [
          { role: "system", content: "You are a helpful assistant that extracts structured data from text. Always respond with valid JSON only." },
          { role: "user", content: extractionPrompt }
        ],
      });

      let extracted;
      try {
        const content = extractionResponse.choices[0].message.content || "{}";
        extracted = JSON.parse(content);
      } catch (e) {
        // Fallback if LLM doesn't return valid JSON
        extracted = {
          materialType: "general",
          category: "Timber",
          specifications: "",
          location: null,
          projectType: null,
          projectSize: null,
          priority: "balanced"
        };
      }

      // Step 2: Query database for relevant materials
      const categoryFilter = extracted.category;
      const allMaterials = await db
        .select()
        .from(materials)
        .where(eq(materials.category, categoryFilter))
        .limit(50);

      if (allMaterials.length === 0) {
        return {
          query: input.query,
          extracted,
          recommendations: [],
          message: `No materials found in category: ${categoryFilter}. Try a different material type.`
        };
      }

      // Step 3: Use LLM to rank and recommend materials
      const materialsContext = allMaterials.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        totalCarbon: m.totalCarbon,
        cost: m.pricing?.costPerUnit || 0,
        functionalUnit: m.functionalUnit,
        risScore: m.risScores?.ris || 0,
        lisScore: m.risScores?.lis || 0,
      }));

      const recommendationPrompt = `You are a sustainable construction materials expert. Based on this query:

"${input.query}"

User priority: ${extracted.priority}
Location: ${input.region}
Project area: ${input.projectArea} sq ft

Available materials in ${categoryFilter} category:
${JSON.stringify(materialsContext, null, 2)}

Recommend the TOP 3 materials that best match the query. Consider:
- User's priority (cost vs carbon vs balanced)
- Material performance and suitability
- Carbon footprint (lower is better)
- Cost effectiveness
- Regional availability

Return ONLY a JSON array of material IDs in order of recommendation:
[materialId1, materialId2, materialId3]

Return ONLY the JSON array, no explanation.`;

      const recommendationResponse = await invokeLLM({
        messages: [
          { role: "system", content: "You are a helpful assistant that recommends materials. Always respond with valid JSON only." },
          { role: "user", content: recommendationPrompt }
        ],
      });

      let recommendedIds: number[] = [];
      try {
        const content = recommendationResponse.choices[0].message.content || "[]";
        recommendedIds = JSON.parse(content);
      } catch (e) {
        // Fallback: sort by carbon efficiency
        recommendedIds = allMaterials
          .sort((a, b) => {
            const effA = parseFloat(a.totalCarbon) / (a.pricing?.costPerUnit || 1);
            const effB = parseFloat(b.totalCarbon) / (b.pricing?.costPerUnit || 1);
            return effA - effB;
          })
          .slice(0, 3)
          .map(m => m.id);
      }

      // Step 4: Get full details for recommended materials
      const recommendations = await Promise.all(
        recommendedIds.map(async (id) => {
          const material = allMaterials.find(m => m.id === id);
          if (!material) return null;

          // Calculate regional cost
          const regionalMultipliers: Record<string, number> = {
            national: 1.0,
            nyc: 1.45,
            sf: 1.38,
            la: 1.22,
            seattle: 1.28,
            boston: 1.32,
            chicago: 1.18,
            denver: 1.12,
            miami: 1.08,
            atlanta: 0.95,
            dallas: 0.92,
            phoenix: 0.90,
            rural: 0.78,
          };
          const multiplier = regionalMultipliers[input.region] || 1.0;
          const regionalCost = (material.pricing?.costPerUnit || 0) * multiplier;

          return {
            id: material.id,
            name: material.name,
            category: material.category,
            totalCarbon: parseFloat(material.totalCarbon),
            cost: regionalCost,
            baseCost: material.pricing?.costPerUnit || 0,
            functionalUnit: material.functionalUnit,
            risScore: material.risScores?.ris || 0,
            lisScore: material.risScores?.lis || 0,
            description: `${material.category} material with ${material.risScores?.ris || 0} RIS score`,
          };
        })
      );

      const validRecommendations = recommendations.filter(r => r !== null);

      // Step 5: Generate explanation using LLM
      const explanationPrompt = `You are a friendly construction materials expert. Explain these recommendations to the user:

User asked: "${input.query}"

Recommended materials:
${JSON.stringify(validRecommendations, null, 2)}

Write a brief, friendly explanation (2-3 sentences) of why these materials are good choices. 
Focus on carbon savings, cost-effectiveness, and practical benefits.
Be conversational and helpful.`;

      const explanationResponse = await invokeLLM({
        messages: [
          { role: "system", content: "You are a friendly construction materials expert. Be concise and helpful." },
          { role: "user", content: explanationPrompt }
        ],
      });

      const explanation = explanationResponse.choices[0].message.content || 
        "Here are my top recommendations based on your query. These materials offer a good balance of sustainability and cost-effectiveness.";

      return {
        query: input.query,
        extracted,
        recommendations: validRecommendations,
        explanation,
        region: input.region,
        projectArea: input.projectArea,
      };
    }),

  /**
   * Generate CSI MasterFormat specification language for a material
   */
  generateSpec: publicProcedure
    .input(
      z.object({
        materialId: z.number(),
        projectName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const material = await db
        .select()
        .from(materials)
        .where(eq(materials.id, input.materialId))
        .limit(1);

      if (material.length === 0) {
        throw new Error("Material not found");
      }

      const m = material[0];

      // Use LLM to generate specification language
      const specPrompt = `Generate a CSI MasterFormat specification section for this material:

Material: ${m.name}
Category: ${m.category}
Total Carbon: ${m.totalCarbon} kg CO₂e per ${m.functionalUnit}
RIS Score: ${m.risScores?.ris || 0}
LIS Score: ${m.risScores?.lis || 0}
Cost: $${m.pricing?.costPerUnit || 0} per ${m.functionalUnit}

Generate a professional specification section including:
1. Section number and title (appropriate CSI division)
2. Part 1: General (description, performance requirements)
3. Part 2: Products (material specifications, sustainability requirements)
4. Part 3: Execution (installation requirements)

Include sustainability language referencing:
- EPD (Environmental Product Declaration) requirements
- Recycled content if applicable
- Regional materials preference
- LEED credit eligibility

Format in standard CSI MasterFormat style.`;

      const specResponse = await invokeLLM({
        messages: [
          { role: "system", content: "You are a professional specification writer. Generate clear, detailed CSI MasterFormat specifications." },
          { role: "user", content: specPrompt }
        ],
      });

      const specText = specResponse.choices[0].message.content || "Specification generation failed.";

      return {
        materialId: input.materialId,
        materialName: m.name,
        specText,
        projectName: input.projectName,
      };
    }),
});
