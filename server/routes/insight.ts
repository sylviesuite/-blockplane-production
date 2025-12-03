import type { Application, Request, Response } from "express";
import {
  InsightScores,
  InsightText,
  Quadrant,
  RISComponents,
  buildInsightScores,
  buildStaticInsightText,
} from "@shared/scoring";
import { callClaudeForInsight } from "../ai/claudeInsightClient";

export interface InsightRequestBody {
  lis: number;
  ris: number;
  cpi: number;
  quadrant: Quadrant;
  risComponents: RISComponents;
  parisAlignment: number;
  materialName?: string;
  category?: string;
  contextNote?: string;
  useAI?: boolean;
}

async function handleInsight(req: Request, res: Response) {
  const body = req.body as InsightRequestBody;

  const scores: InsightScores = buildInsightScores({
    lis: body.lis,
    ris: body.ris,
    cpi: body.cpi,
    quadrant: body.quadrant,
    risComponents: body.risComponents,
    parisAlignment: body.parisAlignment,
  });

  const staticInsight: InsightText = buildStaticInsightText(scores);
  let insightText: InsightText = staticInsight;

  if (body.useAI && process.env.CLAUDE_API_KEY) {
    try {
      insightText = await callClaudeForInsight({
        scores,
        materialName: body.materialName,
        category: body.category,
        contextNote: body.contextNote,
      });
    } catch (error) {
      console.error("Insight AI call failed, using static fallback:", error);
    }
  }

  res.json({ scores, insightText });
}

export function registerInsightRoutes(app: Application) {
  app.post("/api/insight", handleInsight);
}

