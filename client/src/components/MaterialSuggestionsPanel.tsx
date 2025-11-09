/**
 * Material Suggestions Panel
 * 
 * Proactive AI-powered recommendations panel that auto-suggests
 * better alternatives based on viewed materials
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, TrendingDown, DollarSign, Leaf, X, ArrowRight } from 'lucide-react';
import { trpc } from '../lib/trpc';
import type { Material } from '../types';

interface MaterialSuggestionsPanelProps {
  currentMaterial?: Material;
  onCompare?: (material: Material, alternative: Material) => void;
  onViewDetails?: (material: Material) => void;
}

export function MaterialSuggestionsPanel({ 
  currentMaterial, 
  onCompare, 
  onViewDetails 
}: MaterialSuggestionsPanelProps) {
  const [dismissed, setDismissed] = useState(false);

  // Fetch recommendations when material changes
  const { data: recommendations, isLoading } = trpc.recommendations.getAlternatives.useQuery(
    {
      materialId: currentMaterial?.id || '',
      maxResults: 3,
      prioritizeCarbon: true,
      prioritizeRIS: true,
      prioritizeCost: false,
    },
    {
      enabled: !!currentMaterial && !dismissed,
    }
  );

  // Reset dismissed state when material changes
  useEffect(() => {
    setDismissed(false);
  }, [currentMaterial?.id]);

  // Log analytics event when suggestions are shown
  const logEventMutation = trpc.analytics.logEvent.useMutation();
  useEffect(() => {
    if (recommendations && recommendations.length > 0 && currentMaterial) {
      logEventMutation.mutate({
        eventType: 'ai_suggestion_shown',
        sessionId: getSessionId(),
        materialId: currentMaterial.id,
        materialName: currentMaterial.name,
        metadata: JSON.stringify({
          suggestedAlternatives: recommendations.map(r => r.material.name),
          carbonSavingsPotential: recommendations.reduce((sum, r) => sum + r.carbonSavings, 0),
        }),
      });
    }
  }, [recommendations, currentMaterial]);

  // Session ID helper
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  };

  // Handle recommendation click
  const handleRecommendationClick = (recommendation: typeof recommendations[0]) => {
    if (!currentMaterial || !recommendation) return;

    // Log acceptance event
    logEventMutation.mutate({
      eventType: 'ai_recommendation_accepted',
      sessionId: getSessionId(),
      materialId: currentMaterial.id,
      materialName: currentMaterial.name,
      alternativeMaterialId: recommendation.material.id,
      alternativeMaterialName: recommendation.material.name,
      carbonSaved: recommendation.carbonSavings,
      costDelta: recommendation.costDelta,
      risDelta: recommendation.risDelta,
      source: 'proactive_suggestion',
    });

    // Trigger callback
    onViewDetails?.(recommendation.material);
  };

  if (!currentMaterial || dismissed || !recommendations || recommendations.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Finding better alternatives...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <CardTitle className="text-lg">AI Recommendations</CardTitle>
              <CardDescription>
                Better alternatives to {currentMaterial.name}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={rec.material.id}
            className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer"
            onClick={() => handleRecommendationClick(rec)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <h4 className="font-semibold">{rec.material.name}</h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {rec.material.category} • {rec.material.functionalUnit}
                </p>
              </div>
              <Badge 
                variant={rec.confidence > 70 ? 'default' : 'secondary'}
                className="text-xs"
              >
                {rec.confidence > 70 ? 'High' : rec.confidence > 40 ? 'Medium' : 'Low'} Confidence
              </Badge>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {rec.carbonSavings > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <TrendingDown className="w-3 h-3 text-green-600" />
                  <span className="font-semibold text-green-600">
                    -{rec.carbonSavings.toFixed(1)} kg CO₂e
                  </span>
                </div>
              )}
              
              {rec.risDelta > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <Leaf className="w-3 h-3 text-emerald-600" />
                  <span className="font-semibold text-emerald-600">
                    +{rec.risDelta} RIS
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-1 text-xs">
                <DollarSign className="w-3 h-3" />
                <span className={rec.costDelta > 0 ? 'text-red-600' : 'text-green-600'}>
                  {rec.costDelta > 0 ? '+' : ''}{rec.costDelta.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {rec.summary}
            </p>

            {/* Reasons */}
            <div className="space-y-1 mb-3">
              {rec.reasons.slice(0, 2).map((reason, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="text-purple-500">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRecommendationClick(rec);
                }}
              >
                View Details
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
              {onCompare && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompare(currentMaterial, rec.material);
                  }}
                >
                  Compare
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            💡 These recommendations are AI-powered based on RIS, carbon footprint, and cost analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
