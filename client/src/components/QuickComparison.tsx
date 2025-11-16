import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X, Leaf, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Material {
  id: number;
  name: string;
  category: string;
  totalCarbon: number;
  cost: number;
  risScore: number;
  lisScore: number;
  lifecycleValues: {
    a1a3: number;
    a4: number;
    a5: number;
    b: number;
    c1c4: number;
  };
}

interface QuickComparisonProps {
  materials: Material[];
  onClose: () => void;
}

export default function QuickComparison({ materials, onClose }: QuickComparisonProps) {
  if (materials.length !== 3) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please select exactly 3 materials to compare.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare lifecycle data for chart
  const lifecycleData = [
    {
      phase: "A1-A3 (Production)",
      [materials[0].name]: materials[0].lifecycleValues.a1a3,
      [materials[1].name]: materials[1].lifecycleValues.a1a3,
      [materials[2].name]: materials[2].lifecycleValues.a1a3,
    },
    {
      phase: "A4 (Transport)",
      [materials[0].name]: materials[0].lifecycleValues.a4,
      [materials[1].name]: materials[1].lifecycleValues.a4,
      [materials[2].name]: materials[2].lifecycleValues.a4,
    },
    {
      phase: "A5 (Installation)",
      [materials[0].name]: materials[0].lifecycleValues.a5,
      [materials[1].name]: materials[1].lifecycleValues.a5,
      [materials[2].name]: materials[2].lifecycleValues.a5,
    },
    {
      phase: "B (Use)",
      [materials[0].name]: materials[0].lifecycleValues.b,
      [materials[1].name]: materials[1].lifecycleValues.b,
      [materials[2].name]: materials[2].lifecycleValues.b,
    },
    {
      phase: "C1-C4 (End of Life)",
      [materials[0].name]: materials[0].lifecycleValues.c1c4,
      [materials[1].name]: materials[1].lifecycleValues.c1c4,
      [materials[2].name]: materials[2].lifecycleValues.c1c4,
    },
  ];

  // Prepare radar chart data
  const radarData = [
    {
      metric: "RIS Score",
      [materials[0].name]: materials[0].risScore,
      [materials[1].name]: materials[1].risScore,
      [materials[2].name]: materials[2].risScore,
    },
    {
      metric: "LIS Score",
      [materials[0].name]: materials[0].lisScore,
      [materials[1].name]: materials[1].lisScore,
      [materials[2].name]: materials[2].lisScore,
    },
    {
      metric: "Carbon (inv)",
      [materials[0].name]: 100 - (materials[0].totalCarbon / 10),
      [materials[1].name]: 100 - (materials[1].totalCarbon / 10),
      [materials[2].name]: 100 - (materials[2].totalCarbon / 10),
    },
    {
      metric: "Cost (inv)",
      [materials[0].name]: 100 - (materials[0].cost / 10),
      [materials[1].name]: 100 - (materials[1].cost / 10),
      [materials[2].name]: 100 - (materials[2].cost / 10),
    },
  ];

  const handleExport = async () => {
    const element = document.getElementById("quick-comparison-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Material_Comparison_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Find best/worst for each metric
  const bestCarbon = materials.reduce((prev, curr) => prev.totalCarbon < curr.totalCarbon ? prev : curr);
  const bestCost = materials.reduce((prev, curr) => prev.cost < curr.cost ? prev : curr);
  const bestRIS = materials.reduce((prev, curr) => prev.risScore > curr.risScore ? prev : curr);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-6xl my-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Quick Comparison: 3 Materials</CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent id="quick-comparison-content">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {materials.map((material, index) => (
              <Card key={material.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{index + 1}</Badge>
                    <Badge>{material.category}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{material.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Carbon:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{material.totalCarbon.toFixed(1)} kg</span>
                        {material.id === bestCarbon.id && (
                          <Badge variant="default" className="text-xs">Best</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cost:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">${material.cost.toFixed(2)}</span>
                        {material.id === bestCost.id && (
                          <Badge variant="default" className="text-xs">Best</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">RIS Score:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{material.risScore}</span>
                        {material.id === bestRIS.id && (
                          <Badge variant="default" className="text-xs">Best</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">LIS Score:</span>
                      <span className="font-semibold">{material.lisScore}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Lifecycle Breakdown Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Lifecycle Carbon Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lifecycleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phase" />
                  <YAxis label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={materials[0].name} fill="#3b82f6" />
                  <Bar dataKey={materials[1].name} fill="#10b981" />
                  <Bar dataKey={materials[2].name} fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Overall Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name={materials[0].name} dataKey={materials[0].name} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name={materials[1].name} dataKey={materials[1].name} stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Radar name={materials[2].name} dataKey={materials[2].name} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Metric</th>
                      {materials.map((material, index) => (
                        <th key={material.id} className="text-left p-2">
                          <Badge variant="outline" className="mr-2">{index + 1}</Badge>
                          {material.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Category</td>
                      {materials.map(m => <td key={m.id} className="p-2">{m.category}</td>)}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Total Carbon (kg CO₂e)</td>
                      {materials.map(m => (
                        <td key={m.id} className="p-2">
                          {m.totalCarbon.toFixed(2)}
                          {m.id === bestCarbon.id && <Badge variant="default" className="ml-2 text-xs">Lowest</Badge>}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Cost ($/unit)</td>
                      {materials.map(m => (
                        <td key={m.id} className="p-2">
                          ${m.cost.toFixed(2)}
                          {m.id === bestCost.id && <Badge variant="default" className="ml-2 text-xs">Lowest</Badge>}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">RIS Score</td>
                      {materials.map(m => (
                        <td key={m.id} className="p-2">
                          {m.risScore}
                          {m.id === bestRIS.id && <Badge variant="default" className="ml-2 text-xs">Highest</Badge>}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">LIS Score</td>
                      {materials.map(m => <td key={m.id} className="p-2">{m.lisScore}</td>)}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-2 font-medium" colSpan={4}>Lifecycle Phases (kg CO₂e)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 pl-6">A1-A3 (Production)</td>
                      {materials.map(m => <td key={m.id} className="p-2">{m.lifecycleValues.a1a3.toFixed(2)}</td>)}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 pl-6">A4 (Transport)</td>
                      {materials.map(m => <td key={m.id} className="p-2">{m.lifecycleValues.a4.toFixed(2)}</td>)}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 pl-6">A5 (Installation)</td>
                      {materials.map(m => <td key={m.id} className="p-2">{m.lifecycleValues.a5.toFixed(2)}</td>)}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 pl-6">B (Use Phase)</td>
                      {materials.map(m => <td key={m.id} className="p-2">{m.lifecycleValues.b.toFixed(2)}</td>)}
                    </tr>
                    <tr>
                      <td className="p-2 pl-6">C1-C4 (End of Life)</td>
                      {materials.map(m => <td key={m.id} className="p-2">{m.lifecycleValues.c1c4.toFixed(2)}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="mt-6 border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Recommendation
              </h3>
              <p className="text-sm text-muted-foreground">
                Based on the comparison, <strong>{bestCarbon.name}</strong> has the lowest carbon footprint ({bestCarbon.totalCarbon.toFixed(1)} kg CO₂e),
                while <strong>{bestCost.name}</strong> is the most cost-effective (${bestCost.cost.toFixed(2)}).
                {bestRIS.id === bestCarbon.id && " It also has the highest regenerative impact score."}
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
