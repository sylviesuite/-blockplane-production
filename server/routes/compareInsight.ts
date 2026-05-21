import type { Application, Request, Response } from "express";
import { logFootprint } from "../lib/footprintLogger";

interface CompareMaterial {
  name: string;
  lis?: number;
  ris?: number | null;
  cpi?: number;
}

async function handleCompareInsight(req: Request, res: Response) {
  const { materials, session_id } = req.body as { materials?: CompareMaterial[]; session_id?: string };

  if (!Array.isArray(materials) || materials.length < 2) {
    return res.status(400).json({ error: "At least two materials are required" });
  }

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  const CLAUDE_MODEL = (process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6").trim().replace(/^["']|["']$/g, "");

  if (!CLAUDE_API_KEY) {
    return res.status(503).json({ error: "AI insight not configured" });
  }

  try {
    const userMessage = materials
      .map(m =>
        [
          `Material: ${m.name}`,
          m.lis !== undefined ? `  LIS (Lifecycle Impact Score): ${m.lis}` : null,
          m.ris !== undefined && m.ris !== null ? `  RIS (Regenerative Impact Score): ${m.ris}` : `  RIS: pending`,
          m.cpi !== undefined ? `  CPI (Cost Performance Index): ${m.cpi}` : null,
        ]
          .filter(Boolean)
          .join("\n")
      )
      .join("\n\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 400,
        system:
          "You are a building material analyst for BlockPlane Metric. The user is comparing these materials for a project in the Great Lakes region. Write a calm, practical 4-sentence analysis of the tradeoffs — be specific about which material performs best for embodied carbon, regenerative impact, and cost, and why.",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error("[compare-insight] Claude API error:", response.status, errBody);
      return res.status(502).json({ error: "Claude API error" });
    }

    const json: any = await response.json();
    const text: string = json?.content?.[0]?.text ?? "";

    logFootprint({
      session_id: session_id ?? null,
      feature_name: "insightbox_compare",
      provider: "anthropic",
      model: CLAUDE_MODEL,
      input_tokens: json?.usage?.input_tokens ?? null,
      output_tokens: json?.usage?.output_tokens ?? null,
    });

    return res.json({ text });
  } catch (err) {
    console.error("[compare-insight] Unexpected error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}

export function registerCompareInsightRoutes(app: Application) {
  app.post("/api/compare-insight", handleCompareInsight);
}
