import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { getAllMaterials, getMaterialsByCategory, getMaterialById } from './db';
import { logAnalyticsEvent, getKPIMetrics, getTopAlternatives } from './analytics-db';
import { findAlternatives, getRecommendationSummary } from './recommendations';

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // AI Assistant for material analysis
  ai: router({
    chat: publicProcedure
      .input(z.object({
        question: z.string(),
        materials: z.array(z.object({
          name: z.string(),
          total: z.number(),
          phases: z.object({
            pointOfOrigin: z.number(),
            transport: z.number(),
            construction: z.number(),
            production: z.number(),
            disposal: z.number(),
          }),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { question, materials } = input;
        
        // Build context from materials data
        let context = '';
        if (materials && materials.length > 0) {
          context = `\n\nCurrent materials in view:\n`;
          materials.forEach(m => {
            context += `- ${m.name}: ${m.total} kg CO₂e total\n`;
            context += `  Point of Origin: ${m.phases.pointOfOrigin}, Transport: ${m.phases.transport}, Construction: ${m.phases.construction}, Production: ${m.phases.production}, Disposal: ${m.phases.disposal}\n`;
          });
        }
        
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are an expert in sustainable building materials and lifecycle carbon analysis. You help users understand embodied carbon, lifecycle phases (A1-A3 production, A4 transport, A5 construction, B maintenance, C1-C4 disposal), and material sustainability. Provide clear, concise answers focused on actionable insights.${context}`,
            },
            {
              role: 'user',
              content: question,
            },
          ],
        });
        
        return {
          answer: response.choices[0].message.content || 'I apologize, but I could not generate a response.',
        };
      }),
  }),

  // Materials data access
  materials: router({
    // Get all materials
    getAll: publicProcedure.query(async () => {
      return await getAllMaterials();
    }),

    // Get materials by category
    getByCategory: publicProcedure
      .input(z.object({ category: z.enum(["Timber", "Steel", "Concrete", "Earth"]) }))
      .query(async ({ input }) => {
        return await getMaterialsByCategory(input.category);
      }),

    // Get single material by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getMaterialById(input.id);
      }),
  }),

  // Analytics tracking
  analytics: router({
    // Log an event
    logEvent: publicProcedure
      .input(z.object({
        eventType: z.enum([
          'ai_suggestion_shown',
          'ai_recommendation_accepted',
          'material_substitution',
          'ai_conversation',
          'material_viewed'
        ]),
        sessionId: z.string(),
        userId: z.string().optional(),
        materialId: z.string().optional(),
        materialName: z.string().optional(),
        alternativeMaterialId: z.string().optional(),
        alternativeMaterialName: z.string().optional(),
        carbonSaved: z.number().optional(),
        costDelta: z.number().optional(),
        risDelta: z.number().optional(),
        context: z.string().optional(),
        source: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await logAnalyticsEvent(input);
        return { success: true };
      }),

    // Get KPI metrics
    getKPIs: publicProcedure
      .input(z.object({ daysAgo: z.number().default(30) }))
      .query(async ({ input }) => {
        return await getKPIMetrics(input.daysAgo);
      }),

    // Get top performing alternatives
    getTopAlternatives: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await getTopAlternatives(input.limit);
      }),
  }),

  // Material recommendations
  recommendations: router({
    // Get alternatives for a material
    getAlternatives: publicProcedure
      .input(z.object({
        materialId: z.number(),
        maxResults: z.number().default(5),
        prioritizeCarbon: z.boolean().default(true),
        prioritizeCost: z.boolean().default(false),
        prioritizeRIS: z.boolean().default(true),
      }))
      .query(async ({ input }) => {
        const allMaterials = await getAllMaterials();
        const currentMaterial = allMaterials.find(m => m.id === input.materialId);
        
        if (!currentMaterial) {
          throw new Error('Material not found');
        }

        const recommendations = findAlternatives(currentMaterial, allMaterials, {
          maxResults: input.maxResults,
          prioritizeCarbon: input.prioritizeCarbon,
          prioritizeCost: input.prioritizeCost,
          prioritizeRIS: input.prioritizeRIS,
        });

        return recommendations.map(rec => ({
          ...rec,
          summary: getRecommendationSummary(rec),
        }));
      }),
  }),
});

export type AppRouter = typeof appRouter;
