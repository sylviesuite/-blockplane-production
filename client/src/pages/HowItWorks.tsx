import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";

interface Section {
  id: string;
  label: string;
  title: string;
  content: React.ReactNode;
}

const LIFECYCLE_STAGES = [
  {
    stage: "A1–A3",
    label: "Manufacturing",
    description:
      "Raw material extraction, processing, and factory production. This is typically the largest share of a material's embodied carbon.",
  },
  {
    stage: "A4",
    label: "Transport to site",
    description:
      "Shipping from manufacturer or regional supplier to the Northern Michigan job site. Varies by material weight and distance.",
  },
  {
    stage: "A5",
    label: "Installation",
    description:
      "On-site construction activity, equipment use, and waste disposal during installation.",
  },
];

const CONFIDENCE_LEVELS = [
  {
    level: "High",
    variant: "default" as const,
    meaning:
      "Data comes from a published Environmental Product Declaration (EPD) by the manufacturer, verified to ISO 14040/14044 standards.",
  },
  {
    level: "Medium",
    variant: "secondary" as const,
    meaning:
      "Data sourced from an industry average in the ICE Database v3.0, EC3, or ATHENA — peer-reviewed but not product-specific.",
  },
  {
    level: "Low",
    variant: "outline" as const,
    meaning:
      "Data estimated by AI research agent from web sources, manufacturer literature, and published studies. Use with caution for detailed analysis.",
  },
];

const REGENERATIVE_YES = [
  "Hemp fiber insulation and hempcrete (sequesters CO₂ during growth; hempcrete continues absorbing CO₂ via carbonation over its lifetime)",
  "Mycelium insulation panels (grown on agricultural waste, fully biodegradable)",
  "Green roof systems (actively creates habitat, manages stormwater, restores urban ecology)",
  "Cork flooring (bark harvested without felling trees; cork oak forests are critical biodiversity hotspots)",
  "Rammed earth and compressed earth blocks (natural local soil, minimal processing, carbon-stable mass wall assembly)",
  "Sustainably harvested timber, CLT, and mass timber (carbon locked in wood for the life of the structure)",
  "Reclaimed wood (no new harvest; embodied carbon already sequestered)",
];

