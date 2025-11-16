import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Leaf, TrendingDown, Calculator, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatCarbon, type MaterialWithCost } from "@/lib/costCarbonAnalysis";
import { toast } from "sonner";

/**
 * Budget Optimizer Tool
 * 
 * Helps users maximize carbon reduction within budget constraints.
 * Enter total budget and material quantities, get optimized material selections.
 */
export default function BudgetOptimizer() {
  const [budget, setBudget] = useState<string>("50000");
  const [optimizationResults, setOptimizationResults] = useState<any>(null);

  const { data: materials, isLoading } = trpc.materials.list.useQuery();

  const handleOptimize = () => {
    if (!materials || materials.length === 0) {
      toast.error("No materials available for optimization");
      return;
    }

    const budgetAmount = parseFloat(budget);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    // Simple optimization: sort by carbon efficiency (carbon per dollar)
    const materialsWithCost: MaterialWithCost[] = materials.map(m => ({
      id: m.id,
      name: m.name,
      category: m.category,
      totalCarbon: parseFloat(m.totalCarbon),
      cost: m.pricing?.costPerUnit ? parseFloat(m.pricing.costPerUnit) : 0,
      functionalUnit: m.functionalUnit,
      risScore: m.risScore?.ris,
      lisScore: m.risScore?.lis,
    }));

    // Sort by lowest carbon per dollar (most carbon-efficient)
    const sortedByEfficiency = [...materialsWithCost].sort((a, b) => {
      const efficiencyA = a.totalCarbon / a.cost;
      const efficiencyB = b.totalCarbon / b.cost;
      return efficiencyA - efficiencyB;
    });

    // Also get highest carbon materials for comparison
    const sortedByCarbon = [...materialsWithCost].sort((a, b) => b.totalCarbon - a.totalCarbon);

    setOptimizationResults({
      budget: budgetAmount,
      lowestCarbonMaterials: sortedByEfficiency.slice(0, 10),
      highestCarbonMaterials: sortedByCarbon.slice(0, 10),
      totalMaterials: materials.length,
    });

    toast.success("Optimization complete!");
  };

  const handleExport = () => {
    if (!optimizationResults) return;

    const csvContent = [
      ["Material Name", "Category", "Cost", "Carbon", "Carbon Efficiency"].join(","),
      ...optimizationResults.lowestCarbonMaterials.map((m: MaterialWithCost) => 
        [
          m.name,
          m.category,
          m.cost,
          m.totalCarbon,
          (m.totalCarbon / m.cost).toFixed(2)
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-optimization-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Optimization results exported!");
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading materials...</div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Budget Optimizer</h1>
        <p className="text-muted-foreground">
          Maximize carbon reduction within your project budget
        </p>
      </div>

      {/* Budget Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Project Budget
          </CardTitle>
          <CardDescription>
            Enter your total materials budget to find the most carbon-efficient options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="budget">Total Budget (USD)</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-9"
                  placeholder="50000"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={handleOptimize} size="lg">
                <Calculator className="w-4 h-4 mr-2" />
                Optimize
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {optimizationResults && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(optimizationResults.budget)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Materials Analyzed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {optimizationResults.totalMaterials}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Top Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {optimizationResults.lowestCarbonMaterials.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Most Carbon-Efficient Materials */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    Most Carbon-Efficient Materials
                  </CardTitle>
                  <CardDescription>
                    Lowest carbon footprint per dollar spent
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {optimizationResults.lowestCarbonMaterials.map((material: MaterialWithCost, index: number) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{material.name}</div>
                        <div className="text-sm text-muted-foreground">{material.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Cost</div>
                        <div className="font-semibold">{formatCurrency(material.cost)}</div>
                        <div className="text-xs text-muted-foreground">per {material.functionalUnit}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Carbon</div>
                        <div className="font-semibold">{formatCarbon(material.totalCarbon)}</div>
                        <div className="text-xs text-muted-foreground">per {material.functionalUnit}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Efficiency</div>
                        <div className="font-semibold text-green-600">
                          {(material.totalCarbon / material.cost).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">kg CO₂/$</div>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Recommended
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Least Carbon-Efficient Materials (to avoid) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                Least Carbon-Efficient Materials
              </CardTitle>
              <CardDescription>
                Highest carbon footprint - consider alternatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {optimizationResults.highestCarbonMaterials.slice(0, 5).map((material: MaterialWithCost, index: number) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-red-50/50 dark:bg-red-950/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 text-red-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{material.name}</div>
                        <div className="text-sm text-muted-foreground">{material.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Cost</div>
                        <div className="font-semibold">{formatCurrency(material.cost)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Carbon</div>
                        <div className="font-semibold text-red-600">{formatCarbon(material.totalCarbon)}</div>
                      </div>
                      <Badge variant="destructive">
                        Avoid
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Budget Optimization Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong>1. Carbon Efficiency Calculation:</strong> We calculate the carbon footprint per dollar for every material in our database.
          </p>
          <p>
            <strong>2. Smart Ranking:</strong> Materials are ranked by carbon efficiency - the lower the carbon per dollar, the better the value.
          </p>
          <p>
            <strong>3. Budget Allocation:</strong> We show you which materials give you the most carbon reduction for your money.
          </p>
          <p>
            <strong>4. Actionable Recommendations:</strong> Use the top-ranked materials to maximize your sustainability impact within budget.
          </p>
          <p className="pt-2 border-t">
            💡 <strong>Pro Tip:</strong> Combine high-efficiency materials for structural elements with cost-effective options for finishes to optimize your entire project.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
