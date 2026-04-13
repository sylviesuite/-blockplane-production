import { Link } from "wouter";
import MinimalFooter from "@/components/MinimalFooter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Layers, GitCompare } from "lucide-react";
import { Header } from "@/components/Header";

// ── Benchmark 2000 reference constants ───────────────────────────────────────
const BENCHMARK = {
  lis: 100,
  ris: 38,
  cpi: 2.40,
  cpiBand: "Watch",
} as const;

// ── House SVG — geometric line-art front elevation ────────────────────────────
function HouseIllustration() {
  return (
    <svg
      viewBox="0 0 500 300"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg mx-auto select-none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="arch-grid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#09FBD3" strokeWidth="0.4" />
        </pattern>
      </defs>

      {/* Subtle grid background */}
      <rect width="500" height="300" fill="url(#arch-grid)" opacity="0.07" />

      {/* Ground / foundation line */}
      <line x1="55" y1="248" x2="445" y2="248" stroke="#09FBD3" strokeWidth="2" opacity="0.45" />

      {/* Walls */}
      <rect x="90" y="160" width="320" height="88" fill="none" stroke="#09FBD3" strokeWidth="1.5" opacity="0.85" />

      {/* Roof outline */}
      <polyline points="70,160 250,62 430,160" fill="none" stroke="#09FBD3" strokeWidth="1.5" opacity="0.9" />

      {/* Chimney */}
      <rect x="295" y="82" width="22" height="46" fill="none" stroke="#09FBD3" strokeWidth="1" opacity="0.5" />
      <line x1="293" y1="82" x2="319" y2="82" stroke="#09FBD3" strokeWidth="2" opacity="0.5" />

      {/* Gable oculus window */}
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
      {/* Door centre rail */}
      <line x1="218" y1="220" x2="282" y2="220" stroke="#09FBD3" strokeWidth="0.4" opacity="0.3" />
      {/* Door knob */}
      <circle cx="274" cy="224" r="2.5" fill="#09FBD3" opacity="0.55" />

      {/* CAD corner marks */}
      <path d="M 82 168 L 82 160 L 90 160" fill="none" stroke="#09FBD3" strokeWidth="0.8" opacity="0.35" />
      <path d="M 418 168 L 418 160 L 410 160" fill="none" stroke="#09FBD3" strokeWidth="0.8" opacity="0.35" />
      <path d="M 82 240 L 82 248 L 90 248" fill="none" stroke="#09FBD3" strokeWidth="0.8" opacity="0.35" />
      <path d="M 418 240 L 418 248 L 410 248" fill="none" stroke="#09FBD3" strokeWidth="0.8" opacity="0.35" />

      {/* Elevation height marker (left side) */}
      <line x1="50" y1="160" x2="50" y2="248" stroke="#09FBD3" strokeWidth="0.6" opacity="0.2" strokeDasharray="3,4" />
      <line x1="44" y1="160" x2="56" y2="160" stroke="#09FBD3" strokeWidth="0.6" opacity="0.2" />
      <line x1="44" y1="248" x2="56" y2="248" stroke="#09FBD3" strokeWidth="0.6" opacity="0.2" />

      {/* Dimension line (width) */}
      <line x1="90" y1="266" x2="410" y2="266" stroke="#09FBD3" strokeWidth="0.8" opacity="0.25" strokeDasharray="4,4" />
      <line x1="90" y1="260" x2="90" y2="272" stroke="#09FBD3" strokeWidth="0.8" opacity="0.25" />
      <line x1="410" y1="260" x2="410" y2="272" stroke="#09FBD3" strokeWidth="0.8" opacity="0.25" />
      <text
        x="250" y="286"
        textAnchor="middle"
        fill="#FF8E4A"
        fontSize="8.5"
        opacity="0.45"
        fontFamily="monospace"
        letterSpacing="1.2"
      >
        2,000 SQ FT · NORTH AMERICAN BASELINE
      </text>
    </svg>
  );
}

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
    href: "/lifecycle",
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

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center py-12 md:py-16">
        <div className="container text-center px-4 max-w-3xl">

          {/* Dominant headline */}
          <h1 className="font-black leading-none mb-1">
            <span className="block text-6xl md:text-8xl text-white tracking-[0.15em] uppercase">
              BENCHMARK
            </span>
            <span className="block text-8xl md:text-[10rem] tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-[#09FBD3] to-[#FF8E4A]">
              2000
            </span>
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mt-5 mb-2 leading-relaxed">
            A 2,000 sq ft code-built North American home — the reference point
            behind every LIS, RIS, and CPI score in BlockPlane.
          </p>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mb-8 leading-relaxed">
            Most projects start close to this. Small changes move these numbers quickly.
          </p>

          {/* House illustration */}
          <div className="mb-8 px-2">
            <HouseIllustration />
          </div>

          {/* Score tiles */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-xl mx-auto mb-3">

            {/* LIS */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl px-4 py-5 flex flex-col items-center gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">LIS</p>
              <p className="text-4xl font-bold text-amber-400 leading-none">{BENCHMARK.lis}</p>
              <p className="text-[10px] text-slate-500 leading-snug">At baseline</p>
              <p className="text-[10px] text-slate-600 leading-snug">Lower is better</p>
            </div>

            {/* RIS */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl px-4 py-5 flex flex-col items-center gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">RIS</p>
              <p className="text-4xl font-bold text-rose-400 leading-none">{BENCHMARK.ris}</p>
              <p className="text-[10px] text-rose-500/80 leading-snug">Below resilient range</p>
              <p className="text-[10px] text-slate-600 leading-snug">Higher is better</p>
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
