/**
 * Stacked Horizontal Bar Chart
 * 
 * Displays lifecycle carbon breakdown across multiple materials
 * with color-coded phases in a horizontal stacked bar format
 * Now with interactive material selection and side-by-side comparison!
 */

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, ArrowLeftRight, TrendingDown } from 'lucide-react';
import type { Material } from '../types';

interface StackedHorizontalBarChartProps {
  materials: Material[];
  title?: string;
  description?: string;
  maxMaterials?: number;
}

// Phase colors matching the reference image
const PHASE_COLORS = {
  'A1-A3': '#8B7355', // Brown - Point of Origin/Production
  'A4': '#5B7C99',    // Blue - Transport
  'A5': '#9CA3AF',    // Gray - Construction
  'B': '#F59E0B',     // Orange - Use/Maintenance
  'C1-C4': '#10B981', // Green - End of Life/Disposal
};

const PHASE_LABELS = {
  'A1-A3': 'Production',
  'A4': 'Transport',
  'A5': 'Construction',
  'B': 'Use',
  'C1-C4': 'End of Life',
};

export function StackedHorizontalBarChart({
  materials,
  title = 'Lifecycle Carbon Breakdown',
  description = 'Click on materials to compare side-by-side',
  maxMaterials = 10,
}: StackedHorizontalBarChartProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);

  // Transform materials data for Recharts
  const chartData = materials.slice(0, maxMaterials).map(material => {
    const lifecycleData: Record<string, any> = {
      name: material.name,
      id: material.id,
    };

    // Map our database phases to chart phases
    if (material.a1_a3 !== undefined) lifecycleData['A1-A3'] = material.a1_a3;
    if (material.a4 !== undefined) lifecycleData['A4'] = material.a4;
    if (material.a5 !== undefined) lifecycleData['A5'] = material.a5;
    if (material.b !== undefined) lifecycleData['B'] = material.b;
    if (material.c1_c4 !== undefined) lifecycleData['C1-C4'] = material.c1_c4;

    return lifecycleData;
  });

  // Handle bar click for material selection
  const handleBarClick = (data: any) => {
    const materialId = data.id;
    const material = materials.find(m => m.id === materialId);
    
    if (!material) return;

    setSelectedMaterials(prev => {
      // If already selected, deselect
      if (prev.find(m => m.id === materialId)) {
        return prev.filter(m => m.id !== materialId);
      }
      
      // If 2 already selected, replace the first one
      if (prev.length >= 2) {
        return [prev[1], material];
      }
      
      // Add to selection
      return [...prev, material];
    });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      const isSelected = selectedMaterials.find(m => m.name === label);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold">{label}</p>
            {isSelected && <Badge variant="default" className="text-xs">Selected</Badge>}
          </div>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{PHASE_LABELS[entry.dataKey as keyof typeof PHASE_LABELS] || entry.dataKey}:</span>
                </div>
                <span className="font-semibold">{entry.value.toFixed(1)} kg CO₂e</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm font-bold">
              <span>Total:</span>
              <span>{total.toFixed(1)} kg CO₂e</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click to {isSelected ? 'deselect' : 'select'} for comparison</p>
        </div>
      );
    }
    return null;
  };

  // Custom bar component with selection highlighting
  const CustomBar = (props: any) => {
    const { fill, x, y, width, height, payload } = props;
    const isSelected = selectedMaterials.find(m => m.name === payload.name);
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          opacity={isSelected ? 1 : 0.7}
          stroke={isSelected ? '#6366f1' : 'none'}
          strokeWidth={isSelected ? 2 : 0}
          style={{ cursor: 'pointer' }}
        />
      </g>
    );
  };

  if (materials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>No materials data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {selectedMaterials.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMaterials([])}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Selection ({selectedMaterials.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full" style={{ height: Math.max(400, materials.length * 60) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                onClick={(data) => data && data.activePayload && handleBarClick(data.activePayload[0].payload)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'kg CO₂e', position: 'insideBottom', offset: -10, fill: '#6b7280' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#6b7280"
                  tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                  width={110}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => PHASE_LABELS[value as keyof typeof PHASE_LABELS] || value}
                />
                
                {/* Stacked bars for each phase */}
                <Bar 
                  dataKey="A1-A3" 
                  stackId="a" 
                  fill={PHASE_COLORS['A1-A3']}
                  shape={<CustomBar />}
                  style={{ cursor: 'pointer' }}
                />
                <Bar 
                  dataKey="A4" 
                  stackId="a" 
                  fill={PHASE_COLORS['A4']}
                  shape={<CustomBar />}
                  style={{ cursor: 'pointer' }}
                />
                <Bar 
                  dataKey="A5" 
                  stackId="a" 
                  fill={PHASE_COLORS['A5']}
                  shape={<CustomBar />}
                  style={{ cursor: 'pointer' }}
                />
                <Bar 
                  dataKey="B" 
                  stackId="a" 
                  fill={PHASE_COLORS['B']}
                  shape={<CustomBar />}
                  style={{ cursor: 'pointer' }}
                />
                <Bar 
                  dataKey="C1-C4" 
                  stackId="a" 
                  fill={PHASE_COLORS['C1-C4']}
                  shape={<CustomBar />}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(PHASE_LABELS).map(([key, label]) => {
              const total = chartData.reduce((sum, material) => sum + (material[key] || 0), 0);
              const avg = total / chartData.length;
              
              return (
                <div key={key} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: PHASE_COLORS[key as keyof typeof PHASE_COLORS] }}
                    />
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</p>
                  </div>
                  <p className="text-sm font-semibold">{avg.toFixed(1)} kg CO₂e</p>
                  <p className="text-xs text-gray-500">avg per material</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison Panel */}
      {selectedMaterials.length === 2 && (
        <Card className="mt-6 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
              Side-by-Side Comparison
            </CardTitle>
            <CardDescription>
              Detailed phase-by-phase breakdown and carbon savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedMaterials.map((material, index) => (
                <div key={material.id} className="space-y-4">
                  {/* Material Header */}
                  <div className="pb-3 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{material.name}</h3>
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        Material {index + 1}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {material.category} • {material.functionalUnit}
                    </p>
                    <p className="text-2xl font-bold mt-2">
                      {material.total.toFixed(1)} <span className="text-sm font-normal">kg CO₂e total</span>
                    </p>
                  </div>

                  {/* Phase Breakdown */}
                  <div className="space-y-2">
                    {Object.entries(PHASE_LABELS).map(([key, label]) => {
                      const value = material[key.toLowerCase().replace(/-/g, '_') as keyof Material] as number || 0;
                      const percentage = (value / material.total) * 100;
                      
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{label}</span>
                            <span className="font-semibold">{value.toFixed(1)} kg CO₂e</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: PHASE_COLORS[key as keyof typeof PHASE_COLORS]
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{percentage.toFixed(1)}% of total</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Carbon Savings Analysis */}
            <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Carbon Savings Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-1">
                    Switching from <strong>{selectedMaterials[0].name}</strong> to <strong>{selectedMaterials[1].name}</strong>:
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {selectedMaterials[0].total > selectedMaterials[1].total ? '-' : '+'}
                    {Math.abs(selectedMaterials[0].total - selectedMaterials[1].total).toFixed(1)} kg CO₂e
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {((Math.abs(selectedMaterials[0].total - selectedMaterials[1].total) / selectedMaterials[0].total) * 100).toFixed(1)}% 
                    {selectedMaterials[0].total > selectedMaterials[1].total ? ' reduction' : ' increase'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-1">
                    Cost Difference:
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {selectedMaterials[0].cost > selectedMaterials[1].cost ? '-' : '+'}
                    ${Math.abs(selectedMaterials[0].cost - selectedMaterials[1].cost).toFixed(2)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    per {selectedMaterials[0].functionalUnit}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
