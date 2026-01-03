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
import InsightBoxV2 from "@/components/insights/InsightBoxV2";
import { localMaterials } from "@/data/materials";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type MaterialParams = { id: string };

function useMaterialParams() {
  const [match, params] = useRoute<MaterialParams>("/materials/:id");
  return match ? params : null;
}

export default function MaterialDetail() {
  const params = useMaterialParams();
  const materialId = params?.id;

  const material = localMaterials.find((item) => item.id === materialId);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

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

  if (!materialId || !material) {
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

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="container py-12">
        <header className="mb-10 space-y-4">
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

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold text-slate-900">
              {material.name}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
              {material.category}
            </p>
            <p className="text-base text-slate-700 max-w-3xl">
              {material.description}
            </p>

            {hasAlternatives && (
              <a
                href="#better-alternatives"
                className="inline-block text-sm text-emerald-700 hover:underline"
              >
                Compare →
              </a>
            )}
          </div>
        </header>

        <section className="mb-10 rounded-3xl border border-slate-200 bg-white/70 p-6">
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>LIS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">
                  {material.lis}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>RIS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-600">
                  {material.ris}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CPI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {material.cpi}
                </p>
              </CardContent>
            </Card>
          </div>

          {hasAlternatives && (
            <section
              id="better-alternatives"
              className="mt-6 space-y-3 scroll-mt-24"
            >
              <h2 className="text-lg font-semibold">Better Alternatives</h2>
              {betterAlternatives.map((alt) => (
                <div key={alt.id}>
                  <Link href={`/materials/${alt.id}`}>{alt.name}</Link> —{" "}
                  {alt.reason}
                </div>
              ))}
            </section>
          )}

          {hasAlternatives && championNotes.length > 0 && (
            <section className="mt-6 space-y-2">
              <h2 className="text-lg font-semibold">
                Why You Might Still Choose This
              </h2>
              <ul className="list-disc pl-4">
                {championNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </section>
          )}
        </section>

        <InsightBoxV2
          materialId={material.id}
          materialName={material.name}
          lis={material.lis}
          ris={material.ris}
          cpi={material.cpi}
          staticInsight={`LIS ${material.lis} • RIS ${material.ris} • CPI ${material.cpi}`}
        />
      </div>
    </div>
  );
}
