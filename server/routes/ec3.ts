import type { Application, Request, Response } from "express";
import { searchEPDs } from "../services/ec3Client";

async function handleEc3Check(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: "Material ID is required." });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    res.status(500).json({ error: "Server configuration error." });
    return;
  }

  try {
    const url = `${supabaseUrl}/rest/v1/materials?id=eq.${encodeURIComponent(id)}&select=name,category&limit=1`;
    const matRes = await fetch(url, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    if (!matRes.ok) {
      res.status(502).json({ error: "Failed to look up material." });
      return;
    }
    const rows = await matRes.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(404).json({ error: "Material not found." });
      return;
    }

    const { name, category } = rows[0];
    const ec3 = await searchEPDs(name, category ?? "");

    res.json({
      materialName: name,
      searchedAt: new Date().toISOString(),
      matchFound: ec3.lowestCarbon !== null,
      ec3: ec3.lowestCarbon !== null
        ? {
            lowestGwp: ec3.lowestCarbon,
            unit: ec3.unit,
            epdName: ec3.epdName,
            manufacturer: ec3.manufacturer,
            verificationStatus: ec3.verificationStatus,
            resultCount: ec3.allResults.length,
          }
        : null,
      attribution: "EC3 live verification — data via Building Transparency.",
    });
  } catch (err: any) {
    console.error("[EC3 check]", err?.message);
    res.status(502).json({ error: "EC3 verification unavailable. Please try again later." });
  }
}

export function registerEc3Routes(app: Application) {
  app.get("/api/materials/:id/ec3-check", handleEc3Check);
}
