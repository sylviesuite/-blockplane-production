import Anthropic from "@anthropic-ai/sdk";
import { InsightScores, InsightText } from "@shared/scoring";

const apiKey = process.env.CLAUDE_API_KEY;

const claudeClient = apiKey
  ? new Anthropic({ apiKey })
  : null;

const DEFAULT_MODEL = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-latest";

type ClaudeInput = {
  scores: InsightScores;
  materialName?: string;
  category?: string;
  contextNote?: string;
};

function buildPrompt(input: ClaudeInput) {
  const { materialName, category, contextNote } = input;
  return [
    "You are an expert building-science assistant.",
    "Explain the provided scores in plain-English guidance for busy builders.",
    "Avoid LIS/RIS jargon; keep the tone practical and upbeat.",
    `Material: ${materialName ?? "anonymous"}`,
    category ? `Category: ${category}` : null,
    contextNote ? `Context: ${contextNote}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function callClaudeForInsight(input: ClaudeInput): Promise<InsightText> {
  if (!claudeClient) {
    throw new Error("CLAUDE_API_KEY is not configured");
  }

  const prompt = buildPrompt(input);

  const response = await claudeClient.messages.create({
    model: DEFAULT_MODEL,
    temperature: 0.3,
    max_tokens: 400,
    system: prompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Return ONLY valid JSON that matches {" +
              '"short": "...", "details": "..."}' +
              " describing the material scores.",
          },
        ],
      },
    ],
  });

  const text = response.content?.[0]?.type === "text" ? response.content[0].text : "{}";
  let parsed: { short?: string; details?: string } = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Claude response did not contain valid JSON");
  }

  return {
    short: parsed.short ?? "Score summary pending.",
    details: parsed.details,
    source: "ai",
    model: DEFAULT_MODEL,
  };
}

