import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { supabaseSignIn, supabaseSignUp, upsertUserRow, setSessionCookie, insertBetaSignup } from "./lib/auth";
import { getAllMaterials, getMaterialsByCategory, getMaterialById } from './db';
import { logAnalyticsEvent, getKPIMetrics, getTopAlternatives } from './analytics-db';
import { findAlternatives, getRecommendationSummary } from './recommendations';
import { userAccountsRouter } from './routers/userAccounts';
import { adminRouter } from './routers/admin';
import { swapAssistantRouter } from './routers/swapAssistant';
import { impactRouter } from './routers/impact';
import { publicAPIRouter } from './routers/publicAPI';
import { supplierRouter } from './routers/supplier';
import { materialAPIRouter } from './routers/materialAPI';
import { selectRelevantMemories } from './ai/memoryGate';

const MEMORY_BEHAVIOR_RULE =
  'Use prior context only when it clearly improves the current answer. Do not pull old topics into unrelated conversations. Prefer a clean answer to the current question over forcing in unrelated past context.';

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  swapAssistant: swapAssistantRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const { user } = await supabaseSignIn(input.email, input.password);
        await upsertUserRow({ openId: user.id, email: user.email, name: user.email.split("@")[0] });
        await setSessionCookie(ctx.res, ctx.req, user.id, user.email.split("@")[0], user.email);
        return { success: true } as const;
      }),

    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1).max(100),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await supabaseSignUp(input.email, input.password);
        await upsertUserRow({ openId: result.user.id, email: result.user.email, name: input.name });
        if (result.access_token) {
          await setSessionCookie(ctx.res, ctx.req, result.user.id, input.name, result.user.email);
          return { success: true, requiresConfirmation: false } as const;
        }
        // Email confirmation enabled in Supabase — account created, session deferred
        return { success: true, requiresConfirmation: true } as const;
      }),

    betaSignup: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().max(100).optional(),
        role: z.string().max(100).optional(),
        org: z.string().max(255).optional(),
      }))
      .mutation(async ({ input }) => {
        await insertBetaSignup(input);
        return { success: true } as const;
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // AI Assistant for material analysis (WhisperLeaf-style: active context always; long-term memory only when relevant)
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
        recentTurns: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional(),
        memoryResults: z.array(z.object({
          content: z.string(),
          score: z.number().optional(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { question, materials, recentTurns = [], memoryResults = [] } = input;

        // Active context: current-conversation turns (always included)
        const activeContextMessages: Array<{ role: 'user' | 'assistant'; content: string }> = recentTurns.map(
          (t) => ({ role: t.role as 'user' | 'assistant', content: t.content })
        );

        // Long-term memory: only inject when relevance is above threshold
        const relevantMemories = selectRelevantMemories(memoryResults);
        const longTermBlock =
          relevantMemories.length > 0
            ? `\n\nRelevant prior context (use only if it clearly improves your answer):\n${relevantMemories.map((m) => `- ${m.content}`).join('\n')}`
            : '';

        // Build system message: expertise + materials in view + behavior rule + gated long-term memory
        let materialsBlock = '';
        if (materials && materials.length > 0) {
          materialsBlock = `\n\nCurrent materials in view:\n`;
          materials.forEach((m) => {
            materialsBlock += `- ${m.name}: ${m.total} kg CO₂e total\n`;
            materialsBlock += `  Point of Origin: ${m.phases.pointOfOrigin}, Transport: ${m.phases.transport}, Construction: ${m.phases.construction}, Production: ${m.phases.production}, Disposal: ${m.phases.disposal}\n`;
          });
        }

        const systemContent = [
          'You are an expert in sustainable building materials and lifecycle carbon analysis. You help users understand embodied carbon, lifecycle phases (A1-A3 production, A4 transport, A5 construction, B maintenance, C1-C4 disposal), and material sustainability. Provide clear, concise answers focused on actionable insights.',
          MEMORY_BEHAVIOR_RULE,
          materialsBlock,
          longTermBlock,
        ]
          .filter(Boolean)
          .join('');

        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemContent },
            ...activeContextMessages,
            { role: 'user', content: question },
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
      .input(z.object({ id: z.string() }))
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

  // User accounts & saved data
  userAccounts: userAccountsRouter,

  // Admin dashboard
  admin: adminRouter,

  // Impact tracking & case studies
  impact: impactRouter,

  // Public REST API for external integrations
  publicAPI: publicAPIRouter,

  // Supplier integration for real-time quotes
  supplier: supplierRouter,

  // Material API for Revit plugin integration
  materialAPI: materialAPIRouter,

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
