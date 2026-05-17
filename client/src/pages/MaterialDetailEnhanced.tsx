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
} from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { InsightBoxV2 } from "@/components/insights/InsightBoxV2";
import AuthGate from "@/components/AuthGate";
import { ScoreConfidenceBadge } from "@/components/ScoreConfidenceBadge";

const forest = "#1a2e1f";
const amber  = "#c17f24";

type ConfidenceLevel = "High" | "Medium" | "Low" | "None";

function formatSourceLabel(raw: string): string {
  return raw
    .split(/[_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function buildMethodologyText(
  category: string,
  ris: number | null,
  lis: number,
  confidence: ConfidenceLevel,
): string {
  let risDesc: string;
  if (ris === null) risDesc = "score pending review";
  else if (ris >= 80) risDesc = "exceptionally durable and resilient";
  else if (ris >= 60) risDesc = "reliably durable under normal conditions";
  else if (ris >= 40) risDesc = "average durability — compare alternatives";
  else risDesc = "below-average durability — verify maintenance requirements";

  let lisDesc: string;
  if (lis <= 30) lisDesc = "a low lifecycle burden — among the cleaner options in its class";
  else if (lis <= 55) lisDesc = "moderate lifecycle impact, typical for its category";
  else lisDesc = "higher lifecycle impact — consider lower-LIS alternatives where available";

  let confidenceNote: string;
  if (confidence === "High")
    confidenceNote = "Data is from verified sources and can be used directly in professional specifications.";
  else if (confidence === "Medium")
    confidenceNote = "Data is from industry databases with reasonable assumptions — cross-check with manufacturer EPDs for regulatory submissions.";
  else if (confidence === "Low")
    confidenceNote = "Data is estimated. Professional verification with supplier EPDs is recommended before specifying.";
  else
    confidenceNote = "Data is preliminary. Do not use for professional specifications without independent verification.";

  const risDisplay = ris !== null ? `RIS ${ris} (${risDesc})` : `RIS score pending review`;
  return `This ${category} entry has ${risDisplay} and LIS ${lis} (${lisDesc}). ${confidenceNote}`;
}

function buildInsightText(
  category: string,
  ris: number | null,
  lis: number,
  carbon: number,
): string {
  let risSentence: string;
  if (ris === null)
    risSentence = `The Regenerative Impact Score for this material is pending review — check back after the next data update.`;
  else if (ris >= 80)
    risSentence = `With a RIS of ${ris}, this material is built to last — expect low maintenance callbacks and strong moisture resistance in the field.`;
  else if (ris >= 60)
    risSentence = `A RIS of ${ris} means reliable performance under typical site conditions with standard maintenance.`;
  else
    risSentence = `A RIS of ${ris} is below average — factor in higher maintenance intervals and confirm moisture performance for your climate.`;

  let lisSentence: string;
  const cSqFt = (carbon / 10.764).toFixed(2);
  if (lis <= 30)
    lisSentence = `At LIS ${lis} and ${cSqFt} kg CO₂e/sq ft, it sits among the lower-impact ${category} options available.`;
  else if (lis <= 55)
    lisSentence = `Its LIS of ${lis} (${cSqFt} kg CO₂e/sq ft) reflects moderate lifecycle impact, typical for the ${category} category.`;
  else
    lisSentence = `The LIS of ${lis} (${cSqFt} kg CO₂e/sq ft) is on the higher end — check alternatives if embodied carbon is a project constraint.`;

  let advice: string;
  if ((ris ?? 0) >= 70 && lis <= 40)
    advice = "A strong all-round choice when durability and sustainability both matter.";
  else if ((ris ?? 0) >= 70)
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

  const { data: recommendations } = trpc.materialAPI.getRecommendations.useQuery(
    { materialId: materialId!, maxResults: 3 },
    { enabled: !!materialId },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3f8c52]" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">
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
  const carbonSqFt = carbon / 10.764;
  const cost = parseFloat(material.costPerUnit);

  const confidenceBadgeClass: Record<ConfidenceLevel, string> = {
    High:   "bg-[#3f8c52]/10 text-[#3f8c52] border-[#3f8c52]/30",
    Medium: "bg-[#4a7fa8]/10 text-[#4a7fa8] border-[#4a7fa8]/30",
    Low:    "bg-[#c17f24]/10 text-[#c17f24] border-[#c17f24]/30",
    None:   "bg-red-50 text-red-600 border-red-200",
  };

  const ConfidenceIcon = () => {
    if (confidenceLevel === "High") return <CheckCircle className="w-3 h-3" />;
    if (confidenceLevel === "Medium") return <Info className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  const lifecycleHasData = Object.values(material.lifecycleBreakdown).some(
    (v) => parseFloat(v) > 0,
  );

  const insightText = buildInsightText(material.category, material.risScore, material.lisScore, carbon);
  const methodologyText = buildMethodologyText(material.category, material.risScore, material.lisScore, confidenceLevel);
  const sourceLabel = (material as any).source ? formatSourceLabel((material as any).source) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* ── Hero strip — forest green ── */}
      <div style={{ backgroundColor: forest }} className="border-b border-black/10">
        <div className="container py-3">

          {/* Back + breadcrumb */}
          <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: "rgba(245,242,236,0.5)" }}>
            <Link href="/materials">
              <button className="flex items-center gap-1 hover:text-white transition-colors">
                <ArrowLeft className="w-3 h-3" /> Materials
              </button>
            </Link>
            <span>/</span>
            <span style={{ color: "rgba(245,242,236,0.75)" }} className="truncate max-w-xs">{material.name}</span>
          </div>

          {/* Name + badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white leading-tight">{material.name}</h1>
            <Badge variant="outline" className="text-xs border-white/20 text-white/60">
              {material.category}
            </Badge>
            {material.isRegenerative === 1 && (
              <Badge className="text-xs bg-[#3f8c52]/30 text-emerald-200 border border-emerald-500/30">
                <Leaf className="w-3 h-3 mr-1" /> Regenerative
              </Badge>
            )}
            {confidenceLevel && confidenceLevel.toLowerCase() !== "none" && (
              <span
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${confidenceBadgeClass[confidenceLevel]}`}
              >
                <ConfidenceIcon />
                {confidenceLevel} confidence
              </span>
            )}
            {confidenceLevel === "Low" && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-300">
                <AlertCircle className="w-3 h-3" /> Verify before use
              </span>
            )}
          </div>

          {/* Manufacturer subtitle */}
          {material.manufacturer && (
            <p className="text-sm mb-1" style={{ color: "rgba(245,242,236,0.5)" }}>
              {material.manufacturer}
            </p>
          )}

          {/* Description */}
          {material.description && (
            <p className="text-sm line-clamp-2 max-w-3xl mb-3" style={{ color: "rgba(245,242,236,0.65)" }}>
              {material.description}
            </p>
          )}

          {/* Key metrics strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-300 shrink-0" />
              <div>
                <p className="text-xs leading-none" style={{ color: "rgba(245,242,236,0.5)" }}>Carbon</p>
                <p className="text-base font-bold text-emerald-300 leading-tight">
                  {carbonSqFt.toFixed(2)}
                  <span className="text-xs font-normal ml-1" style={{ color: "rgba(245,242,236,0.5)" }}>kg CO₂e/sq ft</span>
                </p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-sky-300 shrink-0" />
              <div>
                <p className="text-xs leading-none" style={{ color: "rgba(245,242,236,0.5)" }}>Cost</p>
                <p className="text-base font-bold text-sky-300 leading-tight">
                  ${cost.toFixed(2)}
                  <span className="text-xs font-normal ml-1" style={{ color: "rgba(245,242,236,0.5)" }}>/{material.functionalUnit}</span>
                </p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2">
              <p className="text-xs leading-none mb-0.5" style={{ color: "rgba(245,242,236,0.5)" }}>LIS</p>
              <p className="text-base font-bold text-orange-300 leading-tight">
                {material.lisScore}
                <span className="text-xs font-normal ml-1" style={{ color: "rgba(245,242,236,0.5)" }}>/ 100</span>
              </p>
              <p className="text-[10px]" style={{ color: "rgba(245,242,236,0.4)" }}>Lower is better</p>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2">
              <p className="text-xs leading-none mb-0.5" style={{ color: "rgba(245,242,236,0.5)" }}>RIS</p>
              {material.risScore !== null ? (
                <p className="text-base font-bold text-amber-300 leading-tight">
                  {material.risScore}
                  <span className="text-xs font-normal ml-1" style={{ color: "rgba(245,242,236,0.5)" }}>/ 100</span>
                </p>
              ) : (
                <p className="text-xs font-medium text-amber-300 leading-tight mt-0.5">Score Pending</p>
              )}
              <p className="text-[10px]" style={{ color: "rgba(245,242,236,0.4)" }}>Higher is better</p>
            </div>
          </div>

          {/* Score confidence */}
          <div className="mb-3">
            <ScoreConfidenceBadge confidence={(material as any).scoreConfidence} />
          </div>

          {/* InsightBox */}
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
          <TabsList className="bg-card border border-border mb-2 h-8">
            <TabsTrigger value="lifecycle"    className="text-xs h-7">Lifecycle</TabsTrigger>
            <TabsTrigger value="epd"          className="text-xs h-7">EPD Sources</TabsTrigger>
            <TabsTrigger value="quality"      className="text-xs h-7">Data Quality</TabsTrigger>
            <TabsTrigger value="alternatives" className="text-xs h-7">Alternatives</TabsTrigger>
          </TabsList>

          {/* ── Lifecycle tab ── */}
          <TabsContent value="lifecycle" className="mt-0">
            <Card>
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm font-semibold">Lifecycle Carbon Breakdown</CardTitle>
                <CardDescription className="text-xs">
                  EN 15804 · A1–A3 production · A4 transport · A5 construction · B use · C1–C4 end-of-life
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-1">
                {lifecycleHasData ? (
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: "A1–A3", sub: "Production",  value: material.lifecycleBreakdown.a1a3, color: "text-[#3f8c52]" },
                      { label: "A4",    sub: "Transport",    value: material.lifecycleBreakdown.a4,   color: "text-[#4a7fa8]" },
                      { label: "A5",    sub: "Construction", value: material.lifecycleBreakdown.a5,   color: "text-[#c17f24]" },
                      { label: "B",     sub: "Use",          value: material.lifecycleBreakdown.b,    color: "text-amber-600" },
                      { label: "C1–C4", sub: "End-of-life",  value: material.lifecycleBreakdown.c1c4, color: "text-red-500"   },
                    ].map((phase) => (
                      <div key={phase.label} className="bg-[#eae7e0] rounded-lg p-2 text-center">
                        <p className={`text-base font-bold ${phase.color}`}>
                          {parseFloat(phase.value).toFixed(1)}
                        </p>
                        <p className="text-[10px] font-semibold text-foreground">{phase.label}</p>
                        <p className="text-[10px] text-muted-foreground">{phase.sub}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 gap-1.5">
                    <Clock className="w-7 h-7 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">Lifecycle phase data coming soon</p>
                    <p className="text-xs text-muted-foreground/60 text-center max-w-sm">
                      Total cradle-to-gate is {carbonSqFt.toFixed(2)} kg CO₂e/sq ft — per-phase breakdown
                      will be added as data coverage expands.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── EPD Sources tab ── */}
          <TabsContent value="epd" className="mt-0">
            <Card>
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm font-semibold">EPD Sources</CardTitle>
                <CardDescription className="text-xs">Transparent data attribution</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-1 space-y-2">
                {material.manufacturer && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Manufacturer</span>
                    <span className="font-medium">{material.manufacturer}</span>
                  </div>
                )}
                {sourceLabel && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Source</span>
                    <span className="font-medium">{sourceLabel}</span>
                  </div>
                )}
                {(material as any).sourceUrl && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reference</span>
                    <a
                      href={(material as any).sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:underline"
                      style={{ color: amber }}
                    >
                      View source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {material.epdMetadata && material.epdMetadata.length > 0
                  ? material.epdMetadata.map((epd: any, idx: number) => (
                      <div key={idx} className="border border-border rounded-lg p-2.5 text-sm space-y-0.5">
                        <p className="font-medium">{epd.source}</p>
                        {epd.manufacturer && (
                          <p className="text-muted-foreground text-xs">Mfr: {epd.manufacturer}</p>
                        )}
                      </div>
                    ))
                  : !material.manufacturer && !sourceLabel && (
                      <p className="text-sm text-muted-foreground py-3 text-center">
                        No EPD sources documented yet
                      </p>
                    )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Data Quality tab ── */}
          <TabsContent value="quality" className="mt-0">
            <Card>
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm font-semibold">Data Quality</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-1 space-y-2">
                {confidenceLevel && confidenceLevel.toLowerCase() !== "none" && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${confidenceBadgeClass[confidenceLevel]}`}
                    >
                      <ConfidenceIcon />
                      {confidenceLevel}
                    </span>
                  </div>
                )}
                {material.dataQualityScore != null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quality score</span>
                    <span className="font-medium">{material.dataQualityScore} / 100</span>
                  </div>
                )}
                {(material as any).lastVerified && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last verified</span>
                    <span>{new Date((material as any).lastVerified).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">About this entry</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{methodologyText}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1.5">
                    Carbon follows EN 15804. Costs are regional averages and may vary by supplier.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Alternatives tab ── */}
          <TabsContent value="alternatives" className="mt-0">
            <Card>
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm font-semibold">Recommended Alternatives</CardTitle>
                <CardDescription className="text-xs">
                  Same category · genuine improvements in carbon or resilience only
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-1 space-y-2">
                {recommendations && recommendations.length > 0 ? (
                  recommendations.map((rec: any) => (
                    <Link key={rec.material.id} href={`/materials/${rec.material.id}`}>
                      <div className="border border-border rounded-lg p-2.5 hover:border-[#c17f24]/50 hover:bg-[#eae7e0] transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="text-sm font-medium leading-tight">{rec.material.name}</p>
                          <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
                            {rec.material.category}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          {rec.carbonSavings > 0 && (
                            <span className="text-[#3f8c52]">
                              −{(rec.carbonSavings / 10.764).toFixed(2)} kg CO₂e/sq ft
                            </span>
                          )}
                          {rec.risDelta > 0 && (
                            <span style={{ color: amber }}>+{rec.risDelta} RIS</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-3 text-center">
                    No better alternatives found in this category yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Manufacturer site link */}
        {(material as any).sourceUrl && (
          <div className="mt-3 pb-1 text-center">
            <a
              href={(material as any).sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:underline transition-colors"
              style={{ color: "rgba(90,90,86,0.7)" }}
            >
              View manufacturer site →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
