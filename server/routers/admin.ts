import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import { materials, lifecycleValues, risScores, pricing, epdMetadata, analyticsEvents } from '../../drizzle/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // ============================================================================
  // MATERIAL CRUD OPERATIONS
  // ============================================================================

  createMaterial: adminProcedure
    .input(z.object({
      name: z.string(),
      category: z.enum(['Timber', 'Steel', 'Concrete', 'Earth']),
      functionalUnit: z.string(),
      totalCarbon: z.number(),
      description: z.string().optional(),
      lifecyclePhases: z.object({
        'A1-A3': z.number(),
        'A4': z.number(),
        'A5': z.number(),
        'B': z.number(),
        'C1-C4': z.number(),
      }),
      risScore: z.number().min(0).max(100),
      lisScore: z.number().min(0).max(100),
      costPerUnit: z.number(),
      epdSource: z.string().optional(),
      epdYear: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Insert material
      const [materialResult] = await db.insert(materials).values({
        name: input.name,
        category: input.category,
        functionalUnit: input.functionalUnit,
        totalCarbon: input.totalCarbon.toString(),
        description: input.description,
      });

      const materialId = materialResult.insertId;

      // Insert lifecycle values
      const lifecycleEntries = Object.entries(input.lifecyclePhases).map(([phase, value]) => ({
        materialId,
        phase: phase as 'A1-A3' | 'A4' | 'A5' | 'B' | 'C1-C4',
        value: value.toString(),
      }));
      await db.insert(lifecycleValues).values(lifecycleEntries);

      // Insert RIS/LIS scores
      await db.insert(risScores).values({
        materialId,
        risScore: input.risScore,
        lisScore: input.lisScore,
      });

      // Insert pricing
      await db.insert(pricing).values({
        materialId,
        costPerUnit: input.costPerUnit.toString(),
        currency: 'USD',
      });

      // Insert EPD metadata if provided
      if (input.epdSource) {
        await db.insert(epdMetadata).values({
          materialId,
          source: input.epdSource,
          referenceYear: input.epdYear,
        });
      }

      return { success: true, materialId };
    }),

  updateMaterial: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      category: z.enum(['Timber', 'Steel', 'Concrete', 'Earth']).optional(),
      functionalUnit: z.string().optional(),
      totalCarbon: z.number().optional(),
      description: z.string().optional(),
      lifecyclePhases: z.object({
        'A1-A3': z.number(),
        'A4': z.number(),
        'A5': z.number(),
        'B': z.number(),
        'C1-C4': z.number(),
      }).optional(),
      risScore: z.number().min(0).max(100).optional(),
      lisScore: z.number().min(0).max(100).optional(),
      costPerUnit: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, lifecyclePhases, risScore, lisScore, costPerUnit, ...materialUpdates } = input;

      // Update material
      if (Object.keys(materialUpdates).length > 0) {
        const updates: any = {};
        if (materialUpdates.name) updates.name = materialUpdates.name;
        if (materialUpdates.category) updates.category = materialUpdates.category;
        if (materialUpdates.functionalUnit) updates.functionalUnit = materialUpdates.functionalUnit;
        if (materialUpdates.totalCarbon !== undefined) updates.totalCarbon = materialUpdates.totalCarbon.toString();
        if (materialUpdates.description !== undefined) updates.description = materialUpdates.description;

        await db.update(materials).set(updates).where(eq(materials.id, id));
      }

      // Update lifecycle values
      if (lifecyclePhases) {
        for (const [phase, value] of Object.entries(lifecyclePhases)) {
          await db
            .update(lifecycleValues)
            .set({ value: value.toString() })
            .where(
              and(
                eq(lifecycleValues.materialId, id),
                eq(lifecycleValues.phase, phase as any)
              )
            );
        }
      }

      // Update RIS/LIS scores
      if (risScore !== undefined || lisScore !== undefined) {
        const updates: any = {};
        if (risScore !== undefined) updates.risScore = risScore;
        if (lisScore !== undefined) updates.lisScore = lisScore;
        await db.update(risScores).set(updates).where(eq(risScores.materialId, id));
      }

      // Update pricing
      if (costPerUnit !== undefined) {
        await db
          .update(pricing)
          .set({ costPerUnit: costPerUnit.toString() })
          .where(eq(pricing.materialId, id));
      }

      return { success: true };
    }),

  deleteMaterial: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Delete related records first
      await db.delete(lifecycleValues).where(eq(lifecycleValues.materialId, input.id));
      await db.delete(risScores).where(eq(risScores.materialId, input.id));
      await db.delete(pricing).where(eq(pricing.materialId, input.id));
      await db.delete(epdMetadata).where(eq(epdMetadata.materialId, input.id));

      // Delete material
      await db.delete(materials).where(eq(materials.id, input.id));

      return { success: true };
    }),

  // ============================================================================
  // BULK IMPORT
  // ============================================================================

  bulkImport: adminProcedure
    .input(z.object({
      materials: z.array(z.object({
        name: z.string(),
        category: z.enum(['Timber', 'Steel', 'Concrete', 'Earth']),
        functionalUnit: z.string(),
        totalCarbon: z.number(),
        description: z.string().optional(),
        lifecyclePhases: z.object({
          'A1-A3': z.number(),
          'A4': z.number(),
          'A5': z.number(),
          'B': z.number(),
          'C1-C4': z.number(),
        }),
        risScore: z.number().min(0).max(100),
        lisScore: z.number().min(0).max(100),
        costPerUnit: z.number(),
        epdSource: z.string().optional(),
        epdYear: z.number().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let successCount = 0;
      const errors: string[] = [];

      for (const material of input.materials) {
        try {
          // Insert material
          const [materialResult] = await db.insert(materials).values({
            name: material.name,
            category: material.category,
            functionalUnit: material.functionalUnit,
            totalCarbon: material.totalCarbon.toString(),
            description: material.description,
          });

          const materialId = materialResult.insertId;

          // Insert lifecycle values
          const lifecycleEntries = Object.entries(material.lifecyclePhases).map(([phase, value]) => ({
            materialId,
            phase: phase as 'A1-A3' | 'A4' | 'A5' | 'B' | 'C1-C4',
            value: value.toString(),
          }));
          await db.insert(lifecycleValues).values(lifecycleEntries);

          // Insert RIS/LIS scores
          await db.insert(risScores).values({
            materialId,
            risScore: material.risScore,
            lisScore: material.lisScore,
          });

          // Insert pricing
          await db.insert(pricing).values({
            materialId,
            costPerUnit: material.costPerUnit.toString(),
            currency: 'USD',
          });

          // Insert EPD metadata if provided
          if (material.epdSource) {
            await db.insert(epdMetadata).values({
              materialId,
              source: material.epdSource,
              referenceYear: material.epdYear,
            });
          }

          successCount++;
        } catch (error) {
          errors.push(`Failed to import ${material.name}: ${error}`);
        }
      }

      return {
        success: true,
        imported: successCount,
        total: input.materials.length,
        errors,
      };
    }),

  // ============================================================================
  // USAGE ANALYTICS
  // ============================================================================

  getUsageStats: adminProcedure
    .input(z.object({ daysAgo: z.number().default(30) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.daysAgo);

      // Total events
      const [totalEventsResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.createdAt, cutoffDate));

      // Events by type
      const eventsByType = await db
        .select({
          eventType: analyticsEvents.eventType,
          count: sql<number>`count(*)`,
        })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.createdAt, cutoffDate))
        .groupBy(analyticsEvents.eventType);

      // Most viewed materials
      const mostViewed = await db
        .select({
          materialName: analyticsEvents.materialName,
          count: sql<number>`count(*)`,
        })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.createdAt, cutoffDate),
            eq(analyticsEvents.eventType, 'material_viewed')
          )
        )
        .groupBy(analyticsEvents.materialName)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      // Total carbon saved
      const [carbonSavedResult] = await db
        .select({ total: sql<number>`sum(carbonSaved)` })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.createdAt, cutoffDate),
            eq(analyticsEvents.eventType, 'material_substitution')
          )
        );

      return {
        totalEvents: totalEventsResult.count,
        eventsByType,
        mostViewedMaterials: mostViewed,
        totalCarbonSaved: carbonSavedResult.total || 0,
      };
    }),

  getMaterialStats: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return null;

      // Count by category
      const byCategory = await db
        .select({
          category: materials.category,
          count: sql<number>`count(*)`,
        })
        .from(materials)
        .groupBy(materials.category);

      // Total materials
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(materials);

      return {
        total: totalResult.count,
        byCategory,
      };
    }),
});
