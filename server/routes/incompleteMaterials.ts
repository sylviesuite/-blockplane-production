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

function computeMissing(mat: any): string[] {
  const lisRis = mat.lis_ris_scores?.[0];
  const missing: string[] = [];
  if (mat.score_confidence === "insufficient_data") missing.push("Score insufficient");
  if (mat.manufacturer == null) missing.push("Manufacturer");
  if (lisRis?.lis_score == null) missing.push("LIS score");
  if (lisRis?.ris_score == null) missing.push("RIS score");
  return missing;
}

async function handleList(_req: Request, res: Response) {
  try {
    const rows: any[] = await supabaseRequest(
      "materials?select=id,name,category,manufacturer,score_confidence,created_at," +
        "lis_ris_scores(lis_score,ris_score)&order=created_at.desc&limit=500"
    );

    const incomplete = (rows ?? []).filter((mat: any) => {
      const lisRis = mat.lis_ris_scores?.[0];
      return (
        mat.score_confidence === "insufficient_data" ||
        mat.manufacturer == null ||
        lisRis?.lis_score == null ||
        lisRis?.ris_score == null
      );
    });

    res.json(incomplete.map((mat: any) => ({ ...mat, missing: computeMissing(mat) })));
  } catch (err: any) {
    console.error("[IncompleteMaterials] list failed:", err);
    res.status(500).json({ error: err?.message ?? "Failed to fetch incomplete materials" });
  }
}

async function handleMarkResearched(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await supabaseRequest(`materials?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ score_confidence: "estimated" }),
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("[IncompleteMaterials] mark-researched failed:", err);
    res.status(500).json({ error: err?.message ?? "Failed to update material" });
  }
}

async function handleFlagForResearch(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await supabaseRequest("material_flags", {
      method: "POST",
      body: JSON.stringify({
        material_id: id,
        flag_type: "missing_data",
        notes: "Flagged for research from Incomplete Materials queue",
        status: "pending",
      }),
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("[IncompleteMaterials] flag-research failed:", err);
    res.status(500).json({ error: err?.message ?? "Failed to flag material" });
  }
}

async function handleDelete(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await supabaseRequest(`materials?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("[IncompleteMaterials] delete failed:", err);
    res.status(500).json({ error: err?.message ?? "Failed to delete material" });
  }
}

export function registerIncompleteMaterialsRoutes(app: Application) {
  app.get("/api/admin/incomplete-materials", handleList);
  app.patch("/api/admin/incomplete-materials/:id/mark-researched", handleMarkResearched);
  app.post("/api/admin/incomplete-materials/:id/flag-research", handleFlagForResearch);
  app.delete("/api/admin/incomplete-materials/:id", handleDelete);
}
