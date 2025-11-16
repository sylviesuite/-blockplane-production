import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, ExternalLink, Award, DollarSign } from "lucide-react";
import { 
  getIncentivesByCategory, 
  estimateIncentiveValue,
  getIncentiveTypeBadge,
  type Incentive 
} from "@/lib/incentives";

interface IncentiveFinderProps {
  category: string;
  projectArea?: number;
}

/**
 * Incentive Finder Component
 * 
 * Shows available financial incentives, tax credits, and green building programs
 * that can offset the cost premium of sustainable materials.
 */
export function IncentiveFinder({ category, projectArea = 1000 }: IncentiveFinderProps) {
  const { incentives, estimatedValue, leedPoints } = estimateIncentiveValue(category, projectArea);

  if (incentives.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              Available Incentives
            </CardTitle>
            <CardDescription>
              Financial incentives and programs that can offset material costs
            </CardDescription>
          </div>
          {leedPoints > 0 && (
            <Badge variant="default" className="bg-emerald-600">
              <Award className="w-3 h-3 mr-1" />
              {leedPoints} LEED Points
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-900 dark:text-green-100">
                Estimated Incentive Value
              </div>
              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                Based on {projectArea.toLocaleString()} sq ft project
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {estimatedValue}
            </div>
          </div>
        </div>

        {/* Incentive List */}
        <div className="space-y-3">
          {incentives.map((incentive) => {
            const typeBadge = getIncentiveTypeBadge(incentive.type);
            
            return (
              <div
                key={incentive.id}
                className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge className={typeBadge.color}>
                        {typeBadge.label}
                      </Badge>
                      {incentive.region !== "federal" && (
                        <Badge variant="outline" className="text-xs">
                          {incentive.region.charAt(0).toUpperCase() + incentive.region.slice(1)}
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm">{incentive.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {incentive.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 font-semibold text-green-600">
                        <DollarSign className="w-4 h-4" />
                        {incentive.value}
                      </div>
                      {incentive.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          asChild
                        >
                          <a
                            href={incentive.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            Learn More
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                    </div>

                    {incentive.eligibility.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Eligibility:</span> {incentive.eligibility.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-xs text-muted-foreground border-t pt-4 space-y-1">
          <p>💡 <strong>Tip:</strong> Incentive availability and amounts vary by location and project type.</p>
          <p>📋 Check with your local utility company, state energy office, and LEED consultant for specific eligibility.</p>
          <p>🔗 Visit <a href="https://www.dsireusa.org/" target="_blank" rel="noopener noreferrer" className="underline">DSIRE</a> for comprehensive state and local incentive database.</p>
        </div>
      </CardContent>
    </Card>
  );
}
