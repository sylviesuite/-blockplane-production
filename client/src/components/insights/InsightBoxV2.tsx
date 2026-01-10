import React, { useEffect, useMemo, useState } from "react";
import { getInsightProvider } from "@/lib/ai/insightProvider";
import type { InsightProvider } from "@/lib/ai/insightProviderTypes";

type Mode = "static" | "ai";

export interface InsightBoxV2Props {
  materialId: string;
  materialName: string;
  lis?: number;
  ris?: number;
  cpi?: number;
  context?: {
    climateZone?: string;
    region?: string;
    buildingType?: string;
  };
  staticInsight?: string;
  insightProvider?: InsightProvider;
}

type Status = "idle" | "loading" | "error";

const formatNumber = (value: number | undefined, digits = 1) =>
  value !== undefined && Number.isFinite(value) ? value.toFixed(digits) : "—";

const formatContextSummary = (context?: InsightBoxV2Props["context"]) => {
  if (!context) return "";
  return [context.region, context.climateZone, context.buildingType].filter(Boolean).join(" • ");
};

const buildCacheKey = (
  materialId: string,
  lis?: number,
  ris?: number,
  cpi?: number
) => {
  const segments = [
    materialId,
    formatNumber(lis, 2),
    formatNumber(ris, 2),
    formatNumber(cpi, 2),
  ];
  return `insightv2:${segments.join(":")}`;
};

const safeReadCache = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeWriteCache = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
};

export function InsightBoxV2({
  materialId,
  materialName,
  lis,
  ris,
  cpi,
  context,
  staticInsight,
  insightProvider,
}: InsightBoxV2Props) {
  const [mode, setMode] = useState<Mode>("static");
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [cachedContent, setCachedContent] = useState<string | null>(null);

  const provider = useMemo(() => insightProvider ?? getInsightProvider(), [insightProvider]);

  const cacheKey = useMemo(() => buildCacheKey(materialId, lis, ris, cpi), [materialId, lis, ris, cpi]);
  useEffect(() => {
    if (!materialId) return;
    const stored = safeReadCache(cacheKey);
    if (stored) {
      setCachedContent(stored);
    }
  }, [cacheKey, materialId]);

  const isAIMode = mode === "ai";
  const staticCopy = useMemo(() => {
    if (staticInsight) return staticInsight;

    const values = [
      `LIS ${formatNumber(lis)}`,
      `RIS ${formatNumber(ris)}`,
      `CPI ${formatNumber(cpi, 2)}`,
    ]
      .filter(Boolean)
      .join(" • ");

    const contextSummary = formatContextSummary(context);
    const materialLabel = materialName || "This material";

    return `${materialLabel}: ${values}${contextSummary ? ` • ${contextSummary}` : ""}.`;
  }, [cpi, context, lis, materialName, ris, staticInsight]);

  const aiDisplayText = aiContent ?? cachedContent;

  const handleGenerate = async () => {
    if (status === "loading") return;
    setStatus("loading");
    setError(null);

    try {
      const response = await provider.generateMaterialInsight({
        materialId,
        materialName,
        lis,
        ris,
        cpi,
        context,
      });

      setAiContent(response.text);
      setCachedContent(response.text);
      safeWriteCache(cacheKey, response.text);
      setStatus("idle");
    } catch (err) {
      console.error("[InsightBoxV2] AI generation failed:", err);
      setError("AI insight unavailable right now.");
      setStatus("error");
    }
  };

  const contextSummary = formatContextSummary(context);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          Insight
        </p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{materialName}</h3>
            <p className="text-xs uppercase text-slate-500 dark:text-slate-400">
              {mode === "static" ? "Static" : "AI (beta)"}
            </p>
          </div>
          {contextSummary && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{contextSummary}</p>
          )}
        </div>
      </div>

      <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            mode === "static"
              ? "bg-white text-emerald-700 shadow dark:bg-slate-900 dark:text-emerald-400"
              : "text-slate-400 hover:text-emerald-600 dark:text-slate-600 dark:hover:text-emerald-300"
          }`}
          onClick={() => setMode("static")}
          aria-pressed={mode === "static"}
        >
          Static
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            isAIMode
              ? "bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
          onClick={() => setMode("ai")}
          aria-pressed={isAIMode}
        >
          AI (beta)
        </button>
      </div>

      <div className="mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Insight source
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {isAIMode
            ? `AI-generated insight (beta)${aiDisplayText ? "" : " — producing fresh text"}`
            : "Static insight (deterministic)"}
          {(!aiContent && cachedContent && !isAIMode) || cachedContent ? " • cached" : ""}
        </p>
      </div>
      <div className="mt-1 space-y-4">
        {isAIMode ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
              {aiDisplayText ? (
                <p>{aiDisplayText}</p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No AI insight yet. Generate to see a tailored summary.</p>
              )}
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Generate Insight drafts a calm, practical summary of these LIS/RIS/CPI scores.
              </p>

              {status === "loading" && (
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-5/6 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200/80 bg-rose-50/80 p-3 text-sm text-rose-700 dark:border-rose-400/60 dark:bg-rose-500/10 dark:text-rose-200">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="mt-2 inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-rose-500"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
            <p>{staticCopy}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Static insights reflect the deterministic LIS/RIS/CPI template tied to the scores shown above.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!isAIMode || status === "loading"}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "loading"
              ? "Generating…"
              : aiDisplayText
                ? "Regenerate Insight"
                : "Generate Insight"}
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAIMode
              ? "AI mode phrases a short insight using the visible LIS/RIS/CPI data."
              : "Switch to AI mode to enable the generator."}
          </p>
          {status === "loading" && (
            <p className="text-xs text-slate-500 dark:text-slate-400">Thinking…</p>
          )}
        </div>
      </div>

      {isAIMode && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Static fallback: {staticCopy}
        </p>
      )}
    </div>
  );
}

export default InsightBoxV2;

