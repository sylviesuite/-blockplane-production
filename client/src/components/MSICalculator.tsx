/**
 * MSI (Material Sustainability Index) Calculator
 * 
 * Interactive calculator allowing users to adjust weights for:
 * - Impact (RIS - LIS): Environmental and regenerative balance
 * - Carbon: Climate impact
 * - Cost: Economic factor
 * 
 * Formula: MSI = [(RIS - LIS) × W₁] - [Carbon_Normalized × W₂] - [Cost_Normalized × W₃]
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import type { Material } from '../types';

interface MSICalculatorProps {
  materials: Material[];
}

interface MaterialWithMSI extends Material {
  msi: number;
  netImpact: number;
  carbonNormalized: number;
  costNormalized: number;
}

export function MSICalculator({ materials }: MSICalculatorProps) {
  // Weight state (percentages, must sum to 100)
  const [impactWeight, setImpactWeight] = useState(50);
  const [carbonWeight, setCarbonWeight] = useState(30);
  const [costWeight, setCostWeight] = useState(20);

  // Calculate MSI for all materials
  const rankedMaterials = useMemo(() => {
    if (materials.length === 0) return [];

    // Find max values for normalization
    const maxCarbon = Math.max(...materials.map(m => m.total));
    const maxCost = Math.max(...materials.map(m => m.cost));

    // Calculate MSI for each material
    const withMSI: MaterialWithMSI[] = materials.map(m => {
      const netImpact = m.ris - m.lis;
      const carbonNormalized = (m.total / maxCarbon) * 100;
      const costNormalized = (m.cost / maxCost) * 100;

      const msi = 
        (netImpact * impactWeight / 100) -
        (carbonNormalized * carbonWeight / 100) -
        (costNormalized * costWeight / 100);

      return {
        ...m,
        msi,
        netImpact,
        carbonNormalized,
        costNormalized,
      };
    });

    // Sort by MSI (highest first)
    return withMSI.sort((a, b) => b.msi - a.msi);
  }, [materials, impactWeight, carbonWeight, costWeight]);

  // Get MSI rating
  const getMSIRating = (msi: number) => {
    if (msi >= 20) return { label: 'Excellent', color: 'bg-emerald-500' };
    if (msi >= 0) return { label: 'Good', color: 'bg-green-500' };
    if (msi >= -20) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Poor', color: 'bg-red-500' };
  };

  // Handle weight changes (ensure they sum to 100)
  const handleImpactChange = (value: number[]) => {
    const newImpact = value[0];
    const remaining = 100 - newImpact;
    const carbonRatio = carbonWeight / (carbonWeight + costWeight);
    setImpactWeight(newImpact);
    setCarbonWeight(Math.round(remaining * carbonRatio));
    setCostWeight(Math.round(remaining * (1 - carbonRatio)));
  };

  const handleCarbonChange = (value: number[]) => {
    const newCarbon = value[0];
    const remaining = 100 - newCarbon;
    const impactRatio = impactWeight / (impactWeight + costWeight);
    setCarbonWeight(newCarbon);
    setImpactWeight(Math.round(remaining * impactRatio));
    setCostWeight(Math.round(remaining * (1 - impactRatio)));
  };

  const handleCostChange = (value: number[]) => {
    const newCost = value[0];
    const remaining = 100 - newCost;
    const impactRatio = impactWeight / (impactWeight + carbonWeight);
    setCostWeight(newCost);
    setImpactWeight(Math.round(remaining * impactRatio));
    setCarbonWeight(Math.round(remaining * (1 - impactRatio)));
  };

  // Preset configurations
  const presets = [
    { name: 'Balanced', impact: 50, carbon: 30, cost: 20 },
    { name: 'Eco-Warrior', impact: 60, carbon: 30, cost: 10 },
    { name: 'Carbon-Focused', impact: 30, carbon: 60, cost: 10 },
    { name: 'Budget-Conscious', impact: 40, carbon: 20, cost: 40 },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setImpactWeight(preset.impact);
    setCarbonWeight(preset.carbon);
    setCostWeight(preset.cost);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Material Sustainability Index (MSI) Calculator</CardTitle>
        <CardDescription>
          Adjust weights to rank materials based on your priorities. Higher MSI = better sustainability match.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Weight Controls */}
        <div className="space-y-6 mb-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Impact Weight (RIS - LIS)</label>
              <span className="text-sm font-semibold text-emerald-600">{impactWeight}%</span>
            </div>
            <Slider
              value={[impactWeight]}
              onValueChange={handleImpactChange}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Environmental and regenerative balance
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Carbon Weight</label>
              <span className="text-sm font-semibold text-blue-600">{carbonWeight}%</span>
            </div>
            <Slider
              value={[carbonWeight]}
              onValueChange={handleCarbonChange}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Climate impact (kg CO₂e)
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Cost Weight</label>
              <span className="text-sm font-semibold text-purple-600">{costWeight}%</span>
            </div>
            <Slider
              value={[costWeight]}
              onValueChange={handleCostChange}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Economic factor ($/unit)
            </p>
          </div>

          {/* Presets */}
          <div>
            <p className="text-sm font-medium mb-2">Quick Presets:</p>
            <div className="flex flex-wrap gap-2">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ranked Materials */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Ranked Materials</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {rankedMaterials.map((material, index) => {
              const rating = getMSIRating(material.msi);
              return (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{material.name}</p>
                      <p className="text-xs text-gray-500">{material.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs">
                      <p className="text-gray-500">Net Impact: {material.netImpact > 0 ? '+' : ''}{material.netImpact}</p>
                      <p className="text-gray-500">Carbon: {material.total.toFixed(1)} kg</p>
                      <p className="text-gray-500">Cost: ${material.cost.toFixed(0)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`${rating.color} text-white text-xs`}>
                        {rating.label}
                      </Badge>
                      <span className="text-lg font-bold text-emerald-600">
                        {material.msi.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formula Explanation */}
        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📐 MSI Formula
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200 font-mono">
            MSI = [(RIS - LIS) × {impactWeight}%] - [Carbon_Norm × {carbonWeight}%] - [Cost_Norm × {costWeight}%]
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            Higher MSI indicates better alignment with your sustainability priorities. 
            Positive values are good, negative values suggest high impact or cost.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
