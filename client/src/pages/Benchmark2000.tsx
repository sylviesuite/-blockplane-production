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
  costDelta?: string;
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
  whyMatters?: string;
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
    insight: "Foundation accounts for 51% of this home's embodied carbon, primarily due to Portland cement manufacturing. Low-carbon mixes using fly ash or slag can reduce foundation emissions by 20–30% with minimal cost impact.",
    swaps: [
      { name: "Fly Ash Concrete (40%)", delta: -3200, rd: 6, desc: "Replace 40% of Portland cement with fly ash — a power-plant byproduct that cuts process emissions significantly.", costDelta: "No cost premium" },
      { name: "Slag-Blended Mix (50%)", delta: -4800, rd: 9, desc: "GGBS at 50% substitution; maintains structural strength while dramatically reducing GWP.", costDelta: "+$800–1,500 est." },
      { name: "Optimized Structural Mix", delta: -1600, rd: 4, desc: "Reduce concrete volume 10–15% via structural optimization without changing the mix design.", costDelta: "No cost premium" },
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
    insight: "Floor systems carry significant material volume and structural load. Engineered options reduce carbon without compromising performance.",
    swaps: [
      { name: "Engineered Wood Joists", delta: -800, rd: 4, desc: "OSB made with higher recycled fiber content and low-VOC binders — same spec, better GWP.", costDelta: "No cost premium" },
      { name: "Cross-Laminated Timber (CLT)", delta: -1800, rd: 8, desc: "CLT panels sequester biogenic carbon and replace multiple OSB layers in one product.", costDelta: "+$2,000–4,000 est." },
      { name: "Reclaimed Douglas Fir", delta: -1400, rd: 6, desc: "Salvaged structural lumber from decommissioned barns or buildings — near-zero new production, high character.", costDelta: "+$1,000–2,500 est." },
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
    insight: "Asphalt shingles require replacement multiple times over a building's life, compounding emissions. Metal roofing lasts 2–3x longer and cuts long-term carbon impact significantly.",
    swaps: [
      { name: "Steel Standing Seam", delta: -180, rd: 8, desc: "50-year lifespan, often 25–35% recycled content, fully recyclable at end of life.", costDelta: "+$4,000–8,000 est." },
      { name: "Reclaimed Slate", delta: -260, rd: 11, desc: "Near-zero embodied carbon; reused material skips new manufacturing entirely.", costDelta: "+$6,000–12,000 est." },
      { name: "Recycled Content Shingles", delta: -110, rd: 2, desc: "Shingles with post-consumer recycled rubber or plastic content — same installation, slightly lower production footprint.", costDelta: "No cost premium" },
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
    insight: "Window manufacturing is energy-intensive, but durability and thermal performance offset that impact over time. Triple-pane options from regional suppliers pay back in energy savings.",
    swaps: [
      { name: "Triple-Pane Fiberglass", delta: -600, rd: 6, desc: "FSC-certified wood frames with triple low-e glazing — lower carbon, better U-value.", costDelta: "+$2,000–4,000 est." },
      { name: "Double-Pane Low-E Upgrade", delta: -240, rd: 2, desc: "Upgraded low-e coatings reduce solar gain and heat loss with minimal added material impact over standard double-pane.", costDelta: "+$500–1,000 est." },
      { name: "Fiberglass Frame Upgrade", delta: -420, rd: 4, desc: "Pultruded fiberglass composite: low carbon, excellent thermal break, 40+ year lifespan.", costDelta: "+$800–1,500 est." },
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
    insight: "Insulation affects both embodied carbon and lifetime energy performance. Blown cellulose is widely available in Michigan at similar or lower cost than fiberglass.",
    swaps: [
      { name: "Blown Cellulose (R-49)", delta: -700, rd: 5, desc: "85% recycled content, carbon-negative biogenic material, superior cold-climate performance.", costDelta: "No cost premium" },
      { name: "Mineral Wool Batts", delta: -350, rd: 3, desc: "Slag-based mineral wool — non-combustible, moisture-resistant, moderate carbon improvement.", costDelta: "+$300–600 est." },
      { name: "Recycled Denim Batts", delta: -420, rd: 3, desc: "Made from post-consumer denim scraps — high recycled content, no chemical irritants, similar R-value to fiberglass.", costDelta: "+$200–400 est." },
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
    insight: "Wall framing is relatively low-carbon but material sourcing matters. FSC-certified lumber and advanced framing techniques reduce waste with no cost premium.",
    swaps: [
      { name: "Advanced Framing (24\" o.c.)", delta: -200, rd: 5, desc: "24\" o.c. framing with two-stud corners cuts lumber 20–25% without compromising structure.", costDelta: "-$200–400 savings" },
      { name: "FSC-Certified Lumber", delta: -80, rd: 2, desc: "Chain-of-custody certified sustainable forestry — same product, verified responsible sourcing.", costDelta: "+$300–600 est." },
      { name: "Engineered Lumber (LVL)", delta: -150, rd: 4, desc: "LVL uses precision-cut veneers — less material waste, consistent strength, and lower volume per lineal foot.", costDelta: "+$500–900 est." },
    ],
  },
  hvac: {
    name: "HVAC",
    carbon: 950, ris: 42, color: "red",
    pill: { left: "52%", top: "60%" },
    sqft: 2000, confidence: "Medium",
    note: "Forced-air gas furnace with central AC; equipment manufacturing EPDs are limited in the US market.",
    methodology: "Source data: Industry estimates for residential HVAC equipment manufacturing GWP; no widely published EPDs exist for HVAC systems as of 2024. Calculation: equipment weight × material composition GWP (steel, aluminum, copper, refrigerants). EPD notes: Refrigerant GWP is a significant wildcard — R-410A has a GWP of 2,088 vs R-32 at 675. Caveats: Operational emissions excluded (embodied carbon only); ductwork and installation materials tracked separately.",
    contractorNote: "Heat pump systems available from major distributors · Higher upfront cost, lower operating cost",
    whyMatters: "HVAC equipment manufacturing carries meaningful embodied carbon, and refrigerant choice can significantly amplify or reduce that impact over the system's life.",
    insight: "Conventional gas furnace + AC systems use R-410A refrigerant with a global warming potential over 2,000× that of CO₂. Cold-climate heat pumps with low-GWP refrigerants (R-32, R-454B) cut both embodied carbon and operating emissions — critical for Michigan's heating-dominated climate.",
    swaps: [
      { name: "Cold-Climate Heat Pump (R-32)", delta: -210, rd: 6, desc: "Air-source heat pump with low-GWP R-32 refrigerant — efficient to -13°F, widely available in Michigan." },
      { name: "Ground-Source Heat Pump", delta: -340, rd: 9, desc: "Geothermal system with minimal refrigerant charge; highest embodied carbon reduction, higher install cost." },
      { name: "Mini-Split System (R-454B)", delta: -160, rd: 5, desc: "Ductless multi-zone system with ultra-low GWP refrigerant; eliminates duct losses and material." },
    ],
  },
  drywall: {
    name: "Drywall",
    carbon: 1200, ris: 55, color: "amber",
    pill: { left: "30%", top: "45%" },
    sqft: 8500, confidence: "High",
    note: "Standard 1/2\" gypsum board; US manufacturer EPDs are well-established in EC3.",
    methodology: "Source data: Gypsum board EPDs from USG, Georgia-Pacific, and National Gypsum in EC3. Calculation: wall and ceiling area × board weight per area × GWP factor. EPD notes: Calcination of gypsum is the primary emission source; recycled content varies by manufacturer. Caveats: Joint compound, tape, and primer excluded; ceiling drywall included in sqft total.",
    contractorNote: "High-recycled-content drywall available from major suppliers · No cost premium",
    whyMatters: "Drywall covers every interior wall and ceiling surface — the sheer area makes even small per-unit improvements add up across the whole house.",
    insight: "Standard gypsum board calcination releases CO₂ during manufacturing. High-recycled-content drywall from manufacturers like USG Sheetrock EcoSmart uses synthetic gypsum — a power-plant byproduct — cutting process emissions significantly with no performance difference.",
    swaps: [
      { name: "Recycled-Content Gypsum (USG EcoSmart)", delta: -280, rd: 5, desc: "Synthetic gypsum from FGD process; same install, lower manufacturing emissions." },
      { name: "Lime Plaster Finish", delta: -160, rd: 6, desc: "Natural hydraulic lime plaster — vapor-permeable, durable, and lower GWP than gypsum board manufacturing." },
      { name: "Hempcrete Interior Panels", delta: -480, rd: 8, desc: "Carbon-sequestering hemp-lime panels for interior partitions; biogenic carbon credit." },
    ],
  },
  interiorFinishes: {
    name: "Interior Finishes",
    carbon: 550, ris: 50, color: "amber",
    pill: { left: "30%", top: "55%" },
    sqft: 2000, confidence: "Low",
    note: "Flooring, paint, trim, and cabinetry combined; EPD coverage is sparse and highly variable.",
    methodology: "Source data: Composite estimate from flooring EPDs (vinyl plank, carpet, hardwood), paint EPDs, and cabinet industry averages. Calculation: floor area × flooring GWP + wall area × paint coverage × GWP + cabinet lineal footage × GWP. EPD notes: Vinyl flooring carries the highest GWP; hardwood and tile are moderate; paint GWP is low per coat but covers significant area. Caveats: Confidence is Low due to wide product variability; no single EPD covers this composite category.",
    contractorNote: "Low-VOC paint and FSC flooring widely available · Minimal to no cost premium",
    whyMatters: "Interior finishes are highly variable and often overlooked, but flooring choice in particular can meaningfully shift the carbon profile of the interior package.",
    insight: "Vinyl luxury plank flooring is one of the highest-GWP flooring options due to PVC content. FSC-certified hardwood or reclaimed wood floors carry biogenic carbon storage. Low-VOC paint adds minimal carbon impact but meaningfully improves indoor air quality — a co-benefit worth specifying.",
    swaps: [
      { name: "FSC Hardwood Flooring", delta: -140, rd: 5, desc: "Certified sustainable hardwood sequesters biogenic carbon and lasts the life of the building." },
      { name: "Reclaimed Wood Floors", delta: -220, rd: 8, desc: "Near-zero embodied carbon; salvaged material skips new manufacturing entirely." },
    ],
  },
  cladding: {
    name: "Exterior Cladding",
    carbon: 610, ris: 48, color: "amber",
    pill: { left: "74%", top: "50%" },
    sqft: 1450, confidence: "Medium",
    note: "Vinyl siding assumed; EPD coverage for residential cladding is improving but still limited.",
    methodology: "Source data: Vinyl siding EPDs from US manufacturers; fiber cement and wood siding EPDs from EC3 and manufacturer disclosures. Calculation: wall area × cladding weight per area × GWP factor. EPD notes: Vinyl is PVC-based with high process emissions; fiber cement has moderate GWP; wood and reclaimed materials carry lower or negative biogenic carbon. Caveats: Paint, trim, and flashing excluded; installation hardware GWP not included.",
    contractorNote: "Fiber cement widely available in Michigan · Comparable to vinyl cost",
    whyMatters: "Cladding covers the entire exterior and is replaced or repainted multiple times over a building's life. Material choice affects both embodied carbon and long-term maintenance cycles.",
    insight: "Vinyl siding is petrochemical-derived and difficult to recycle at end of life. Fiber cement offers comparable durability with a lower carbon footprint, while reclaimed wood or naturally durable species like cedar eliminate most manufacturing emissions entirely.",
    swaps: [
      { name: "Fiber Cement (James Hardie)", delta: -120, rd: 4, desc: "50-year warranty, fire-resistant, lower GWP than vinyl — the most common Michigan upgrade." },
      { name: "FSC-Certified Cedar Siding", delta: -220, rd: 7, desc: "Naturally durable wood with biogenic carbon storage; FSC certification verifies responsible sourcing." },
      { name: "Reclaimed Wood Cladding", delta: -340, rd: 10, desc: "Near-zero embodied carbon; salvaged material skips manufacturing entirely. Sourcing requires lead time." },
    ],
  },
};

const ZONE_ORDER = ["sheathing", "foundation", "framing", "windows", "attic", "roofing", "hvac", "cladding", "drywall", "interiorFinishes"];

// SVG paths in viewBox 0 0 1000 667
const ZONE_SHAPES: Record<string, string> = {
  roofing:    "M150,20 H750 V140 H150 Z",
  attic:      "M300,167 H750 V300 H300 Z",
  framing:    "M50,233 H300 V520 H50 Z",
  windows:    "M80,280 H280 V427 H80 Z",
  sheathing:  "M250,414 H800 V494 H250 Z",
  foundation: "M50,520 H500 V620 H50 Z",
  hvac:       "M430,370 H570 V500 H430 Z",
  cladding:   "M750,140 H870 V520 H750 Z",
  drywall:          "M115,250 H770 V405 H115 Z",
  interiorFinishes: "M300,500 H570 V580 H300 Z",
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
    { tone: "amber", msg: "Reclaimed option. High-character material that skips new manufacturing — ask your supplier about regional availability." },
  ],
  roofing: [
    { tone: "amber", msg: "Long-term swap. Higher upfront cost but lasts 50+ years and is fully recyclable — strong lifecycle argument." },
    { tone: "green", msg: "Regenerative swap. Near-zero embodied carbon. Availability varies but worth asking about in Northern Michigan." },
    { tone: "green", msg: "Easy swap. Recycled content shingles carry the same installation spec with a lower carbon footprint — no premium." },
  ],
  windows: [
    { tone: "amber", msg: "Premium swap. Best thermal and carbon performance. Higher cost but strong for high-performance builds." },
    { tone: "green", msg: "Practical upgrade. Low-e coating cuts operational energy at moderate cost — solid improvement over standard double-pane." },
    { tone: "green", msg: "Incremental swap. Better thermal performance and modest carbon reduction — solid upgrade." },
  ],
  attic: [
    { tone: "green", msg: "Clean swap. Recycled content, same performance, lower carbon. Easy upgrade." },
    { tone: "green", msg: "Solid alternative. Non-combustible and moisture-resistant — practical for Michigan's climate." },
    { tone: "amber", msg: "Sustainable swap. Recycled denim is comfortable to install and comes with high recycled content — good option for health-conscious builds." },
  ],
  framing: [
    { tone: "green", msg: "Smart swap. Reduces lumber use without changing the build process — easy to specify." },
    { tone: "amber", msg: "Sourcing swap. Same product, verified responsible forestry. Low effort, good story." },
    { tone: "amber", msg: "Engineering swap. LVL uses less material with tighter tolerances — good for span conditions and reducing overall lumber volume." },
  ],
  hvac: [
    { tone: "green", msg: "Smart swap. Cold-climate heat pumps work well in Michigan winters and the R-32 refrigerant dramatically lowers lifecycle GWP." },
    { tone: "green", msg: "High-impact swap. Ground-source systems have significant upfront cost but the carbon and operating savings are substantial." },
    { tone: "amber", msg: "Practical swap. Mini-splits eliminate duct losses and the low-GWP refrigerant is a meaningful improvement over R-410A." },
  ],
  cladding: [
    { tone: "green", msg: "Easy swap. Fiber cement is the standard upgrade from vinyl — better carbon, better durability, familiar installation." },
    { tone: "green", msg: "Strong swap. Cedar sequesters biogenic carbon and lasts 30–50 years with minimal maintenance in Michigan's climate." },
    { tone: "amber", msg: "Regenerative swap. Sourcing reclaimed wood takes lead time but the embodied carbon is essentially zero." },
  ],
  drywall: [
    { tone: "green", msg: "Clean swap. Same install process, same performance, meaningfully lower manufacturing emissions — easy to specify on any project." },
    { tone: "amber", msg: "Specialty swap. Lime plaster has a learning curve but suits high-performance and vapor-open assemblies well." },
    { tone: "amber", msg: "Ambitious swap. Hempcrete panels sequester carbon but require specialized installation — best for new construction with a willing contractor." },
  ],
  interiorFinishes: [
    { tone: "green", msg: "Durable swap. FSC hardwood lasts the life of the building and sequesters biogenic carbon in the process." },
    { tone: "green", msg: "Regenerative swap. Reclaimed floors are the lowest-carbon option available — worth the sourcing effort." },
  ],
};

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const BASE_CARBON = 31926;
const BASE_RIS = 51;
const MILESTONES = [
  { pct: 0,  label: "Standard" },
  { pct: 15, label: "Better"   },
  { pct: 20, label: "Good"     },
  { pct: 35, label: "Great"    },
  { pct: 50, label: "Excellent" },
];

// ── HELPERS ────────────────────────────────────────────────────────────────────
function effectiveColor(key: string, swaps: Record<string, number>): ZoneColor {
  const zone = ZONES[key];
  const idx = swaps[key];
  if (idx === undefined) return zone.color;
  const effectiveRIS = zone.ris + zone.swaps[idx].rd;
  if (effectiveRIS >= 60) return "green";
  if (effectiveRIS >= 45) return "amber";
  // Any applied swap on a red zone promotes at least to amber;
  // amber zones hold their color when the improvement is modest.
  return zone.color === "red" ? "amber" : zone.color;
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
  if (savePct >= 50) return "Excellent";
  if (savePct >= 35) return "Great";
  if (savePct >= 20) return "Good";
  if (savePct >= 15) return "Better";
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
  const scoreboardRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelTop, setPanelTop] = useState(0);
  const [panelLeft, setPanelLeft] = useState(0);

  const carbon = computeCarbon(swaps);
  const savePct = computeSavePct(carbon);
  const ris = computeRIS(savePct);
  const hotspots = hotspotCount(swaps);
  const baseHotspots = Object.keys(ZONES).filter(k => ZONES[k].color === "red").length;
  const resolved = baseHotspots - hotspots;
  const barPct = Math.min(savePct / 50 * 100, 100);

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

  useEffect(() => {
    function measure() {
      if (scoreboardRef.current) {
        setPanelTop(scoreboardRef.current.getBoundingClientRect().bottom);
      }
      if (panelRef.current) {
        setPanelLeft(panelRef.current.getBoundingClientRect().left);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "#1a2e1f", color: "#f5f2ec" }}>
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
                  left: `${m.pct / 50 * 100}%`,
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
                  left: `${m.pct / 50 * 100}%`,
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
        <div ref={scoreboardRef} style={{
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
          gap: "3%",
          overflow: "hidden",
        }}>

          {/* House area */}
          <div style={{ flex: "0 0 55%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
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
                        if (!isActive) {
                          (e.target as SVGPathElement).style.fillOpacity = "0.18";
                          (e.target as SVGPathElement).style.strokeOpacity = "0.6";
                        }
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
                    key={`${key}-${color}`}
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
          <div ref={panelRef} style={{
            flex: 1,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
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
          position: "fixed", top: panelTop, left: panelLeft, right: 0, bottom: 0,
          background: "#1c3121",
          borderLeft: "1px solid rgba(255,255,255,0.13)",
          boxShadow: selected ? "-14px 0 48px rgba(0,0,0,0.5)" : "none",
          transform: selected ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 200,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: "1.35rem 1.5rem 2.5rem" }}>
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

              {/* Active zone mini-header — sticky while scrolling swap cards */}
              <div style={{
                position: "sticky", top: 0, zIndex: 10,
                background: "#1c3121",
                padding: "0.4rem 0 0.5rem",
                marginBottom: "0.3rem",
                fontSize: "0.62rem", textTransform: "uppercase",
                letterSpacing: "0.07em", color: "rgba(245,242,236,0.38)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                {zone.name} · {curCarbon.toLocaleString()} kg CO₂e · {Math.round(curCarbon / BASE_CARBON * 100)}% of total · RIS {curRIS}
              </div>

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
                      <div style={{ marginBottom: "0.15rem" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#f5f2ec" }}>{sw.name}</span>
                      </div>
                      <div style={{ fontSize: "0.72rem", marginBottom: "0.3rem" }}>
                        <span style={{ fontWeight: 700, color: "#4ade80" }}>
                          {sw.delta > 0 ? "+" : ""}{sw.delta.toLocaleString()} kg CO₂e
                        </span>
                        {sw.costDelta && <span style={{ color: "rgba(245,242,236,0.42)" }}>{" · "}{sw.costDelta}</span>}
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
      </div>

      <MinimalFooter />
    </div>
  );
}
