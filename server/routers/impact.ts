import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { generateCaseStudy, generateMonthlyReport } from '../lib/caseStudyGenerator';

export const impactRouter = router({
  /**
   * Generate a case study from project data
   */
  generateCaseStudy: protectedProcedure
    .input(z.object({
      projectName: z.string(),
      projectType: z.enum(['residential', 'commercial', 'industrial']),
      location: z.string(),
      totalArea: z.number(),
      materialsUsed: z.array(z.object({
        name: z.string(),
        category: z.string(),
        quantity: z.number(),
        unit: z.string(),
      })),
      carbonSaved: z.number(),
      costDifference: z.number(),
      timeframe: z.string(),
    }))
    .mutation(async ({ input }) => {
      const caseStudy = await generateCaseStudy(input);
      return caseStudy;
    }),

  /**
   * Generate monthly impact report for user
   */
  generateMonthlyReport: protectedProcedure
    .input(z.object({
      month: z.string(),
      carbonSaved: z.number(),
      projectsCompleted: z.number(),
      materialsSubstituted: z.number(),
      topMaterial: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const emailContent = await generateMonthlyReport({
        userName: ctx.user.name || 'User',
        ...input,
      });
      
      return {
        success: true,
        emailContent,
      };
    }),

  /**
   * Get global impact metrics (public)
   */
  getGlobalMetrics: publicProcedure
    .query(async () => {
      // In production, this would query the globalImpact table
      // For now, return mock data
      return {
        totalCarbonSaved: 125847.5,
        totalSubstitutions: 3421,
        totalProjectsOptimized: 892,
        totalAIRecommendations: 5234,
        aiAcceptanceRate: 65.3,
        activeUsers: 1247,
      };
    }),

  /**
   * Get user's personal impact metrics
   */
  getUserImpact: protectedProcedure
    .query(async ({ ctx }) => {
      // In production, this would query the userImpact table
      // For now, return mock data
      return {
        totalCarbonSaved: 8234.5,
        totalSubstitutions: 47,
        totalProjectsOptimized: 12,
        rank: 23, // User's rank on leaderboard
        percentile: 92, // Top 8%
      };
    }),
});
