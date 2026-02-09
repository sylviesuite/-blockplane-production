/**
 * Related Insights: surfaces Gold InsightBox links for a given decision context.
 * Non-intrusive, secondary UI. No AI, no inference — uses goldInsightMapping only.
 */

import { Link } from "wouter";
import {
  getGoldInsightsForContext,
  type GoldInsightContextId,
} from "@/insightbox/goldInsightMapping";

export interface RelatedGoldInsightsProps {
  /** Decision context (e.g. airtight_envelope). Only this context is supported for now. */
  contextId: GoldInsightContextId;
  /** Optional heading override */
  heading?: string;
  /** Optional class for the wrapper */
  className?: string;
}

export function RelatedGoldInsights({
  contextId,
  heading = "Related insights",
  className = "",
}: RelatedGoldInsightsProps) {
  const entries = getGoldInsightsForContext(contextId);
  if (entries.length === 0) return null;

  return (
    <aside
      className={`rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 ${className}`}
      aria-label={heading}
    >
      <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-3">
        {heading}
      </h3>
      <ul className="space-y-2">
        {entries.map(({ slug, title }) => (
          <li key={slug}>
            <Link
              href={`/insights/gold/${encodeURIComponent(slug)}`}
              className="text-sm text-slate-800 hover:text-slate-600 hover:underline"
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
