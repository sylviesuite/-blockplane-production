import { InsightScores } from "@shared/scoring";

export interface InsightBoxProps {
  scores: InsightScores;
  insightText?: string;
}

const cpiBandCopy: Record<InsightScores["cpiBand"], string> = {
  good: "Good value",
  watch: "Watch",
  warning: "Warning",
  extreme: "Extreme",
};

export function InsightBox({ scores, insightText }: InsightBoxProps) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
            Insight Scores
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {!isNaN(scores.lis) ? `${scores.lis.toFixed(1)} LIS` : "LIS pending"}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Quadrant
          </p>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {scores.quadrant}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-emerald-50 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">RIS</p>
          <p className="text-2xl font-bold text-emerald-700">{scores.ris}</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600">CPI</p>
          <p className="text-2xl font-bold text-blue-700">
            {Number.isFinite(scores.cpi) ? scores.cpi.toFixed(2) : "—"}
          </p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-600">Paris Alignment</p>
          <p className="text-2xl font-bold text-amber-700">{scores.parisAlignment.toFixed(0)}%</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            CPI band
          </p>
          <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
            {cpiBandCopy[scores.cpiBand]}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            RIS components
          </p>
          <p className="text-base font-medium text-slate-900 dark:text-slate-100">
            Carbon: {scores.risComponents.carbonRecovery}, Durability:{" "}
            {scores.risComponents.durability}
          </p>
        </div>
      </div>

      {insightText && (
        <p className="mt-5 text-sm text-slate-700 dark:text-slate-300">{insightText}</p>
      )}
    </div>
  );
}

