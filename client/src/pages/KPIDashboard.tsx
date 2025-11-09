/**
 * KPI Dashboard
 * 
 * Visualizes the real-world carbon impact of BlockPlane's AI recommendations
 * Tracks Material Substitution Rate, Carbon Avoided, AI Engagement, etc.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Leaf, Sparkles, Users, Award, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';

export default function KPIDashboard() {
  const [daysAgo, setDaysAgo] = useState(30);

  // Fetch KPIs
  const { data: kpis, isLoading: kpisLoading, refetch: refetchKPIs } = trpc.analytics.getKPIs.useQuery({ daysAgo });
  const { data: topAlternatives, isLoading: topLoading, refetch: refetchTop } = trpc.analytics.getTopAlternatives.useQuery({ limit: 10 });

  const handleRefresh = () => {
    refetchKPIs();
    refetchTop();
  };

  if (kpisLoading || topLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Impact Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Measuring BlockPlane's real-world carbon impact through AI-powered recommendations
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                onClick={() => setDaysAgo(days)}
                variant={daysAgo === days ? 'default' : 'outline'}
                size="sm"
              >
                Last {days} days
              </Button>
            ))}
          </div>
        </div>

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Carbon Avoided */}
          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Total Carbon Avoided
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-green-700 dark:text-green-300">
                {kpis?.totalCarbonAvoided.toFixed(1) || '0.0'}
                <span className="text-xl ml-2">kg CO₂e</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800 dark:text-green-200">
                Equivalent to {((kpis?.totalCarbonAvoided || 0) / 411).toFixed(1)} trees planted 🌳
              </p>
            </CardContent>
          </Card>

          {/* Materials Substituted */}
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Materials Substituted
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                {kpis?.totalSubstitutions || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Substitution Rate: {kpis?.substitutionRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          {/* AI Engagement */}
          <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Engagement Rate
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                {kpis?.aiEngagementRate.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                {kpis?.totalAIInteractions || 0} total AI interactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recommendation Acceptance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                Recommendation Performance
              </CardTitle>
              <CardDescription>How users respond to AI suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Acceptance Rate</span>
                  <span className="text-sm font-semibold text-amber-600">
                    {kpis?.recommendationAcceptanceRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all"
                    style={{ width: `${kpis?.recommendationAcceptanceRate || 0}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Suggestions Shown</p>
                  <p className="text-2xl font-bold">{kpis?.totalSuggestionsShown || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">{kpis?.totalRecommendationsAccepted || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                User Activity
              </CardTitle>
              <CardDescription>Engagement and exploration patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Materials Viewed</p>
                  <p className="text-2xl font-bold">{kpis?.totalMaterialsViewed || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg per Session</p>
                  <p className="text-2xl font-bold">
                    {kpis?.totalSessions 
                      ? ((kpis.totalMaterialsViewed || 0) / kpis.totalSessions).toFixed(1)
                      : '0'
                    }
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Carbon Impact per User</p>
                <p className="text-3xl font-bold text-green-600">
                  {kpis?.totalSessions 
                    ? ((kpis.totalCarbonAvoided || 0) / kpis.totalSessions).toFixed(1)
                    : '0'
                  }
                  <span className="text-sm ml-2">kg CO₂e</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Alternatives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Top Recommended Alternatives
            </CardTitle>
            <CardDescription>
              Materials most frequently recommended and adopted by users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topAlternatives && topAlternatives.length > 0 ? (
              <div className="space-y-3">
                {topAlternatives.map((alt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg font-bold w-8 h-8 flex items-center justify-center">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-semibold">{alt.alternativeName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Recommended {alt.recommendationCount} times
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Avg Carbon Savings</p>
                        <p className="text-sm font-semibold text-green-600">
                          -{alt.avgCarbonSaved.toFixed(1)} kg CO₂e
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Adoption Rate</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {((alt.acceptanceCount / alt.recommendationCount) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No recommendations data yet</p>
                <p className="text-sm mt-2">Start using the AI assistant to see top alternatives here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 These metrics track the real-world impact of AI-powered material recommendations.
            Data is updated in real-time as users interact with BlockPlane.
          </p>
        </div>
      </div>
    </div>
  );
}
