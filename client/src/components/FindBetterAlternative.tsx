import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, TrendingDown, DollarSign, Leaf } from "lucide-react";
import { CostCarbonSlider } from "./CostCarbonSlider";
import { filterByTradeoffPreference, type MaterialWithCost } from "@/lib/costCarbonAnalysis";
import { Link } from "wouter";

interface FindBetterAlternativeProps {
  currentMaterial: MaterialWithCost;
  allMaterials: MaterialWithCost[];
  category?: string; // Optional: filter by same category
}

/**
 * Find Better Alternative Component
 * 
 * Uses cost-carbon trade-off slider to recommend better material alternatives
 * based on user's preference (cost-focused vs carbon-focused).
 */
export function FindBetterAlternative({ 
  currentMaterial, 
  allMaterials,
  category 
}: FindBetterAlternativeProps) {
  const [preference, setPreference] = useState(50); // Default: balanced

  // Filter materials to same category if specified
  const candidateMaterials = category
    ? allMaterials.filter(m => m.category === category && m.id !== currentMaterial.id)
    : allMaterials.filter(m => m.id !== currentMaterial.id);

  // Get top 3 recommendations based on preference
  const recommendations = filterByTradeoffPreference(
    candidateMaterials,
    preference
  ).slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Find Better Alternative
        </CardTitle>
        <CardDescription>
          Adjust your cost-carbon preference to find materials that match your priorities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trade-off Slider */}
        <div>
          <CostCarbonSlider value={preference} onChange={setPreference} />
        </div>

        {/* Current Material Reference */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">Current Material</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{currentMaterial.name}</div>
              <div className="text-sm text-muted-foreground">{currentMaterial.category}</div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-right">
                <div className="text-muted-foreground">Cost</div>
                <div className="font-semibold">${currentMaterial.cost.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground">Carbon</div>
                <div className="font-semibold">{currentMaterial.totalCarbon.toFixed(1)} kg</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div className="text-sm font-medium mb-3">
            Top {recommendations.length} Recommendations
          </div>
          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((material, index) => {
                const costDiff = material.cost - currentMaterial.cost;
                const carbonDiff = material.totalCarbon - currentMaterial.totalCarbon;
                const costSavings = costDiff < 0;
                const carbonSavings = carbonDiff < 0;

                return (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{material.name}</div>
                        <div className="text-sm text-muted-foreground">{material.category}</div>
                        
                        <div className="flex gap-3 mt-2">
                          {/* Cost Comparison */}
                          <div className="flex items-center gap-1 text-xs">
                            <DollarSign className="w-3 h-3" />
                            <span className={costSavings ? "text-green-600 font-medium" : "text-red-600"}>
                              {costSavings ? "-" : "+"}{Math.abs(costDiff).toFixed(2)}
                            </span>
                            <span className="text-muted-foreground">
                              ({costSavings ? "saves" : "costs"} {Math.abs((costDiff / currentMaterial.cost) * 100).toFixed(0)}%)
                            </span>
                          </div>

                          {/* Carbon Comparison */}
                          <div className="flex items-center gap-1 text-xs">
                            <Leaf className="w-3 h-3" />
                            <span className={carbonSavings ? "text-green-600 font-medium" : "text-red-600"}>
                              {carbonSavings ? "-" : "+"}{Math.abs(carbonDiff).toFixed(1)} kg
                            </span>
                            <span className="text-muted-foreground">
                              ({carbonSavings ? "reduces" : "increases"} {Math.abs((carbonDiff / currentMaterial.totalCarbon) * 100).toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {costSavings && carbonSavings && (
                        <Badge variant="default" className="bg-green-600">
                          Best Choice
                        </Badge>
                      )}
                      <Link href={`/material/${material.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No alternative materials available in this category.
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>
            💡 <strong>How it works:</strong> Adjust the slider to prioritize cost savings (left) or carbon reduction (right). 
            Recommendations are ranked based on your preference, showing materials that best match your priorities.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
