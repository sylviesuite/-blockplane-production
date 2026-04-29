import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import MinimalFooter from "@/components/MinimalFooter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Layers, GitCompare, X, TrendingUp, ArrowRight, Calculator, Lock } from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

// ── Benchmark 2000 reference constants ───────────────────────────────────────
const BENCHMARK = {
  lis: 100,
  ris: 38,
  cpi: 2.40,
  cpiBand: "Watch",
} as const;

// ── Zone definitions — cats must match actual DB category values ──────────────
const ZONES = {
  roof: {
    label: "Roof",
    cats: ["Steel", "Composites", "Timber"],
    desc: "Roofing & cladding assemblies",
    pulsePos: { x: 195, y: 130 },
    labelPos: { x: 195, y: 128 },
  },
  walls: {
    label: "Walls",
    cats: ["Timber", "Masonry", "Earth", "Concrete"],
    desc: "Exterior wall systems",
    pulsePos: { x: 105, y: 200 },
    labelPos: { x: 105, y: 198 },
  },
  insulation: {
    label: "Insulation",
    cats: ["Insulation"],
    desc: "Thermal insulation",
    pulsePos: { x: 250, y: 170 },
    labelPos: { x: 250, y: 170 },
  },
  windows: {
    label: "Windows",
    cats: ["Composites", "Steel"],
    desc: "Window glazing & frames",
    pulsePos: { x: 147, y: 198 },
    labelPos: { x: 147, y: 198 },
  },
  flooring: {
    label: "Flooring",
    cats: ["Timber", "Composites"],
    desc: "Interior flooring materials",
    pulsePos: { x: 250, y: 235 },
    labelPos: { x: 250, y: 235 },
  },
  foundation: {
    label: "Foundation",
    cats: ["Concrete", "Masonry", "Steel"],
    desc: "Foundation & structure",
    pulsePos: { x: 250, y: 252 },
    labelPos: { x: 250, y: 252 },
  },
} as const;

type ZoneId = keyof typeof ZONES;

// ── Navigation cards ──────────────────────────────────────────────────────────
const NAV_CARDS = [
  {
    href: "/materials",
    title: "Material Database",
    body: "Browse a vetted catalog of building materials with embodied carbon, LIS/RIS scores, and cost-per-impact — all benchmarked against Benchmark 2000.",
    cta: "Browse materials →",
    icon: Database,
    accent: "from-[#09FBD3] to-[#07C9B3]",
    borderHover: "hover:border-[#09FBD3]/50",
  },
  {
    href: "/breakdown",
    title: "Lifecycle Breakdown",
    body: "See where the impact actually happens — from point of origin through transport, construction, use, and end-of-life — for each material.",
    cta: "View lifecycle chart →",
    icon: Layers,
    accent: "from-[#FF8E4A] to-[#FF6B35]",
    borderHover: "hover:border-[#FF8E4A]/50",
  },
  {
    href: "/analysis",
    title: "Compare & Visualize",
    body: "Put materials side-by-side in LIS/RIS quadrants, compare CPI, and explore trade-offs against the Benchmark 2000 reference.",
    cta: "Open comparison tools →",
    icon: GitCompare,
    accent: "from-[#09FBD3] to-[#FF8E4A]",
    borderHover: "hover:border-[#09FBD3]/50",
  },
];

