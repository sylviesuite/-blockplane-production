import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, TrendingDown, TrendingUp, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { ExportMenu } from '@/components/ExportMenu';

interface BOMItem {
  material: string;
  quantity: number;
  unit: string;
  category?: string;
}

interface ProjectSummary {
  totalCarbon: number;
  totalCost: number;
  avgRIS: number;
  avgLIS: number;
  items: Array<BOMItem & {
    materialId?: number;
    carbon: number;
    cost: number;
    ris: number;
    lis: number;
  }>;
}

interface OptimizationSuggestion {
  originalMaterial: string;
  suggestedMaterial: string;
  carbonSavings: number;
  costDifference: number;
  risDifference: number;
  reason: string;
}

export default function ProjectAnalysis() {
  const [bomFile, setBomFile] = useState<File | null>(null);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(null);
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [projectName, setProjectName] = useState('');

  const { data: materials } = trpc.materials.getAll.useQuery();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    setBomFile(file);
    
    // Parse CSV
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const items: BOMItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const item: BOMItem = {
          material: values[headers.indexOf('material')] || values[0],
          quantity: parseFloat(values[headers.indexOf('quantity')] || values[1]) || 0,
          unit: values[headers.indexOf('unit')] || values[2] || 'm³',
          category: values[headers.indexOf('category')] || undefined,
        };
        items.push(item);
      }
      
      setBomItems(items);
      toast.success(`Loaded ${items.length} items from BOM`);
    } catch (error) {
      console.error('Parse error:', error);
      toast.error('Failed to parse BOM file');
    }
  };

  const analyzeProject = async () => {
    if (!materials || bomItems.length === 0) {
      toast.error('Please upload a BOM first');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Match BOM items to materials database
      const matchedItems = bomItems.map(item => {
        const material = materials.find(m => 
          m.name.toLowerCase().includes(item.material.toLowerCase()) ||
          item.material.toLowerCase().includes(m.name.toLowerCase())
        );

        if (!material) {
          return {
            ...item,
            carbon: 0,
            cost: 0,
            ris: 0,
            lis: 0,
          };
        }

        return {
          ...item,
          materialId: material.id,
          carbon: material.totalCarbon * item.quantity,
          cost: (material.pricing?.costPerUnit || 0) * item.quantity,
          ris: material.risScores?.ris || 0,
          lis: material.risScores?.lis || 0,
        };
      });

      const summary: ProjectSummary = {
        totalCarbon: matchedItems.reduce((sum, item) => sum + item.carbon, 0),
        totalCost: matchedItems.reduce((sum, item) => sum + item.cost, 0),
        avgRIS: matchedItems.reduce((sum, item) => sum + item.ris, 0) / matchedItems.length,
        avgLIS: matchedItems.reduce((sum, item) => sum + item.lis, 0) / matchedItems.length,
        items: matchedItems,
      };

      setProjectSummary(summary);

      // Generate optimization suggestions
      const suggestions: OptimizationSuggestion[] = [];
      for (const item of matchedItems) {
        if (!item.materialId) continue;

        const currentMaterial = materials.find(m => m.id === item.materialId);
        if (!currentMaterial) continue;

        // Find better alternatives in same category
        const alternatives = materials.filter(m => 
          m.category === currentMaterial.category &&
          m.id !== currentMaterial.id &&
          m.totalCarbon < currentMaterial.totalCarbon
        );

        for (const alt of alternatives.slice(0, 1)) { // Top alternative
          const carbonSavings = (currentMaterial.totalCarbon - alt.totalCarbon) * item.quantity;
          const costDiff = ((alt.pricing?.costPerUnit || 0) - (currentMaterial.pricing?.costPerUnit || 0)) * item.quantity;
          const risDiff = (alt.risScores?.ris || 0) - (currentMaterial.risScores?.ris || 0);

          if (carbonSavings > 0) {
            suggestions.push({
              originalMaterial: currentMaterial.name,
              suggestedMaterial: alt.name,
              carbonSavings,
              costDifference: costDiff,
              risDifference: risDiff,
              reason: carbonSavings > 50 
                ? 'Significant carbon reduction'
                : 'Moderate carbon improvement',
            });
          }
        }
      }

      setOptimizations(suggestions);
      toast.success('Project analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze project');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'material,quantity,unit,category\nCross Laminated Timber,100,m³,Timber\nReinforced Concrete,50,m³,Concrete\nStructural Steel,20,tonnes,Steel';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bom_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded!');
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Project Analysis</h1>
          <p className="text-gray-600 mt-2">
            Upload your Bill of Materials to analyze project-level carbon footprint and get optimization recommendations
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Bill of Materials</CardTitle>
          <CardDescription>
            Upload a CSV or Excel file with your project's material list
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g., Office Building Renovation"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bom-file">BOM File</Label>
              <Input
                id="bom-file"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your BOM should include columns: material, quantity, unit, category (optional)
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={downloadTemplate} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            <Button 
              onClick={analyzeProject} 
              disabled={bomItems.length === 0 || isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>Analyzing...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze Project
                </>
              )}
            </Button>
          </div>

          {bomItems.length > 0 && (
            <div className="mt-4">
              <Badge variant="secondary">
                {bomItems.length} items loaded
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {projectSummary && (
        <Tabs defaultValue="summary" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="optimizations">
                Optimizations
                {optimizations.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {optimizations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <ExportMenu
              materials={projectSummary.items}
              filename={`project-analysis-${projectName || 'export'}`}
            />
          </div>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Carbon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projectSummary.totalCarbon.toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">kg CO₂e</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${projectSummary.totalCost.toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">estimated</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Avg RIS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projectSummary.avgRIS.toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">durability and resilience (RIS)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Avg LIS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projectSummary.avgLIS.toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">life impact score</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Material Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectSummary.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.material}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="text-right">
                          <div className="font-medium">{item.carbon.toFixed(0)} kg CO₂e</div>
                          <div className="text-gray-600">carbon</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${item.cost.toFixed(0)}</div>
                          <div className="text-gray-600">cost</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimizations" className="space-y-4">
            {optimizations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Great Job!
                  </h3>
                  <p className="text-gray-600">
                    Your material selections are already optimized for carbon efficiency.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {optimizations.map((opt, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{opt.reason}</Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-600">Replace:</div>
                            <div className="font-medium">{opt.originalMaterial}</div>
                            <div className="text-sm text-gray-600 mt-2">With:</div>
                            <div className="font-medium text-green-600">{opt.suggestedMaterial}</div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 text-right">
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingDown className="h-4 w-4" />
                            <span className="font-medium">
                              -{opt.carbonSavings.toFixed(0)} kg CO₂e
                            </span>
                          </div>
                          <div className={`flex items-center gap-1 ${opt.costDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {opt.costDifference > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="font-medium">
                              {opt.costDifference > 0 ? '+' : ''}{opt.costDifference.toFixed(0)} $
                            </span>
                          </div>
                          {opt.risDifference !== 0 && (
                            <div className={`flex items-center gap-1 ${opt.risDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {opt.risDifference > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span className="font-medium">
                                {opt.risDifference > 0 ? '+' : ''}{opt.risDifference.toFixed(0)} RIS
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
