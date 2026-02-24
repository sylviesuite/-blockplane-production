/**
 * Enhanced Material Detail Page with "Radical Honesty"
 * 
 * Displays comprehensive material information with transparent data quality disclosure:
 * - EPD source attribution
 * - Confidence level display
 * - Last verified date
 * - Data quality metadata
 * - Verification recommendations
 * - Methodology transparency
 */

import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  ExternalLink,
  Calendar,
  FileText,
  MapPin,
  Award,
  Leaf,
  TrendingDown,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type ConfidenceLevel = "High" | "Medium" | "Low" | "None";

export default function MaterialDetailEnhanced() {
  const [, params] = useRoute("/material/:id");
  const materialId = params?.id ? parseInt(params.id) : null;

  const { data: material, isLoading } = trpc.materialAPI.getById.useQuery(
    { id: materialId! },
    { enabled: !!materialId }
  );

  const { data: recommendations } = trpc.materialAPI.getRecommendations.useQuery(
    { materialId: materialId!, maxResults: 3 },
    { enabled: !!materialId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading material details...</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Material Not Found</CardTitle>
            <CardDescription>The requested material could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/materials">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Materials
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get confidence badge styling
  const getConfidenceBadgeVariant = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case "High": return "default";
      case "Medium": return "secondary";
      case "Low": return "outline";
      case "None": return "destructive";
    }
  };

  const getConfidenceIcon = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case "High": return <CheckCircle className="w-4 h-4" />;
      case "Medium": return <Info className="w-4 h-4" />;
      case "Low": return <AlertCircle className="w-4 h-4" />;
      case "None": return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getConfidenceDescription = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case "High": return "Data verified from peer-reviewed EPDs with recent publication dates";
      case "Medium": return "Data from industry databases with reasonable assumptions";
      case "Low": return "Data based on estimates or older sources - verification recommended";
      case "None": return "Preliminary data - professional verification required before use";
    }
  };

  // Prepare lifecycle chart data
  const lifecycleData = [
    { phase: "A1-A3 (Production)", value: parseFloat(material.lifecycleBreakdown.a1a3), color: "#10b981" },
    { phase: "A4 (Transport)", value: parseFloat(material.lifecycleBreakdown.a4), color: "#3b82f6" },
    { phase: "A5 (Construction)", value: parseFloat(material.lifecycleBreakdown.a5), color: "#8b5cf6" },
    { phase: "B (Use)", value: parseFloat(material.lifecycleBreakdown.b), color: "#f59e0b" },
    { phase: "C1-C4 (End of Life)", value: parseFloat(material.lifecycleBreakdown.c1c4), color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: "Home", href: "/" },
          { label: "Materials", href: "/materials" },
          { label: material.name }
        ]} />
        
        {/* Header */}
        <div className="mb-6">

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">{material.name}</h1>
                {material.isRegenerative === 1 && (
                  <Badge variant="default" className="bg-emerald-600">
                    <Leaf className="w-3 h-3 mr-1" />
                    Regenerative
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{material.category}</Badge>
                <Badge 
                  variant={getConfidenceBadgeVariant(material.confidenceLevel)}
                  className="flex items-center gap-1"
                >
                  {getConfidenceIcon(material.confidenceLevel)}
                  {material.confidenceLevel} Confidence
                </Badge>
              </div>
              <p className="text-gray-600 max-w-2xl">{material.description}</p>
            </div>
          </div>
        </div>

        {/* Data Quality Warning */}
        {(material.confidenceLevel === "Low" || material.confidenceLevel === "None") && (
          <Card className="mb-6 border-amber-300 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Verification Recommended</h3>
                  <p className="text-sm text-amber-800">
                    This material has {material.confidenceLevel.toLowerCase()} confidence data. 
                    We recommend verifying this information with manufacturer EPDs before using in 
                    professional projects or regulatory submissions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-600" />
                Carbon Footprint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700 mb-1">
                {parseFloat(material.totalCarbon).toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">kg CO₂e per {material.functionalUnit}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 mb-1">
                ${parseFloat(material.costPerUnit).toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">per {material.functionalUnit}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Impact Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div>
                  <div className="text-2xl font-bold text-emerald-700">{material.risScore}</div>
                  <p className="text-xs text-gray-600">RIS</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">{material.lisScore}</div>
                  <p className="text-xs text-gray-600">LIS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="lifecycle" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lifecycle">Lifecycle Breakdown</TabsTrigger>
            <TabsTrigger value="epd">EPD Sources</TabsTrigger>
            <TabsTrigger value="quality">Data Quality</TabsTrigger>
            <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
          </TabsList>

          {/* Lifecycle Breakdown Tab */}
          <TabsContent value="lifecycle">
            <Card>
              <CardHeader>
                <CardTitle>Lifecycle Carbon Breakdown</CardTitle>
                <CardDescription>
                  Carbon emissions across EN 15804 lifecycle stages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={lifecycleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="phase" angle={-45} textAnchor="end" height={120} />
                    <YAxis label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {lifecycleData.map(phase => (
                    <div key={phase.phase} className="text-center">
                      <div className="text-lg font-bold" style={{ color: phase.color }}>
                        {phase.value.toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-600">{phase.phase.split(' ')[0]}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EPD Sources Tab */}
          <TabsContent value="epd">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Environmental Product Declaration Sources
                </CardTitle>
                <CardDescription>
                  Transparent attribution of data sources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {material.epdMetadata && material.epdMetadata.length > 0 ? (
                  material.epdMetadata.map((epd: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{epd.source}</h3>
                          {epd.manufacturer && (
                            <p className="text-sm text-gray-600">Manufacturer: {epd.manufacturer}</p>
                          )}
                        </div>
                        {epd.epdUrl && (
                          <a 
                            href={epd.epdUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {epd.referenceYear && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Year: {epd.referenceYear}</span>
                          </div>
                        )}
                        {epd.region && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{epd.region}</span>
                          </div>
                        )}
                        {epd.standard && (
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span>{epd.standard}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No EPD sources documented yet</p>
                    <p className="text-sm mt-2">Data may be based on industry averages or estimates</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Quality Tab */}
          <TabsContent value="quality">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getConfidenceIcon(material.confidenceLevel)}
                  Data Quality & Confidence
                </CardTitle>
                <CardDescription>
                  Transparent disclosure of data quality and limitations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Confidence Level */}
                <div>
                  <h3 className="font-semibold mb-2">Confidence Level</h3>
                  <Badge 
                    variant={getConfidenceBadgeVariant(material.confidenceLevel)}
                    className="text-lg px-4 py-2"
                  >
                    {material.confidenceLevel}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    {getConfidenceDescription(material.confidenceLevel)}
                  </p>
                </div>

                {/* Last Verified */}
                {material.lastVerified && (
                  <div>
                    <h3 className="font-semibold mb-2">Last Verified</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(material.lastVerified).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Verification Notes */}
                {material.verificationNotes && (
                  <div>
                    <h3 className="font-semibold mb-2">Verification Notes</h3>
                    <p className="text-sm text-gray-600">{material.verificationNotes}</p>
                  </div>
                )}

                {/* Data Quality Metadata */}
                {material.dataQuality && (
                  <div>
                    <h3 className="font-semibold mb-2">Data Quality Details</h3>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                      {JSON.stringify(material.dataQuality, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Methodology */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Methodology Transparency
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Carbon calculations follow EN 15804 standard</li>
                    <li>Lifecycle stages: A1-A3 (Production), A4 (Transport), A5 (Construction), B (Use), C1-C4 (End of Life)</li>
                    <li>RIS (Regenerative Impact Score): 0-100 scale, higher = better durability and resilience</li>
                    <li>LIS (Life Impact Score): 0-100 scale, lower = less environmental damage</li>
                    <li>Costs are regional averages and may vary by location and supplier</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alternatives Tab */}
          <TabsContent value="alternatives">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Alternatives</CardTitle>
                <CardDescription>
                  Materials in the same category with better environmental performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations && recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((rec: any) => (
                      <Link key={rec.material.id} href={`/material/${rec.material.id}`}>
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{rec.material.name}</h3>
                              <Badge variant="outline" className="mt-1">{rec.material.category}</Badge>
                            </div>
                            <Badge variant={getConfidenceBadgeVariant(rec.confidence)}>
                              {rec.confidence}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Carbon Savings</p>
                              <p className="text-sm font-semibold text-emerald-600">
                                {rec.carbonSavings > 0 ? '-' : '+'}{Math.abs(rec.carbonSavings).toFixed(2)} kg CO₂e
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Cost Delta</p>
                              <p className="text-sm font-semibold">
                                {rec.costDelta > 0 ? '+' : ''}{rec.costDelta.toFixed(2)} {material.currency}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">RIS Improvement</p>
                              <p className="text-sm font-semibold text-blue-600">
                                {rec.risDelta > 0 ? '+' : ''}{rec.risDelta}
                              </p>
                            </div>
                          </div>

                          {rec.reasons && rec.reasons.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <p className="font-medium mb-1">Why this is better:</p>
                              <ul className="list-disc list-inside space-y-0.5">
                                {rec.reasons.map((reason: string, idx: number) => (
                                  <li key={idx}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No alternative recommendations available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