// ── Interactive house illustration ────────────────────────────────────────────
function InteractiveHouse({
  activeZone,
  hoveredZone,
  onZoneClick,
  onZoneHover,
}: {
  activeZone: ZoneId | null;
  hoveredZone: ZoneId | null;
  onZoneClick: (z: ZoneId) => void;
  onZoneHover: (z: ZoneId | null) => void;
}) {
  const zoneProps = (id: ZoneId) => {
    const isActive = activeZone === id;
    const isHovered = hoveredZone === id;
    return {
      style: {
        fill: "#09FBD3",
        fillOpacity: isActive ? 0.22 : isHovered ? 0.12 : 0,
        stroke: "#09FBD3",
        strokeOpacity: isActive ? 0.85 : isHovered ? 0.55 : 0,
        strokeWidth: isActive ? 1.5 : 1,
        cursor: "pointer",
        pointerEvents: "all" as const,
        transition: "fill-opacity 0.2s ease, stroke-opacity 0.2s ease",
      },
      onClick: () => onZoneClick(id),
      onMouseEnter: () => onZoneHover(id),
      onMouseLeave: () => onZoneHover(null),
      onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); onZoneClick(id); },
    };
  };

  return (
    <svg
      viewBox="0 0 500 300"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-none mx-auto select-none"
      aria-label="Interactive house illustration — click zones to explore materials"
    >
      <defs>
        <pattern id="arch-grid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#09FBD3" strokeWidth="0.4" />
        </pattern>
        <filter id="zone-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Grid */}
      <rect width="500" height="300" fill="url(#arch-grid)" opacity="0.07" />

      {/* ── Static house geometry ─────────────────────────────────────────── */}
      <line x1="55" y1="248" x2="445" y2="248" stroke="#09FBD3" strokeWidth="2" opacity="0.45" />
      <rect x="90" y="160" width="320" height="88" fill="none" stroke="#09FBD3" strokeWidth="1.5" opacity="0.85" />
      <polyline points="70,160 250,62 430,160" fill="none" stroke="#09FBD3" strokeWidth="1.5" opacity="0.9" />

      {/* Chimney */}
      <rect x="295" y="82" width="22" height="46" fill="none" stroke="#09FBD3" strokeWidth="1" opacity="0.5" />
      <line x1="293" y1="82" x2="319" y2="82" stroke="#09FBD3" strokeWidth="2" opacity="0.5" />

      {/* Gable oculus */}
      <circle cx="250" cy="110" r="14" fill="none" stroke="#09FBD3" strokeWidth="0.8" opacity="0.5" />
      <line x1="250" y1="96" x2="250" y2="124" stroke="#09FBD3" strokeWidth="0.4" opacity="0.35" />
      <line x1="236" y1="110" x2="264" y2="110" stroke="#09FBD3" strokeWidth="0.4" opacity="0.35" />

      {/* Left window */}
      <rect x="115" y="174" width="65" height="48" fill="none" stroke="#09FBD3" strokeWidth="1" opacity="0.75" />
      <line x1="147" y1="174" x2="147" y2="222" stroke="#09FBD3" strokeWidth="0.5" opacity="0.45" />
      <line x1="115" y1="198" x2="180" y2="198" stroke="#09FBD3" strokeWidth="0.5" opacity="0.45" />

      {/* Right window */}
      <rect x="320" y="174" width="65" height="48" fill="none" stroke="#09FBD3" strokeWidth="1" opacity="0.75" />
      <line x1="352" y1="174" x2="352" y2="222" stroke="#09FBD3" strokeWidth="0.5" opacity="0.45" />
      <line x1="320" y1="198" x2="385" y2="198" stroke="#09FBD3" strokeWidth="0.5" opacity="0.45" />

      {/* Door */}
      <rect x="218" y="193" width="64" height="55" fill="none" stroke="#09FBD3" strokeWidth="1" opacity="0.75" />
      <line x1="218" y1="220" x2="282" y2="220" stroke="#09FBD3" strokeWidth="0.4" opacity="0.3" />
      <circle cx="274" cy="224" r="2.5" fill="#09FBD3" opacity="0.55" />

      {/* CAD marks */}
      <path d="M 82 168 L 82 160 L 90 160" fill="none" stroke="#09FBD3" strokeWidth="0.8" opacity="0.35" />
      <path d="M 418 168 L 418 160 L 410 160" fill="none" stroke="#09FBD3" strokeWidth="0.8" opacity="0.35" />
      <path d="M 82 240 L 82 248 L 90 248" fill="none" stroke="#09FBD3" strokeWidth="0.8" opacity="0.35" />
      <path d="M 418 240 L 418 248 L 410 248" fill="none" stroke="#09FBD3" strokeWidth="0.8" opacity="0.35" />
      <line x1="50" y1="160" x2="50" y2="248" stroke="#09FBD3" strokeWidth="0.6" opacity="0.2" strokeDasharray="3,4" />
      <line x1="44" y1="160" x2="56" y2="160" stroke="#09FBD3" strokeWidth="0.6" opacity="0.2" />
      <line x1="44" y1="248" x2="56" y2="248" stroke="#09FBD3" strokeWidth="0.6" opacity="0.2" />
      <line x1="90" y1="266" x2="410" y2="266" stroke="#09FBD3" strokeWidth="0.8" opacity="0.25" strokeDasharray="4,4" />
      <line x1="90" y1="260" x2="90" y2="272" stroke="#09FBD3" strokeWidth="0.8" opacity="0.25" />
      <line x1="410" y1="260" x2="410" y2="272" stroke="#09FBD3" strokeWidth="0.8" opacity="0.25" />
      <text x="250" y="286" textAnchor="middle" fill="#FF8E4A" fontSize="8.5" opacity="0.45" fontFamily="monospace" letterSpacing="1.2">
        2,000 SQ FT · NORTH AMERICAN BASELINE
      </text>

      {/* ── Clickable hotspot zones (rendered on top of geometry) ──────────── */}

      {/* Walls — left + right strips */}
      <path
        d="M90,160 L120,160 L120,248 L90,248 Z M380,160 L410,160 L410,248 L380,248 Z"
        {...zoneProps("walls")}
      >
        <title>Walls — click to explore wall materials</title>
      </path>

      {/* Insulation — upper band across middle wall */}
      <rect x="120" y="160" width="260" height="22" {...zoneProps("insulation")}>
        <title>Insulation — click to explore insulation materials</title>
      </rect>

      {/* Windows — both window areas */}
      <path
        d="M110,182 L185,182 L185,226 L110,226 Z M315,182 L390,182 L390,226 L315,226 Z"
        {...zoneProps("windows")}
      >
        <title>Windows — click to explore window materials</title>
      </path>

      {/* Flooring — interior floor strip */}
      <rect x="120" y="226" width="260" height="17" {...zoneProps("flooring")}>
        <title>Flooring — click to explore flooring materials</title>
      </rect>

      {/* Foundation — ground line zone */}
      <rect x="55" y="243" width="390" height="22" {...zoneProps("foundation")}>
        <title>Foundation — click to explore structural materials</title>
      </rect>

      {/* Roof — full triangle */}
      <polygon points="70,160 250,62 430,160" {...zoneProps("roof")}>
        <title>Roof — click to explore roofing materials</title>
      </polygon>

      {/* ── Pulse indicators (hidden when zone is active) ─────────────────── */}
      {(Object.keys(ZONES) as ZoneId[]).map((id, index) => {
        if (activeZone === id) return null;
        const { pulsePos } = ZONES[id];
        const delay = `${index * 0.35}s`;
        return (
          <g key={`pulse-${id}`} style={{ pointerEvents: "none" }}>
            {/* Outer ring — CSS ping animation */}
            <circle
              cx={pulsePos.x}
              cy={pulsePos.y}
              r="10"
              fill="none"
              stroke="#09FBD3"
              strokeWidth="1.5"
              className="hotspot-ring"
              style={{ animationDelay: delay }}
            />
            {/* Solid inner dot — CSS pulse animation */}
            <circle
              cx={pulsePos.x}
              cy={pulsePos.y}
              r="4"
              fill="#09FBD3"
              className="hotspot-dot"
              style={{ animationDelay: delay }}
            />
          </g>
        );
      })}

      {/* ── Zone labels (shown on hover or when active) ───────────────────── */}
      {(Object.keys(ZONES) as ZoneId[]).map((id) => {
        const { labelPos } = ZONES[id];
        const isVisible = hoveredZone === id || activeZone === id;
        const label = ZONES[id].label.toUpperCase();
        const labelW = label.length * 5.5 + 12;
        return (
          <g
            key={`label-${id}`}
            style={{
              opacity: isVisible ? 1 : 0,
              transition: "opacity 0.15s ease",
              pointerEvents: "none",
            }}
          >
            <rect
              x={labelPos.x - labelW / 2}
              y={labelPos.y - 9}
              width={labelW}
              height={13}
              rx="3"
              fill="#0f172a"
              fillOpacity="0.9"
              stroke="#09FBD3"
              strokeWidth="0.6"
              strokeOpacity="0.7"
            />
            <text
              x={labelPos.x}
              y={labelPos.y + 1.5}
              textAnchor="middle"
              fill="#09FBD3"
              fontSize="5.5"
              fontFamily="monospace"
              letterSpacing="0.8"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Material comparison panel ─────────────────────────────────────────────────
function ZoneMaterialPanel({
  zone,
  items,
  isLoading,
  onClose,
}: {
  zone: ZoneId;
  items: any[];
  isLoading: boolean;
  onClose: () => void;
}) {
  const config = ZONES[zone];
  const sorted = [...items].sort((a, b) => b.risScore - a.risScore);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const risGap = best && worst ? best.risScore - worst.risScore : 0;

  return (
    <div className="w-full border border-[#09FBD3]/30 rounded-xl bg-slate-900/90 backdrop-blur-sm overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/60">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#09FBD3] uppercase">
            {config.label}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">{config.desc}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-slate-500 text-sm">
          Loading {config.label.toLowerCase()} materials…
        </div>
      ) : !best ? (
        <div className="px-5 py-8 text-center">
          <p className="text-slate-500 text-sm">No materials found for this zone.</p>
          <p className="text-slate-600 text-xs mt-1">
            The live database contains more data than the development fallback.
          </p>
        </div>
      ) : (
        <>
          {/* Comparison grid */}
          <div className="grid grid-cols-2 divide-x divide-slate-700/40">
            {/* Worst = zone baseline */}
            <div className="px-4 py-4">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                Zone baseline
              </p>
              <p className="text-sm font-semibold text-slate-300 leading-tight mb-3 line-clamp-2">
                {worst?.name ?? "—"}
              </p>
              <div className="space-y-1.5">
                <MetricRow label="Carbon" value={`${parseFloat(worst?.totalCarbon ?? "0").toFixed(1)}`} unit="kg CO₂e/m²" tone="muted" />
                <MetricRow label="Cost" value={`$${parseFloat(worst?.costPerUnit ?? "0").toFixed(0)}`} unit="/m²" tone="muted" />
                <MetricRow label="RIS" value={String(worst?.risScore ?? "—")} tone="bad" />
                <MetricRow label="LIS" value={String(worst?.lisScore ?? "—")} tone="muted" />
              </div>
            </div>

            {/* Best = best available */}
            <div className="px-4 py-4 bg-slate-800/30">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[#09FBD3]/70 mb-2">
                Best available
              </p>
              <p className="text-sm font-semibold text-white leading-tight mb-3 line-clamp-2">
                {best.name}
              </p>
              <div className="space-y-1.5">
                <MetricRow label="Carbon" value={`${parseFloat(best.totalCarbon).toFixed(1)}`} unit="kg CO₂e/m²" tone="good" />
                <MetricRow label="Cost" value={`$${parseFloat(best.costPerUnit).toFixed(0)}`} unit="/m²" tone="muted" />
                <MetricRow label="RIS" value={String(best.risScore)} tone="good" />
                <MetricRow label="LIS" value={String(best.lisScore)} tone="good" />
              </div>
            </div>
          </div>

          {/* "Better is possible" bar */}
          {worst && best && worst.id !== best.id && risGap > 0 && (
            <div className="px-5 py-3 border-t border-slate-700/40 bg-slate-800/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#09FBD3] shrink-0" />
                <span className="text-[11px] text-slate-300">
                  <span className="text-[#09FBD3] font-semibold">+{risGap} RIS points</span> better is possible in this zone
                </span>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="px-5 py-3 border-t border-slate-700/40 flex items-center justify-between">
            <p className="text-[10px] text-slate-600">{sorted.length} materials in this zone</p>
            <Link href="/materials">
              <button className="flex items-center gap-1.5 text-[11px] font-semibold text-[#09FBD3] hover:text-white transition-colors">
                Explore all {config.label.toLowerCase()} materials
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function MetricRow({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone: "good" | "bad" | "muted";
}) {
  const valueColor =
    tone === "good" ? "text-[#09FBD3]" : tone === "bad" ? "text-rose-400" : "text-slate-400";
  return (
    <div className="flex items-baseline justify-between gap-1">
      <span className="text-[10px] text-slate-600 font-mono">{label}</span>
      <span className={`text-[11px] font-semibold font-mono ${valueColor}`}>
        {value}
        {unit && <span className="text-slate-600 font-normal text-[9px] ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  const [activeZone, setActiveZone] = useState<ZoneId | null>(null);
  const [hoveredZone, setHoveredZone] = useState<ZoneId | null>(null);

  const zoneConfig = activeZone ? ZONES[activeZone] : null;

  // Fetch materials for the active zone
  const { data: zoneResults, isLoading: zoneLoading } = trpc.materialAPI.search.useQuery(
    {
      categories: (zoneConfig?.cats ?? []) as any[],
      sortBy: "ris",
      sortOrder: "desc",
      pageSize: 100,
    },
    { enabled: !!activeZone }
  );

  const zoneItems = zoneResults?.items ?? [];
  const zoneSorted = [...zoneItems].sort((a, b) => b.risScore - a.risScore);
  const zoneBest = zoneSorted[0];
  const zoneWorst = zoneSorted[zoneSorted.length - 1];

  const handleZoneClick = (z: ZoneId) => {
    setActiveZone((prev) => (prev === z ? null : z));
  };

  // Dynamic score values
  const lisDisplay =
    activeZone && zoneBest && zoneWorst && zoneBest.id !== zoneWorst.id
      ? { from: zoneWorst.lisScore, to: zoneBest.lisScore, hasDelta: true }
      : { single: BENCHMARK.lis, hasDelta: false };

  const risDisplay =
    activeZone && zoneBest && zoneWorst && zoneBest.id !== zoneWorst.id
      ? { from: zoneWorst.risScore, to: zoneBest.risScore, hasDelta: true }
      : { single: BENCHMARK.ris, hasDelta: false };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center py-12 md:py-16">
        <div className="container text-center px-4 max-w-3xl">

          <h1 className="font-black leading-none mb-1">
            <span className="block text-6xl md:text-8xl text-white tracking-[0.15em] uppercase">
              BENCHMARK
            </span>
            <span className="block text-8xl md:text-[10rem] tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-[#09FBD3] to-[#FF8E4A]">
              2000
            </span>
          </h1>

          <p className="text-sm text-slate-500 tracking-widest uppercase mt-3 mb-6">
            A 2,000 sq ft reference home
          </p>

          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-1 leading-relaxed">
            A 2,000 sq ft code-built North American home — the reference point
            behind every LIS, RIS, and CPI score in BlockPlane.
          </p>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mb-0 leading-relaxed">
            Most projects start close to this. Small changes move these numbers quickly.
          </p>

        </div>

        {/* House — wider than text column for 20% size increase */}
        <div className="w-full max-w-[57.6rem] mx-auto px-2 mb-1">
          <InteractiveHouse
            activeZone={activeZone}
            hoveredZone={hoveredZone}
            onZoneClick={handleZoneClick}
            onZoneHover={setHoveredZone}
          />
        </div>

        {/* Instruction line */}
        <p className="text-[11px] text-slate-600 text-center mb-3 tracking-wide">
          Click any part of the house to explore its environmental impact
        </p>

        {/* Zone status indicator */}
        {(hoveredZone || activeZone) && (
          <p className="text-[10px] font-mono tracking-widest text-[#09FBD3]/80 text-center mb-2 uppercase">
            {ZONES[hoveredZone ?? activeZone!].label} ·{" "}
            {ZONES[hoveredZone ?? activeZone!].desc}
          </p>
        )}

        {/* Material panel — shown when zone is active */}
        <div
          className="w-full max-w-[57.6rem] mx-auto px-2 mb-4"
          style={{
            maxHeight: activeZone ? "600px" : "0",
            opacity: activeZone ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.25s ease, opacity 0.2s ease",
          }}
        >
          {activeZone && (
            <ZoneMaterialPanel
              zone={activeZone}
              items={zoneItems}
              isLoading={zoneLoading}
              onClose={() => setActiveZone(null)}
            />
          )}
        </div>

        <div className="container text-center px-4 max-w-3xl">

          {/* Connective line */}
          <p className="text-xs text-slate-500 text-center mb-5">
            {activeZone
              ? `Scores update to reflect the ${ZONES[activeZone].label.toLowerCase()} zone range.`
              : "This configuration produces the baseline scores below."}
          </p>

          {/* Score tiles */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-xl mx-auto mb-3">

            {/* LIS */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl px-4 py-5 flex flex-col items-center gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">LIS</p>
              {lisDisplay.hasDelta ? (
                <>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-2xl font-bold text-slate-500">{lisDisplay.from}</span>
                    <span className="text-slate-600 text-sm">→</span>
                    <span className="text-2xl font-bold text-[#09FBD3]">{lisDisplay.to}</span>
                  </div>
                  <p className="text-[10px] text-[#09FBD3]/70 leading-snug">Zone range</p>
                  <p className="text-[10px] text-slate-600 leading-snug">Lower is better</p>
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold text-amber-400 leading-none">{BENCHMARK.lis}</p>
                  <p className="text-[10px] text-slate-500 leading-snug">At baseline</p>
                  <p className="text-[10px] text-slate-600 leading-snug">Lower is better</p>
                </>
              )}
            </div>

            {/* RIS */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl px-4 py-5 flex flex-col items-center gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">RIS</p>
              {risDisplay.hasDelta ? (
                <>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-2xl font-bold text-rose-400">{risDisplay.from}</span>
                    <span className="text-slate-600 text-sm">→</span>
                    <span className="text-2xl font-bold text-[#09FBD3]">{risDisplay.to}</span>
                  </div>
                  <p className="text-[10px] text-[#09FBD3]/70 leading-snug">Zone range</p>
                  <p className="text-[10px] text-slate-600 leading-snug">Higher is better</p>
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold text-rose-400 leading-none">{BENCHMARK.ris}</p>
                  <p className="text-[10px] text-rose-500/80 leading-snug">Below resilient range</p>
                  <p className="text-[10px] text-slate-600 leading-snug">Higher is better</p>
                </>
              )}
            </div>

            {/* CPI */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl px-4 py-5 flex flex-col items-center gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">CPI</p>
              <p className="text-4xl font-bold text-amber-400 leading-none">{BENCHMARK.cpi.toFixed(2)}</p>
              <p className="text-[10px] text-amber-500/80 leading-snug">{BENCHMARK.cpiBand}</p>
              <p className="text-[10px] text-slate-600 leading-snug">Lower is better</p>
            </div>
          </div>

          {/* Caption */}
          <p className="text-xs text-slate-600 text-center mb-8">
            Material choices drive these scores.
          </p>

          {/* CTA */}
          <Link href="/materials">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Explore materials that improve on this baseline →
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Score legend strip ───────────────────────────────────────────────── */}
      <section className="border-t border-b border-slate-800 bg-slate-900/60">
        <div className="container px-4 max-w-4xl mx-auto py-6">
          <div className="grid md:grid-cols-3 gap-6 md:gap-10">

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-1">
                LIS — Lifecycle Impact Score
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Measures total embodied carbon relative to the 200 kg CO₂e/m²
                baseline. Benchmark 2000 = 100. Materials scoring below 100 are
                cleaner; above 100 are worse.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1">
                RIS — Resilience Impact Score
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Weighted score across durability, circularity, carbon recovery,
                material health, and biodiversity. Standard construction scores 38
                (Problematic). Aim for Silver (60+) or Gold (75+).
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80 mb-1">
                CPI — Cost-Performance Index
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Lifecycle cost per unit of carbon impact. Lower = better cost
                efficiency. Baseline sits in the Watch band. Good materials push
                this below 50.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Navigation cards ─────────────────────────────────────────────────── */}
      <section className="py-10 md:py-12 bg-slate-950">
        <div className="container px-4 max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 text-center mb-6">
            Where to go next
          </p>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {NAV_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href}>
                  <Card
                    className={`h-full cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 ${card.borderHover}`}
                  >
                    <CardHeader className="pb-2">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.accent} flex items-center justify-center mb-3`}
                      >
                        <Icon className="w-5 h-5 text-black" />
                      </div>
                      <CardTitle className="text-white text-lg">{card.title}</CardTitle>
                      <CardDescription className="text-gray-300 leading-relaxed text-sm">
                        {card.body}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <span className="text-sm font-semibold text-[#09FBD3]">{card.cta}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Free vs auth split ───────────────────────────────────────────────── */}
      <section className="py-10 md:py-12 bg-slate-900/60 border-t border-slate-700/40">
        <div className="container px-4 max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-center mb-2">
            What's free · what's unlocked
          </p>
          <h2 className="text-xl font-bold text-center text-white mb-6">
            Start exploring for free. Sign in to go deeper.
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Free card 1 */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#09FBD3]">
                <Database className="h-4 w-4" />
                <span className="text-sm font-semibold">Material Database</span>
                <span className="ml-auto text-[10px] border border-[#09FBD3]/30 text-[#09FBD3] rounded-full px-2 py-0.5">Free</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browse the full catalog — embodied carbon, LIS/RIS scores, and lifecycle breakdowns for every material.
              </p>
              <Link href="/materials">
                <Button size="sm" variant="outline" className="mt-2 border-slate-600 text-slate-300 hover:text-white w-full">
                  Browse materials →
                </Button>
              </Link>
            </div>

            {/* Free card 2 */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#09FBD3]">
                <Calculator className="h-4 w-4" />
                <span className="text-sm font-semibold">Carbon Calculator</span>
                <span className="ml-auto text-[10px] border border-[#09FBD3]/30 text-[#09FBD3] rounded-full px-2 py-0.5">Free</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Look up any material's embodied carbon instantly — kg CO₂e/m², LIS, and RIS at a glance.
              </p>
              <Link href="/calculator">
                <Button size="sm" variant="outline" className="mt-2 border-slate-600 text-slate-300 hover:text-white w-full">
                  Open calculator →
                </Button>
              </Link>
            </div>

            {/* Gated card */}
            <div className={`rounded-xl border p-5 space-y-2 ${user ? "border-[#09FBD3]/30 bg-slate-800/40" : "border-slate-600/40 bg-slate-900/60"}`}>
              <div className="flex items-center gap-2 text-slate-300">
                {user ? <TrendingUp className="h-4 w-4 text-[#FF8E4A]" /> : <Lock className="h-4 w-4 text-slate-500" />}
                <span className="text-sm font-semibold">{user ? "Advanced Tools" : "Advanced Tools"}</span>
                <span className={`ml-auto text-[10px] rounded-full px-2 py-0.5 border ${user ? "border-[#FF8E4A]/40 text-[#FF8E4A]" : "border-slate-600 text-slate-500"}`}>
                  {user ? "Unlocked" : "Sign in"}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Project analysis, budget optimizer, material swap assistant, AI insights, and global impact dashboard.
              </p>
              {user ? (
                <a href="https://app.blockplanemetric.com" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="mt-2 w-full bg-[#FF8E4A]/20 border border-[#FF8E4A]/40 text-[#FF8E4A] hover:bg-[#FF8E4A]/30">
                    Open projects →
                  </Button>
                </a>
              ) : (
                <a href="https://app.blockplanemetric.com" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="mt-2 w-full bg-[#09FBD3]/10 border border-[#09FBD3]/30 text-[#09FBD3] hover:bg-[#09FBD3]/20">
                    Create free account →
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── AI assistant banner ──────────────────────────────────────────────── */}
      <section className="border-t border-slate-700/50 bg-slate-800/40">
        <div className="container px-4 max-w-5xl mx-auto py-4 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Need a second opinion?</h3>
              <p className="text-sm text-gray-400 mt-0.5">
                Ask the AI Builder&apos;s Assistant to walk you through LIS, RIS, CPI,
                and which materials beat the Benchmark 2000 baseline.
              </p>
            </div>
            <Link href="/assistant">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-200 hover:bg-slate-700/50 shrink-0"
              >
                Ask the AI →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MinimalFooter />
    </div>
  );
}
