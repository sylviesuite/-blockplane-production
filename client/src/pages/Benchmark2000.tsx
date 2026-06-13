import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import MinimalFooter from "@/components/MinimalFooter";
import SEO from "@/components/SEO";

// ── TYPES ──────────────────────────────────────────────────────────────────────
type ZoneColor = "red" | "amber" | "green";

interface Swap {
  name: string;
  delta: number;
  rd: number;
  desc: string;
}

interface Zone {
  name: string;
  carbon: number;
  ris: number;
  color: ZoneColor;
  pill: { left: string; top: string };
  insight: string;
  swaps: Swap[];
  sqft: number;
  confidence: string;
  note: string;
  methodology: string;
  contractorNote: string;
  whyMatters: string;
}

interface SwapFeedback {
  tone: "green" | "amber";
  msg: string;
}

// ── ZONE DATA ──────────────────────────────────────────────────────────────────
const ZONES: Record<string, Zone> = {
  foundation: {
    name: "Foundation",
    carbon: 16224, ris: 38, color: "red",
    pill: { left: "6%", top: "84%" },
    sqft: 2000, confidence: "High",
    note: "Poured concrete slab; Portland cement process emissions are well-characterized across EC3 EPDs.",
    methodology: "Source data: EC3 ready-mix concrete EPDs, US average. Calculation: slab volume × concrete GWP factor (kg CO₂e/m³); baseline assumes 100% Portland cement with no SCM substitution. EPD notes: Manufacturer EPDs in EC3 range 285–380 kg CO₂e/m³ depending on mix design. Caveats: Regional aggregate transport excluded; fly-ash or slag substitution can shift GWP by 30–50%.",
    contractorNote: "Commonly available in Michigan · Minimal cost premium",
    whyMatters: "Foundation is responsible for 51% of this home's embodied carbon. Most of that impact comes from Portland cement manufacturing, one of the largest industrial CO₂ sources globally.",
    insight: "Your poured concrete foundation accounts for over half this home's embodied carbon. Portland cement is responsible for roughly 8% of global CO₂ emissions. Specifying a mix with 40–50% fly ash or slag substitution is a low-cost, high-impact change that most Michigan contractors can source locally.",
    swaps: [
      { name: "Fly Ash Concrete (40%)", delta: -3200, rd: 6, desc: "Replace 40% of Portland cement with fly ash — a power-plant byproduct that cuts process emissions significantly." },
      { name: "Slag-Blended Mix (50%)", delta: -4800, rd: 9, desc: "GGBS at 50% substitution; maintains structural strength while dramatically reducing GWP." },
      { name: "Optimized Structural Mix", delta: -1600, rd: 4, desc: "Reduce concrete volume 10–15% via structural optimization without changing the mix design." },
    ],
  },
  sheathing: {
    name: "Floor Assembly",
    carbon: 7266, ris: 52, color: "amber",
    pill: { left: "41%", top: "76%" },
    sqft: 2000, confidence: "Medium",
    note: "OSB and engineered lumber; regional EPD data coverage varies by manufacturer.",
    methodology: "Source data: APA industry-average OSB EPD; engineered lumber (LVL, I-joist) EPDs from EC3. Calculation: floor area × panel thickness × density × GWP factor, plus framing volume × lumber GWP. EPD notes: Biogenic carbon storage not credited per EC3 convention; OSB EPDs available from major North American producers. Caveats: Regional mill energy intensity can shift GWP ±15%; adhesive and fastener impacts excluded.",
    contractorNote: "Engineered lumber standard in Michigan · Comparable cost",
    whyMatters: "Floor systems carry significant structural load and material volume. Engineered and reclaimed options can cut carbon without compromising performance.",
    insight: "OSB sheathing and engineered lumber in the floor assembly are the second-largest carbon contributor. Mass timber panels sequester biogenic carbon while often simplifying installation. Recycled-content OSB is a drop-in replacement with a lower footprint.",
    swaps: [
      { name: "Recycled-Content OSB", delta: -800, rd: 4, desc: "OSB made with higher recycled fiber content and low-VOC binders — same spec, better GWP." },
      { name: "Cross-Laminated Timber", delta: -1800, rd: 8, desc: "CLT panels sequester biogenic carbon and replace multiple OSB layers in one product." },
    ],
  },
  roofing: {
    name: "Roof",
    carbon: 970, ris: 44, color: "red",
    pill: { left: "43%", top: "5%" },
    sqft: 2200, confidence: "Medium",
    note: "Petroleum-derived asphalt; limited EPD coverage in the US market.",
    methodology: "Source data: Industry average for fiberglass-reinforced asphalt shingles; limited manufacturer EPDs in EC3 as of 2024. Calculation: roof area × shingle weight per square × GWP factor. EPD notes: Only one published North American manufacturer EPD for asphalt shingles; estimate based on material composition (bitumen, fiberglass, mineral granules). Caveats: 20–25 year lifespan not amortized; underlayment and fasteners excluded.",
    contractorNote: "Metal roofing available through most suppliers · Moderate cost premium",
    whyMatters: "Asphalt shingles require replacement multiple times over a building's life, compounding lifecycle emissions. Material choice here affects decades of impact.",
    insight: "Asphalt shingles are petroleum-derived and last only 20–25 years before going to landfill. A steel standing seam roof lasts 50+ years, can contain significant recycled content, and is fully recyclable at end of life — turning a maintenance item into a long-term asset.",
    swaps: [
      { name: "Steel Standing Seam", delta: -180, rd: 8, desc: "50-year lifespan, often 25–35% recycled content, fully recyclable at end of life." },
      { name: "Reclaimed Slate", delta: -260, rd: 11, desc: "Near-zero embodied carbon; reused material skips new manufacturing entirely." },
    ],
  },
  windows: {
    name: "Windows",
    carbon: 2666, ris: 66, color: "green",
    pill: { left: "8%", top: "38%" },
    sqft: 280, confidence: "Medium",
    note: "Aluminum frame assumed; glazing EPDs vary by coating type and manufacturer.",
    methodology: "Source data: Aluminum window frame and flat-glass EPDs from EC3 and manufacturer disclosures. Calculation: window area × composite frame-and-glass GWP per m². EPD notes: Frame type dominates — aluminum carries 3–5× the GWP of wood or fiberglass frames; low-e coatings add minor GWP. Caveats: Thermally broken aluminum frame assumed; SHGC and U-value performance not reflected in the carbon figure; installation materials excluded.",
    contractorNote: "Triple-pane available from regional suppliers · Higher upfront cost, long-term savings",
    whyMatters: "Manufacturing energy dominates window carbon footprint, but durability and thermal performance can offset that impact significantly over time.",
    insight: "Aluminum-framed windows carry high embodied carbon from energy-intensive smelting. Wood or fiberglass frames reduce that impact substantially while improving the thermal break — critical in Michigan's Zone 6 climate where windows are a primary heat-loss path.",
    swaps: [
      { name: "Wood-Frame Triple Pane", delta: -600, rd: 6, desc: "FSC-certified wood frames with triple low-e glazing — lower carbon, better U-value." },
      { name: "Fiberglass Frame Windows", delta: -420, rd: 4, desc: "Pultruded fiberglass composite: low carbon, excellent thermal break, 40+ year lifespan." },
    ],
  },
  attic: {
    name: "Attic Insulation",
    carbon: 2100, ris: 71, color: "green",
    pill: { left: "43%", top: "27%" },
    sqft: 2000, confidence: "High",
    note: "Blown fiberglass; industry average EPD applied from leading US manufacturers.",
    methodology: "Source data: North American blown fiberglass EPDs; industry average applied. Calculation: attic area × installed depth × settled density × GWP factor. EPD notes: Manufacturing energy is the primary driver; some products use blowing agents with additional GWP; cellulose carries biogenic carbon credit under certain accounting conventions. Caveats: R-value performance differences not captured in GWP alone; air sealing materials excluded.",
    contractorNote: "Blown cellulose widely available · Similar or lower cost than fiberglass",
    whyMatters: "Insulation choice affects both embodied carbon and operational energy. High-performance options reduce lifetime emissions well beyond the install date.",
    insight: "Blown fiberglass has a global warming potential roughly 5× higher than cellulose due to manufacturing energy. Dense-pack cellulose is 85% recycled newspaper, performs better in cold attics by reducing convective loops, and sequesters biogenic carbon as a bonus.",
    swaps: [
      { name: "Dense-Pack Cellulose", delta: -700, rd: 5, desc: "85% recycled content, carbon-negative biogenic material, superior cold-climate performance." },
      { name: "Mineral Wool Batt", delta: -350, rd: 3, desc: "Slag-based mineral wool — non-combustible, moisture-resistant, moderate carbon improvement." },
    ],
  },
  framing: {
    name: "Wall Assembly",
    carbon: 1140, ris: 68, color: "amber",
    pill: { left: "5%", top: "58%" },
    sqft: 1450, confidence: "High",
    note: "Dimensional lumber; regional mill EPDs available in EC3 database.",
    methodology: "Source data: Dimension lumber EPDs from Pacific Northwest and Great Lakes mills (EC3). Calculation: framing volume from 2×6 studs at 16\" o.c. with standard corners and headers × GWP factor. EPD notes: Biogenic carbon storage not credited per EC3 convention; FSC-certified vs uncertified lumber carries the same GWP in most EPDs. Caveats: Drywall, sheathing, housewrap, and insulation tracked separately; moisture content at installation not accounted for.",
    contractorNote: "FSC lumber widely stocked in Michigan · No cost premium",
    whyMatters: "Wall framing is already relatively low-carbon, but material sourcing and advanced framing techniques can reduce waste and improve the overall build score.",
    insight: "Conventional 2×6 framing is already a low-carbon structural option. Advanced framing (OVE) reduces lumber use by 20–25% while adding more insulation cavity — a win on both embodied and operational carbon. The savings are modest but essentially free at the design stage.",
    swaps: [
      { name: "Advanced Framing (OVE)", delta: -200, rd: 5, desc: "24\" o.c. framing with two-stud corners cuts lumber 20–25% without compromising structure." },
      { name: "FSC-Certified Lumber", delta: -80, rd: 2, desc: "Chain-of-custody certified sustainable forestry — same product, verified responsible sourcing." },
    ],
  },
};

