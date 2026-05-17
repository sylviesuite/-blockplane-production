import type { Application, Request, Response } from "express";
import { searchEPDs } from "../services/ec3Client";

async function handleEc3Test(req: Request, res: Response) {
  try {
    const result = await searchEPDs("concrete", "Concrete");
    res.json(result);
  } catch (err: any) {
    console.error("[EC3 test]", err?.message);
    res.status(502).json({ error: err?.message ?? "EC3 request failed" });
  }
}

export function registerEc3Routes(app: Application) {
  app.get("/api/ec3/test", handleEc3Test);
}
