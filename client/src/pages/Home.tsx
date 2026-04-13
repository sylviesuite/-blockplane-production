import { Link } from "wouter";
import MinimalFooter from "@/components/MinimalFooter";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Layers, GitCompare } from "lucide-react";

const MVP_CARDS = [
  {
    href: "/materials",
    title: "Material Database",
    body: "Browse a vetted catalog of building materials with transparent embodied carbon, LIS/RIS scores, and cost-per-impact.",
    cta: "Browse materials →",
    icon: Database,
    accent: "from-[#09FBD3] to-[#07C9B3]",
    borderHover: "hover:border-[#09FBD3]/50",
  },
  {
    href: "/lifecycle",
    title: "Lifecycle Breakdown",
    body: "See where the impact actually happens—from point of origin through transport, construction, use, and end-of-life—for each material.",
    cta: "View lifecycle chart →",
    icon: Layers,
    accent: "from-[#FF8E4A] to-[#FF6B35]",
    borderHover: "hover:border-[#FF8E4A]/50",
  },
  {
    href: "/analysis",
    title: "Compare & Visualize Materials",
    body: "Put materials side-by-side in LIS/RIS quadrants, compare CPI, and explore trade-offs with interactive charts.",
    cta: "Open comparison tools →",
    icon: GitCompare,
    accent: "from-[#09FBD3] to-[#FF8E4A]",
    borderHover: "hover:border-[#09FBD3]/50",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero — compact so hero + cards fit above the fold on desktop */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden py-10 md:py-12">
        <FloatingParticles />
        <div className="relative z-10 container text-center px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Choose Your Path to Clarity
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            BlockPlane helps builders, architects, and sustainability teams compare materials by carbon, cost, and long-term resilience—without becoming a data scientist. Start with a single material, then zoom out to lifecycle phases and cross-material comparisons.
          </p>
        </div>
      </section>

      {/* Primary cards */}
      <section className="relative py-8 md:py-10 bg-slate-900/50">
        <div className="container px-4 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {MVP_CARDS.map((card) => {
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

      {/* AI Builder's Assistant entry — slim banner below cards */}
      <section className="border-t border-slate-700/50 bg-slate-800/40">
        <div className="container px-4 max-w-5xl mx-auto py-4 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Need a second opinion?</h3>
              <p className="text-sm text-gray-400 mt-0.5">
                Ask the AI Builder&apos;s Assistant to walk you through LIS, RIS, CPI, and better material choices.
              </p>
            </div>
            <Link href="/assistant">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-700/50 shrink-0">
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
