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

    // Respond immediately so the HTTP connection isn't held open for the full run (~22 min)
    res.status(202).json({ ok: true, message: "Agent started — check Render logs for results" });

    // Run asynchronously after response is sent
    setImmediate(() => {
      console.log("[AgentRoute] Starting material research agent (async)");
      runMaterialResearchAgent()
        .then((summary) => console.log("[AgentRoute] Agent complete:", JSON.stringify(summary)))
        .catch((err) => console.error("[AgentRoute] Agent failed:", err));
    });
  });
}
