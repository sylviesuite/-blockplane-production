import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

// ── Design tokens (matching Lovable redesign) ─────────────────────────────────
const forest = "#1a2e1f";
const cream = "#f5f2ec";
const creamAlt = "#eae7e0";
const amber = "#c17f24";
const amberHover = "#a86c1c";
const text = "#1c1c1a";
const muted = "#5a5a56";
const borderSoft = "rgba(28,28,26,0.08)";
const borderOnDark = "rgba(245,242,236,0.12)";

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b" style={{ backgroundColor: forest, borderColor: borderOnDark }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-sm" style={{ backgroundColor: cream }} aria-hidden />
          <span className="text-lg font-semibold tracking-tight" style={{ color: cream }}>
            Block Plane
          </span>
        </Link>

        <div className="flex items-center gap-7">
          <Link
            href="/materials"
            className="hidden text-sm font-medium md:inline transition-colors"
            style={{ color: "rgba(245,242,236,0.6)" }}
          >
            Materials
          </Link>
          <Link
            href="/analysis"
            className="hidden text-sm font-medium md:inline transition-colors"
            style={{ color: "rgba(245,242,236,0.6)" }}
          >
            Analysis
          </Link>
          <Link
            href="/how-it-works"
            className="hidden text-sm font-medium md:inline transition-colors"
            style={{ color: "rgba(245,242,236,0.6)" }}
          >
            How It Works
          </Link>

          {user ? (
            <>
              <Link
                href="/projects"
                className="hidden text-sm font-medium md:inline transition-colors"
                style={{ color: "rgba(245,242,236,0.6)" }}
              >
                Account
              </Link>
              <button
                onClick={logout}
                className="rounded-md px-4 py-2 text-sm font-semibold transition-colors"
                style={{ color: cream, border: `1px solid ${borderOnDark}` }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/signup"
              className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: amber }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = amberHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = amber)}
            >
              Get started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ backgroundColor: forest }}>
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <span
          className="inline-block rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider"
          style={{ borderColor: borderOnDark, color: "#d8d4c8" }}
        >
          Northern Michigan · Great Lakes Region
        </span>
        <h1
          className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
          style={{ color: cream }}
        >
          Craft a sustainable future with Block Plane Metrics.
        </h1>
        <p className="mt-3 text-base" style={{ color: "rgba(245,242,236,0.55)" }}>
          A cradle-to-gate carbon calculator for building materials.
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: "#cfcabf" }}>
          Block Plane gives you verified embodied carbon data for 243 regional building
          materials.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/materials"
            className="rounded-md px-6 py-3.5 text-base font-semibold text-white transition-colors"
            style={{ backgroundColor: amber }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = amberHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = amber)}
          >
            Start a material compare
          </Link>
          <Link
            href="/materials"
            className="rounded-md border px-6 py-3.5 text-base font-semibold transition-colors"
            style={{ borderColor: borderOnDark, color: cream, backgroundColor: "transparent" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(245,242,236,0.06)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Explore the database
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Example material strip ────────────────────────────────────────────────────
type Trust = "verified" | "database" | "ai";

const trustMeta: Record<Trust, { label: string; symbol: string }> = {
  verified: { label: "Verified EPD", symbol: "✓" },
  database: { label: "Database (EC3 / ATHENA)", symbol: "▦" },
  ai: { label: "AI estimate", symbol: "~" },
};

type Material = {
  name: string;
  category: string;
  value: number;
  ris: number;
  risTier: "Regenerative" | "Low-impact" | "Standard" | "High-impact";
  trust: Trust;
  source: string;
  distanceMi: number;
  transport: number;
};

// Values in kg CO₂e/sq ft (converted from kg CO₂e/m² ÷ 10.764)
const sampleMaterials: Material[] = [
  {
    name: "Cellulose Insulation",
    category: "Recycled content insulation",
    value: -1.3,
    ris: 85,
    risTier: "Regenerative",
    trust: "verified",
    source: "CIMA · EPD #3104",
    distanceMi: 40,
    transport: 0.1,
  },
  {
    name: "Douglas Fir Lumber",
    category: "Dimensional framing lumber",
    value: 1.1,
    ris: 72,
    risTier: "Low-impact",
    trust: "verified",
    source: "APA · EPD #2031",
    distanceMi: 85,
    transport: 0.2,
  },
  {
    name: "XPS Rigid Foam",
    category: "Extruded polystyrene insulation",
    value: 13.2,
    ris: 28,
    risTier: "High-impact",
    trust: "ai",
    source: "AI estimate · benchmarked",
    distanceMi: 310,
    transport: 0.6,
  },
];

const tierColor: Record<Material["risTier"], string> = {
  Regenerative: "#3f8c52",
  "Low-impact": "#4a7fa8",
  Standard: "#c17f24",
  "High-impact": "#a04a3c",
};

function ExampleStrip() {
  return (
    <section id="materials" style={{ backgroundColor: forest }}>
      <div
        className="mx-auto max-w-6xl px-6 py-20"
        style={{ borderTop: `1px solid ${borderOnDark}` }}
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ color: cream }}
            >
              The real lifecycle carbon impact behind every material you specify.
            </h2>
            <p className="mt-2 text-sm" style={{ color: "#cfcabf" }}>
              All values shown as kg CO₂e per sq ft of finished assembly.
            </p>
            <p className="mt-1 text-xs" style={{ color: "rgba(245,242,236,0.45)" }}>
              Imperial units · Northern Michigan region
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
            {sampleMaterials.map((m) => {
              const positive = m.value < 0;
              const t = trustMeta[m.trust];
              return (
                <article
                  key={m.name}
                  className="flex flex-col p-7"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider" style={{ color: "#9a9588" }}>
                      {m.category}
                    </span>
                    <span
                      title={m.source}
                      className="inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                      style={{ borderColor: borderOnDark, color: "#cfcabf" }}
                    >
                      <span aria-hidden>{t.symbol}</span>
                      {t.label}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold" style={{ color: cream }}>
                    {m.name}
                  </h3>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span
                      className="text-4xl font-semibold tracking-tight tabular-nums"
                      style={{ color: positive ? "#8fb98a" : cream }}
                    >
                      {positive ? "−" : ""}
                      {Math.abs(m.value).toFixed(1)}
                    </span>
                    <span className="text-sm" style={{ color: "#cfcabf" }}>
                      kg CO₂e / sq ft
                    </span>
                  </div>
                  <div
                    className="mt-5 flex items-center gap-2 text-sm"
                    style={{ color: "#cfcabf" }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: tierColor[m.risTier] }}
                      aria-hidden
                    />
                    <span className="font-medium" style={{ color: cream }}>
                      RIS {m.ris}
                    </span>
                    <span>·</span>
                    <span>{m.risTier}</span>
                  </div>
                  <div
                    className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-xs"
                    style={{ borderColor: borderOnDark, color: "#cfcabf" }}
                  >
                    <div>
                      <div className="uppercase tracking-wider" style={{ color: "#9a9588" }}>
                        Sourced
                      </div>
                      <div className="mt-1" style={{ color: cream }}>
                        {m.distanceMi} mi away
                      </div>
                    </div>
                    <div>
                      <div className="uppercase tracking-wider" style={{ color: "#9a9588" }}>
                        Transport
                      </div>
                      <div className="mt-1" style={{ color: cream }}>
                        +{m.transport} kg CO₂e/sq ft
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/materials"
            className="inline-block rounded-md border px-6 py-3 text-sm font-semibold transition-colors"
            style={{ borderColor: borderOnDark, color: cream, backgroundColor: "transparent" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(245,242,236,0.06)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Browse all 243 materials →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── What Block Plane does ─────────────────────────────────────────────────────
const features = [
  {
    title: "Calculate embodied carbon",
    body: "Plug in quantities and get accurate kg CO₂e totals across assemblies, broken down by material and life-cycle stage.",
    href: "/calculator",
  },
  {
    title: "Compare with scored metrics",
    body: "The Regenerative Impact Score (RIS) lets you weigh options side-by-side — not just carbon, but sourcing, durability, and reuse.",
    href: "/analysis",
  },
  {
    title: "Find regenerative options",
    body: "Surface bio-based and carbon-storing materials available within the Great Lakes region, with verified supplier and transport data.",
    href: "/materials",
  },
];

function What() {
  return (
    <section id="how" style={{ backgroundColor: cream }}>
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: amber }}
          >
            What Block Plane does
          </span>
          <h2
            className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ color: text }}
          >
            Three things, done well.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <Link key={f.title} href={f.href}>
              <div
                className="border p-8 transition-shadow hover:shadow-md cursor-pointer"
                style={{ backgroundColor: cream, borderColor: borderSoft }}
              >
                <span className="text-sm font-semibold" style={{ color: amber }}>
                  0{i + 1}
                </span>
                <h3 className="mt-4 text-xl font-semibold" style={{ color: text }}>
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: muted }}>
                  {f.body}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── RIS legend ────────────────────────────────────────────────────────────────
const risLegend: { tier: Material["risTier"]; range: string; note: string }[] = [
  { tier: "Regenerative", range: "75 – 100", note: "Actively sequesters carbon or restores ecosystems." },
  { tier: "Low-impact", range: "50 – 74", note: "Notably below regional baseline." },
  { tier: "Standard", range: "25 – 49", note: "Typical for the category." },
  { tier: "High-impact", range: "0 – 24", note: "Carbon-intensive — substitute if possible." },
];

function RDS() {
  return (
    <section style={{ backgroundColor: cream }}>
      <div
        className="mx-auto max-w-6xl px-6 py-24"
        style={{ borderTop: `1px solid ${borderSoft}` }}
      >
        <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: amber }}
            >
              Regenerative Impact Score
            </span>
            <h2
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ color: text }}
            >
              One score that captures the whole picture.
            </h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: muted }}>
              RIS combines embodied carbon, regional sourcing, durability, and end-of-life
              recovery into a single 0–100 score. Higher is better. Materials scoring 75+
              actively sequester carbon or restore ecosystems.
            </p>
            <Link
              href="/how-it-works"
              className="mt-5 inline-block text-sm font-medium"
              style={{ color: amber }}
            >
              How scores are calculated →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {risLegend.map((l) => (
              <div
                key={l.tier}
                className="flex items-start gap-3 border bg-white/40 p-4"
                style={{ borderColor: borderSoft }}
              >
                <span
                  className="mt-1.5 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: tierColor[l.tier] }}
                  aria-hidden
                />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold" style={{ color: text }}>
                      {l.tier}
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: muted }}>
                      {l.range}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: muted }}>
                    {l.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Confidence system ─────────────────────────────────────────────────────────
const confidenceLevels = [
  {
    level: "High",
    dot: "#3f8c52",
    body: "Verified Environmental Product Declaration (EPD) from the manufacturer.",
  },
  {
    level: "Medium",
    dot: "#c17f24",
    body: "Sourced from established databases — EC3 or ATHENA Impact Estimator.",
  },
  {
    level: "Low",
    dot: "#888888",
    body: "AI-researched estimate with industry benchmarks — confidence level shown on every material card.",
  },
];

function Confidence() {
  return (
    <section id="confidence" style={{ backgroundColor: creamAlt }}>
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: amber }}
            >
              Confidence system
            </span>
            <h2
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ color: text }}
            >
              Every number tells you how much to trust it.
            </h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: muted }}>
              Carbon data quality varies. Every entry is labeled and filterable — show only
              verified EPDs when you need to.
            </p>
            <Link
              href="/how-it-works"
              className="mt-5 inline-block text-sm font-medium"
              style={{ color: amber }}
            >
              Learn about our methodology →
            </Link>
          </div>
          <div className="space-y-3">
            {confidenceLevels.map((c) => (
              <div
                key={c.level}
                className="flex items-start gap-4 border bg-white/40 p-5"
                style={{ borderColor: borderSoft }}
              >
                <span
                  className="mt-1.5 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: c.dot }}
                  aria-hidden
                />
                <div>
                  <div className="text-base font-semibold" style={{ color: text }}>
                    {c.level}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: muted }}>
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Bottom CTA ────────────────────────────────────────────────────────────────
function BottomCTA() {
  const { user } = useAuth();

  return (
    <section style={{ backgroundColor: cream }}>
      <div
        className="mx-auto max-w-6xl px-6 py-24 text-center"
        style={{ borderTop: `1px solid ${borderSoft}` }}
      >
        <h2
          className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl"
          style={{ color: text }}
        >
          243 materials. Growing every day.
        </h2>
        <p
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed"
          style={{ color: muted }}
        >
          The database grows automatically every morning with new regional materials,
          supplier pricing, and transport data.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/materials"
            className="inline-block rounded-md px-7 py-3.5 text-base font-semibold text-white transition-colors"
            style={{ backgroundColor: amber }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = amberHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = amber)}
          >
            Browse the database
          </Link>
          {!user && (
            <Link
              href="/signup"
              className="inline-block rounded-md border px-7 py-3.5 text-base font-semibold transition-colors"
              style={{ borderColor: borderSoft, color: text }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "rgba(28,28,26,0.04)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Create free account
            </Link>
          )}
          {user && (
            <Link
              href="/projects"
              className="inline-block rounded-md border px-7 py-3.5 text-base font-semibold transition-colors"
              style={{ borderColor: borderSoft, color: text }}
            >
              Open projects →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function LandingFooter() {
  return (
    <footer style={{ backgroundColor: forest }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-sm" style={{ backgroundColor: amber }} aria-hidden />
          <span className="text-sm font-semibold" style={{ color: cream }}>
            Block Plane
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs" style={{ color: "#9a9588" }}>
          <Link href="/privacy" style={{ color: "#9a9588" }}>
            Privacy
          </Link>
          <Link href="/terms" style={{ color: "#9a9588" }}>
            Terms
          </Link>
          <Link href="/how-it-works" style={{ color: "#9a9588" }}>
            Methodology
          </Link>
          <span>© {new Date().getFullYear()} Block Plane · Northern Michigan</span>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main style={{ backgroundColor: cream, color: text }}>
      <Nav />
      <Hero />
      <ExampleStrip />
      <What />
      <RDS />
      <Confidence />
      <BottomCTA />
      <LandingFooter />
    </main>
  );
}
