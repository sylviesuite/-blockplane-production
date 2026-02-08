// client/src/insightBox/v2/types.ts

export type InsightContextType = "material" | "assembly" | "comparison";

export interface InsightContext {
  type: InsightContextType;
  primaryId: string;
  secondaryId?: string;
  materialIds?: string[];
  tags?: string[];
}

export interface CanonicalInsight {
  id: string;
  title: string;
  type: "comparison" | "material" | "assembly";
  status: "canonical";
  source: "human-authored";
  related_materials?: string[];
  metrics_context: {
    LIS?: {
      summary: string;
      relative_position?: string;
    };
    RIS?: Record<string, string>;
    CPI?: {
      summary: string;
    };
  };
  sections: {
    overview: string;
    why_it_scores_this_way?: {
      LIS?: string;
      RIS?: string;
    };
    tradeoffs?: string[];
    when_it_makes_sense?: {
      choose_this_when?: string[];
      choose_alternative_when?: string[];
    };
    alternatives?: string[];
    takeaway?: string;
  };
  ui_hints?: {
    default_expanded?: boolean;
    emphasis?: string;
    tone?: string;
  };
}
