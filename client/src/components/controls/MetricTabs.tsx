export type Metric = "co2e" | "energy";

export function MetricTabs({
  metric,
  setMetric,
}: {
  metric: Metric;
  setMetric: (m: Metric) => void;
}) {
  const base =
    "rounded-xl border px-3 py-1.5 text-sm transition";
  const on  = "bg-emerald-600 text-white border-emerald-600 shadow-sm";
  const off = "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";

  return (
    <div className="flex items-center gap-2">
      <button
        className={`${base} ${metric === "co2e" ? on : off}`}
        onClick={() => setMetric("co2e")}
        type="button"
      >
        CO₂e
      </button>
      <button
        className={`${base} ${metric === "energy" ? on : off}`}
        onClick={() => setMetric("energy")}
        type="button"
        title="Embodied Energy"
      >
        Embodied Energy
      </button>
    </div>
  );
}
