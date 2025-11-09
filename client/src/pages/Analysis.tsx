/**
 * Analysis Page
 * 
 * Advanced material analysis tools:
 * - Quadrant Visualization (RIS vs LIS scatter plot)
 * - MSI Calculator (adjustable weight-based ranking)
 * - Material Comparison (side-by-side radar charts)
 */

import { useMaterials } from '../hooks/useMaterials';
import { QuadrantVisualization } from '../components/QuadrantVisualization';
import { MSICalculator } from '../components/MSICalculator';
import { MaterialComparison } from '../components/MaterialComparison';
import { Loader2, TrendingUp, Calculator, GitCompare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function Analysis() {
  const { materials, loading, error } = useMaterials();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading materials data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error loading materials</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Material Analysis Tools
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Advanced visualization and comparison tools for {materials.length} sustainable building materials
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs defaultValue="quadrant" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="quadrant" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Quadrant View</span>
            </TabsTrigger>
            <TabsTrigger value="msi" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span>MSI Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <GitCompare className="w-4 h-4" />
              <span>Comparison</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quadrant" className="space-y-6">
            <QuadrantVisualization 
              materials={materials}
              onMaterialClick={(material) => {
                console.log('Material clicked:', material);
                // Could open a modal or navigate to detail page
              }}
            />
          </TabsContent>

          <TabsContent value="msi" className="space-y-6">
            <MSICalculator materials={materials} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <MaterialComparison materials={materials} maxComparisons={4} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
