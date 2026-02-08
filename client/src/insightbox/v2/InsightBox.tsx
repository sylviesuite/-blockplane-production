// client/src/insightBox/v2/InsightBox.tsx
import React from "react";
import type { InsightContext, CanonicalInsight } from "./types";
import { findCanonicalInsight } from "./canonicalRegistry";

type SourceType = "canonical" | "none";

interface InsightBoxProps {
  context: InsightContext;
}

/**
 * InsightBox v2 (canonical-only MVP)
 * - Looks up a canonical insight for the given context
 * - Renders it if found
 * - Otherwise shows a small "no insight yet" stub
 */
export const InsightBox: React.FC<InsightBoxProps> = ({ context }) => {
  const insight = findCanonicalInsight(context);

  if (!insight) {
    return (
      <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
        No curated insight for this view yet. Numbers are still valid; we’re
        expanding explanations over time.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-4 bg-background/70 space-y-3">
      <InsightHeader source="canonical" />
      <CanonicalInsightBody insight={insight} />
    </div>
  );
};

const InsightHeader: React.FC<{ source: SourceType }> = ({ source }) => {
  let badge = "";
  let badgeClass = "";

  if (source === "canonical") {
    badge = "Curated";
    badgeClass = "bg-emerald-100 text-emerald-700";
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="font-semibold text-sm">Insight</h3>
      {badge && (
        <span className={`rounded-full px-2 py-0.5 text-xs ${badgeClass}`}>
          {badge}
        </span>
      )}
    </div>
  );
};

const CanonicalInsightBody: React.FC<{ insight: CanonicalInsight }> = ({ insight }) => {
  const { sections } = insight;

  return (
    <div className="space-y-2 text-sm">
      {sections.overview && <p>{sections.overview}</p>}

      {sections.why_it_scores_this_way && (
        <div>
          <h4 className="mt-2 text-xs font-semibold uppercase tracking-wide">
            Why it scores this way
          </h4>
          {sections.why_it_scores_this_way.LIS && (
            <p className="mt-1">{sections.why_it_scores_this_way.LIS}</p>
          )}
          {sections.why_it_scores_this_way.RIS && (
            <p className="mt-1">{sections.why_it_scores_this_way.RIS}</p>
          )}
        </div>
      )}

      {sections.tradeoffs && sections.tradeoffs.length > 0 && (
        <div>
          <h4 className="mt-2 text-xs font-semibold uppercase tracking-wide">
            Tradeoffs
          </h4>
          <ul className="mt-1 list-disc pl-5 space-y-0.5">
            {sections.tradeoffs.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {sections.when_it_makes_sense && (
        <div className="grid gap-2 md:grid-cols-2">
          {sections.when_it_makes_sense.choose_this_when && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide">
                Choose this when…
              </h4>
              <ul className="mt-1 list-disc pl-5 space-y-0.5">
                {sections.when_it_makes_sense.choose_this_when.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {sections.when_it_makes_sense.choose_alternative_when && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide">
                Choose alternatives when…
              </h4>
              <ul className="mt-1 list-disc pl-5 space-y-0.5">
                {sections.when_it_makes_sense.choose_alternative_when.map(
                  (item, i) => (
                    <li key={i}>{item}</li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {sections.alternatives && sections.alternatives.length > 0 && (
        <div>
          <h4 className="mt-2 text-xs font-semibold uppercase tracking-wide">
            Alternatives
          </h4>
          <ul className="mt-1 list-disc pl-5 space-y-0.5">
            {sections.alternatives.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {sections.takeaway && (
        <p className="mt-2 text-sm font-medium">{sections.takeaway}</p>
      )}
    </div>
  );
};