const ZONE_ORDER = ["sheathing", "foundation", "framing", "windows", "attic", "roofing"];

// SVG paths in viewBox 0 0 1000 667
const ZONE_SHAPES: Record<string, string> = {
  roofing:    "M150,20 H750 V140 H150 Z",
  attic:      "M300,167 H750 V300 H300 Z",
  framing:    "M50,233 H300 V520 H50 Z",
  windows:    "M80,280 H280 V427 H80 Z",
  sheathing:  "M250,414 H800 V494 H250 Z",
  foundation: "M50,520 H500 V620 H50 Z",
};

const COLOR_HEX: Record<ZoneColor, string> = {
  red: "#ef4444",
  amber: "#f59e0b",
  green: "#22c55e",
};

const SWAP_FEEDBACK: Record<string, SwapFeedback[]> = {
  foundation: [
    { tone: "green", msg: "Good swap. Cuts the largest carbon driver while keeping the mix familiar for Michigan contractors." },
    { tone: "green", msg: "Strong swap. GGBS is well-established and widely available — this is one of the highest-impact changes you can make." },
    { tone: "amber", msg: "Practical swap. No material change needed — just a more efficient design conversation with your engineer." },
  ],
  sheathing: [
    { tone: "green", msg: "Easy swap. Same installation, lower footprint. Worth specifying on every project." },
    { tone: "amber", msg: "Ambitious swap. CLT sequesters carbon and simplifies the assembly — best suited for projects where the budget supports it." },
  ],
  roofing: [
    { tone: "amber", msg: "Long-term swap. Higher upfront cost but lasts 50+ years and is fully recyclable — strong lifecycle argument." },
    { tone: "green", msg: "Regenerative swap. Near-zero embodied carbon. Availability varies but worth asking about in Northern Michigan." },
  ],
  windows: [
    { tone: "amber", msg: "Premium swap. Best thermal and carbon performance. Higher cost but strong for high-performance builds." },
    { tone: "green", msg: "Incremental swap. Better thermal performance and modest carbon reduction — solid upgrade." },
  ],
  attic: [
    { tone: "green", msg: "Clean swap. Recycled content, same performance, lower carbon. Easy upgrade." },
    { tone: "green", msg: "Solid alternative. Non-combustible and moisture-resistant — practical for Michigan's climate." },
  ],
  framing: [
    { tone: "green", msg: "Smart swap. Reduces lumber use without changing the build process — easy to specify." },
    { tone: "amber", msg: "Sourcing swap. Same product, verified responsible forestry. Low effort, good story." },
  ],
};

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const BASE_CARBON = 31926;
const BASE_RIS = 51;
const MILESTONES = [
  { pct: 0,  label: "Standard" },
  { pct: 8,  label: "Better"   },
  { pct: 16, label: "Good"     },
  { pct: 25, label: "Great"    },
  { pct: 35, label: "Excellent" },
];