const REGENERATIVE_NO = [
  "Concrete variants (ready-mix, ICF, precast, CMU) — low-impact but does not restore",
  "Insulation (fiberglass, mineral wool, spray foam, cellulose) — reduces heat loss, does not regenerate",
  "Mechanical systems (heat pumps, HRVs) — energy efficient, not ecologically restorative",
  "Low-VOC coatings and adhesives — health benefit, not ecological restoration",
  "Recycled-content plastics or synthetics — reduces waste, does not improve environmental systems",
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-16">
        <div className="mx-auto w-full max-w-2xl space-y-16">

          {/* Hero */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">How Block Plane Works</h1>
            <p className="text-muted-foreground leading-relaxed">
              Block Plane helps architects and designers understand the environmental impact of
              building materials during early-stage design. Here's exactly where the data comes
              from, how scores are calculated, and where the limitations are.
            </p>
          </div>

          {/* Data Sources */}
          <section className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Where the data comes from</h2>
              <p className="text-sm text-muted-foreground">
                Block Plane draws from three tiers of data, each with a different confidence level.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border p-5 space-y-2">
                <div className="flex items-center gap-3">
                  <Badge>High confidence</Badge>
                  <span className="text-sm font-medium">Published EPDs</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Environmental Product Declarations filed by manufacturers and verified to ISO
                  14040/14044. These are the gold standard for embodied carbon data — product-specific,
                  third-party reviewed, and declared publicly.
                </p>
              </div>

              <div className="rounded-lg border p-5 space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Medium confidence</Badge>
                  <span className="text-sm font-medium">Industry databases</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The ICE Database v3.0 (Inventory of Carbon and Energy, University of Bath), EC3
                  (Embodied Carbon in Construction Calculator), and ATHENA Impact Estimator provide
                  peer-reviewed averages for common material categories. These are not
                  manufacturer-specific but are widely used in professional LCA practice.
                </p>
              </div>

              <div className="rounded-lg border p-5 space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Low confidence</Badge>
                  <span className="text-sm font-medium">AI-researched estimates</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For regional materials without published EPDs, Block Plane's research agent searches
                  the web for manufacturer data, technical specifications, and academic publications,
                  then synthesizes a best-effort estimate. These values carry a Low confidence flag and
                  should not be used as the basis for formal reporting or certification.
                </p>
              </div>

              <div className="rounded-lg border p-5 space-y-2">
                <span className="text-sm font-medium">Regional supplier data</span>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pricing and transport distances are sourced from Northern Michigan suppliers and
                  distributors. Transport carbon (A4) is calculated from estimated distance and
                  transport mode (truck, rail, or local delivery).
                </p>
              </div>
            </div>
          </section>

          {/* Embodied Carbon */}
          <section className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">How embodied carbon is calculated</h2>
              <p className="text-sm text-muted-foreground">
                Embodied carbon is reported as kg CO₂e per functional unit (sq ft, linear ft, cubic
                yard, or each), cradle to gate. That means it covers everything from raw material
                extraction through installation — but not the building's operational energy use.
              </p>
            </div>

            <div className="space-y-3">
              {LIFECYCLE_STAGES.map((s) => (
                <div key={s.stage} className="flex gap-4 rounded-lg border p-4">
                  <div className="shrink-0 w-14 text-center">
                    <span className="text-xs font-mono font-semibold text-muted-foreground">{s.stage}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              The <span className="text-foreground font-medium">Total Carbon</span> figure shown on
              each material card is A1–A3 + A4 + A5. End-of-life stages (C1–C4) are stored
              separately and used in full lifecycle analysis but are not included in the primary
              display value.
            </p>
          </section>

          {/* LIS */}
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">LIS — Lifecycle Impact Score</h2>
              <p className="text-sm text-muted-foreground">
                A 0–100 score representing a material's overall lifecycle performance. Higher is better.
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              LIS is a weighted composite that accounts for embodied carbon, material durability and
              service life, recyclability and end-of-life pathways, operational energy contribution
              (where applicable), and toxicity or indoor air quality impact. It is not a single-metric
              carbon score — a material with moderate embodied carbon but very long service life and
              full recyclability can score higher than a lower-carbon material with a short lifespan
              and difficult disposal.
            </p>
            <div className="rounded-lg border p-4 text-sm text-muted-foreground space-y-1">
              <p><span className="text-foreground font-medium">0–39</span> — Poor lifecycle performance. High impact, difficult end-of-life, or short service life.</p>
              <p><span className="text-foreground font-medium">40–69</span> — Average. Typical conventional building materials.</p>
              <p><span className="text-foreground font-medium">70–84</span> — Good. Durable, lower-carbon, or recyclable.</p>
              <p><span className="text-foreground font-medium">85–100</span> — Excellent. Best-in-class across lifecycle dimensions.</p>
            </div>
          </section>

          {/* RIS */}
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">RIS — Regenerative Impact Score</h2>
              <p className="text-sm text-muted-foreground">
                A 0–100 score measuring whether a material actively restores or improves environmental
                systems — not just reduces harm. Materials with RIS above 70 are flagged as Regenerative.
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Regenerative is a higher bar than sustainable. A material qualifies when it actively
              sequesters carbon, restores ecosystems, or improves environmental conditions as a
              direct result of its production or use — not simply because it has a lower carbon
              footprint than the alternative.
            </p>

            <div className="space-y-3">
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-medium">Qualifies as Regenerative</p>
                <ul className="space-y-2">
                  {REGENERATIVE_YES.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                      <span className="shrink-0 text-foreground">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-medium">Does not qualify</p>
                <ul className="space-y-2">
                  {REGENERATIVE_NO.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                      <span className="shrink-0 text-foreground">–</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Confidence Levels */}
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Confidence levels</h2>
              <p className="text-sm text-muted-foreground">
                Every material in Block Plane carries a confidence level that tells you how reliable
                its carbon data is.
              </p>
            </div>
            <div className="space-y-3">
              {CONFIDENCE_LEVELS.map(({ level, variant, meaning }) => (
                <div key={level} className="flex gap-4 rounded-lg border p-4">
                  <div className="shrink-0 pt-0.5">
                    <Badge variant={variant}>{level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{meaning}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Limitations */}
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Limitations</h2>
              <p className="text-sm text-muted-foreground">
                Block Plane is a design decision tool, not a certified LCA software. Here's what
                that means in practice.
              </p>
            </div>
            <div className="rounded-lg border p-5 space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <span className="text-foreground font-medium">Some data is estimated, not EPD-verified.</span>{" "}
                Many materials in the database carry Low or Medium confidence ratings. Carbon values
                for the same product can vary significantly between manufacturers, production batches,
                and regions.
              </p>
              <p>
                <span className="text-foreground font-medium">LIS and RIS scores are model outputs, not standards.</span>{" "}
                These scores reflect Block Plane's weighting methodology. They are useful for
                relative comparison between materials — not as absolute environmental ratings.
              </p>
              <p>
                <span className="text-foreground font-medium">Not a substitute for a formal LCA.</span>{" "}
                If you're pursuing LEED, BREEAM, Passive House, or similar certification — or
                submitting embodied carbon for a permit — commission a project-specific lifecycle
                assessment from a certified practitioner using EPD-verified data.
              </p>
              <p>
                <span className="text-foreground font-medium">Regional focus.</span>{" "}
                Block Plane's database is optimized for Northern Michigan residential construction.
                Transport distances, supplier availability, and regional material options may not
                reflect conditions in other geographies.
              </p>
            </div>
          </section>

          {/* Footer nav */}
          <div className="pt-4 border-t flex gap-3">
            <Link href="/materials">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Browse materials →
              </span>
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/calculator">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Carbon calculator →
              </span>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
