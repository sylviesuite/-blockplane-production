import type { Application, Request, Response } from "express";
import { runMaterialResearchAgent } from "../agents/materialResearchAgent";

export function registerAgentRoutes(app: Application) {
  app.get("/api/agent/run-research", async (req: Request, res: Response) => {
    const secret = process.env.AGENT_SECRET;
    if (!secret) {
      res.status(503).json({ error: "AGENT_SECRET not configured on this server" });
      return;
    }
    if (req.headers["x-agent-secret"] !== secret) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      console.log("[AgentRoute] Starting material research agent");
      const summary = await runMaterialResearchAgent();
      console.log("[AgentRoute] Agent complete:", summary);
      res.json({ ok: true, summary });
    } catch (err: any) {
      console.error("[AgentRoute] Agent failed:", err);
      res.status(500).json({ error: err?.message ?? "Agent failed" });
    }
  });
}
