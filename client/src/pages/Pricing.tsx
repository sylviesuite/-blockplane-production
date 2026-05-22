import { Link } from "wouter";
import { Check } from "lucide-react";
import { Header } from "@/components/Header";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import SEO from "@/components/SEO";

const forest = "#1a2e1f";
const cream = "#f5f2ec";
const amber = "#c17f24";
const amberHover = "#a86c1c";
const muted = "#5a5a56";
const borderSoft = "rgba(28,28,26,0.08)";
const borderOnDark = "rgba(245,242,236,0.12)";

const BETA_FEATURES = [
  "Full material database (260+ materials and growing)",
  "LIS, RIS, and CPI scoring on every material",
  "InsightBox AI Builder's Assistant",
  "Wall Systems analysis",
  "Frontier material badges",
  "Bulk CSV import",
  "EC3-verified EPD data (coming soon)",
  "Unlimited projects",
  "Priority feature requests",
  "Locked in free when paid tiers launch",
];

const COMING_SOON = [
  {
    name: "Solo",
    price: "$29",
    period: "/ month",
    sub: "For independent architects and builders",
    feature: "Everything in Beta, plus more at launch",
  },
  {
    name: "Pro",
    price: "$79",
    period: "/ month",
    sub: "For small firms and project teams",
    feature: "Everything in Solo, plus more at launch",
  },
  {
    name: "Firm",
    price: "$149",
    period: "/ month",
    sub: "For mid-size firms with multiple projects",
    feature: "Everything in Pro, plus more at launch",
  },
];

const FAQS = [
  {
    q: "Is the beta access really free forever?",
    a: "Yes. Anyone who signs up during beta gets lifetime access to BlockPlane at no cost. When paid tiers launch, beta users stay on free access permanently.",
  },
  {
    q: "When do paid tiers launch?",
    a: "No date is set. We are focused on building the right product first. Beta users will get advance notice before anything changes.",
  },
  {
    q: "What is BlockPlane exactly?",
    a: "BlockPlane is an embodied carbon and material intelligence platform for the construction industry. It pulls verified EPD data from EC3 (Building Transparency), scores every material on lifecycle impact (LIS), regenerative value (RIS), and carbon efficiency (CPI), and gives you an AI assistant — InsightBox — that answers material questions in plain language. Built for builders, architects, and contractors who need to make better material decisions faster.",
  },
];

export default function Pricing() {
  return (
    <>
      <SEO
        title="Pricing — BlockPlane"
        description="BlockPlane is free for beta testers. Full material database, LIS/RIS/CPI scoring, and InsightBox AI — at no cost, forever."
      />

      <Header />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: forest }}>
        <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28 text-center">
          <span
            className="inline-block rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider"
            style={{ borderColor: borderOnDark, color: "#d8d4c8" }}
          >
            Early access
          </span>
          <h1
            className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
            style={{ color: cream }}
          >
            Free for beta testers. Forever.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: "#cfcabf" }}>
            BlockPlane is in active development. The builders, architects, and contractors who show up now get lifetime access — no credit card, no expiration, no catch. When paid tiers launch, your access stays free.
          </p>
        </div>
      </section>

      {/* ── Pricing tiers ──────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: cream }}>
        <div className="mx-auto max-w-6xl px-6 py-20">

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:items-start">

            {/* Beta card — featured */}
            <div
              className="rounded-xl border-2 p-7 flex flex-col"
              style={{ borderColor: amber, backgroundColor: "#fff" }}
            >
              {/* Active badge */}
              <span
                className="self-start rounded-full px-3 py-1 text-xs font-semibold mb-5"
                style={{ backgroundColor: amber, color: "#fff" }}
              >
                Active now
              </span>

              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: amber }}>
                Beta Access
              </p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-5xl font-bold" style={{ color: forest }}>$0</span>
              </div>
              <p className="mt-1 text-sm" style={{ color: muted }}>free forever</p>

              <ul className="mt-7 space-y-3 flex-1">
                {BETA_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "#2e2e2c" }}>
                    <Check
                      className="mt-0.5 shrink-0 h-4 w-4"
                      style={{ color: amber }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/beta"
                className="mt-8 block rounded-md px-5 py-3 text-center text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: amber }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = amberHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = amber)}
              >
                Claim your beta access →
              </Link>

              <p className="mt-3 text-center text-xs" style={{ color: muted }}>
                Beta access closes when paid tiers launch. No date set — but it will close.
              </p>
            </div>

            {/* Coming soon tiers */}
            {COMING_SOON.map((tier) => (
              <div
                key={tier.name}
                className="rounded-xl border p-7 flex flex-col"
                style={{
                  borderColor: borderSoft,
                  backgroundColor: "#fff",
                  opacity: 0.55,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                <span
                  className="self-start rounded-full border px-3 py-1 text-xs font-medium mb-5"
                  style={{ borderColor: borderSoft, color: muted }}
                >
                  Coming soon
                </span>

                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: muted }}>
                  {tier.name}
                </p>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold" style={{ color: "#1c1c1a" }}>{tier.price}</span>
                  <span className="mb-1 text-sm" style={{ color: muted }}>{tier.period}</span>
                </div>
                <p className="mt-1 text-sm" style={{ color: muted }}>{tier.sub}</p>

                <ul className="mt-7 flex-1">
                  <li className="flex items-start gap-2.5 text-sm" style={{ color: muted }}>
                    <Check className="mt-0.5 shrink-0 h-4 w-4" style={{ color: "#c0bcb4" }} />
                    {tier.feature}
                  </li>
                </ul>

                <div
                  className="mt-8 block rounded-md px-5 py-3 text-center text-sm font-semibold"
                  style={{ backgroundColor: "#e8e4dc", color: "#a8a49c" }}
                >
                  Coming soon
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust statement ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#eae7e0" }}>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p
            className="text-xl italic leading-relaxed sm:text-2xl"
            style={{ color: forest }}
          >
            "We are building this with early users, not for them."
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: cream }}>
        <div className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: muted }}>
            Questions
          </p>

          <Accordion type="multiple" className="border rounded-xl overflow-hidden" style={{ borderColor: borderSoft }}>
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="px-6"
                style={{ borderColor: borderSoft }}
              >
                <AccordionTrigger
                  className="text-sm font-medium py-5 hover:no-underline"
                  style={{ color: "#1c1c1a" }}
                >
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="pb-5 text-sm leading-relaxed" style={{ color: muted }}>
                    {faq.a}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Footer nudge ───────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: forest }}>
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="text-sm mb-6" style={{ color: "rgba(245,242,236,0.55)" }}>
            Ready to start?
          </p>
          <Link
            href="/beta"
            className="inline-block rounded-md px-8 py-3.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: amber }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = amberHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = amber)}
          >
            Claim your beta access →
          </Link>
        </div>
      </section>
    </>
  );
}
