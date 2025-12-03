// server/ai/claudeInsightClient.ts

import type { InsightScores } from "@shared/scoring";
import type { InsightText, InsightTone } from "@shared/insightText";
import { buildHeuristicInsight } from "@shared/insightText";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-latest";

export type InsightSource =
  | "heuristic-only"
  | "claude+heuristic"
  | "claude-fallback-error";

export interface AIInsightResult extends InsightText {
  source: InsightSource;
  model: string;
  rawText?: string; // optional full model output from Claude
}

export interface AIInsightInput {
  materialName: string;
  scores: InsightScores;
}

/**
 * Core helper for generating material insight text.
 *
 * - Always builds deterministic heuristic insight
 * - Optionally enriches it with Claude when API key is present
 * - Never throws: on any error, returns heuristic-only (or heuristic-fallback) result
 */
export async function generateClaudeInsight(
  input: AIInsightInput
): Promise<AIInsightResult> {
  const { materialName, scores } = input;

  // Always compute heuristic first (this never fails)
  const heuristic = buildHeuristicInsight(scores);

  // If no API key, stay deterministic and cheap
  if (!CLAUDE_API_KEY) {
    return {
      ...heuristic,
      source: "heuristic-only",
      model: "heuristic-only",
    };
  }

  try {
    const systemPrompt = `
You are Sylvie Metrics' BlockPlane assistant.
Your job is to turn lifecycle scores into short, practical insights
for builders and architects. Be concrete, calm, and non-judgmental.
Keep responses under 160 words.
    `.trim();

    // Pack the relevant data for the model
    const payload = {
      model: CLAUDE_MODEL,
      max_tokens: 400,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                `Material: ${materialName}`,
                ``,
                `Scores:`,
                `- LIS (Lifecycle Impact Score): ${scores.lis}`,
                `- RIS (Regenerative Impact Score): ${scores.ris}`,
                `- Quadrant: ${scores.quadrant}`,
                `- CPI band: ${scores.cpiBand}`,
                `- Paris alignment: ${scores.parisAlignment}%`,
                ``,
                `Heuristic headline: ${heuristic.headline}`,
                `Heuristic bullets:`,
                ...(heuristic.bullets ?? []).map((b) => `- ${b}`),
                ``,
                `Task:`,
                `1. Write a short, friendly headline (max 80 characters).`,
                `2. Write 2–4 bullet points that explain what this means in practical terms.`,
                `3. Respect the tone: ${heuristic.tone}.`,
                `4. Do NOT invent numbers; stay within the data given.`,
              ].join("\n"),
            },
          ],
        },
      ],
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Log response body if we can, for debugging
      const errorBody = await response.text().catch(() => "");
      console.error(
        "[ClaudeInsight] Claude API error:",
        response.status,
        errorBody
      );
      throw new Error(`Claude API error: ${response.status}`);
    }

    const json: any = await response.json();

    // Anthropic messages API: content is an array; grab first text block
    const text: string =
      json?.content?.[0]?.text ??
      (Array.isArray(json?.content)
        ? json.content.map((c: any) => c.text).join("\n")
        : "") ??
      "";

    if (!text) {
      throw new Error("Claude returned empty content");
    }

    // Very simple parsing:
    // - first non-empty line as headline
    // - subsequent lines starting with "-" as bullets
    const lines = text.split("\n").map((l: string) => l.trim());
    const nonEmpty = lines.filter((l) => l.length > 0);

    const aiHeadline = nonEmpty[0] ?? heuristic.headline;

    const aiBulletsRaw = nonEmpty
      .slice(1)
      .filter((l) => l.startsWith("-"))
      .map((l) => l.replace(/^-+\s*/, ""));

    const aiBullets =
      aiBulletsRaw.length > 0 ? aiBulletsRaw : heuristic.bullets;

    const aiTone: InsightTone = heuristic.tone; // keep deterministic tone for now

    return {
      headline: aiHeadline,
      body: heuristic.body, // keep body from heuristic, bullets/headline from AI
      bullets: aiBullets,
      tone: aiTone,
      source: "claude+heuristic",
      model: CLAUDE_MODEL,
      rawText: text,
    };
  } catch (err) {
    console.error("[ClaudeInsight] Error, falling back to heuristic:", err);
    return {
      ...heuristic,
      source: "claude-fallback-error",
      model: CLAUDE_MODEL,
    };
  }
}


