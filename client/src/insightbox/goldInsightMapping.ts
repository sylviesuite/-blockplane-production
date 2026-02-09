/**
 * Gold InsightBox mapping: decision context → InsightBox slugs (filename without .md).
 * Used for "Related Insights" / "Why this matters" in the UI.
 * No AI, no inference — explicit mapping only.
 */

export type GoldInsightContextId = "airtight_envelope" | "mechanicals_core" | "risk_health_durability";

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
  mechanicals_core: [
    {
      slug: "Load_Calculation_Manual_J_vs_Rule_of_Thumb_Sizing",
      title: "Load Calculation (Manual J) vs Rule-of-Thumb Sizing",
    },
    {
      slug: "Duct_Sealing_and_Commissioning_vs_Install_and_Forget",
      title: "Duct Sealing & Commissioning vs Install-and-Forget",
    },
    {
      slug: "Heat_Pump_Plus_Solar_vs_Gas_Plus_Grid",
      title: "Heat Pump + Solar vs Gas + Grid",
    },
    {
      slug: "Zoning_Systems_When_They_Help_and_When_They_Backfire",
      title: "Zoning Systems: When They Help and When They Backfire",
    },
    {
      slug: "Comfort_Complaints_When_Math_Was_Right_but_House_Feels_Wrong",
      title: "Comfort Complaints: When the Math Was Right but the House Feels Wrong",
    },
  ],
  risk_health_durability: [
    {
      slug: "Garage_to_House_Air_Leakage_Quiet_Health_Risk",
      title: "Garage-to-House Air Leakage: A Quiet Health Risk",
    },
    {
      slug: "Thermal_Bridging_Small_Details_Big_Long_Term_Costs",
      title: "Thermal Bridging: Small Details, Big Long-Term Costs",
    },
    {
      slug: "Commissioning_Most_Underrated_Step_Performance_Homes",
      title: "Commissioning: The Most Underrated Step in Performance Homes",
    },
    {
      slug: "Moisture_Failures_in_Tight_Homes_Where_They_Actually_Start",
      title: "Moisture Failures in Tight Homes: Where They Actually Start",
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

/**
 * Returns the display title for a Gold InsightBox slug from any context, or undefined if not found.
 */
export function getGoldInsightTitleBySlug(slug: string): string | undefined {
  for (const entries of Object.values(CONTEXT_TO_SLUGS)) {
    const found = entries.find((e) => e.slug === slug);
    if (found) return found.title;
  }
  return undefined;
}