// ── HELPERS ────────────────────────────────────────────────────────────────────
function effectiveColor(key: string, swaps: Record<string, number>): ZoneColor {
  const zone = ZONES[key];
  const idx = swaps[key];
  if (idx === undefined) return zone.color;
  const effectiveRIS = zone.ris + zone.swaps[idx].rd;
  if (effectiveRIS >= 60) return "green";
  if (effectiveRIS >= 45) return "amber";
  return "red";
}

function computeCarbon(swaps: Record<string, number>): number {
  return Object.entries(swaps).reduce((t, [k, i]) => t + ZONES[k].swaps[i].delta, BASE_CARBON);
}

function computeSavePct(carbon: number): number {
  return (BASE_CARBON - carbon) / BASE_CARBON * 100;
}

function computeRIS(savePct: number): number {
  return Math.min(Math.round(BASE_RIS + savePct * 1.2), 94);
}

function risRating(ris: number): string {
  if (ris >= 80) return "Platinum";
  if (ris >= 70) return "Gold";
  if (ris >= 60) return "Silver";
  return "Bronze";
}

function risImpactLabel(color: ZoneColor): string {
  if (color === "green") return "Low-impact";
  if (color === "amber") return "Medium-impact";
  return "High-impact";
}

function buildLevel(savePct: number): string {
  if (savePct >= 35) return "Excellent";
  if (savePct >= 25) return "Great";
  if (savePct >= 16) return "Good";
  if (savePct >= 8)  return "Better";
  return "Standard";
}

function hotspotCount(swaps: Record<string, number>): number {
  return Object.keys(ZONES).filter(k =>
    ZONES[k].color === "red" && effectiveColor(k, swaps) !== "green"
  ).length;
}

function nextBestZone(currentKey: string | null, swaps: Record<string, number>): string | null {
  return Object.keys(ZONES)
    .filter(k => k !== currentKey && swaps[k] === undefined)
    .sort((a, b) => ZONES[b].carbon - ZONES[a].carbon)[0] ?? null;
}

function coachMessage(swaps: Record<string, number>): { text: string; showBtn: boolean } {
  const has = (k: string) => swaps[k] !== undefined;
  if (has("foundation") && has("sheathing") && has("roofing") &&
      (has("framing") || has("attic") || has("windows"))) {
    return { text: "Strong build. You've reduced whole-house carbon significantly. Reset to try a different approach.", showBtn: false };
  }
  if (has("foundation") && has("sheathing") && has("roofing")) {
    return { text: "Three hotspots addressed. Wall assembly and windows are solid choices — consider cellulose insulation or triple-pane glazing for further improvement →", showBtn: false };
  }
  if (has("foundation") && has("sheathing")) {
    return { text: "Good progress. The roof is the next hotspot to review. Asphalt shingles are the easiest material to upgrade. Click Roof to compare options →", showBtn: false };
  }
  if (has("foundation")) {
    return { text: "Foundation improved. The floor assembly is now the next largest hotspot at 23% of total carbon. Click it to compare better options →", showBtn: false };
  }
  return { text: "Suggested first move: The foundation carries 51% of this home's embodied carbon. Click it to compare better options →", showBtn: true };
}

