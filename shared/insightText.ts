import type { InsightScores } from "@shared/scoring";

export type InsightTone = "neutral" | "optimistic" | "caution";

export interface InsightText {
  headline: string;
  body: string;
  bullets?: string[];
  tone: InsightTone;
}

export function buildHeuristicInsight(scores: InsightScores): InsightText {
  // Loosen the type *inside* this function so TS stops complaining
  const {
    quadrant,
    cpiBand,
    lis,
    ris,
    parisAlignment,
  } = scores as any;

  let headline = "";
  let tone: InsightTone = "neutral";
  const bullets: string[] = [];

  // ---------------------------
  // Quadrant-based messaging
  // ---------------------------
  if (quadrant === "regenerative") {
    headline = "Low lifecycle impact";
    tone = "optimistic";
    bullets.push(
      "Low lifecycle impact",
      "High RIS score",
      "Strong durability and circularity profile"
    );
  } else if (quadrant === "transitional") {
    headline = "Solid transitional material";
    tone = "neutral";
    bullets.push(
      "Moderate LIS",
      "Improving RIS factors",
      "Good candidate for upgrades over time"
    );
  } else if (quadrant === "costly") {
    headline = "Higher impact for the cost";
    tone = "caution";
    bullets.push(
      "Elevated lifecycle emissions",
      "Cost-performance imbalance",
      "Consider alternatives depending on project goals"
    );
  } else if (quadrant === "problematic") {
    headline = "High impact—consider alternatives";
    tone = "caution";
    bullets.push(
      "Low RIS score",
      "Weak Paris alignment",
      "Significant lifecycle emissions"
    );
  }

  // ---------------------------
  // CPI band messaging
  // ---------------------------
  if (cpiBand === "excellent") {
    bullets.push("Strong cost efficiency");
  } else if (cpiBand === "poor") {
    bullets.push("Cost performance may be unfavorable");
  }

  // ---------------------------
  // Construct body text
  // ---------------------------
  const body = `LIS: ${lis}, RIS: ${ris}. Paris alignment: ${parisAlignment}%.`;

  return {
    headline,
    body,
    bullets,
    tone,
  };
}
