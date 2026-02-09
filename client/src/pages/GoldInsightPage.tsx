/**
 * Gold InsightBox viewer: displays a single Gold InsightBox by slug (filename without .md).
 * Read-only; loads .md from insightbox/gold via Vite glob.
 */

import { useRoute } from "wouter";
import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { getGoldInsightTitleBySlug } from "@/insightbox/goldInsightMapping";

type Params = { slug: string };

const goldModules = import.meta.glob<string>("../insightbox/gold/*.md", {
  as: "raw",
});

function useGoldContent(slug: string): { content: string | null; loading: boolean } {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const key = Object.keys(goldModules).find((k) =>
      k.endsWith(`/${slug}.md`)
    );
    if (!key) {
      setContent(null);
      setLoading(false);
      return;
    }
    const load = goldModules[key];
    if (typeof load !== "function") {
      setContent(null);
      setLoading(false);
      return;
    }
    (load as () => Promise<string>)()
      .then((text) => {
        if (!cancelled) setContent(text);
      })
      .catch(() => {
        if (!cancelled) setContent(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { content, loading };
}

function formatSlugAsTitle(slug: string): string {
  return slug
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function GoldInsightPage() {
  const [match, params] = useRoute<Params>("/insights/gold/:slug");
  const slug = params?.slug ?? "";
  const { content, loading } = useGoldContent(slug);

  const title = useMemo(
    () => getGoldInsightTitleBySlug(slug) ?? formatSlugAsTitle(slug),
    [slug]
  );

  if (!match) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/materials"
          className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          ← Back to materials
        </Link>
        <article className="mt-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          {loading && (
            <p className="mt-4 text-slate-500">Loading…</p>
          )}
          {!loading && !content && (
            <p className="mt-4 text-slate-500">
              Insight not found or not available.
            </p>
          )}
          {!loading && content && (
            <div
              className="prose prose-slate dark:prose-invert mt-6 max-w-none whitespace-pre-wrap text-slate-700 dark:text-slate-300"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {content}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
