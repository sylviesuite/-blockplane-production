import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import MinimalFooter from "@/components/MinimalFooter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, TrendingDown, TrendingUp, Home, RotateCcw } from "lucide-react";

const forest = "#1a2e1f";
const cream = "#f5f2ec";
const amber = "#c17f24";
const M2_TO_SQFT = 10.764;

function barColor(fraction: number) {
  if (fraction < 0.25) return "#3f8c52";
  if (fraction < 0.55) return amber;
  return "#a04a3c";
}

// Inline swap search component — must always render (hooks rule)
function SwapSearch({
  assemblyName,
  quantity,
  onSelect,
  onCancel,
}: {
  assemblyName: string;
  quantity: number;
  onSelect: (id: string, name: string, carbonPerSqFt: number) => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState("");

  const { data } = trpc.materialAPI.search.useQuery(
    { query: query || undefined, pageSize: 8, sortBy: "carbon", sortOrder: "asc" },
    { enabled: query.length > 1, staleTime: 30_000 },
  );

  return (
    <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          Swap: <span className="text-muted-foreground font-normal">{assemblyName}</span>
        </p>
        <button
          onClick={onCancel}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search replacement material…"
          className="pl-8 h-9 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      {data?.items && data.items.length > 0 && (
        <ul className="space-y-0.5 max-h-52 overflow-y-auto rounded-lg border border-border">
          {data.items.map((m) => {
            const cPerSqFt = parseFloat(m.totalCarbon) / M2_TO_SQFT;
            const newTotal = Math.round(cPerSqFt * quantity);
            return (
              <li key={m.id}>
                <button
                  className="w-full text-left px-3 py-2.5 hover:bg-[#eae7e0] text-sm flex items-center justify-between gap-3 transition-colors"
                  onClick={() => onSelect(m.id, m.name, cPerSqFt)}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.category}</p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {cPerSqFt.toFixed(2)}&thinsp;kg/sq&thinsp;ft
                    <br />
                    <span className="font-medium text-foreground">{newTotal.toLocaleString()} kg total</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {query.length > 1 && (!data?.items || data.items.length === 0) && (
        <p className="text-xs text-muted-foreground text-center py-3">
          No results — try a broader term
        </p>
      )}
    </div>
  );
}

type Swap = { id: string; name: string; carbonPerSqFt: number };

export default function Benchmark() {
  const { data, isLoading } = trpc.benchmark.getSpec.useQuery(undefined, {
    staleTime: Infinity,
  });
  const [swaps, setSwaps] = useState<Record<string, Swap>>({});
  const [activeSwap, setActiveSwap] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading benchmark model…</p>
        </div>
        <MinimalFooter />
      </div>
    );
  }

  const { house, assemblies, referenceTotal } = data;

  // Apply swaps to compute current totals
  const assemblyRows = assemblies.map((a) => {
    const swap = swaps[a.id];
    const carbonTotal = swap ? Math.round(swap.carbonPerSqFt * a.quantity) : a.carbonTotal;
    return { ...a, carbonTotal, swap: swap ?? null };
  });

  const currentTotal = assemblyRows.reduce((s, a) => s + a.carbonTotal, 0);
  const delta = currentTotal - referenceTotal;
  const maxRowCarbon = Math.max(...assemblyRows.map((a) => a.carbonTotal));

  const perSqFt = currentTotal / house.sqft;
  const refPerSqFt = referenceTotal / house.sqft;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      {/* Hero strip */}
      <div style={{ backgroundColor: forest }} className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-4 w-4 shrink-0" style={{ color: "rgba(245,242,236,0.5)" }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: "rgba(245,242,236,0.5)" }}>
              Reference standard
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: cream }}>
            {house.name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(245,242,236,0.65)" }}>
            {house.description} · {house.footprint} footprint · Garage: {house.garage}
          </p>

          {/* Key metrics */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Floor Area", value: `${house.sqft.toLocaleString()} sq ft` },
              { label: "Assemblies", value: `${assemblies.length}` },
              {
                label: delta !== 0 ? "Current Total" : "Total Embodied Carbon",
                value: `${Math.round(currentTotal).toLocaleString()} kg CO₂e`,
              },
              {
                label: "Carbon / sq ft",
                value: `${perSqFt.toFixed(1)} kg CO₂e/sq ft`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl px-4 py-3 border border-white/10">
                <p className="text-xs" style={{ color: "rgba(245,242,236,0.5)" }}>{label}</p>
                <p className="text-lg font-bold mt-0.5 leading-tight" style={{ color: cream }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Delta banner */}
          {delta !== 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div
                className="flex items-center gap-2 rounded-lg px-4 py-2 border"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderColor: delta < 0 ? "rgba(63,140,82,0.5)" : "rgba(160,74,60,0.5)",
                }}
              >
                {delta < 0 ? (
                  <TrendingDown className="h-4 w-4 text-emerald-300 shrink-0" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-300 shrink-0" />
                )}
                <span className="text-sm font-medium" style={{ color: cream }}>
                  {delta < 0 ? "−" : "+"}{Math.abs(Math.round(delta)).toLocaleString()} kg CO₂e vs baseline
                  {" "}({delta < 0 ? "−" : "+"}{Math.abs(perSqFt - refPerSqFt).toFixed(1)} kg/sq ft)
                </span>
              </div>
              <button
                onClick={() => { setSwaps({}); setActiveSwap(null); }}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors"
                style={{ borderColor: "rgba(245,242,236,0.2)", color: "rgba(245,242,236,0.6)" }}
              >
                <RotateCcw className="h-3 w-3" />
                Reset to baseline
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Assembly breakdown */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Assembly Breakdown</h2>
          <p className="text-xs text-muted-foreground">Imperial units · Northern Michigan region</p>
        </div>

        <div className="space-y-2.5">
          {assemblyRows.map((a) => {
            const fraction = a.carbonTotal / maxRowCarbon;
            const barPct = Math.max(fraction * 100, 1.5);
            const isActive = activeSwap === a.id;
            const pctOfTotal = ((a.carbonTotal / currentTotal) * 100).toFixed(1);

            return (
              <div
                key={a.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Name + swap badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium leading-tight">{a.name}</span>
                        {a.swap && (
                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0 border-[#3f8c52]/40 text-[#3f8c52]"
                          >
                            Swapped → {a.swap.name}
                          </Badge>
                        )}
                      </div>

                      {/* Horizontal bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-border rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${barPct}%`,
                              backgroundColor: barColor(fraction),
                            }}
                          />
                        </div>
                        <div className="shrink-0 flex items-baseline gap-1.5 w-44 justify-end">
                          <span className="text-sm font-bold tabular-nums">
                            {Math.round(a.carbonTotal).toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">kg CO₂e</span>
                          <span
                            className="text-xs tabular-nums ml-1 px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${amber}15`, color: amber }}
                          >
                            {pctOfTotal}%
                          </span>
                        </div>
                      </div>

                      {/* Sub-label */}
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {a.swap ? a.swap.name : a.materialName}
                        {a.unit === "sqft"
                          ? ` · ${a.quantity.toLocaleString()} sq ft`
                          : " · 1 unit"}
                        {a.unit === "sqft" && (
                          <span className="ml-1">
                            · {(a.carbonTotal / a.quantity).toFixed(2)} kg CO₂e/sq ft
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Swap / Re-swap button */}
                    {a.swappable && (
                      <button
                        className="shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors"
                        style={{
                          borderColor: isActive ? amber : "var(--border)",
                          color: isActive ? amber : "var(--muted-foreground)",
                          backgroundColor: isActive ? `${amber}0f` : "transparent",
                        }}
                        onClick={() => setActiveSwap(isActive ? null : a.id)}
                      >
                        {a.swap ? (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Re-swap
                          </span>
                        ) : (
                          "Swap →"
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Swap search panel */}
                {isActive && (
                  <SwapSearch
                    assemblyName={a.name}
                    quantity={a.quantity}
                    onSelect={(id, name, carbonPerSqFt) => {
                      setSwaps((prev) => ({ ...prev, [a.id]: { id, name, carbonPerSqFt } }));
                      setActiveSwap(null);
                    }}
                    onCancel={() => setActiveSwap(null)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div
          className="mt-6 rounded-xl px-5 py-5 border-2"
          style={{ borderColor: amber, backgroundColor: `${amber}0c` }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Whole-House Embodied Carbon
              </p>
              <p className="text-4xl font-bold tabular-nums" style={{ color: amber }}>
                {Math.round(currentTotal).toLocaleString()}
                <span className="text-lg font-normal text-muted-foreground ml-2">kg CO₂e</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Per sq ft of floor area</p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: amber }}>
                {perSqFt.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">kg CO₂e / sq ft</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Baseline: {refPerSqFt.toFixed(1)} kg CO₂e / sq ft
              </p>
            </div>
          </div>
          {delta !== 0 && (
            <p
              className="mt-3 text-sm font-medium"
              style={{ color: delta < 0 ? "#3f8c52" : "#a04a3c" }}
            >
              {delta < 0 ? "↓" : "↑"} {Math.abs(Math.round(delta)).toLocaleString()} kg CO₂e{" "}
              {delta < 0 ? "below" : "above"} the {referenceTotal.toLocaleString()} kg CO₂e reference baseline
            </p>
          )}
        </div>

        {/* About */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5 space-y-3 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">About this model</p>
          <p>
            The Benchmark 2000 represents a conventional {house.sqft.toLocaleString()} sq ft
            wood-frame home in Northern Michigan built to standard code-minimum practices.
            Carbon values are cradle-to-gate (A1–A3) reference intensities derived from
            published EPD averages. Use the <strong className="text-foreground">Swap →</strong> tool
            on any assembly to replace a material with one from the BlockPlane database and
            instantly see the whole-house carbon impact.
          </p>
          <p className="text-xs">
            Quantities assume a {house.footprint} footprint, {house.stories} stories at 9′ ceiling
            heights. The Benchmark 2000 defines LIS 100 / RIS 38 — the conventional construction
            baseline against which all BlockPlane material scores are calibrated.
          </p>
        </div>
      </main>

      <MinimalFooter />
    </div>
  );
}
