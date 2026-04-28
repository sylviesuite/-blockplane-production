import type { Application, Request, Response } from "express";
import { getAllMaterials } from "../db";

const BASE_SYSTEM_PROMPT = `You are the BlockPlane AI Builder's Assistant — an expert in sustainable construction materials, embodied carbon, and lifecycle analysis. You have access to the BlockPlane material database.

When answering questions:
- Reference specific materials by name with their actual LIS, RIS, carbon (kg CO₂e/m²), and cost ($/m²) values
- Explain what LIS (Lifecycle Impact Score) and RIS (Regenerative Impact Score) mean in plain language when relevant
- When comparing materials, use a structured format: Carbon | Cost | RIS | LIS
- Flag any material with RIS >= 80 as Regenerative
- Flag any material with LIS >= 80 as High Lifecycle Performance
- Be direct and practical — users are builders, architects, and developers
- If asked for alternatives, suggest the top 2-3 by best RIS/carbon tradeoff

MATERIAL DATABASE:
{{MATERIALS_JSON}}`;

export function registerChatRoutes(app: Application) {
  app.post("/api/chat", async (req: Request, res: Response) => {
    const { messages } = req.body as { messages: { role: string; content: string }[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    const apiKey = process.env.CLAUDE_API_KEY;
    const model = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";

    if (!apiKey) {
      res.status(503).json({ error: "AI not configured on this server" });
      return;
    }

    try {
      const materials = await getAllMaterials();
      const materialsJson = JSON.stringify(
        materials.map((m) => ({
          name: m.name,
          category: m.category,
          carbon: parseFloat(m.totalCarbon),
          cost: parseFloat(m.costPerUnit),
          ris: m.risScore,
          lis: m.lisScore,
          isRegenerative: m.isRegenerative === 1,
        }))
      );

      const systemPrompt = BASE_SYSTEM_PROMPT.replace("{{MATERIALS_JSON}}", materialsJson);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        console.error("[Chat] Claude API error:", response.status, errBody);
        res.status(502).json({ error: "AI request failed" });
        return;
      }

      const data = await response.json() as any;
      const text: string = data?.content?.[0]?.text ?? "";
      res.json({ text, model });
    } catch (err) {
      console.error("[Chat] Error:", err);
      res.status(500).json({ error: "Internal error" });
    }
  });
}
