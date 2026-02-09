import { useState } from "react";
import { useRoute, Link } from "wouter";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InsightBox } from "@/insightbox/v2/InsightBox";
import type { InsightContext } from "@/insightbox/v2/types";
import { localMaterials } from "@/data/materials";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { RelatedGoldInsights } from "@/components/RelatedGoldInsights";
import type { LocalMaterial } from "@/data/materials";

type MaterialParams = { id: string };

function isEnvelopeRelatedMaterial(material: LocalMaterial): boolean {
  const c = material.category.toLowerCase();
  return (
    c.includes("insulation") ||
    c.includes("wall") ||
    c.includes("earthen") ||
    c.includes("construction")
  );
}

function useMaterialParams() {
  const [match, params] = useRoute<MaterialParams>("/materials/:id");
  return match ? params : null;
}

function buildInsightContextForMaterial(slug: string): InsightContext {
  switch (slug) {
    case "rammed-earth-hempcrete-wall":
      return {
        type: "comparison",
        primaryId: "rammed_earth_hempcrete_wall",
        secondaryId: "standard_2x6_wall",
        materialIds: ["rammed_earth", "hempcrete", "wood_framing_2x6"],
        tags: ["wall", "mass_wall"],
      };
    case "fiberglass-batt":
    case "dense-pack-cellulose":
      return {
        type: "comparison",
        primaryId: "fiberglass_batt_insulation",
        secondaryId: "dense_pack_cellulose",
        materialIds: ["fiberglass_batt_insulation", "dense_pack_cellulose"],
        tags: ["insulation"],
      };
    case "hempcrete-infill":
      return {
        type: "comparison",
        primaryId: "hempcrete_infill",
        secondaryId: "rammed_earth_hempcrete_wall",
        materialIds: ["hempcrete", "rammed_earth"],
        tags: ["wall", "bio-based", "infill"],
      };
    case "double-pane-vinyl-window":
    case "triple-pane-high-performance-window":
      return {
        type: "comparison",
        primaryId: "double_pane_vinyl_windows",
        secondaryId: "triple_pane_high_performance_windows",
        materialIds: [
          "double_pane_vinyl_windows",
          "triple_pane_high_performance_windows",
        ],
        tags: ["windows"],
      };
    default:
      return {
        type: "material",
        primaryId: slug,
        materialIds: [slug],
        tags: ["material"],
      };
  }
}

function getComparisonLabel(
  context: InsightContext,
  materialName: string,
): string | null {
  if (context.type !== "comparison") {
    return null;
  }

  const nameMap: Record<string, string> = {
    rammed_earth_hempcrete_wall: "Rammed Earth + Hempcrete Wall",
    standard_2x6_wall: "2×6 SPF Stud Wall (Baseline Assembly)",
    fiberglass_batt_insulation: "Fiberglass Batt Insulation",
    dense_pack_cellulose: "Dense-Pack Cellulose",
    double_pane_vinyl_windows: "Double-Pane Vinyl Window",
    triple_pane_high_performance_windows:
      "Triple-Pane High-Performance Window",
    hempcrete_infill: "Hempcrete Infill",
  };

  const primaryId = context.primaryId;
  const secondaryIdFromContext = context.secondaryId;

  const primaryName =
    (primaryId && nameMap[primaryId]) ||
    materialName;

  let secondaryId = secondaryIdFromContext;
  if (!secondaryId && Array.isArray(context.materialIds)) {
    secondaryId = context.materialIds.find((id) => id !== primaryId);
  }
  if (!secondaryId) {
    return null;
  }

  const secondaryName =
    nameMap[secondaryId] ||
    secondaryId
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return `${primaryName} → ${secondaryName}`;
}

