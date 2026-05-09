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
    value < max * 0.33 ? "#3f8c52" : value < max * 0.66 ? "#c17f24" : "#a04a3c";
  return (
    <div className="w-full bg-border rounded-full h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number | null }) {
  const color =
    value === null ? "text-amber-600"
    : value >= 70 ? "text-[#3f8c52]"
    : value >= 40 ? "text-[#c17f24]"
    : "text-muted-foreground";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-lg font-bold tabular-nums ${color}`}>{value ?? "—"}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 space-y-10">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#c17f24]/10 border border-[#c17f24]/30 px-3 py-1 text-xs text-[#c17f24] font-medium mb-2">
            <Leaf className="h-3 w-3" />
            Free — no account required
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Embodied Carbon Calculator
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Look up the embodied carbon of any building material — instantly. Search
            by name to see kg&nbsp;CO₂e per&nbsp;m², lifecycle scores, and sustainability
            ratings from the BlockPlane database.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search materials — e.g. CLT, concrete, hemp insulation…"
            className="pl-9 h-12 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Results */}
        {isLoading && debouncedQuery && (
          <p className="text-center text-muted-foreground text-sm">Searching…</p>
        )}

        {showResults && !isLoading && results.length === 0 && debouncedQuery && (
          <div className="text-center py-10 space-y-2">
            <p className="text-muted-foreground">No materials found for "{debouncedQuery}".</p>
            <p className="text-muted-foreground text-sm">
              Try a broader term like "timber", "steel", or "insulation".
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {!debouncedQuery && (
              <p className="text-xs text-muted-foreground text-center">
                Showing all materials — type above to filter
              </p>
            )}
            <ul className="space-y-2">
              {results.map((m) => {
                const carbon = parseFloat(m.totalCarbon);
                return (
                  <li key={m.id}>
                    <Link href={`/materials/${m.id}`}>
                      <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-[#c17f24]/50 hover:bg-[#eae7e0] transition-all cursor-pointer">

                        {/* Carbon value — primary metric */}
                        <div className="flex-none text-center w-20">
                          <p className="text-xl font-bold tabular-nums text-[#c17f24]">
                            {carbon.toFixed(1)}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-tight">
                            kg CO₂e/m²
                          </p>
                          <CarbonBar value={carbon} max={CARBON_MAX} />
                        </div>

                        {/* Name + category */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate group-hover:text-[#c17f24] transition-colors">
                            {m.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0"
                            >
                              {m.category}
                            </Badge>
                            {m.isRegenerative === 1 && (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-[#3f8c52]/40 text-[#3f8c52] py-0"
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
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#c17f24] transition-colors ml-1" />
                        </div>

                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {data && data.totalItems > results.length && (
              <p className="text-center text-xs text-muted-foreground pt-1">
                Showing {results.length} of {data.totalItems} — refine your search to narrow results
              </p>
            )}
          </div>
        )}

        {/* Education block */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Info className="h-4 w-4 text-[#c17f24]" />
            What is embodied carbon?
          </div>
          <p>
            <strong className="text-foreground">Embodied carbon</strong> is the CO₂ emitted
            during the extraction, manufacturing, transport, and construction of a building
            material — everything before the building is occupied. It is measured in{" "}
            <strong className="text-foreground">kg CO₂ equivalent per m²</strong> (kg CO₂e/m²).
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
              <div key={label} className="rounded-lg bg-background p-3 space-y-1 border border-border">
                <p className="text-foreground font-medium text-xs">{label}</p>
                <p className="text-xs">{body}</p>
              </div>
            ))}
          </div>
          <p className="text-xs">
            Want the full picture?{" "}
            <Link href="/materials" className="text-[#c17f24] hover:underline">
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
