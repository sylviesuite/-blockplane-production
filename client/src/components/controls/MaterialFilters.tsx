export function MaterialFilters(props: {
  materialType: string;
  setMaterialType: (v: string) => void;
  comparisonView: "single" | "compare2" | "compareSet";
  setComparisonView: (v: "single" | "compare2" | "compareSet") => void;
  query: string;
  setQuery: (v: string) => void;
  sharedScale: boolean;
  setSharedScale: (v: boolean) => void;
}) {
  const {
    materialType, setMaterialType,
    comparisonView, setComparisonView,
    query, setQuery,
    sharedScale, setSharedScale,
  } = props;

  const MATERIAL_TYPES = ["All", "Masonry", "Wood", "Insulation", "Metals", "Composites"];

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <select
          value={materialType}
          onChange={(e) => setMaterialType(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        >
          {MATERIAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={comparisonView}
          onChange={(e) => setComparisonView(e.target.value as any)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        >
          <option value="single">Single Material</option>
          <option value="compare2">Compare 2</option>
          <option value="compareSet">Compare Set</option>
        </select>

        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search materials…"
            className="w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm pl-9"
            aria-label="Search materials"
          />
          <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">🔍</span>
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={sharedScale}
          onChange={(e) => setSharedScale(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Use Shared Scale
      </label>
    </div>
  );
}
