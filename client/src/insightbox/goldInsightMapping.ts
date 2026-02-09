/**
 * Gold InsightBox mapping: decision context → InsightBox slugs (filename without .md).
 * Used for "Related Insights" / "Why this matters" in the UI.
 * No AI, no inference — explicit mapping only.
 */

export type GoldInsightContextId = "airtight_envelope";

export interface GoldInsightEntry {
  /** Filename without .md, used in URL and to load content */
  slug: string;
  /** Human-readable title for links */
  title: string;
}

/** Context → list of Gold InsightBox entries to surface */
const CONTEXT_TO_SLUGS: Record<GoldInsightContextId, GoldInsightEntry[]> = {
  airtight_envelope: [
    {
      slug: "Moisture_Failures_in_Tight_Homes_Where_They_Actually_Start",
      title: "Moisture Failures in Tight Homes: Where They Actually Start",
    },
    {
      slug: "Vapor_Control_vs_Air_Control_What_Matters_Most",
      title: "Vapor Control vs Air Control: What Actually Matters Most",
    },
    {
      slug: "Oversized_HVAC_in_Tight_Homes_Why_Bigger_Fails",
      title: "Oversized HVAC in Tight Homes: Why \"Bigger\" Fails",
    },
  ],
};

/**
 * Returns Gold InsightBox entries for a given context, or empty array if unknown.
 */
export function getGoldInsightsForContext(
  contextId: GoldInsightContextId
): GoldInsightEntry[] {
  return CONTEXT_TO_SLUGS[contextId] ?? [];
}
