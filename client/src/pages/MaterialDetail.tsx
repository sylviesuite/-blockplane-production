import { useRoute } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Sparkles, TrendingDown, TrendingUp, DollarSign, Leaf } from 'lucide-react';
import { Link } from 'wouter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { AIAssistantDialog } from '@/components/AIAssistantDialog';
import { RecommendationCard } from '@/components/RecommendationCard';

export default function MaterialDetail() {
  const [, params] = useRoute('/material/:id');
  const materialId = params?.id ? parseInt(params.id) : null;
  
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  
  const { data: material, isLoading } = trpc.materials.getById.useQuery(
    { id: materialId! },
    { enabled: !!materialId }
  );
  
  const { data: recommendations } = trpc.recommendations.getRecommendations.useQuery(
    { materialId: materialId! },
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
            <Link href="/visuals">
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

  // Prepare lifecycle chart data
  const lifecycleData = material.lifecycleValues?.map(lv => ({
    phase: lv.phase,
    carbon: lv.carbonValue,
  })) || [];

  // Calculate quadrant
  const netImpact = material.risScores?.ris - material.risScores?.lis;
  let quadrant = 'Linear';
  if (netImpact > 30) quadrant = 'Regenerative';
  else if (netImpact > 0) quadrant = 'Transitional';

  const quadrantColors = {
    'Regenerative': 'bg-green-100 text-green-800 border-green-300',
    'Transitional': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Linear': 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/visuals">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Materials
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">{material.name}</h1>
                <Badge className={quadrantColors[quadrant as keyof typeof quadrantColors]}>
                  {quadrant}
                </Badge>
              </div>
              <p className="text-lg text-gray-600">{material.category}</p>
            </div>
            
            <Button onClick={() => setAiDialogOpen(true)} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Ask AI
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Carbon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {material.totalCarbon.toFixed(1)} kg CO₂e
              </div>
              <p className="text-xs text-gray-500 mt-1">per {material.functionalUnit}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                RIS Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {material.risScores?.ris || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Regenerative Impact</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-orange-600" />
                LIS Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {material.risScores?.lis || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Life Impact Score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${material.pricing?.costPerUnit.toFixed(2) || 'N/A'}
              </div>
              <p className="text-xs text-gray-500 mt-1">per {material.functionalUnit}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="lifecycle" className="space-y-6">
          <TabsList>
            <TabsTrigger value="lifecycle">Lifecycle Breakdown</TabsTrigger>
            <TabsTrigger value="alternatives">Better Alternatives</TabsTrigger>
            <TabsTrigger value="usage">Usage & Recommendations</TabsTrigger>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
          </TabsList>

          {/* Lifecycle Tab */}
          <TabsContent value="lifecycle">
            <Card>
              <CardHeader>
                <CardTitle>Lifecycle Carbon Breakdown</CardTitle>
                <CardDescription>
                  Carbon emissions across all lifecycle phases (kg CO₂e per {material.functionalUnit})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={lifecycleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="phase" />
                    <YAxis label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="carbon" fill="#10b981" name="Carbon Emissions" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  {material.lifecycleValues?.map((lv) => (
                    <div key={lv.phase} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{lv.phase}</span>
                      <span className="text-gray-900 font-semibold">{lv.carbonValue.toFixed(2)} kg CO₂e</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alternatives Tab */}
          <TabsContent value="alternatives">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Better Alternatives</CardTitle>
                  <CardDescription>
                    AI-recommended materials with lower carbon footprint and better sustainability scores
                  </CardDescription>
                </CardHeader>
              </Card>

              {recommendations && recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <RecommendationCard key={rec.alternative.id} recommendation={rec} />
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No alternatives available for this material.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>Usage Recommendations</CardTitle>
                <CardDescription>Best practices and typical applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Typical Applications</h3>
                  <p className="text-gray-600">
                    {material.category === 'Timber' && 'Structural framing, flooring, cladding, interior finishes, furniture'}
                    {material.category === 'Steel' && 'Structural frames, reinforcement, roofing, cladding, mechanical systems'}
                    {material.category === 'Concrete' && 'Foundations, structural walls, floors, paving, thermal mass'}
                    {material.category === 'Earth' && 'Walls, insulation, thermal mass, finishes, landscaping'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sustainability Considerations</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {material.risScores?.ris > 70 && (
                      <>
                        <li>Highly regenerative material with positive environmental impact</li>
                        <li>Consider for projects prioritizing sustainability</li>
                      </>
                    )}
                    {material.risScores?.lis < 30 && (
                      <li>Low lifecycle impact - minimal environmental footprint</li>
                    )}
                    {material.totalCarbon < 100 && (
                      <li>Low embodied carbon - excellent for carbon-conscious designs</li>
                    )}
                    <li>Verify local availability to minimize transport emissions</li>
                    <li>Consider end-of-life recyclability and reuse potential</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cost Considerations</h3>
                  <p className="text-gray-600">
                    At ${material.pricing?.costPerUnit.toFixed(2)} per {material.functionalUnit}, this material is{' '}
                    {material.pricing?.costPerUnit < 100 ? 'economically competitive' : 
                     material.pricing?.costPerUnit < 500 ? 'moderately priced' : 
                     'a premium option'}.
                    Consider lifecycle cost savings from durability and maintenance requirements.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle>Data Sources & References</CardTitle>
                <CardDescription>Environmental Product Declarations and research sources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {material.epdMetadata ? (
                  <>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Primary Source</h3>
                      <p className="text-gray-600">{material.epdMetadata.source}</p>
                    </div>

                    {material.epdMetadata.epdUrl && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">EPD Document</h3>
                        <a 
                          href={material.epdMetadata.epdUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 underline"
                        >
                          View Environmental Product Declaration →
                        </a>
                      </div>
                    )}

                    {material.epdMetadata.notes && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                        <p className="text-gray-600">{material.epdMetadata.notes}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No EPD metadata available for this material.</p>
                )}

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">Additional Resources</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <a href="https://www.environdec.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">International EPD System</a></li>
                    <li>• <a href="https://www.nist.gov/el/building-and-fire-research-laboratory-bfrl" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">NIST Building Research</a></li>
                    <li>• <a href="https://www.carbonleadershipforum.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Carbon Leadership Forum</a></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Assistant Dialog */}
      <AIAssistantDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        context={`Material: ${material.name}\nCategory: ${material.category}\nTotal Carbon: ${material.totalCarbon.toFixed(1)} kg CO₂e per ${material.functionalUnit}\nRIS: ${material.risScores?.ris || 0}, LIS: ${material.risScores?.lis || 0}\nQuadrant: ${quadrant}`}
        suggestedPrompts={[
          `Why is ${material.name} considered ${quadrant.toLowerCase()}?`,
          `What are the best use cases for ${material.name}?`,
          `How can I reduce the carbon impact of ${material.name}?`,
          `What alternatives should I consider instead of ${material.name}?`,
        ]}
      />
    </div>
  );
}
