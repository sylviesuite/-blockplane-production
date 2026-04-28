import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, Leaf, ArrowRight, Info } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import MinimalFooter from "@/components/MinimalFooter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function CarbonBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color =
    value < max * 0.33 ? "#09FBD3" : value < max * 0.66 ? "#FF8E4A" : "#ef4444";
  return (
    <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  const color =
    value >= 70 ? "text-[#09FBD3]" : value >= 40 ? "text-[#FF8E4A]" : "text-slate-400";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-lg font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  );
}

const CARBON_MAX = 200;

export default function CarbonCalculator() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = trpc.materialAPI.search.useQuery(
    { query: debouncedQuery || undefined, pageSize: 12, sortBy: "name", sortOrder: "asc" },
    { enabled: true, staleTime: 60_000 }
  );

  const results = data?.items ?? [];
  const showResults = debouncedQuery.length > 0 || results.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 space-y-10">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#09FBD3]/10 border border-[#09FBD3]/20 px-3 py-1 text-xs text-[#09FBD3] font-medium mb-2">
            <Leaf className="h-3 w-3" />
            Free — no account required
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Embodied Carbon Calculator
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Look up the embodied carbon of any building material — instantly. Search
            by name to see kg&nbsp;CO₂e per&nbsp;m², lifecycle scores, and sustainability
            ratings from the BlockPlane database.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search materials — e.g. CLT, concrete, hemp insulation…"
            className="pl-9 bg-slate-900/80 border-slate-700 focus:border-[#09FBD3]/60 text-white placeholder:text-slate-500 h-12 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Results */}
        {isLoading && debouncedQuery && (
          <p className="text-center text-slate-500 text-sm">Searching…</p>
        )}

        {showResults && !isLoading && results.length === 0 && debouncedQuery && (
          <div className="text-center py-10 space-y-2">
            <p className="text-slate-400">No materials found for "{debouncedQuery}".</p>
            <p className="text-slate-500 text-sm">
              Try a broader term like "timber", "steel", or "insulation".
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {!debouncedQuery && (
              <p className="text-xs text-slate-500 text-center">
                Showing all materials — type above to filter
              </p>
            )}
            <ul className="space-y-2">
              {results.map((m) => {
                const carbon = parseFloat(m.totalCarbon);
                return (
                  <li key={m.id}>
                    <Link href={`/materials/${m.id}`}>
                      <div className="group flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 hover:border-[#09FBD3]/40 hover:bg-slate-900/90 transition-all cursor-pointer">

                        {/* Carbon value — primary metric */}
                        <div className="flex-none text-center w-20">
                          <p className="text-xl font-bold tabular-nums text-[#09FBD3]">
                            {carbon.toFixed(1)}
                          </p>
                          <p className="text-[10px] text-slate-500 leading-tight">
                            kg CO₂e/m²
                          </p>
                          <CarbonBar value={carbon} max={CARBON_MAX} />
                        </div>

                        {/* Name + category */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate group-hover:text-[#09FBD3] transition-colors">
                            {m.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] border-slate-600 text-slate-400 py-0"
                            >
                              {m.category}
                            </Badge>
                            {m.isRegenerative === 1 && (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-[#09FBD3]/40 text-[#09FBD3] py-0"
                              >
                                Regenerative
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* LIS / RIS scores */}
                        <div className="flex-none flex gap-4 items-center">
                          <ScorePill label="LIS" value={m.lisScore} />
                          <ScorePill label="RIS" value={m.risScore} />
                          <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-[#09FBD3] transition-colors ml-1" />
                        </div>

                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {data && data.totalItems > results.length && (
              <p className="text-center text-xs text-slate-500 pt-1">
                Showing {results.length} of {data.totalItems} — refine your search to narrow results
              </p>
            )}
          </div>
        )}

        {/* Education block */}
        <section className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-6 space-y-4 text-sm text-slate-400">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Info className="h-4 w-4 text-[#09FBD3]" />
            What is embodied carbon?
          </div>
          <p>
            <strong className="text-slate-200">Embodied carbon</strong> is the CO₂ emitted
            during the extraction, manufacturing, transport, and construction of a building
            material — everything before the building is occupied. It is measured in{" "}
            <strong className="text-slate-200">kg CO₂ equivalent per m²</strong> (kg CO₂e/m²).
          </p>
          <p>
            Unlike operational carbon (heating, cooling, lighting), embodied carbon is locked
            in from day one. Choosing lower-carbon materials is one of the highest-leverage
            decisions an architect or engineer can make to reduce a building's total climate
            impact.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { label: "LIS — Lifecycle Impact Score", body: "Rates the full lifecycle impact from A1 (raw material) through C4 (end-of-life). Higher = better." },
              { label: "RIS — Regenerative Impact Score", body: "Measures positive ecological value — carbon sequestration, biodiversity, circularity. Higher = better." },
              { label: "Benchmark 2000", body: "BlockPlane's reference standard. A LIS of 100 and RIS of 38 represent a conventional construction baseline." },
            ].map(({ label, body }) => (
              <div key={label} className="rounded-lg bg-slate-800/50 p-3 space-y-1">
                <p className="text-slate-300 font-medium text-xs">{label}</p>
                <p className="text-xs">{body}</p>
              </div>
            ))}
          </div>
          <p className="text-xs">
            Want the full picture?{" "}
            <Link href="/materials" className="text-[#09FBD3] hover:underline">
              Browse the complete material database →
            </Link>
          </p>
        </section>

      </main>

      <MinimalFooter />
    </div>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
