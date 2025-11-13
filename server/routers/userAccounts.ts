import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { savedProjects, favoriteMaterials, msiPresets } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export const userAccountsRouter = router({
  // ============================================================================
  // SAVED PROJECTS
  // ============================================================================
  
  saveProject: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      bomData: z.string(), // JSON string
      totalCarbon: z.number().optional(),
      totalCost: z.number().optional(),
      avgRIS: z.number().optional(),
      avgLIS: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [project] = await db.insert(savedProjects).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        bomData: input.bomData,
        totalCarbon: input.totalCarbon?.toString(),
        totalCost: input.totalCost?.toString(),
        avgRIS: input.avgRIS?.toString(),
        avgLIS: input.avgLIS?.toString(),
      });

      return { success: true, projectId: project.insertId };
    }),

  getProjects: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const projects = await db
        .select()
        .from(savedProjects)
        .where(eq(savedProjects.userId, ctx.user.id))
        .orderBy(desc(savedProjects.updatedAt));

      return projects.map(p => ({
        ...p,
        totalCarbon: p.totalCarbon ? parseFloat(p.totalCarbon) : null,
        totalCost: p.totalCost ? parseFloat(p.totalCost) : null,
        avgRIS: p.avgRIS ? parseFloat(p.avgRIS) : null,
        avgLIS: p.avgLIS ? parseFloat(p.avgLIS) : null,
      }));
    }),

  getProject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const [project] = await db
        .select()
        .from(savedProjects)
        .where(
          and(
            eq(savedProjects.id, input.id),
            eq(savedProjects.userId, ctx.user.id)
          )
        );

      if (!project) return null;

      return {
        ...project,
        totalCarbon: project.totalCarbon ? parseFloat(project.totalCarbon) : null,
        totalCost: project.totalCost ? parseFloat(project.totalCost) : null,
        avgRIS: project.avgRIS ? parseFloat(project.avgRIS) : null,
        avgLIS: project.avgLIS ? parseFloat(project.avgLIS) : null,
      };
    }),

  deleteProject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .delete(savedProjects)
        .where(
          and(
            eq(savedProjects.id, input.id),
            eq(savedProjects.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // ============================================================================
  // FAVORITE MATERIALS
  // ============================================================================

  addFavorite: protectedProcedure
    .input(z.object({ materialId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Check if already favorited
      const existing = await db
        .select()
        .from(favoriteMaterials)
        .where(
          and(
            eq(favoriteMaterials.userId, ctx.user.id),
            eq(favoriteMaterials.materialId, input.materialId)
          )
        );

      if (existing.length > 0) {
        return { success: true, alreadyFavorited: true };
      }

      await db.insert(favoriteMaterials).values({
        userId: ctx.user.id,
        materialId: input.materialId,
      });

      return { success: true, alreadyFavorited: false };
    }),

  removeFavorite: protectedProcedure
    .input(z.object({ materialId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .delete(favoriteMaterials)
        .where(
          and(
            eq(favoriteMaterials.userId, ctx.user.id),
            eq(favoriteMaterials.materialId, input.materialId)
          )
        );

      return { success: true };
    }),

  getFavorites: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const favorites = await db
        .select()
        .from(favoriteMaterials)
        .where(eq(favoriteMaterials.userId, ctx.user.id))
        .orderBy(desc(favoriteMaterials.createdAt));

      return favorites;
    }),

  isFavorite: protectedProcedure
    .input(z.object({ materialId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return false;

      const [favorite] = await db
        .select()
        .from(favoriteMaterials)
        .where(
          and(
            eq(favoriteMaterials.userId, ctx.user.id),
            eq(favoriteMaterials.materialId, input.materialId)
          )
        );

      return !!favorite;
    }),

  // ============================================================================
  // MSI PRESETS
  // ============================================================================

  savePreset: protectedProcedure
    .input(z.object({
      name: z.string(),
      impactWeight: z.number().min(0).max(100),
      carbonWeight: z.number().min(0).max(100),
      costWeight: z.number().min(0).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [preset] = await db.insert(msiPresets).values({
        userId: ctx.user.id,
        name: input.name,
        impactWeight: input.impactWeight,
        carbonWeight: input.carbonWeight,
        costWeight: input.costWeight,
      });

      return { success: true, presetId: preset.insertId };
    }),

  getPresets: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const presets = await db
        .select()
        .from(msiPresets)
        .where(eq(msiPresets.userId, ctx.user.id))
        .orderBy(desc(msiPresets.createdAt));

      return presets;
    }),

  deletePreset: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .delete(msiPresets)
        .where(
          and(
            eq(msiPresets.id, input.id),
            eq(msiPresets.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),
});
