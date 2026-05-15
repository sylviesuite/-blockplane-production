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

export const projectsRouter = router({
  save: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      projectData: z.record(z.string(), z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      const rows = await supabaseAdmin(`projects`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: ctx.user.openId,
          name: input.name,
          project_data: input.projectData,
        }),
      });
      return { success: true, id: Array.isArray(rows) ? rows[0]?.id : rows?.id };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await supabaseAdmin(
      `projects?user_id=eq.${ctx.user.openId}&order=updated_at.desc`
    );
    return Array.isArray(rows) ? rows : [];
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await supabaseAdmin(
        `projects?id=eq.${input.id}&user_id=eq.${ctx.user.openId}`
      );
      if (!Array.isArray(rows) || rows.length === 0) throw new Error('Project not found');
      return rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await supabaseAdmin(`projects?id=eq.${input.id}&user_id=eq.${ctx.user.openId}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' } as any,
      });
      return { success: true };
    }),

  rename: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      await supabaseAdmin(`projects?id=eq.${input.id}&user_id=eq.${ctx.user.openId}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' } as any,
        body: JSON.stringify({ name: input.name, updated_at: new Date().toISOString() }),
      });
      return { success: true };
    }),
});
