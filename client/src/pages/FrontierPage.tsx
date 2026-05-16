import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Link } from "wouter";
import { Settings2 } from "lucide-react";

const teal = "#0F6E56";
const forest = "#1a2e1f";
const cream = "#f5f2ec";
const creamAlt = "#eae7e0";
const amber = "#c17f24";
const text = "#1c1c1a";
const muted = "#5a5a56";
const borderSoft = "rgba(28,28,26,0.08)";

const RIS_BADGE: Record<string, { bg: string; color: string }> = {
  "Very High": { bg: "#EAF3DE", color: "#27500A" },
  "High":      { bg: "#E1F5EE", color: "#085041" },
  "Moderate":  { bg: "#FAEEDA", color: "#633806" },
};

const GL_BADGE: Record<string, { bg: string; color: string; desc: string }> = {
  "High":     { bg: "#EAF3DE", color: "#27500A", desc: "Deployable now" },
  "Moderate": { bg: "#FAEEDA", color: "#633806", desc: "Sourcing effort needed" },
  "Low":      { bg: "#FCEBEB", color: "#791F1F", desc: "Import-dependent" },
};

const LIS_BADGE: Record<string, { bg: string; color: string; desc: string }> = {
  "Strong":   { bg: "#E6F1FB", color: "#0C447C", desc: "Verified EPD" },
  "Emerging": { bg: "#EEEDFE", color: "#3C3489", desc: "Partial data" },
  "Early":    { bg: "#FAEEDA", color: "#633806", desc: "Estimated" },
};

function deriveRISSignal(ris: number | null): "Very High" | "High" | "Moderate" {
  if (ris !== null && ris >= 90) return "Very High";
  if (ris !== null && ris >= 80) return "High";
  return "Moderate";
}

function deriveLIS(lisScore: number, sourceUrl: string | null): "Strong" | "Emerging" | "Early" {
  if (sourceUrl) return "Strong";
  if (lisScore > 60) return "Emerging";
  return "Early";
}

function deriveGL(category: string): "High" | "Moderate" | "Low" {
  const cat = category?.toLowerCase() || '';
  if (['timber', 'earth', 'insulation', 'landscaping', 'flooring', 'roofing', 'reclaimed', 'cladding', 'siding'].some(c => cat.includes(c))) return 'High';
  if (['biofabricated', 'cement', 'concrete', 'composite'].some(c => cat.includes(c))) return 'Moderate';
  return 'Moderate';
}

const CATEGORY_NOTES: Record<string, string> = {
  Timber: "Structurally graded wood-based material",
  Earth: "Regional clay or earthen system",
  Insulation: "Thermal envelope insulation",
  Concrete: "Cementitious structural system",
  Steel: "Structural steel component",
  Masonry: "Masonry unit or system",
  Roofing: "Roof assembly material",
  Cladding: "Exterior cladding system",
  Flooring: "Interior flooring material",
  Windows: "Fenestration assembly",
  Finishes: "Interior finish material",
  Foundation: "Foundation or subgrade system",
  Landscaping: "Site or landscaping material",
  "Wall Systems": "Wall assembly system",
  Composites: "Composite material",
  Mechanical: "Mechanical system component",
};

