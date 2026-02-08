// client/src/insightBox/v2/canonicalRegistry.ts
import type { CanonicalInsight, InsightContext } from "./types";

import insight001 from "./canonical/insight-001.rammed-earth-hempcrete-vs-2x6.json";
import insight002 from "./canonical/insight-002.fiberglass-vs-cellulose.json";
import insight003 from "./canonical/insight-003.double-vs-triple-pane-windows.json";

const CANONICAL_INSIGHTS: CanonicalInsight[] = [
  insight001 as CanonicalInsight,
  insight002 as CanonicalInsight,
  insight003 as CanonicalInsight,
];

interface CanonicalMatchRule {
  id: string;
  match: (ctx: InsightContext) => boolean;
}

const MATCH_RULES: CanonicalMatchRule[] = [
  {
    id: "insight-001",
    match: (ctx) =>
      ctx.type === "comparison" &&
      ctx.materialIds?.includes("rammed_earth") &&
      ctx.materialIds?.includes("hempcrete") &&
      ctx.materialIds?.includes("wood_framing_2x6") === true,
  },
  {
    id: "insight-002",
    match: (ctx) =>
      ctx.type === "comparison" &&
      ctx.materialIds?.includes("fiberglass_batt_insulation") &&
      ctx.materialIds?.includes("dense_pack_cellulose") === true,
  },
  {
    id: "insight-003",
    match: (ctx) => ctx.type === "comparison" && ctx.tags?.includes("windows") === true,
  },
];

export function findCanonicalInsight(ctx: InsightContext): CanonicalInsight | null {
  // 1. explicit rules
  const rule = MATCH_RULES.find((r) => r.match(ctx));
  if (rule) {
    const hit = CANONICAL_INSIGHTS.find((insight) => insight.id === rule.id);
    if (hit) return hit;
  }

  // 2. loose related_materials overlap
  if (ctx.materialIds && ctx.materialIds.length > 0) {
    const best = CANONICAL_INSIGHTS.find((insight) =>
      insight.related_materials?.some((m) => ctx.materialIds!.includes(m)),
    );
    if (best) return best;
  }

  return null;
}