// ── ANIMATED NUMBER HOOK ───────────────────────────────────────────────────────
function useAnimatedNumber(value: number, decimals = 0): string {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;
    if (from === to) return;

    const start = performance.now();
    const dur = 550;

    function tick(now: number) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const cur = from + (to - from) * ease;
      setDisplay(cur);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(to);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  if (decimals > 0) return display.toFixed(decimals);
  return Math.round(display).toLocaleString();
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function Benchmark2000() {
  const [selected, setSelected] = useState<string | null>(null);
  const [swaps, setSwaps] = useState<Record<string, number>>({});
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  const carbon = computeCarbon(swaps);
  const savePct = computeSavePct(carbon);
  const ris = computeRIS(savePct);
  const hotspots = hotspotCount(swaps);
  const baseHotspots = Object.keys(ZONES).filter(k => ZONES[k].color === "red").length;
  const resolved = baseHotspots - hotspots;
  const barPct = Math.min(savePct / 35 * 100, 100);

  const animCarbon = useAnimatedNumber(carbon);
  const animRIS = useAnimatedNumber(ris);
  const animPct = useAnimatedNumber(savePct, 1);

  const coach = coachMessage(swaps);

  function selectZone(key: string) {
    setSelected(prev => prev === key ? prev : key);
  }

  function toggleSwap(key: string, idx: number) {
    setSwaps(prev => {
      const next = { ...prev };
      if (next[key] === idx) delete next[key];
      else next[key] = idx;
      return next;
    });
  }

  function resetAll() {
    setSwaps({});
    setSelected(null);
  }

  function startWithFoundation() {
    setSelected("foundation");
  }

  // Derived per-zone colors
  const zoneColors = Object.fromEntries(
    Object.keys(ZONES).map(k => [k, effectiveColor(k, swaps)])
  ) as Record<string, ZoneColor>;

  const hasAnySwap = Object.keys(swaps).length > 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#1a2e1f", color: "#f5f2ec" }}>
      <SEO
        title="Benchmark 2000 — Interactive Carbon Simulator"
        description="Explore how material choices affect embodied carbon in a 2,000 sq ft Northern Michigan home. EC3-verified baseline of 31,926 kg CO₂e."
        url="https://blockplanemetric.com/benchmark2000"
      />

      <Header />

      {/* ── INNER LAYOUT (full-height below header) ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>

        {/* ── PROGRESS HEADER ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "2.5rem",
          padding: "0.7rem 2.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#c17f24", letterSpacing: "-0.02em", whiteSpace: "nowrap", margin: 0 }}>
            Benchmark 2000
          </h1>
          <button
            onClick={resetAll}
            style={{
              padding: "3px 10px", borderRadius: 6, fontSize: "0.68rem", fontWeight: 600,
              letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer",
              background: "transparent", color: "#c17f24", border: "1px solid rgba(193,127,36,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            Reset
          </button>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(245,242,236,0.4)" }}>
              Build Better
            </div>
            {/* Progress bar */}
            <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                background: "linear-gradient(90deg,#c17f24,#e8a83e)",
                borderRadius: 3,
                width: `${barPct}%`,
                transition: "width 0.65s cubic-bezier(0.4,0,0.2,1)",
              }} />
              {MILESTONES.map(m => (
                <div key={m.pct} style={{
                  position: "absolute",
                  left: `${m.pct / 35 * 100}%`,
                  top: -3, width: 2, height: 12,
                  background: savePct >= m.pct ? "#c17f24" : "rgba(255,255,255,0.2)",
                  borderRadius: 1,
                  transform: "translateX(-50%)",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
            {/* Milestone labels */}
            <div style={{ position: "relative", height: 14 }}>
              {MILESTONES.map(m => (
                <div key={m.pct} style={{
                  position: "absolute",
                  left: `${m.pct / 35 * 100}%`,
                  transform: "translateX(-50%)",
                  fontSize: "0.65rem",
                  color: savePct >= m.pct ? "#c17f24" : "rgba(245,242,236,0.35)",
                  fontWeight: savePct >= m.pct ? 600 : 400,
                  transition: "color 0.3s",
                  whiteSpace: "nowrap",
                }}>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SCOREBOARD ── */}
        <div style={{
          display: "flex", gap: "0.85rem",
          padding: "0.7rem 2.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}>
          {[
            { label: "Whole-House Carbon", value: animCarbon, sub: "kg CO₂e", accent: false },
            { label: "RIS Score", value: animRIS, sub: risRating(ris), accent: false },
            { label: "Build Level", value: buildLevel(savePct), sub: "Build", accent: true },
            {
              label: "Hotspots",
              value: String(hotspots),
              sub: resolved > 0 && hotspots > 0
                ? `zones below Silver — ${resolved} resolved`
                : resolved > 0 && hotspots === 0
                ? "all zones at Silver or better"
                : "zones below Silver",
              accent: false,
              positive: hotspots === 0,
            },
            {
              label: "Improvement",
              value: `${animPct}%`,
              sub: "vs. Standard Build",
              accent: savePct > 0 && savePct < 35,
              positive: savePct >= 35,
            },
          ].map(card => (
            <div key={card.label} style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: "0.9rem 1.1rem",
              border: `1px solid ${card.positive ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.09)"}`,
              transition: "border-color 0.3s",
            }}>
              <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(245,242,236,0.45)", marginBottom: "0.35rem" }}>
                {card.label}
              </div>
              <div style={{
                fontSize: "1.35rem", fontWeight: 700,
                color: card.positive ? "#4ade80" : card.accent ? "#c17f24" : "#f5f2ec",
                transition: "color 0.4s",
              }}>
                {card.value}
              </div>
              <div style={{ fontSize: "0.73rem", color: "rgba(245,242,236,0.45)", marginTop: "0.1rem" }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN AREA ── */}
        <div style={{
          flex: 1, minHeight: 0,
          display: "flex",
          padding: "0.75rem 2.5rem 1rem",
          gap: 0,
          overflow: "hidden",
        }}>

          {/* House area */}
          <div style={{ flex: "0 0 60%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
              <img
                src="/images/benchmark2000-house.png"
                alt="Benchmark 2000 — Northern Michigan Home cutaway"
                style={{ width: "100%", height: "100%", display: "block", borderRadius: 10, objectFit: "contain" }}
              />

              {/* SVG overlay */}
              <svg
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 10, overflow: "hidden" }}
                viewBox="0 0 1000 667"
                preserveAspectRatio="xMidYMid slice"
              >
                {ZONE_ORDER.map(key => {
                  const color = zoneColors[key];
                  const hex = COLOR_HEX[color];
                  const isActive = selected === key;
                  return (
                    <path
                      key={key}
                      d={ZONE_SHAPES[key]}
                      fill={hex}
                      fillOpacity={isActive ? 0.28 : 0}
                      stroke={hex}
                      strokeWidth={1.5}
                      strokeOpacity={isActive ? 0.9 : 0}
                      style={{ cursor: "pointer", transition: "fill-opacity 0.18s, stroke-opacity 0.18s" }}
                      onClick={() => selectZone(key)}
                      onMouseEnter={e => {
                        (e.target as SVGPathElement).style.fillOpacity = "0.18";
                        (e.target as SVGPathElement).style.strokeOpacity = "0.6";
                      }}
                      onMouseLeave={e => {
                        (e.target as SVGPathElement).style.fillOpacity = isActive ? "0.28" : "0";
                        (e.target as SVGPathElement).style.strokeOpacity = isActive ? "0.9" : "0";
                      }}
                    />
                  );
                })}
              </svg>

              {/* Zone pills */}
              {Object.entries(ZONES).map(([key, zone]) => {
                const color = zoneColors[key];
                const isActive = selected === key;
                const bgColor = color === "red"
                  ? "rgba(220,38,38,0.9)"
                  : color === "amber"
                  ? "rgba(193,127,36,0.95)"
                  : "rgba(22,163,74,0.9)";
                return (
                  <button
                    key={key}
                    onClick={() => selectZone(key)}
                    style={{
                      position: "absolute",
                      left: zone.pill.left,
                      top: zone.pill.top,
                      padding: "3px 9px",
                      borderRadius: 20,
                      fontSize: "0.67rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      outline: "none",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "#fff",
                      background: bgColor,
                      boxShadow: isActive ? "0 0 0 2px rgba(255,255,255,0.8)" : "none",
                      transition: "transform 0.12s, box-shadow 0.12s, background 0.3s",
                    }}
                  >
                    {zone.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel */}
          <div style={{
            flex: "0 0 40%",
            padding: "0 0 0 1.75rem",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            maxHeight: "calc(100vh - 255px)",
            minHeight: 0,
          }}>
            {/* Empty state */}
            {!selected && (
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
                <div style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(193,127,36,0.07)",
                  borderLeft: "3px solid rgba(193,127,36,0.6)",
                  borderRadius: "0 6px 6px 0",
                  fontSize: "0.8rem",
                  color: "rgba(193,127,36,0.88)",
                  lineHeight: 1.6,
                }}>
                  {coach.text}
                </div>
                {coach.showBtn && (
                  <button
                    onClick={startWithFoundation}
                    style={{
                      marginTop: "0.85rem",
                      padding: "0.6rem 1rem",
                      background: "#c17f24",
                      color: "#1a2e1f",
                      border: "none",
                      borderRadius: 7,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      width: "100%",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Start with Foundation →
                  </button>
                )}
              </div>
            )}

            {/* Zone detail */}
            {selected && (() => {
              const zone = ZONES[selected];
              const appliedIdx = swaps[selected];
              const applied = appliedIdx !== undefined ? zone.swaps[appliedIdx] : null;
              const curCarbon = zone.carbon + (applied ? applied.delta : 0);
              const curRIS = zone.ris + (applied ? applied.rd : 0);
              const sharePct = Math.round(curCarbon / BASE_CARBON * 100);
              const perSqft = (curCarbon / zone.sqft).toFixed(1);
              const feedback = appliedIdx !== undefined ? (SWAP_FEEDBACK[selected]?.[appliedIdx] ?? null) : null;
              const color = zoneColors[selected];
              const chipColor = color === "green" ? { bg: "rgba(22,163,74,0.18)", text: "#4ade80", border: "rgba(22,163,74,0.35)" }
                : color === "amber" ? { bg: "rgba(193,127,36,0.18)", text: "#fbbf24", border: "rgba(193,127,36,0.35)" }
                : { bg: "rgba(220,38,38,0.18)", text: "#f87171", border: "rgba(220,38,38,0.35)" };
              const next = nextBestZone(selected, swaps);

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 0, flexShrink: 0 }}>
                  {/* Title row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f5f2ec" }}>{zone.name}</div>
                      <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                        <span style={{ fontSize: "0.78rem", color: "rgba(245,242,236,0.5)" }}>
                          <strong style={{ color: "#f5f2ec" }}>{curCarbon.toLocaleString()} kg</strong> CO₂e
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "rgba(245,242,236,0.5)" }}>
                          <strong style={{ color: "#f5f2ec" }}>{sharePct}%</strong> of total
                        </span>
                      </div>
                    </div>
                    <div style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700,
                      background: chipColor.bg, color: chipColor.text, border: `1px solid ${chipColor.border}`,
                      flexShrink: 0, marginTop: 2,
                    }}>
                      RIS {curRIS}
                    </div>
                  </div>

                  {/* Compact data row */}
                  <div style={{ fontSize: "0.74rem", color: "rgba(245,242,236,0.72)", marginBottom: "0.55rem" }}>
                    Per sq ft: <strong style={{ color: "#f5f2ec", fontWeight: 600 }}>{perSqft} kg</strong>
                    {" · "}
                    Quantity: <strong style={{ color: "#f5f2ec", fontWeight: 600 }}>{zone.sqft.toLocaleString()} sq ft</strong>
                    {" · "}
                    Confidence: <strong style={{ color: "#f5f2ec", fontWeight: 600 }}>{zone.confidence}</strong>
                  </div>

                  {/* Learn More — kept in the title area so it's never clipped */}
                  <div style={{ marginBottom: "0.75rem", textAlign: "right" }}>
                    <button
                      onClick={() => setLearnMoreOpen(true)}
                      style={{
                        background: "none", border: "none", padding: 0,
                        fontSize: "0.69rem", color: "rgba(245,242,236,0.35)",
                        cursor: "pointer", textDecoration: "underline",
                        letterSpacing: "0.01em",
                      }}
                    >
                      Learn more
                    </button>
                  </div>

                  {/* Why This Matters */}
                  <div style={{ fontSize: "0.78rem", color: "rgba(245,242,236,0.55)", lineHeight: 1.65, marginBottom: "0.75rem" }}>
                    {zone.whyMatters}
                  </div>

                  {/* Insight */}
                  <div style={{
                    fontSize: "0.82rem", lineHeight: 1.65, color: "rgba(245,242,236,0.72)",
                    background: "rgba(255,255,255,0.04)", borderRadius: 8,
                    padding: "0.8rem 0.95rem", borderLeft: "3px solid #c17f24",
                    marginBottom: "1rem",
                  }}>
                    {zone.insight}
                  </div>

                  {/* Swaps */}
                  <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(245,242,236,0.4)", marginBottom: "0.35rem" }}>
                    Material Swaps
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(245,242,236,0.4)", marginBottom: "0.5rem" }}>
                    {zone.contractorNote}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {zone.swaps.map((sw, i) => {
                      const isOn = swaps[selected] === i;
                      return (
                        <div key={i} style={{
                          background: isOn ? "rgba(74,222,128,0.07)" : "rgba(255,255,255,0.05)",
                          border: `1px solid ${isOn ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.09)"}`,
                          borderRadius: 9,
                          padding: "0.8rem 0.9rem",
                          transition: "border-color 0.2s, background 0.2s",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                            <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "#f5f2ec" }}>{sw.name}</span>
                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#4ade80" }}>
                              {sw.delta > 0 ? "+" : ""}{sw.delta.toLocaleString()} kg
                            </span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "rgba(245,242,236,0.5)", marginBottom: "0.55rem", lineHeight: 1.5 }}>
                            {sw.desc}
                          </div>
                          <button
                            onClick={() => toggleSwap(selected, i)}
                            style={{
                              padding: "4px 13px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600,
                              cursor: "pointer", letterSpacing: "0.02em",
                              background: isOn ? "rgba(74,222,128,0.2)" : "#c17f24",
                              color: isOn ? "#4ade80" : "#1a2e1f",
                              border: isOn ? "1px solid rgba(74,222,128,0.4)" : "none",
                              transition: "background 0.15s",
                            }}
                          >
                            {isOn ? "✓ Applied — Undo" : "Try Swap"}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  {feedback && (
                    <div style={{
                      marginTop: "0.65rem", padding: "0.55rem 0.8rem", borderRadius: 7, fontSize: "0.74rem", lineHeight: 1.45,
                      background: feedback.tone === "green" ? "rgba(74,222,128,0.07)" : "rgba(193,127,36,0.08)",
                      border: `1px solid ${feedback.tone === "green" ? "rgba(74,222,128,0.2)" : "rgba(193,127,36,0.25)"}`,
                      color: feedback.tone === "green" ? "#86efac" : "#fbbf24",
                    }}>
                      {feedback.msg}
                    </div>
                  )}

                  {/* Next best move */}
                  {hasAnySwap && next && (
                    <div
                      onClick={() => selectZone(next)}
                      style={{
                        marginTop: "0.85rem", padding: "0.65rem 0.9rem",
                        background: "rgba(193,127,36,0.07)",
                        borderLeft: "3px solid rgba(193,127,36,0.5)",
                        borderRadius: "0 7px 7px 0",
                        fontSize: "0.77rem", color: "rgba(193,127,36,0.9)",
                        lineHeight: 1.55, cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(193,127,36,0.13)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(193,127,36,0.07)")}
                    >
                      <strong style={{ display: "block", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.2rem", opacity: 0.7 }}>
                        Next best move
                      </strong>
                      {ZONES[next].name} — {Math.round(ZONES[next].carbon / BASE_CARBON * 100)}% of whole-house carbon. Click to compare options →
                    </div>
                  )}

                  {/* Coach message when panel is open */}
                  {!coach.showBtn && (
                    <div style={{
                      marginTop: "0.85rem", padding: "0.55rem 0.8rem",
                      background: "rgba(193,127,36,0.05)",
                      borderLeft: "2px solid rgba(193,127,36,0.3)",
                      borderRadius: "0 6px 6px 0",
                      fontSize: "0.72rem", color: "rgba(193,127,36,0.65)",
                      lineHeight: 1.55,
                    }}>
                      {coach.text}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── METHODOLOGY MODAL ── */}
      {learnMoreOpen && selected && (
        <div
          onClick={() => setLearnMoreOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 400,
            background: "rgba(0,0,0,0.65)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1.5rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#1c3121",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "1.75rem 2rem",
              maxWidth: 520, width: "100%",
              maxHeight: "78vh", overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.1rem" }}>
              <div>
                <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(245,242,236,0.35)", marginBottom: "0.3rem" }}>Methodology</div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f5f2ec" }}>{ZONES[selected].name}</div>
              </div>
              <button
                onClick={() => setLearnMoreOpen(false)}
                style={{ background: "none", border: "none", color: "rgba(245,242,236,0.4)", fontSize: "1.1rem", cursor: "pointer", padding: "0 2px", lineHeight: 1 }}
              >✕</button>
            </div>
            <div style={{ fontSize: "0.82rem", color: "rgba(245,242,236,0.68)", lineHeight: 1.75 }}>
              {ZONES[selected].methodology}
            </div>
          </div>
        </div>
      )}

      {/* ── SLIDE-OUT ZONE DETAIL PANEL ── */}
      <div
        aria-hidden={!selected}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(420px, 88vw)",
          background: "#1c3121",
          borderLeft: "1px solid rgba(255,255,255,0.13)",
          boxShadow: selected ? "-14px 0 48px rgba(0,0,0,0.5)" : "none",
          transform: selected ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 200,
          display: "flex", flexDirection: "column",
          overflowY: "auto",
          padding: "1.35rem 1.5rem 2.5rem",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {selected && (() => {
          const zone = ZONES[selected];
          const appliedIdx = swaps[selected];
          const applied = appliedIdx !== undefined ? zone.swaps[appliedIdx] : null;
          const curCarbon = zone.carbon + (applied ? applied.delta : 0);
          const curRIS = zone.ris + (applied ? applied.rd : 0);
          const perSqft = (curCarbon / zone.sqft).toFixed(1);
          const color = zoneColors[selected];
          const feedback = appliedIdx !== undefined ? (SWAP_FEEDBACK[selected]?.[appliedIdx] ?? null) : null;
          const chipColor = color === "green"
            ? { bg: "rgba(22,163,74,0.18)", text: "#4ade80", border: "rgba(22,163,74,0.35)" }
            : color === "amber"
            ? { bg: "rgba(193,127,36,0.18)", text: "#fbbf24", border: "rgba(193,127,36,0.35)" }
            : { bg: "rgba(220,38,38,0.18)", text: "#f87171", border: "rgba(220,38,38,0.35)" };

          return (
            <>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f5f2ec" }}>{zone.name}</div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close panel"
                  style={{
                    background: "none", border: "none", color: "rgba(245,242,236,0.45)",
                    fontSize: "1.15rem", cursor: "pointer", padding: "0 2px", lineHeight: 1,
                  }}
                >✕</button>
              </div>

              {/* Carbon / share line */}
              <div style={{ display: "flex", gap: "1rem", marginBottom: "0.6rem" }}>
                <span style={{ fontSize: "0.78rem", color: "rgba(245,242,236,0.5)" }}>
                  <strong style={{ color: "#f5f2ec" }}>{curCarbon.toLocaleString()} kg</strong> CO₂e
                </span>
                <span style={{ fontSize: "0.78rem", color: "rgba(245,242,236,0.5)" }}>
                  <strong style={{ color: "#f5f2ec" }}>{Math.round(curCarbon / BASE_CARBON * 100)}%</strong> of total
                </span>
              </div>

              {/* Compact data row */}
              <div style={{ fontSize: "0.74rem", color: "rgba(245,242,236,0.72)", marginBottom: "0.75rem", lineHeight: 1.5 }}>
                Per sq ft: <strong style={{ color: "#f5f2ec", fontWeight: 600 }}>{perSqft} kg</strong>
                {" · "}
                Quantity: <strong style={{ color: "#f5f2ec", fontWeight: 600 }}>{zone.sqft.toLocaleString()} sq ft</strong>
                {" · "}
                Confidence: <strong style={{ color: "#f5f2ec", fontWeight: 600 }}>{zone.confidence}</strong>
              </div>

              {/* RIS + impact label */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.7rem" }}>
                <div style={{
                  padding: "3px 11px", borderRadius: 20, fontSize: "0.77rem", fontWeight: 700,
                  background: chipColor.bg, color: chipColor.text, border: `1px solid ${chipColor.border}`,
                }}>
                  RIS {curRIS}
                </div>
                <div style={{ fontSize: "0.77rem", color: chipColor.text, fontWeight: 500 }}>
                  {risImpactLabel(color)}
                </div>
              </div>

              {/* Note */}
              <div style={{
                fontSize: "0.76rem", color: "rgba(245,242,236,0.5)", lineHeight: 1.55,
                marginBottom: "0.65rem", fontStyle: "italic",
              }}>
                {zone.note}
              </div>

              {/* Why This Matters */}
              <div style={{ fontSize: "0.78rem", color: "rgba(245,242,236,0.55)", lineHeight: 1.65, marginBottom: "0.75rem" }}>
                {zone.whyMatters}
              </div>

              {/* Insight — sentence per line */}
              <div style={{ fontSize: "0.8rem", color: "rgba(245,242,236,0.68)", lineHeight: 1.6, marginBottom: "1rem" }}>
                {zone.insight.split('. ').map((sentence, i, arr) => (
                  <span key={i} style={{ display: "block", marginBottom: i < arr.length - 1 ? "0.4rem" : 0 }}>
                    {sentence}{i < arr.length - 1 ? '.' : ''}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: "0.8rem" }} />

              {/* Swaps label + Learn more */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(245,242,236,0.38)" }}>
                  Swap Alternatives
                </div>
                <button
                  onClick={() => setLearnMoreOpen(true)}
                  style={{
                    background: "none", border: "none", padding: 0,
                    fontSize: "0.69rem", color: "rgba(245,242,236,0.35)",
                    cursor: "pointer", textDecoration: "underline",
                    letterSpacing: "0.01em",
                  }}
                >
                  Learn more
                </button>
              </div>

              {/* Contractor note */}
              <div style={{ fontSize: "0.72rem", color: "rgba(245,242,236,0.4)", marginBottom: "0.45rem" }}>
                {zone.contractorNote}
              </div>

              {/* Swap cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "0.9rem" }}>
                {zone.swaps.map((sw, i) => {
                  const isOn = swaps[selected] === i;
                  return (
                    <div key={i} style={{
                      background: isOn ? "rgba(74,222,128,0.07)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isOn ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 9, padding: "0.7rem 0.8rem",
                      transition: "border-color 0.2s, background 0.2s",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.22rem" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#f5f2ec" }}>{sw.name}</span>
                        <span style={{ fontSize: "0.79rem", fontWeight: 700, color: "#4ade80" }}>
                          {sw.delta > 0 ? "+" : ""}{sw.delta.toLocaleString()} kg
                        </span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "rgba(245,242,236,0.48)", marginBottom: "0.45rem", lineHeight: 1.45 }}>
                        {sw.desc}
                      </div>
                      <button
                        onClick={() => toggleSwap(selected, i)}
                        style={{
                          padding: "4px 13px", borderRadius: 6, fontSize: "0.71rem", fontWeight: 600,
                          cursor: "pointer", letterSpacing: "0.02em",
                          background: isOn ? "rgba(74,222,128,0.18)" : "#c17f24",
                          color: isOn ? "#4ade80" : "#1a2e1f",
                          border: isOn ? "1px solid rgba(74,222,128,0.4)" : "none",
                          transition: "background 0.15s",
                        }}
                      >
                        {isOn ? "✓ Applied — Undo" : "Apply Swap"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Feedback */}
              {feedback && (
                <div style={{
                  padding: "0.5rem 0.72rem", borderRadius: 7, fontSize: "0.73rem", lineHeight: 1.45,
                  marginBottom: "0.8rem",
                  background: feedback.tone === "green" ? "rgba(74,222,128,0.07)" : "rgba(193,127,36,0.08)",
                  border: `1px solid ${feedback.tone === "green" ? "rgba(74,222,128,0.2)" : "rgba(193,127,36,0.25)"}`,
                  color: feedback.tone === "green" ? "#86efac" : "#fbbf24",
                }}>
                  {feedback.msg}
                </div>
              )}

              {/* Get AI Recommendations */}
              <button
                onClick={() => { window.location.href = "/assistant"; }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(193,127,36,0.2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(193,127,36,0.1)")}
                style={{
                  width: "100%", padding: "0.68rem 1rem", marginTop: "0.25rem",
                  background: "rgba(193,127,36,0.1)",
                  color: "#c17f24",
                  border: "1px solid rgba(193,127,36,0.4)",
                  borderRadius: 8, fontSize: "0.8rem", fontWeight: 600,
                  cursor: "pointer", letterSpacing: "0.02em",
                  transition: "background 0.15s",
                }}
              >
                Get AI Recommendations →
              </button>
            </>
          );
        })()}
      </div>

      <MinimalFooter />
    </div>
  );
}
