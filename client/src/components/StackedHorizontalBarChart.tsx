/**
 * Stacked Horizontal Bar Chart
 * 
 * Displays lifecycle carbon breakdown across multiple materials
 * with color-coded phases in a horizontal stacked bar format
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
  description = 'Phases: Point of Origin → Production → Transport → Construction → Disposal',
  maxMaterials = 10,
}: StackedHorizontalBarChartProps) {
  // Transform materials data for Recharts
  const chartData = materials.slice(0, maxMaterials).map(material => {
    // Get lifecycle values from the material
    const lifecycleData: Record<string, number> = {
      name: material.name,
    };

    // Map our database phases to chart phases
    // Assuming material has lifecycle values stored
    if (material.a1_a3 !== undefined) {
      lifecycleData['A1-A3'] = material.a1_a3;
    }
    if (material.a4 !== undefined) {
      lifecycleData['A4'] = material.a4;
    }
    if (material.a5 !== undefined) {
      lifecycleData['A5'] = material.a5;
    }
    if (material.b !== undefined) {
      lifecycleData['B'] = material.b;
    }
    if (material.c1_c4 !== undefined) {
      lifecycleData['C1-C4'] = material.c1_c4;
    }

    return lifecycleData;
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold mb-2">{label}</p>
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
        </div>
      );
    }
    return null;
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full" style={{ height: Math.max(400, materials.length * 60) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
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
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="A4" 
                stackId="a" 
                fill={PHASE_COLORS['A4']}
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="A5" 
                stackId="a" 
                fill={PHASE_COLORS['A5']}
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="B" 
                stackId="a" 
                fill={PHASE_COLORS['B']}
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="C1-C4" 
                stackId="a" 
                fill={PHASE_COLORS['C1-C4']}
                radius={[0, 4, 4, 0]}
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
  );
}
