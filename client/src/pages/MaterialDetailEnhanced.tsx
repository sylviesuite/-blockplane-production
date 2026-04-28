import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
  Leaf,
  TrendingDown,
  DollarSign,
  Clock,
  Lightbulb,
} from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { InsightBoxV2 } from "@/components/insights/InsightBoxV2";
import AuthGate from "@/components/AuthGate";

type ConfidenceLevel = "High" | "Medium" | "Low" | "None";

// ── Fix 1: human-readable source labels ──────────────────────────────────────
function formatSourceLabel(raw: string): string {
  return raw
    .split(/[_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ── Fix 3: material-specific methodology paragraph ───────────────────────────
function buildMethodologyText(
  category: string,
  ris: number,
  lis: number,
  confidence: ConfidenceLevel,
): string {
  let risDesc: string;
  if (ris >= 80) risDesc = "exceptionally durable and resilient";
  else if (ris >= 60) risDesc = "reliably durable under normal conditions";
  else if (ris >= 40) risDesc = "average durability — compare alternatives";
  else risDesc = "below-average durability — verify maintenance requirements";

  let lisDesc: string;
  if (lis <= 30) lisDesc = "a low lifecycle burden — among the cleaner options in its class";
  else if (lis <= 55) lisDesc = "moderate lifecycle impact, typical for its category";
  else lisDesc = "higher lifecycle impact — consider lower-LIS alternatives where available";

  let confidenceNote: string;
  if (confidence === "High")
    confidenceNote =
      "Data is from verified sources and can be used directly in professional specifications.";
  else if (confidence === "Medium")
    confidenceNote =
      "Data is from industry databases with reasonable assumptions — cross-check with manufacturer EPDs for regulatory submissions.";
  else if (confidence === "Low")
    confidenceNote =
      "Data is estimated. Professional verification with supplier EPDs is recommended before specifying.";
  else
    confidenceNote =
      "Data is preliminary. Do not use for professional specifications without independent verification.";

  return (
    `This ${category} entry scores RIS ${ris} (${risDesc}) and LIS ${lis} (${lisDesc}). ` +
    confidenceNote
  );
}

// ── Fix 5: plain-language "Why this matters" for builders ─────────────────────
function buildInsightText(
  category: string,
  ris: number,
  lis: number,
  carbon: number,
): string {
  let risSentence: string;
  if (ris >= 80)
    risSentence = `With a RIS of ${ris}, this material is built to last — expect low maintenance callbacks and strong moisture resistance in the field.`;
  else if (ris >= 60)
    risSentence = `A RIS of ${ris} means reliable performance under typical site conditions with standard maintenance.`;
  else
    risSentence = `A RIS of ${ris} is below average — factor in higher maintenance intervals and confirm moisture performance for your climate.`;

  let lisSentence: string;
  if (lis <= 30)
    lisSentence = `At LIS ${lis} and ${carbon.toFixed(1)} kg CO₂e, it sits among the lower-impact ${category} options available.`;
  else if (lis <= 55)
    lisSentence = `Its LIS of ${lis} (${carbon.toFixed(1)} kg CO₂e) reflects moderate lifecycle impact, typical for the ${category} category.`;
  else
    lisSentence = `The LIS of ${lis} (${carbon.toFixed(1)} kg CO₂e) is on the higher end — check alternatives if embodied carbon is a project constraint.`;

  let advice: string;
  if (ris >= 70 && lis <= 40)
    advice = "A strong all-round choice when durability and sustainability both matter.";
  else if (ris >= 70)
    advice = "Strong durability credentials; weigh the carbon cost against your project targets.";
  else if (lis <= 40)
    advice = "Good environmental profile — pair with a robust system detail to compensate for lower resilience.";
  else
    advice = "Consider higher-scoring alternatives unless project constraints require this specific material.";

  return `${risSentence} ${lisSentence} ${advice}`;
}

export default function MaterialDetailEnhanced() {
  const [, params] = useRoute("/materials/:id");
  const materialId = params?.id ?? null;

  const { data: material, isLoading } = trpc.materialAPI.getById.useQuery(
    { id: materialId! },
    { enabled: !!materialId },
  );

  // Fix 2: cap at 3, server already filters genuine improvements
  const { data: recommendations } = trpc.materialAPI.getRecommendations.useQuery(
    { materialId: materialId!, maxResults: 3 },
    { enabled: !!materialId },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="text-lg font-semibold mb-3">Material not found</p>
          <Link href="/materials">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const confidenceLevel = material.confidenceLevel as ConfidenceLevel;
  const carbon = parseFloat(material.totalCarbon);
  const cost = parseFloat(material.costPerUnit);

  const confidenceBadgeClass: Record<ConfidenceLevel, string> = {
    High: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
    Medium: "bg-blue-900/60 text-blue-300 border-blue-700",
    Low: "bg-amber-900/60 text-amber-300 border-amber-700",
    None: "bg-red-900/60 text-red-300 border-red-700",
  };

  const ConfidenceIcon = () => {
    if (confidenceLevel === "High") return <CheckCircle className="w-3 h-3" />;
    if (confidenceLevel === "Medium") return <Info className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  const lifecycleHasData = Object.values(material.lifecycleBreakdown).some(
    (v) => parseFloat(v) > 0,
  );

  // Fix 5: builder insight text
  const insightText = buildInsightText(
    material.category,
    material.risScore,
    material.lisScore,
    carbon,
  );

  // Fix 3: material-specific methodology text
  const methodologyText = buildMethodologyText(
    material.category,
    material.risScore,
    material.lisScore,
    confidenceLevel,
  );

  // Fix 1: source label
  const sourceLabel = (material as any).source
    ? formatSourceLabel((material as any).source)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      {/* ── Compact hero strip ── */}
      <div className="border-b border-slate-800 bg-slate-900/80">
        <div className="container py-3">

          {/* Back + breadcrumb */}
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
            <Link href="/materials">
              <button className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Materials
              </button>
            </Link>
            <span>/</span>
            <span className="text-slate-400 truncate max-w-xs">{material.name}</span>
          </div>

          {/* Name + badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white leading-tight">{material.name}</h1>
            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
              {material.category}
            </Badge>
            {material.isRegenerative === 1 && (
              <Badge className="text-xs bg-emerald-800/60 text-emerald-300 border border-emerald-700">
                <Leaf className="w-3 h-3 mr-1" /> Regenerative
              </Badge>
            )}
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${confidenceBadgeClass[confidenceLevel]}`}
            >
              <ConfidenceIcon />
              {confidenceLevel} confidence
            </span>
            {(confidenceLevel === "Low" || confidenceLevel === "None") && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                <AlertCircle className="w-3 h-3" /> Verify before use
              </span>
            )}
          </div>

          {/* Description */}
          {material.description && (
            <p className="text-sm text-slate-400 line-clamp-2 max-w-3xl mb-3">
              {material.description}
            </p>
          )}

          {/* Key metrics strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="bg-slate-800/60 rounded-lg px-3 py-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 leading-none">Carbon</p>
                <p className="text-base font-bold text-emerald-400 leading-tight">
                  {carbon.toFixed(1)}
                  <span className="text-xs font-normal text-slate-400 ml-1">kg CO₂e</span>
                </p>
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-lg px-3 py-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 leading-none">Cost</p>
                <p className="text-base font-bold text-blue-400 leading-tight">
                  ${cost.toFixed(2)}
                  <span className="text-xs font-normal text-slate-400 ml-1">/{material.functionalUnit}</span>
                </p>
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500 leading-none mb-0.5">RIS</p>
              <p className="text-base font-bold text-purple-400 leading-tight">
                {material.risScore}
                <span className="text-xs font-normal text-slate-400 ml-1">/ 100</span>
              </p>
              <p className="text-[10px] text-slate-500">Higher is better</p>
            </div>
            <div className="bg-slate-800/60 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500 leading-none mb-0.5">LIS</p>
              <p className="text-base font-bold text-orange-400 leading-tight">
                {material.lisScore}
                <span className="text-xs font-normal text-slate-400 ml-1">/ 100</span>
              </p>
              <p className="text-[10px] text-slate-500">Lower is better</p>
            </div>
          </div>

          {/* InsightBox — AI-powered "Why this matters" (auth-gated) */}
          <AuthGate message="Sign in to unlock AI-powered insights for this material.">
            <InsightBoxV2
              materialId={material.id}
              materialName={material.name}
              lis={material.lisScore}
              ris={material.risScore}
              cpi={parseFloat(material.costPerUnit)}
            />
          </AuthGate>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="container py-2">
        <Tabs defaultValue="lifecycle">
          {/* Fix 4: tighter tab bar */}
          <TabsList className="bg-slate-900 border border-slate-800 mb-2 h-8">
            <TabsTrigger value="lifecycle" className="text-xs h-7">Lifecycle</TabsTrigger>
            <TabsTrigger value="epd" className="text-xs h-7">EPD Sources</TabsTrigger>
            <TabsTrigger value="quality" className="text-xs h-7">Data Quality</TabsTrigger>
            <TabsTrigger value="alternatives" className="text-xs h-7">Alternatives</TabsTrigger>
          </TabsList>

          {/* ── Lifecycle tab ── */}
          <TabsContent value="lifecycle" className="mt-0">
            <Card className="bg-slate-900 border-slate-800 text-white">
              {/* Fix 4: tighter card header */}
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm font-semibold text-slate-300">
                  Lifecycle Carbon Breakdown
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  EN 15804 · A1–A3 production · A4 transport · A5 construction · B use · C1–C4 end-of-life
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-1">
                {lifecycleHasData ? (
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: "A1–A3", sub: "Production",   value: material.lifecycleBreakdown.a1a3, color: "text-emerald-400" },
                      { label: "A4",    sub: "Transport",     value: material.lifecycleBreakdown.a4,   color: "text-blue-400"   },
                      { label: "A5",    sub: "Construction",  value: material.lifecycleBreakdown.a5,   color: "text-purple-400" },
                      { label: "B",     sub: "Use",           value: material.lifecycleBreakdown.b,    color: "text-amber-400"  },
                      { label: "C1–C4", sub: "End-of-life",  value: material.lifecycleBreakdown.c1c4, color: "text-red-400"    },
                    ].map((phase) => (
                      <div key={phase.label} className="bg-slate-800/60 rounded-lg p-2 text-center">
                        <p className={`text-base font-bold ${phase.color}`}>
                          {parseFloat(phase.value).toFixed(1)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">{phase.label}</p>
                        <p className="text-[10px] text-slate-500">{phase.sub}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 gap-1.5">
                    <Clock className="w-7 h-7 text-slate-700" />
                    <p className="text-sm font-medium text-slate-400">Lifecycle phase data coming soon</p>
                    <p className="text-xs text-slate-600 text-center max-w-sm">
                      Total cradle-to-gate is {carbon.toFixed(1)} kg CO₂e — per-phase breakdown
                      will be added as data coverage expands.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── EPD Sources tab ── */}
          <TabsContent value="epd" className="mt-0">
            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm font-semibold text-slate-300">EPD Sources</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Transparent data attribution
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-1 space-y-2">
                {material.manufacturer && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Manufacturer</span>
                    <span className="text-slate-300 font-medium">{material.manufacturer}</span>
                  </div>
                )}
                {/* Fix 1: formatted source label */}
                {sourceLabel && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Source</span>
                    <span className="text-slate-300 font-medium">{sourceLabel}</span>
                  </div>
                )}
                {(material as any).sourceUrl && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Reference</span>
                    <a
                      href={(material as any).sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      View source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {material.epdMetadata && material.epdMetadata.length > 0
                  ? material.epdMetadata.map((epd: any, idx: number) => (
                      <div key={idx} className="border border-slate-700 rounded-lg p-2.5 text-sm space-y-0.5">
                        <p className="font-medium text-slate-200">{epd.source}</p>
                        {epd.manufacturer && (
                          <p className="text-slate-500 text-xs">Mfr: {epd.manufacturer}</p>
                        )}
                      </div>
                    ))
                  : !material.manufacturer && !sourceLabel && (
                      <p className="text-sm text-slate-600 py-3 text-center">
                        No EPD sources documented yet
                      </p>
                    )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Data Quality tab ── */}
          <TabsContent value="quality" className="mt-0">
            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm font-semibold text-slate-300">Data Quality</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Confidence</span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${confidenceBadgeClass[confidenceLevel]}`}
                  >
                    <ConfidenceIcon />
                    {confidenceLevel}
                  </span>
                </div>
                {material.dataQualityScore != null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Quality score</span>
                    <span className="text-slate-300 font-medium">{material.dataQualityScore} / 100</span>
                  </div>
                )}
                {(material as any).lastVerified && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Last verified</span>
                    <span className="text-slate-300">
                      {new Date((material as any).lastVerified).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {/* Fix 3: material-specific methodology */}
                <div className="border-t border-slate-800 pt-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">About this entry</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{methodologyText}</p>
                  <p className="text-xs text-slate-600 mt-1.5">
                    Carbon follows EN 15804. Costs are regional averages and may vary by supplier.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Alternatives tab ── */}
          <TabsContent value="alternatives" className="mt-0">
            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm font-semibold text-slate-300">
                  Recommended Alternatives
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Same category · genuine improvements in carbon or resilience only
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-1 space-y-2">
                {/* Fix 2: only genuine improvements, show RIS + LIS delta */}
                {recommendations && recommendations.length > 0 ? (
                  recommendations.map((rec: any) => (
                    <Link key={rec.material.id} href={`/materials/${rec.material.id}`}>
                      <div className="border border-slate-700 rounded-lg p-2.5 hover:border-slate-500 hover:bg-slate-800/40 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="text-sm font-medium text-slate-200 leading-tight">
                            {rec.material.name}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-slate-600 text-slate-400 shrink-0 ml-2"
                          >
                            {rec.material.category}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          {rec.carbonSavings > 0 && (
                            <span className="text-emerald-400">
                              −{rec.carbonSavings.toFixed(1)} kg CO₂e carbon
                            </span>
                          )}
                          {rec.risDelta > 0 && (
                            <span className="text-purple-400">+{rec.risDelta} RIS</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-600 py-3 text-center">
                    No better alternatives found in this category yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
