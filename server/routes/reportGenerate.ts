import type { Application, Request, Response } from "express";
import { getMaterialById } from "../db";
import { searchEPDs } from "../services/ec3Client";
import { getRequestUser } from "../lib/auth";

async function supabaseAdmin(path: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function handleGenerateReportData(req: Request, res: Response) {
  const { reportId, materialIds: directIds } = req.body as {
    reportId?: string;
    materialIds?: string[];
  };

  let materialIds: string[];

  if (reportId) {
    const user = await getRequestUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }
    const rows = await supabaseAdmin(
      `reports?id=eq.${encodeURIComponent(reportId)}&user_id=eq.${encodeURIComponent(user.openId)}&limit=1`
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(404).json({ error: "Report not found." });
      return;
    }
    materialIds = rows[0].material_ids ?? [];
  } else if (Array.isArray(directIds) && directIds.length > 0) {
    materialIds = directIds.slice(0, 20);
  } else {
    res.status(400).json({ error: "Provide reportId or materialIds array." });
    return;
  }

  const checkedAt = new Date().toISOString();

  const settled = await Promise.allSettled(
    materialIds.map(async (id) => {
      const material = await getMaterialById(id);
      if (!material) return null;

      let ec3: Awaited<ReturnType<typeof searchEPDs>> | null = null;
      try {
        ec3 = await searchEPDs(material.name, material.category);
      } catch {
        // EC3 unavailable for this material; surface as unchecked
      }

      // EC3 results are assembled in memory here and returned in the response.
      // They are NEVER written to any database table.
      return {
        id: material.id,
        name: material.name,
        category: material.category,
        // BlockPlane catalog data (source: BlockPlane DB)
        totalCarbon: material.totalCarbon != null ? Number(material.totalCarbon) : null,
        functionalUnit: material.functionalUnit ?? null,
        lisScore: material.lisScore ?? null,
        risScore: material.risScore ?? null,
        confidenceLevel: material.confidenceLevel ?? null,
        source: material.source ?? null,
        // EC3 live verification (source: Building Transparency, live at report time)
        ec3Checked: ec3 !== null,
        ec3MatchFound: (ec3?.lowestCarbon ?? null) !== null,
        ec3LowestGwp: ec3?.lowestCarbon ?? null,
        ec3Unit: ec3?.unit ?? null,
        ec3EpdName: ec3?.epdName ?? null,
        ec3Manufacturer: ec3?.manufacturer ?? null,
        ec3VerificationStatus: ec3?.verificationStatus ?? null,
        ec3CheckedAt: checkedAt,
      };
    })
  );

  const materials = settled
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter(Boolean);

  res.json({
    materials,
    generatedAt: checkedAt,
    attribution: "EC3 live verification — data via Building Transparency.",
  });
}

export function registerReportGenerateRoutes(app: Application) {
  app.post("/api/reports/generate-data", handleGenerateReportData);
}
