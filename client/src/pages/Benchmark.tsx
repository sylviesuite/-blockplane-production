import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import MinimalFooter from "@/components/MinimalFooter";
import { X, Sparkles, TrendingDown, TrendingUp, ChevronRight } from "lucide-react";

const forest = "#1a2e1f";
const cream = "#f5f2ec";
const amber = "#c17f24";
const M2_TO_SQFT = 10.764;

// SVG zones mapped onto the 1536×1024 image using viewBox="0 0 100 100"
// (x/y expressed as % of image width/height, preserveAspectRatio="none")
// Draw order matters: later elements receive pointer events first (sit "on top")
const ZONES = [
  {
    id: "foundation-walls",
    label: "Foundation",
    shape: "rect" as const,
    x: 10, y: 72, w: 74, h: 19,
    cx: 47, cy: 81,
  },
  {
    id: "windows",
    label: "Windows",
    shape: "rect" as const,
    x: 14, y: 34, w: 35, h: 18,
    cx: 31, cy: 43,
  },
  {
    id: "wall-framing",
    label: "Wall Assembly",
    shape: "rect" as const,
    x: 62, y: 33, w: 21, h: 37,
    cx: 72, cy: 51,
  },
  {
    id: "subfloor",
    label: "Floor Assembly",
    shape: "rect" as const,
    x: 45, y: 55, w: 37, h: 11,
    cx: 63, cy: 60,
  },
  {
    id: "attic-insulation",
    label: "Attic Insulation",
    shape: "rect" as const,
    x: 45, y: 28, w: 37, h: 13,
    cx: 63, cy: 35,
  },
  {
    id: "roofing",
    label: "Roof",
    shape: "polygon" as const,
    points: "50,8 10,33 82,33",
    cx: 50, cy: 21,
  },
];

// RIS, confidence, and a short note per assembly (display-only; not in spec)
const ASSEMBLY_META: Record<string, { ris: number; confidence: "High" | "Medium" | "Low"; note: string }> = {
  "foundation-walls":  { ris: 22, confidence: "High",   note: "PCA and NRMCA publish comprehensive concrete EPD data." },
  "foundation-slab":   { ris: 22, confidence: "High",   note: "Same source as foundation walls; PCA EPD applies." },
  "wall-framing":      { ris: 72, confidence: "High",   note: "Strong APA/CORRIM EPD data for Douglas Fir framing lumber." },
  "wall-sheathing":    { ris: 48, confidence: "High",   note: "OSB EPDs available from LP Building Products and Huber." },
  "wall-insulation":   { ris: 38, confidence: "High",   note: "Fiberglass batts have consistent EPD data from major manufacturers." },
  "exterior-cladding": { ris: 20, confidence: "Medium", note: "Petroleum-derived; vinyl siding has limited EPD coverage." },
  "attic-insulation":  { ris: 38, confidence: "High",   note: "Well-documented EPDs from Owens Corning and Johns Manville." },
  "roofing":           { ris: 18, confidence: "Medium", note: "Petroleum-derived asphalt; limited EPD coverage for architectural shingles." },
  "windows":           { ris: 24, confidence: "Low",    note: "High variability across manufacturers; vinyl frames carry elevated GWP." },
  "drywall":           { ris: 40, confidence: "High",   note: "USG, National Gypsum, and CertainTeed all publish EPDs." },
  "subfloor":          { ris: 48, confidence: "High",   note: "OSB EPDs well-documented — same product family as wall sheathing." },
  "flooring-carpet":   { ris: 28, confidence: "Low",    note: "Highly variable; most residential carpet lacks EPD documentation." },
  "hvac":              { ris: 22, confidence: "Low",    note: "Equipment embodied carbon difficult to isolate; estimates only." },
};

const CONF_COLOR = { High: "#3f8c52", Medium: amber, Low: "#a04a3c" };

function risLabel(ris: number) {
  if (ris >= 70) return "Regenerative";
  if (ris >= 40) return "Low-impact";
  if (ris >= 25) return "Standard";
  return "High-impact";
}
function risColor(ris: number) {
  if (ris >= 70) return "#3f8c52";
  if (ris >= 40) return "#4a7fa8";
  if (ris >= 25) return amber;
  return "#a04a3c";
}

