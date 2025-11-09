/**
 * Recommendation Card
 * 
 * Displays a single material recommendation with carbon savings,
 * cost delta, and improvement reasons
 */

import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingDown, DollarSign, Leaf, ArrowRight, BarChart3 } from 'lucide-react';
import type { Material } from '../types';

interface MaterialRecommendation {
  material: Material;
  carbonSavings: number;
  costDelta: number;
  risDelta: number;
  score: number;
  confidence: number;
  reasons: string[];
  summary: string;
}

interface RecommendationCardProps {
  recommendation: MaterialRecommendation;
  onCompare?: () => void;
  onViewDetails?: () => void;
  compact?: boolean;
}

export function RecommendationCard({
  recommendation,
  onCompare,
  onViewDetails,
  compact = false,
}: RecommendationCardProps) {
  const { material, carbonSavings, costDelta, risDelta, confidence, reasons, summary } = recommendation;

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-emerald-500">
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold ${compact ? 'text-base' : 'text-lg'}`}>
                {material.name}
              </h3>
              <Badge 
                variant={confidence > 70 ? 'default' : 'secondary'}
                className="text-xs"
              >
                {confidence > 70 ? 'High' : confidence > 40 ? 'Medium' : 'Low'} Match
              </Badge>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {material.category} • {material.functionalUnit}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
          {/* Carbon Savings */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Carbon</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              -{carbonSavings.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">kg CO₂e</p>
          </div>

          {/* RIS Improvement */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">RIS</span>
            </div>
            <p className="text-lg font-bold text-emerald-600">
              +{risDelta}
            </p>
            <p className="text-xs text-gray-500">points</p>
          </div>

          {/* Cost Delta */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Cost</span>
            </div>
            <p className={`text-lg font-bold ${costDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {costDelta > 0 ? '+' : ''}{costDelta.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">
              {costDelta > 0 ? 'more' : 'less'}
            </p>
          </div>
        </div>

        {/* Summary */}
        {!compact && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {summary}
            </p>
          </div>
        )}

        {/* Reasons */}
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
            Why This is Better:
          </p>
          <ul className="space-y-1">
            {reasons.slice(0, compact ? 2 : 3).map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-emerald-500 mt-1">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onViewDetails && (
            <Button
              onClick={onViewDetails}
              className="flex-1"
              size={compact ? 'sm' : 'default'}
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {onCompare && (
            <Button
              onClick={onCompare}
              variant="outline"
              size={compact ? 'sm' : 'default'}
              className="flex-1"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Compare
            </Button>
          )}
        </div>

        {/* Confidence Note */}
        {confidence < 70 && (
          <p className="text-xs text-gray-500 mt-3 text-center">
            ℹ️ This recommendation has medium confidence. Consider project-specific requirements.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
