import type { Application, Request, Response } from "express";

interface InsightRequestBody {
  materialName?: string;
  lis?: number;
  ris?: number;
  cpi?: number;
}

async function handleInsight(req: Request, res: Response) {
  const { materialName = "this material", lis, ris, cpi } = req.body as InsightRequestBody;

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  const CLAUDE_MODEL = (process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6").trim().replace(/^["']|["']$/g, "");

  if (!CLAUDE_API_KEY) {
    return res.status(503).json({ error: "AI insight not configured" });
  }

  try {
    const userMessage = [
      `Material: ${materialName}`,
      lis !== undefined ? `LIS (Lifecycle Impact Score): ${lis}` : null,
      ris !== undefined ? `RIS (Regenerative Impact Score): ${ris}` : null,
      cpi !== undefined ? `CPI (Carbon Performance Index): ${cpi}` : null,
    ].filter(Boolean).join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 300,
        system: "You are a building material analyst for BlockPlane Metric. Write a calm, practical 3-sentence summary of this material's sustainability performance based on its LIS, RIS, and CPI scores. Be specific and useful to a builder or architect.",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error("[insight] Claude API error:", response.status, errBody);
      return res.status(502).json({ error: "Claude API error" });
    }

    const json: any = await response.json();
    const text: string = json?.content?.[0]?.text ?? "";

    return res.json({ text });
  } catch (err) {
    console.error("[insight] Unexpected error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}

export function registerInsightRoutes(app: Application) {
  app.post("/api/insight", handleInsight);
}