export default function Benchmark() {
  const { data, isLoading } = trpc.benchmark.getSpec.useQuery(undefined, { staleTime: Infinity });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);
  const aiChat = trpc.ai.chat.useMutation();

  const activeAssembly = activeId && data ? (data.assemblies.find(a => a.id === activeId) ?? null) : null;
  const activeMeta = activeId ? (ASSEMBLY_META[activeId] ?? null) : null;

  // Fetch swap alternatives for the active zone
  const { data: swapData } = trpc.materialAPI.search.useQuery(
    { query: activeAssembly?.dbSearchQuery || undefined, pageSize: 4, sortBy: "carbon", sortOrder: "asc" },
    { enabled: !!activeAssembly?.dbSearchQuery, staleTime: 60_000 },
  );

  function selectZone(id: string) {
    if (activeId === id) {
      setActiveId(null);
    } else {
      setActiveId(id);
      setAiText(null);
    }
  }

  async function getAiRec() {
    if (!activeAssembly || !activeMeta) return;
    setAiLoading(true);
    setAiText(null);
    try {
      const result = await aiChat.mutateAsync({
        question: `Give a specific recommendation for improving the embodied carbon of the "${activeAssembly.name}" in a conventional 2,000 sq ft wood-frame home in Northern Michigan (Climate Zone 6). Current: ${activeAssembly.carbonTotal.toLocaleString()} kg CO₂e (${activeAssembly.carbonPerSqFt.toFixed(2)} kg/sq ft). RIS ${activeMeta.ris}/100. What 1–2 alternative materials would meaningfully reduce carbon while maintaining performance in a cold climate? Be specific and concise.`,
      });
      setAiText(typeof result.answer === "string" ? result.answer : "See recommendation above.");
    } catch {
      setAiText("AI recommendation unavailable. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

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

  const { house } = data;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: forest }}>
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "rgba(245,242,236,0.45)" }}>
            Reference standard
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: cream }}>
            {house.name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(245,242,236,0.6)" }}>
            {house.description} · {house.footprint} footprint · Garage: {house.garage}
          </p>
          <p className="mt-1.5 text-xs" style={{ color: "rgba(245,242,236,0.35)" }}>
            Click a labeled zone on the house to explore carbon data, RIS score, and swap alternatives
          </p>
        </div>

        {/* Main two-column layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Interactive house image ─────────────────────────────── */}
          <div className="w-full lg:flex-1 shrink-0">
            {/* Container maintains 3:2 aspect ratio to match image */}
            <div className="relative w-full" style={{ aspectRatio: "3 / 2" }}>
              <img
                src="/images/benchmark2000-house.png"
                alt="Benchmark 2000 house cutaway showing roof, insulation, wall framing, windows, floor assembly, and foundation"
                className="absolute inset-0 w-full h-full object-cover select-none"
                draggable={false}
              />

              {/* SVG hit zones */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {ZONES.map((zone) => {
                  const isActive  = activeId   === zone.id;
                  const isHovered = hoveredId  === zone.id;
                  const highlight = isActive || isHovered;
                  const fill      = isActive  ? "rgba(193,127,36,0.22)"
                                  : isHovered ? "rgba(193,127,36,0.12)"
                                  : "transparent";
                  const stroke     = highlight ? amber : "transparent";
                  const strokeW    = isActive ? "0.6" : "0.4";

                  const sharedProps = {
                    fill,
                    stroke,
                    strokeWidth: strokeW,
                    style: { cursor: "pointer" },
                    onClick: () => selectZone(zone.id),
                    onMouseEnter: () => setHoveredId(zone.id),
                    onMouseLeave: () => setHoveredId(null),
                  };

                  return (
                    <g key={zone.id}>
                      {zone.shape === "polygon" ? (
                        <polygon points={zone.points} strokeLinejoin="round" {...sharedProps} />
                      ) : (
                        <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="0.5" {...sharedProps} />
                      )}

                      {/* Pulsing indicator dot */}
                      {isActive && (
                        <circle cx={zone.cx} cy={zone.cy} r="2.8" fill="none"
                          stroke={amber} strokeWidth="0.4" opacity="0.6"
                          style={{ pointerEvents: "none" }} />
                      )}
                      <circle cx={zone.cx} cy={zone.cy} r="1.4"
                        fill={isActive ? amber : highlight ? "rgba(193,127,36,0.8)" : "rgba(245,242,236,0.55)"}
                        style={{ pointerEvents: "none" }} />
                    </g>
                  );
                })}
              </svg>

              {/* Zone labels — HTML overlay, positioned at zone centers */}
              {ZONES.map((zone) => {
                const isActive  = activeId  === zone.id;
                const isHovered = hoveredId === zone.id;
                return (
                  <button
                    key={zone.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all select-none"
                    style={{
                      left: `${zone.cx}%`,
                      top: `${zone.cy}%`,
                      marginTop: "3.5%",   // push label below the dot
                      padding: "2px 7px",
                      fontSize: "clamp(8px, 1vw, 11px)",
                      fontWeight: 600,
                      lineHeight: 1.3,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      borderRadius: "9999px",
                      backgroundColor: isActive ? amber : "rgba(26,46,31,0.72)",
                      color: isActive ? forest : "rgba(245,242,236,0.8)",
                      border: `1px solid ${isActive ? amber : isHovered ? "rgba(193,127,36,0.5)" : "rgba(245,242,236,0.18)"}`,
                      boxShadow: isActive ? `0 0 10px ${amber}44` : "none",
                      zIndex: 20,
                      pointerEvents: "none",
                    }}
                  >
                    {zone.label}
                  </button>
                );
              })}
            </div>

            {/* Whole-house total strip under image */}
            <div
              className="mt-3 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3"
              style={{ backgroundColor: `${amber}15`, border: `1px solid ${amber}35` }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(245,242,236,0.5)" }}>
                  Whole-House Embodied Carbon
                </p>
                <p className="text-2xl font-bold tabular-nums mt-0.5" style={{ color: amber }}>
                  {data.referenceTotal.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ml-1.5">kg CO₂e</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "rgba(245,242,236,0.45)" }}>Per sq ft of floor area</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: amber }}>
                  {(data.referenceTotal / house.sqft).toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">kg CO₂e / sq ft</span>
                </p>
              </div>
            </div>
          </div>

          {/* ── Detail panel ────────────────────────────────────────── */}
          <div className="w-full lg:w-96 shrink-0">

            {/* Empty state */}
            {!activeAssembly && (
              <div
                className="rounded-xl p-6 text-center space-y-4"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,242,236,0.1)" }}
              >
                <p className="text-sm" style={{ color: "rgba(245,242,236,0.45)" }}>
                  Click a zone on the house to explore carbon data, RIS score, confidence level, and material swap alternatives.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {ZONES.map(z => (
                    <button
                      key={z.id}
                      onClick={() => selectZone(z.id)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors"
                      style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(245,242,236,0.08)" }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: amber }} />
                      <span className="text-xs font-medium" style={{ color: cream }}>{z.label}</span>
                      <ChevronRight className="h-3 w-3 ml-auto shrink-0" style={{ color: "rgba(245,242,236,0.3)" }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active assembly detail */}
            {activeAssembly && activeMeta && (
              <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(245,242,236,0.12)" }}
              >
                {/* Header */}
                <div className="px-4 py-3.5 flex items-start gap-2"
                  style={{ borderBottom: "1px solid rgba(245,242,236,0.08)", backgroundColor: "rgba(255,255,255,0.04)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(245,242,236,0.4)" }}>
                      Selected Assembly
                    </p>
                    <h2 className="text-base font-bold leading-snug mt-0.5" style={{ color: cream }}>
                      {activeAssembly.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveId(null)}
                    className="shrink-0 p-1 rounded-full"
                    style={{ color: "rgba(245,242,236,0.35)" }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Carbon metrics */}
                <div className="px-4 py-3.5 grid grid-cols-3 gap-3"
                  style={{ borderBottom: "1px solid rgba(245,242,236,0.08)" }}>
                  {[
                    { label: "Total Carbon", value: activeAssembly.carbonTotal.toLocaleString(), unit: "kg CO₂e", color: amber },
                    { label: "Per Sq Ft", value: activeAssembly.carbonPerSqFt.toFixed(2), unit: "kg/sq ft", color: cream },
                    { label: "Quantity", value: activeAssembly.quantity.toLocaleString(), unit: activeAssembly.unit === "sqft" ? "sq ft" : "unit", color: cream },
                  ].map(({ label, value, unit, color }) => (
                    <div key={label}>
                      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(245,242,236,0.4)" }}>{label}</p>
                      <p className="text-lg font-bold tabular-nums leading-none" style={{ color }}>{value}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "rgba(245,242,236,0.4)" }}>{unit}</p>
                    </div>
                  ))}
                </div>

                {/* RIS + Confidence */}
                <div className="px-4 py-3.5 flex items-center gap-3"
                  style={{ borderBottom: "1px solid rgba(245,242,236,0.08)" }}>
                  <div className="flex items-center gap-2.5 flex-1 rounded-lg px-3 py-2"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: risColor(activeMeta.ris) + "2a", color: risColor(activeMeta.ris) }}>
                      {activeMeta.ris}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(245,242,236,0.4)" }}>RIS</p>
                      <p className="text-xs font-semibold" style={{ color: cream }}>{risLabel(activeMeta.ris)}</p>
                    </div>
                  </div>
                  <div className="rounded-lg px-3 py-2 text-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(245,242,236,0.4)" }}>Confidence</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: CONF_COLOR[activeMeta.confidence] + "2a",
                        color: CONF_COLOR[activeMeta.confidence],
                      }}>
                      {activeMeta.confidence}
                    </span>
                  </div>
                </div>

                {/* Note */}
                <p className="px-4 py-3 text-xs leading-relaxed"
                  style={{ color: "rgba(245,242,236,0.45)", borderBottom: "1px solid rgba(245,242,236,0.08)" }}>
                  {activeMeta.note}
                </p>

                {/* Swap alternatives */}
                {swapData?.items && swapData.items.length > 0 && (
                  <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(245,242,236,0.08)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-2.5"
                      style={{ color: "rgba(245,242,236,0.45)" }}>
                      Swap Alternatives
                    </p>
                    <div className="space-y-1.5">
                      {swapData.items.slice(0, 3).map((m) => {
                        const altCpSqFt = parseFloat(m.totalCarbon) / M2_TO_SQFT;
                        const altTotal  = Math.round(altCpSqFt * activeAssembly.quantity);
                        const delta     = altTotal - activeAssembly.carbonTotal;
                        return (
                          <div key={m.id}
                            className="flex items-center justify-between rounded-lg px-3 py-2"
                            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,242,236,0.07)" }}>
                            <div className="min-w-0 flex-1 mr-2">
                              <p className="text-xs font-medium truncate" style={{ color: cream }}>{m.name}</p>
                              <p className="text-[10px]" style={{ color: "rgba(245,242,236,0.4)" }}>
                                {altTotal.toLocaleString()} kg CO₂e
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-1">
                              {delta < 0
                                ? <TrendingDown className="h-3 w-3 text-emerald-400" />
                                : <TrendingUp   className="h-3 w-3 text-red-400"     />}
                              <span className="text-xs font-bold tabular-nums"
                                style={{ color: delta < 0 ? "#6ee7b7" : "#fca5a5" }}>
                                {delta < 0 ? "−" : "+"}{Math.abs(delta).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* AI recommendation */}
                <div className="px-4 py-3.5">
                  {!aiText ? (
                    <button
                      onClick={getAiRec}
                      disabled={aiLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-opacity"
                      style={{ backgroundColor: amber, color: forest, opacity: aiLoading ? 0.7 : 1 }}
                    >
                      <Sparkles className="h-4 w-4" />
                      {aiLoading ? "Getting recommendation…" : "Get AI Recommendation"}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: "rgba(245,242,236,0.45)" }}>
                          AI Recommendation
                        </p>
                        <button onClick={() => setAiText(null)} className="text-xs"
                          style={{ color: "rgba(245,242,236,0.35)" }}>
                          Dismiss
                        </button>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(245,242,236,0.82)" }}>
                        {aiText}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assembly grid (all 13 assemblies) */}
            <div className="mt-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mb-2"
                style={{ color: "rgba(245,242,236,0.35)" }}>
                All Assemblies
              </p>
              {data.assemblies.map((a) => {
                const meta      = ASSEMBLY_META[a.id];
                const isActive  = activeId === a.id;
                const hasZone   = ZONES.some(z => z.id === a.id);
                return (
                  <button
                    key={a.id}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition-all"
                    style={{
                      backgroundColor: isActive ? `${amber}1a` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isActive ? amber + "55" : "rgba(245,242,236,0.07)"}`,
                    }}
                    onClick={() => selectZone(a.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: hasZone ? amber : "rgba(245,242,236,0.2)" }} />
                      <p className="text-xs truncate" style={{ color: isActive ? cream : "rgba(245,242,236,0.7)" }}>
                        {a.name.split(" — ")[1] || a.name}
                      </p>
                    </div>
                    <div className="shrink-0 ml-2 text-right">
                      <p className="text-xs font-bold tabular-nums" style={{ color: isActive ? amber : "rgba(245,242,236,0.6)" }}>
                        {a.carbonTotal.toLocaleString()}
                      </p>
                      {meta && (
                        <p className="text-[9px]" style={{ color: CONF_COLOR[meta.confidence] + "aa" }}>
                          {meta.confidence}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <MinimalFooter />
    </div>
  );
}
