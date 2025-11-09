/**
 * Material Comparison Tool
 * 
 * Side-by-side comparison of selected materials with radar charts
 * showing performance across multiple sustainability dimensions
 */

import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Sparkles } from 'lucide-react';
import { AIAssistantDialog } from './AIAssistantDialog';
import type { Material } from '../types';

interface MaterialComparisonProps {
  materials: Material[];
  maxComparisons?: number;
}

export function MaterialComparison({ materials, maxComparisons = 4 }: MaterialComparisonProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  // Toggle material selection
  const toggleMaterial = (material: Material) => {
    if (selectedMaterials.find(m => m.id === material.id)) {
      setSelectedMaterials(selectedMaterials.filter(m => m.id !== material.id));
    } else if (selectedMaterials.length < maxComparisons) {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  // Remove material from comparison
  const removeMaterial = (materialId: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.id !== materialId));
  };

  // Prepare radar chart data
  const getRadarData = () => {
    if (selectedMaterials.length === 0) return [];

    // Find max values for normalization
    const maxCarbon = Math.max(...materials.map(m => m.total));
    const maxCost = Math.max(...materials.map(m => m.cost));

    // Create radar data structure
    const dimensions = [
      { name: 'RIS', key: 'ris', max: 100 },
      { name: 'Circular\nPotential', key: 'circular', max: 100 },
      { name: 'Low\nCarbon', key: 'lowCarbon', max: 100 },
      { name: 'Cost\nEfficiency', key: 'costEfficiency', max: 100 },
      { name: 'Low\nImpact', key: 'lowImpact', max: 100 },
    ];

    return dimensions.map(dim => {
      const dataPoint: any = { dimension: dim.name };
      
      selectedMaterials.forEach(material => {
        let value = 0;
        
        switch (dim.key) {
          case 'ris':
            value = material.ris;
            break;
          case 'circular':
            // Circular potential = inverse of LIS (lower LIS = higher circular potential)
            value = 100 - material.lis;
            break;
          case 'lowCarbon':
            // Normalize carbon (lower is better, so invert)
            value = 100 - ((material.total / maxCarbon) * 100);
            break;
          case 'costEfficiency':
            // Normalize cost (lower is better, so invert)
            value = 100 - ((material.cost / maxCost) * 100);
            break;
          case 'lowImpact':
            // Low impact = inverse of LIS
            value = 100 - material.lis;
            break;
        }
        
        dataPoint[material.name] = Math.max(0, Math.min(100, value));
      });
      
      return dataPoint;
    });
  };

  const radarData = getRadarData();

  // Color palette for materials
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Material Comparison Tool</CardTitle>
            <CardDescription>
              Select up to {maxComparisons} materials to compare across sustainability dimensions
            </CardDescription>
          </div>
          {selectedMaterials.length > 0 && (
            <Button
              onClick={() => setAiDialogOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Material Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">Select Materials to Compare:</h3>
          <div className="flex flex-wrap gap-2">
            {materials.map(material => {
              const isSelected = selectedMaterials.find(m => m.id === material.id);
              const isDisabled = !isSelected && selectedMaterials.length >= maxComparisons;
              
              return (
                <button
                  key={material.id}
                  onClick={() => toggleMaterial(material)}
                  disabled={isDisabled}
                  className={`px-3 py-2 text-sm rounded-md border transition-all ${
                    isSelected
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100'
                      : isDisabled
                      ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700'
                      : 'bg-white border-gray-300 hover:border-emerald-400 dark:bg-gray-900 dark:border-gray-700 dark:hover:border-emerald-600'
                  }`}
                >
                  {material.name}
                  {isSelected && ' ✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Materials Cards */}
        {selectedMaterials.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Comparing {selectedMaterials.length} Material{selectedMaterials.length > 1 ? 's' : ''}:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedMaterials.map((material, index) => (
                <div
                  key={material.id}
                  className="p-3 rounded-lg border-2 relative"
                  style={{ borderColor: colors[index] }}
                >
                  <button
                    onClick={() => removeMaterial(material.id)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <Badge className="mb-2" style={{ backgroundColor: colors[index] }}>
                    {material.category}
                  </Badge>
                  
                  <h4 className="font-semibold text-sm mb-2 pr-6">{material.name}</h4>
                  
                  <div className="space-y-1 text-xs">
                    <p><span className="text-gray-500">Carbon:</span> {material.total.toFixed(1)} kg CO₂e</p>
                    <p><span className="text-gray-500">RIS:</span> {material.ris}</p>
                    <p><span className="text-gray-500">LIS:</span> {material.lis}</p>
                    <p><span className="text-gray-500">Cost:</span> ${material.cost.toFixed(0)}/{material.functionalUnit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Radar Chart */}
        {selectedMaterials.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold mb-3">Performance Radar:</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="dimension" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                
                {selectedMaterials.map((material, index) => (
                  <Radar
                    key={material.id}
                    name={material.name}
                    dataKey={material.name}
                    stroke={colors[index]}
                    fill={colors[index]}
                    fillOpacity={0.3}
                  />
                ))}
                
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>

            {/* Dimension Explanations */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <p className="font-semibold mb-1">RIS (Regenerative Impact)</p>
                <p className="text-gray-600 dark:text-gray-400">Capacity to restore ecosystems and sequester carbon</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <p className="font-semibold mb-1">Circular Potential</p>
                <p className="text-gray-600 dark:text-gray-400">Recyclability and circular economy compatibility</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <p className="font-semibold mb-1">Low Carbon</p>
                <p className="text-gray-600 dark:text-gray-400">Minimal embodied carbon across lifecycle</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <p className="font-semibold mb-1">Cost Efficiency</p>
                <p className="text-gray-600 dark:text-gray-400">Economic competitiveness per functional unit</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 md:col-span-2">
                <p className="font-semibold mb-1">Low Impact</p>
                <p className="text-gray-600 dark:text-gray-400">Minimal environmental and health damage throughout lifecycle</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No materials selected</p>
            <p className="text-sm">Select 2-{maxComparisons} materials above to see the comparison radar chart</p>
          </div>
        )}
      </CardContent>
    </Card>

    {/* AI Assistant Dialog */}
    <AIAssistantDialog
      open={aiDialogOpen}
      onOpenChange={setAiDialogOpen}
      context={selectedMaterials.length > 0 
        ? `You are comparing ${selectedMaterials.length} materials: ${selectedMaterials.map(m => m.name).join(', ')}. Help the user understand the differences and make the best choice.`
        : undefined
      }
      initialPrompt={selectedMaterials.length === 2
        ? `Compare ${selectedMaterials[0].name} vs ${selectedMaterials[1].name}. Which is better for sustainability?`
        : undefined
      }
    />
    </>
  );
}
