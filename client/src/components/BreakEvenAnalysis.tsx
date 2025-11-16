import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Leaf, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { 
  calculateCostCarbonMetrics, 
  calculateBreakEven,
  formatCurrency,
  formatCarbon,
  formatPercent,
  type MaterialWithCost 
} from "@/lib/costCarbonAnalysis";

interface BreakEvenAnalysisProps {
  baseline: MaterialWithCost;
  alternative: MaterialWithCost;
  assumptions?: {
    energySavingsPerYear?: number;
    maintenanceSavingsPerYear?: number;
    lifespanYears?: number;
    carbonPrice?: number;
  };
}

/**
 * Break-even analysis component showing ROI for premium sustainable materials
 */
export function BreakEvenAnalysis({ baseline, alternative, assumptions = {} }: BreakEvenAnalysisProps) {
  const metrics = calculateCostCarbonMetrics(baseline, alternative);
  const breakEven = calculateBreakEven(baseline, alternative, assumptions);

  const isPremium = metrics.costPremium > 0;
  const isCheaper = metrics.costPremium < 0;
  const hasCarbonSavings = metrics.carbonSavings > 0;

  const getRecommendationIcon = () => {
    if (isCheaper && hasCarbonSavings) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (breakEven.totalCostAdvantage > 0) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (metrics.carbonSavingsPercent > 50) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getRecommendationBadge = () => {
    if (isCheaper && hasCarbonSavings) return <Badge variant="default" className="bg-green-600">Clear Winner</Badge>;
    if (breakEven.totalCostAdvantage > 0) return <Badge variant="default" className="bg-green-600">Recommended</Badge>;
    if (metrics.carbonSavingsPercent > 50) return <Badge variant="secondary">Consider</Badge>;
    return <Badge variant="destructive">Not Recommended</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Break-Even Analysis
            </CardTitle>
            <CardDescription>
              Comparing {baseline.name} vs {alternative.name}
            </CardDescription>
          </div>
          {getRecommendationBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost Comparison */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Cost Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Baseline Cost</div>
              <div className="text-lg font-semibold">{formatCurrency(baseline.cost)}</div>
              <div className="text-xs text-muted-foreground">per {baseline.functionalUnit}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Alternative Cost</div>
              <div className="text-lg font-semibold">{formatCurrency(alternative.cost)}</div>
              <div className="text-xs text-muted-foreground">per {alternative.functionalUnit}</div>
            </div>
          </div>
          
          <div className={`rounded-lg p-3 ${isPremium ? 'bg-orange-50 dark:bg-orange-950' : 'bg-green-50 dark:bg-green-950'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cost Difference</span>
              <span className={`text-lg font-bold ${isPremium ? 'text-orange-600' : 'text-green-600'}`}>
                {isPremium ? '+' : ''}{formatCurrency(metrics.costPremium)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatPercent(metrics.costPremiumPercent)} {isPremium ? 'premium' : 'savings'}
            </div>
          </div>
        </div>

        {/* Carbon Comparison */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Carbon Impact
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Baseline Carbon</div>
              <div className="text-lg font-semibold">{formatCarbon(baseline.totalCarbon)}</div>
              <div className="text-xs text-muted-foreground">per {baseline.functionalUnit}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Alternative Carbon</div>
              <div className="text-lg font-semibold">{formatCarbon(alternative.totalCarbon)}</div>
              <div className="text-xs text-muted-foreground">per {alternative.functionalUnit}</div>
            </div>
          </div>
          
          <div className={`rounded-lg p-3 ${hasCarbonSavings ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Carbon Reduction</span>
              <span className={`text-lg font-bold ${hasCarbonSavings ? 'text-green-600' : 'text-red-600'}`}>
                {hasCarbonSavings ? '-' : '+'}{formatCarbon(Math.abs(metrics.carbonSavings))}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatPercent(metrics.carbonSavingsPercent)} {hasCarbonSavings ? 'reduction' : 'increase'}
            </div>
          </div>
        </div>

        {/* Break-Even Metrics */}
        {isPremium && hasCarbonSavings && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Value Proposition</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3 space-y-1">
                <div className="text-xs text-muted-foreground">Cost per kg CO₂ Saved</div>
                <div className="text-lg font-semibold">
                  {formatCurrency(metrics.costPerKgCO2Saved)}
                </div>
              </div>
              
              <div className="rounded-lg border p-3 space-y-1">
                <div className="text-xs text-muted-foreground">Carbon Price Break-Even</div>
                <div className="text-lg font-semibold">
                  ${breakEven.carbonPriceBreakEven.toFixed(0)}/ton
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Carbon Value (@$50/ton)</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(metrics.carbonPriceEquivalent)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Equivalent value of carbon reduction at current carbon price
              </div>
            </div>

            {breakEven.totalCostAdvantage > 0 && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Cost Advantage</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(breakEven.totalCostAdvantage)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Net savings including carbon value
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendation */}
        <div className="rounded-lg border-2 p-4">
          <div className="flex items-start gap-3">
            {getRecommendationIcon()}
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Recommendation</h4>
              <p className="text-sm text-muted-foreground">
                {breakEven.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Context */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
          <p>💡 <strong>Tip:</strong> This analysis uses a carbon price of ${assumptions.carbonPrice || 50}/ton CO₂.</p>
          <p>📊 Actual savings may vary based on project scale, location, and available incentives.</p>
          <p>🌱 Consider LEED credits, tax incentives, and long-term operational savings.</p>
        </div>
      </CardContent>
    </Card>
  );
}
