import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import { materials, lifecycleValues, risScores, pricing, epdMetadata, analyticsEvents } from '../../drizzle/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { researchAndInsertSingleMaterial } from '../agents/materialResearchAgent';

async function supabaseAdmin(path: string, init: RequestInit = {}): Promise<any> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

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
  // BULK IMPORT TO SUPABASE
  // ============================================================================

  bulkImportToSupabase: adminProcedure
    .input(z.object({
      rows: z.array(z.object({
        name: z.string().min(1).max(255),
        category: z.string().min(1).max(100),
        functional_unit: z.string().max(50).optional(),
        carbon_kg_per_unit: z.number().nullable().optional(),
        cost_per_unit: z.number().nullable().optional(),
        lis_score: z.number().min(0).max(100).nullable().optional(),
        ris_score: z.number().min(0).max(100).nullable().optional(),
        a1_a3: z.number().nullable().optional(),
        a4: z.number().nullable().optional(),
        a5: z.number().nullable().optional(),
        b: z.number().nullable().optional(),
        c1_c4: z.number().nullable().optional(),
        description: z.string().max(2000).optional(),
        manufacturer: z.string().max(255).optional(),
        source: z.string().max(255).optional(),
      })).min(1).max(500),
    }))
    .mutation(async ({ input }) => {
      let imported = 0;
      let needsResearch = 0;
      const errors: string[] = [];

      for (const row of input.rows) {
        try {
          const hasCarbon = row.carbon_kg_per_unit != null && row.carbon_kg_per_unit > 0;

          // Insert material (ignore duplicate names)
          const inserted = await supabaseAdmin(
            `materials`,
            {
              method: "POST",
              headers: { Prefer: "return=representation,resolution=ignore-duplicates" } as any,
              body: JSON.stringify({
                name: row.name,
                category: row.category.toLowerCase(),
                manufacturer: row.manufacturer ?? null,
                description: row.description ?? null,
                source: row.source ?? null,
                needs_research: !hasCarbon,
              }),
            }
          );

          // Resolve UUID
          let materialId: string | null = null;
          if (Array.isArray(inserted) && inserted.length > 0) {
            materialId = inserted[0].id;
          } else {
            const existing = await supabaseAdmin(
              `materials?name=eq.${encodeURIComponent(row.name)}&select=id&limit=1`
            );
            materialId = Array.isArray(existing) && existing.length > 0 ? existing[0].id : null;
          }

          if (!materialId) {
            errors.push(`Could not resolve ID for "${row.name}"`);
            continue;
          }

          if (hasCarbon) {
            const totalC = row.carbon_kg_per_unit!;
            const c1c4 = row.c1_c4 ?? 0;

            await supabaseAdmin(`carbon_footprints`, {
              method: "POST",
              headers: { Prefer: "return=minimal,resolution=ignore-duplicates" } as any,
              body: JSON.stringify({
                material_id: materialId,
                a1_a3_manufacturing: row.a1_a3 ?? totalC * 0.9,
                a4_transport: row.a4 ?? totalC * 0.1,
                a5_installation: row.a5 ?? 0,
                b1_b7_use_phase: row.b ?? 0,
                c1_c4_end_of_life: c1c4,
                total_carbon_cradle_to_gate: totalC,
                total_carbon_cradle_to_grave: totalC + c1c4,
                functional_unit: (row.functional_unit ?? "sq ft").slice(0, 50),
                source: (row.source ?? "Bulk import").slice(0, 255),
                verification_status: "self_declared",
              }),
            }).catch((e: any) => console.warn(`[BulkImport] carbon_footprints skipped: ${e.message}`));

            if (row.lis_score != null || row.ris_score != null) {
              await supabaseAdmin(`lis_ris_scores`, {
                method: "POST",
                headers: { Prefer: "return=minimal,resolution=ignore-duplicates" } as any,
                body: JSON.stringify({
                  material_id: materialId,
                  lis_score: row.lis_score ?? 0,
                  ris_score: row.ris_score ?? 0,
                  baseline_region: "Great Lakes",
                  calculation_version: "1.0",
                  calculation_date: new Date().toISOString().split("T")[0],
                }),
              }).catch((e: any) => console.warn(`[BulkImport] lis_ris_scores skipped: ${e.message}`));
            }

            if (row.cost_per_unit != null) {
              const rdExists = await supabaseAdmin(
                `regional_data?material_id=eq.${materialId}&region=eq.${encodeURIComponent("Northern Michigan")}&select=id&limit=1`
              );
              if (!Array.isArray(rdExists) || rdExists.length === 0) {
                await supabaseAdmin(`regional_data`, {
                  method: "POST",
                  headers: { Prefer: "return=minimal" } as any,
                  body: JSON.stringify({
                    material_id: materialId,
                    region: "Northern Michigan",
                    state_province: "MI",
                    country: "US",
                    supplier_name: row.manufacturer ?? null,
                    price_per_unit: row.cost_per_unit,
                    currency: "USD",
                    unit: (row.functional_unit ?? "sq ft").slice(0, 50),
                    availability_status: "in_stock",
                  }),
                }).catch((e: any) => console.warn(`[BulkImport] regional_data skipped: ${e.message}`));
              }
            }
          } else {
            needsResearch++;
          }

          imported++;
        } catch (err: any) {
          errors.push(`"${row.name}": ${err?.message ?? String(err)}`);
        }
      }

      return { imported, needsResearch, total: input.rows.length, errors };
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

  // ============================================================================
  // MATERIAL SUBMISSIONS REVIEW QUEUE
  // ============================================================================

  getSubmissions: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
    }))
    .query(async ({ input }) => {
      const filter = input.status === "all"
        ? "material_submissions?select=*&order=created_at.desc&limit=200"
        : `material_submissions?select=*&status=eq.${input.status}&order=created_at.desc&limit=200`;
      return await supabaseAdmin(filter);
    }),

  reviewSubmission: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(["approved", "rejected"]),
      reviewerNotes: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input }) => {
      // Fetch submission details before patching so we have the data for research
      let submission: any = null;
      if (input.status === "approved") {
        const rows = await supabaseAdmin(
          `material_submissions?id=eq.${encodeURIComponent(input.id)}&select=name,category,carbon_value,functional_unit,description,manufacturer,source&limit=1`
        );
        submission = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      }

      // Mark approved/rejected
      await supabaseAdmin(
        `material_submissions?id=eq.${encodeURIComponent(input.id)}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            status: input.status,
            reviewer_notes: input.reviewerNotes ?? null,
            reviewed_at: new Date().toISOString(),
          }),
        }
      );

      // On approval: fire targeted research and insert asynchronously
      if (input.status === "approved" && submission) {
        setImmediate(() => {
          researchAndInsertSingleMaterial({
            name: submission.name,
            category: submission.category,
            carbonValue: submission.carbon_value,
            functionalUnit: submission.functional_unit,
            description: submission.description,
            manufacturer: submission.manufacturer,
            source: submission.source,
          }).catch((err: any) =>
            console.error(`[ReviewSubmission] Research failed for "${submission.name}":`, err?.message)
          );
        });
        return { success: true, researching: true };
      }

      return { success: true, researching: false };
    }),
});
