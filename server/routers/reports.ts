import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';

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

export const reportsRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      clientName: z.string().max(200).optional(),
      notes: z.string().max(2000).optional(),
      materialIds: z.array(z.string()).min(1).max(20),
      projectId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const rows = await supabaseAdmin(`reports`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: ctx.user.openId,
          project_id: input.projectId ?? null,
          title: input.title,
          client_name: input.clientName ?? null,
          notes: input.notes ?? null,
          material_ids: input.materialIds,
          report_type: 'client-report',
        }),
      });
      return { success: true, id: Array.isArray(rows) ? rows[0]?.id : rows?.id };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await supabaseAdmin(
      `reports?user_id=eq.${ctx.user.openId}&order=created_at.desc`
    );
    return Array.isArray(rows) ? rows : [];
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await supabaseAdmin(
        `reports?id=eq.${input.id}&user_id=eq.${ctx.user.openId}`
      );
      if (!Array.isArray(rows) || rows.length === 0) throw new Error('Report not found');
      return rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await supabaseAdmin(`reports?id=eq.${input.id}&user_id=eq.${ctx.user.openId}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' } as any,
      });
      return { success: true };
    }),
});
