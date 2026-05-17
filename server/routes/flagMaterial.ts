import type { Application, Request, Response } from "express";

async function supabaseRequest(path: string, options: RequestInit = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase credentials not configured");
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.message ?? `Supabase error ${res.status}`);
  return body;
}

async function handleCreateFlag(req: Request, res: Response) {
  const { materialId, flagType, notes, userId } = req.body as {
    materialId?: string;
    flagType?: string;
    notes?: string;
    userId?: string;
  };

  if (!materialId || !flagType) {
    return res.status(400).json({ error: "materialId and flagType are required" });
  }

  try {
    await supabaseRequest("material_flags", {
      method: "POST",
      body: JSON.stringify({
        material_id: materialId,
        flag_type: flagType,
        notes: notes || null,
        user_id: userId || null,
      }),
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("[FlagMaterial] insert failed:", err);
    res.status(500).json({ error: err?.message ?? "Failed to save flag" });
  }
}

async function handleListFlags(req: Request, res: Response) {
  const status = (req.query.status as string) || "pending";
  const allowed = ["pending", "reviewed", "resolved", "dismissed", "all"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "invalid status" });
  }

  try {
    const filter = status === "all" ? "" : `&status=eq.${encodeURIComponent(status)}`;
    const rows = await supabaseRequest(
      `material_flags?select=id,material_id,flag_type,notes,user_id,status,created_at,materials(name)&order=created_at.desc&limit=200${filter}`
    );
    res.json(rows);
  } catch (err: any) {
    console.error("[FlagMaterial] list failed:", err);
    res.status(500).json({ error: err?.message ?? "Failed to fetch flags" });
  }
}

async function handleUpdateFlagStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body as { status?: string };
  const allowed = ["pending", "reviewed", "resolved", "dismissed"];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: "valid status required" });
  }

  try {
    await supabaseRequest(`material_flags?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("[FlagMaterial] update failed:", err);
    res.status(500).json({ error: err?.message ?? "Failed to update flag" });
  }
}

export function registerFlagMaterialRoutes(app: Application) {
  app.post("/api/flag-material", handleCreateFlag);
  app.get("/api/admin/flags", handleListFlags);
  app.patch("/api/admin/flags/:id/status", handleUpdateFlagStatus);
}