export default function MaterialDetail() {
  const params = useMaterialParams();
  const materialKey = params?.id;

  const material =
    materialKey &&
    localMaterials.find((item) => {
      const normalizedKey = materialKey.toLowerCase();
      return (
        item.id === materialKey ||
        item.id.toLowerCase() === normalizedKey ||
        item.name.toLowerCase() === normalizedKey
      );
    });

  console.log("MaterialDetail param + material", materialKey, Boolean(material));

  if (!material) {
    return (
      <div className="p-8 text-center text-gray-600">
        Material not found.
      </div>
    );
  }

  const [showScoreDetails, setShowScoreDetails] = useState(false);

  const insightContext = buildInsightContextForMaterial(material.id);
  const comparisonLabel = getComparisonLabel(insightContext, material.name);

  const takeaways: string[] = [];

  const betterAlternatives =
    material
      ? localMaterials
          .filter(
            (candidate) =>
              candidate.id !== material.id &&
              (candidate.lis < material.lis ||
                candidate.ris > material.ris ||
                candidate.cpi < material.cpi),
          )
          .map((candidate) => {
            let reason = "Comparable performance";
            if (candidate.lis < material.lis) reason = "Lower lifecycle impact";
            else if (candidate.ris > material.ris)
              reason = "Higher regenerative score";
            else if (candidate.cpi < material.cpi)
              reason = "Better cost efficiency";

            return { id: candidate.id, name: candidate.name, reason };
          })
          .slice(0, 2)
      : [];

  const hasAlternatives = betterAlternatives.length > 0;

  const championNotes =
    material && hasAlternatives
      ? (() => {
          const notes: string[] = [];
          if (material.category.toLowerCase().includes("timber")) {
            notes.push(
              "Wide contractor familiarity and code acceptance for timber assemblies.",
            );
          } else if (material.category.toLowerCase().includes("earth")) {
            notes.push(
              "Regional earthen sourcing keeps lead times predictable.",
            );
          }
          if (material.ris > 70) {
            notes.push(
              "High RIS keeps regenerative goals on track even if alternatives exist.",
            );
          }
          if (material.lis < 35) {
            notes.push(
              "Gentler lifecycle impact supports tighter sustainability targets.",
            );
          }
          return notes.slice(0, 2);
        })()
      : [];

  if (material) {
    if (material.category.toLowerCase().includes("earth")) {
      takeaways.push(
        "Local earthen materials lock carbon and reduce transport emissions.",
      );
    }
    if (material.ris > 60) {
      takeaways.push(
        "Strong regenerative performance due to circular sourcing and recovery potential.",
      );
    }
    if (material.lis < 30) {
      takeaways.push(
        "Low lifecycle burden; processing intensity is modest for this assembly.",
      );
    }
    if (material.cpi > 45) {
      takeaways.push(
        "Cost-per-impact sits above Benchmark 2000, reflecting premium processing.",
      );
    }
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Material Not Found</CardTitle>
            <CardDescription>
              We couldn&apos;t locate that material in the local catalog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/materials">
              <Button>Back to catalog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

function buildInsightContextForMaterial(slug: string): InsightContext {
  switch (slug) {
    case "rammed-earth-hempcrete-wall":
      return {
        type: "comparison",
        primaryId: "rammed_earth_hempcrete_wall",
        secondaryId: "standard_2x6_wall",
        materialIds: ["rammed_earth", "hempcrete", "wood_framing_2x6"],
        tags: ["wall", "mass_wall"],
      };
    case "fiberglass-batt":
    case "dense-pack-cellulose":
      return {
        type: "comparison",
        primaryId: "fiberglass_batt_insulation",
        secondaryId: "dense_pack_cellulose",
        materialIds: ["fiberglass_batt_insulation", "dense_pack_cellulose"],
        tags: ["insulation"],
      };
    case "double-pane-vinyl-window":
    case "triple-pane-high-performance-window":
      return {
        type: "comparison",
        primaryId: "double_pane_vinyl_windows",
        secondaryId: "triple_pane_high_performance_windows",
        materialIds: [
          "double_pane_vinyl_windows",
          "triple_pane_high_performance_windows",
        ],
        tags: ["windows"],
      };
    default:
      return {
        type: "material",
        primaryId: slug,
        materialIds: [slug],
        tags: ["material"],
      };
  }
}

function getComparisonLabel(
  context: InsightContext,
  materialName: string,
): string | null {
  if (context.type !== "comparison" || !context.secondaryId) {
    return null;
  }

  const nameMap: Record<string, string> = {
    rammed_earth_hempcrete_wall: "Rammed Earth + Hempcrete Wall",
    standard_2x6_wall: "2×6 SPF Stud Wall (Baseline Assembly)",
    fiberglass_batt_insulation: "Fiberglass Batt Insulation",
    dense_pack_cellulose: "Dense-Pack Cellulose",
    double_pane_vinyl_windows: "Double-Pane Vinyl Window",
    triple_pane_high_performance_windows: "Triple-Pane High-Performance Window",
  };

  const primaryName = nameMap[context.primaryId] ?? materialName;
  const secondaryName = nameMap[context.secondaryId] ?? context.secondaryId;

  return `${primaryName} → ${secondaryName}`;
}

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="container mx-auto space-y-10 py-12">
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <Link href="/materials">
              <Button variant="ghost" className="px-3 py-1">
                Back to materials
              </Button>
            </Link>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Catalog
            </span>
          </div>
          <h1 className="text-4xl font-semibold text-slate-900">{material.name}</h1>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
            {material.category}
          </p>
          <p className="text-base leading-relaxed text-slate-700 max-w-3xl">
            {material.description}
          </p>
        </header>

        <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Score overview
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">LIS / RIS / CPI</h2>
            </div>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-700"
              onClick={() => setShowScoreDetails((prev) => !prev)}
            >
              {showScoreDetails ? "Hide details" : "Show details"}
            </button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              { label: "LIS", value: material.lis, color: "text-orange-600", helper: "Low lifecycle impact is better" },
              { label: "RIS", value: material.ris, color: "text-emerald-600", helper: "Higher regenerative score" },
              { label: "CPI", value: material.cpi, color: "text-blue-600", helper: "Lower cost-per-impact" },
            ].map((score) => (
              <Card key={score.label} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-1">
                    <CardTitle className="text-xs font-semibold text-slate-500">
                      {score.label}
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-slate-400">
                          <Info className="h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>{score.helper}</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-bold ${score.color}`}>{score.value}</p>
                  <p className="text-xs text-slate-500">
                    {score.label === "RIS" ? "Higher is better" : "Lower is better"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          {showScoreDetails && (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-xs text-slate-600">
              <p>LIS summarizes lifecycle impact over the material lifecycle.</p>
              <p className="mt-1">RIS highlights regenerative circularity signals.</p>
              <p className="mt-1">CPI reports cost efficiency per unit of impact.</p>
            </div>
          )}
          {takeaways.length > 0 && (
            <div className="mt-5 space-y-2 text-xs text-slate-600">
              <p className="font-semibold uppercase tracking-[0.3em] text-slate-500">Key Takeaways</p>
              <ul className="list-disc pl-4 space-y-1">
                {takeaways.slice(0, 3).map((takeaway, idx) => (
                  <li key={idx}>{takeaway}</li>
                ))}
              </ul>
            </div>
          )}
          {hasAlternatives && (
            <section id="better-alternatives" className="mt-6 space-y-2 text-sm text-slate-600">
              <h3 className="text-lg font-semibold text-slate-900">Better Alternatives</h3>
              {betterAlternatives.map((alt) => (
                <div key={alt.id} className="text-xs">
                  <Link
                    href={`/materials/${alt.id}`}
                    className="font-semibold text-slate-800 hover:underline"
                  >
                    {alt.name}
                  </Link>{" "}
                  — {alt.reason}
                </div>
              ))}
            </section>
          )}
          {hasAlternatives && championNotes.length > 0 && (
            <section className="mt-6 space-y-2 text-xs text-slate-600">
              <h3 className="text-lg font-semibold text-slate-900">
                Why You Might Still Choose This
              </h3>
              <ul className="list-disc pl-4 space-y-1">
                {championNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </section>
          )}
        </section>

        <div className="mx-auto w-full max-w-4xl border-t border-slate-200/60"></div>

        <section className="mx-auto w-full max-w-4xl">
          <div className="mt-8 space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Material insight & alternatives</h2>
            <p className="text-sm text-slate-500">
              Key takeaways, trade-offs, and better options when available.
            </p>
            {comparisonLabel && (
              <div className="mt-2 mb-4 text-xs font-medium text-slate-600 uppercase tracking-wide">
                Comparing: {comparisonLabel}
              </div>
            )}
            <div className="border-t border-slate-200/80"></div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 mt-6 shadow-lg shadow-slate-900/5">
            <InsightBox context={insightContext} />
          </div>
          {isEnvelopeRelatedMaterial(material) && (
            <div className="mt-6">
              <RelatedGoldInsights
                contextId="airtight_envelope"
                heading="Why this matters — high-performance envelope"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