export default function FrontierPage() {
  const { data: raw = [], isLoading } = trpc.materialAPI.getFrontier.useQuery();
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterRIS, setFilterRIS] = useState("All");
  const [filterGL, setFilterGL] = useState("All");
  const [filterLIS, setFilterLIS] = useState("All");

  const enriched = useMemo(() =>
    (raw as any[]).map((m) => ({
      ...m,
      risSignal: deriveRISSignal(m.risScore),
      lisSignal: deriveLIS(m.lisScore, m.sourceUrl),
      glFeasibility: deriveGL(m.category),
    })),
  [raw]);

  const categories = useMemo(() => {
    const cats = new Set<string>(enriched.map((m) => m.category));
    return ["All", ...Array.from(cats).sort()];
  }, [enriched]);

  const filtered = useMemo(() =>
    enriched.filter((m) => {
      if (activeCategory !== "All" && m.category !== activeCategory) return false;
      if (filterRIS !== "All" && m.risSignal !== filterRIS) return false;
      if (filterGL !== "All" && m.glFeasibility !== filterGL) return false;
      if (filterLIS !== "All" && m.lisSignal !== filterLIS) return false;
      return true;
    }),
  [enriched, activeCategory, filterRIS, filterGL, filterLIS]);

  const stats = useMemo(() => ({
    total: enriched.length,
    categories: new Set(enriched.map((m) => m.category)).size,
    highGL: enriched.filter((m) => m.glFeasibility === "High").length,
  }), [enriched]);

  function clearFilters() {
    setActiveCategory("All");
    setFilterRIS("All");
    setFilterGL("All");
    setFilterLIS("All");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: cream, color: text }}>
      <Header />

      {/* Hero */}
      <section style={{ backgroundColor: forest }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-wider"
            style={{ color: teal }}
          >
            BlockPlane Frontier
          </span>
          <h1
            className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
            style={{ color: cream }}
          >
            Next-generation building materials
          </h1>
          <p
            className="mt-4 max-w-2xl text-base leading-relaxed"
            style={{ color: "rgba(245,242,236,0.65)" }}
          >
            A curated library of emerging materials with a plausible pathway into real-world
            construction — scored for regenerative impact, lifecycle performance, and Great
            Lakes regional feasibility.
          </p>

          <div className="mt-10 flex flex-wrap gap-10">
            {[
              { value: stats.total,      label: "Frontier materials" },
              { value: stats.categories, label: "Categories represented" },
              { value: stats.highGL,     label: "High GL feasibility" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-bold tabular-nums" style={{ color: cream }}>
                  {value}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "rgba(245,242,236,0.45)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section style={{ backgroundColor: creamAlt }}>
        <div className="mx-auto max-w-6xl px-6 py-8">

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeCategory === cat ? forest : "white",
                  color:           activeCategory === cat ? cream  : text,
                  border: `1px solid ${activeCategory === cat ? forest : borderSoft}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Advanced filters toggle */}
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1.5 text-sm mb-4 transition-opacity hover:opacity-70"
            style={{ color: muted }}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Advanced filters
            <span className="ml-1 text-[10px]">{showAdvanced ? "▲" : "▼"}</span>
          </button>

          {showAdvanced && (
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                {
                  value: filterRIS,
                  onChange: setFilterRIS,
                  options: [
                    ["All",       "RIS signal: All"],
                    ["Very High", "Very High (≥ 90)"],
                    ["High",      "High (≥ 80)"],
                    ["Moderate",  "Moderate (≥ 60)"],
                  ],
                },
                {
                  value: filterGL,
                  onChange: setFilterGL,
                  options: [
                    ["All",      "GL feasibility: All"],
                    ["High",     "High"],
                    ["Moderate", "Moderate"],
                    ["Low",      "Low"],
                  ],
                },
                {
                  value: filterLIS,
                  onChange: setFilterLIS,
                  options: [
                    ["All",      "LIS signal: All"],
                    ["Strong",   "Strong"],
                    ["Emerging", "Emerging"],
                    ["Early",    "Early"],
                  ],
                },
              ].map(({ value, onChange, options }) => (
                <select
                  key={options[0][1]}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="rounded-md border px-3 py-1.5 text-sm"
                  style={{ borderColor: borderSoft, color: text, backgroundColor: "white" }}
                >
                  {options.map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              ))}
            </div>
          )}

          {/* Legend bar */}
          <div
            className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-5 rounded-lg p-4"
            style={{ backgroundColor: "white", border: `1px solid ${borderSoft}` }}
          >
            {/* RIS */}
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: muted }}
              >
                RIS Signal
              </p>
              <div className="space-y-1.5">
                {Object.entries(RIS_BADGE).map(([level, s]) => (
                  <div key={level} className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* GL */}
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: muted }}
              >
                GL Feasibility
              </p>
              <div className="space-y-1.5">
                {Object.entries(GL_BADGE).map(([level, s]) => (
                  <div key={level} className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {level}
                    </span>
                    <span className="text-[10px]" style={{ color: muted }}>{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LIS */}
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: muted }}
              >
                LIS Signal
              </p>
              <div className="space-y-1.5">
                {Object.entries(LIS_BADGE).map(([level, s]) => (
                  <div key={level} className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {level}
                    </span>
                    <span className="text-[10px]" style={{ color: muted }}>{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="py-16 text-center" style={{ color: muted }}>
              <p className="mb-3">No frontier materials match these filters.</p>
              <button
                onClick={clearFilters}
                className="text-sm underline"
                style={{ color: amber }}
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Card grid */}
          {!isLoading && filtered.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {filtered.map((m: any) => {
                const risBadge = m.risSignal ? RIS_BADGE[m.risSignal] : null;
                const glBadge  = GL_BADGE[m.glFeasibility];
                const lisBadge = LIS_BADGE[m.lisSignal];

                return (
                  <Link key={m.id} href={`/materials/${m.id}`}>
                    <div
                      className="flex h-full flex-col rounded-lg p-4 transition-shadow hover:shadow-md cursor-pointer"
                      style={{ backgroundColor: "white", border: `1px solid ${borderSoft}` }}
                    >
                      {/* Top: category + Frontier badge */}
                      <div className="mb-2 flex items-start justify-between gap-1">
                        <p style={{ fontSize: "11px", color: muted }}>{m.category}</p>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: "#FDF3E3", color: amber }}
                        >
                          Frontier
                        </span>
                      </div>

                      {/* Name */}
                      <p
                        className="mb-3 font-medium leading-snug"
                        style={{ fontSize: "13px", color: text }}
                      >
                        {m.name}
                      </p>

                      {/* Score badges */}
                      <div className="mb-3 flex flex-wrap gap-1">
                        {risBadge && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ backgroundColor: risBadge.bg, color: risBadge.color }}
                            title={`Regenerative Impact Score: ${m.risSignal}`}
                          >
                            {m.risSignal} RIS
                          </span>
                        )}
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: glBadge.bg, color: glBadge.color }}
                          title={`Great Lakes Feasibility: ${m.glFeasibility} — ${glBadge.desc}`}
                        >
                          {m.glFeasibility} GL
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: lisBadge.bg, color: lisBadge.color }}
                          title={`Lifecycle Information Score: ${m.lisSignal} — ${lisBadge.desc}`}
                        >
                          {m.lisSignal} LIS
                        </span>
                      </div>

                      {/* Bottom note */}
                      <p
                        className="mt-auto text-[11px] leading-snug"
                        style={{ color: muted }}
                      >
                        {m.manufacturer ?? (CATEGORY_NOTES[m.category] ?? "Building material")}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
