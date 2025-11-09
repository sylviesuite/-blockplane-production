/**
 * Quadrant Visualization Component
 * 
 * Interactive scatter plot showing materials positioned by RIS vs LIS scores
 * with color-coded quadrants for sustainability classification
 */

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import type { Material } from '../types';

interface QuadrantVisualizationProps {
  materials: Material[];
  onMaterialClick?: (material: Material) => void;
}

export function QuadrantVisualization({ materials, onMaterialClick }: QuadrantVisualizationProps) {
  // Transform materials for scatter plot
  const scatterData = materials.map(m => ({
    x: m.lis, // Life Impact Score (x-axis)
    y: m.ris, // Regenerative Impact Score (y-axis)
    name: m.name,
    category: m.category,
    material: m,
  }));

  // Determine quadrant color based on RIS/LIS
  const getQuadrantColor = (ris: number, lis: number) => {
    // Regenerative: High RIS (>60) + Low LIS (<40)
    if (ris > 60 && lis < 40) return '#10b981'; // emerald-500
    
    // Linear: Low RIS (<40) + High LIS (>60)
    if (ris < 40 && lis > 60) return '#ef4444'; // red-500
    
    // Transitional (positive): Medium-High RIS + Medium LIS
    if (ris >= 40 && lis <= 60) return '#f59e0b'; // amber-500
    
    // Transitional (negative): Low-Medium RIS + Medium-High LIS
    return '#f97316'; // orange-500
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const material: Material = data.material;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-sm mb-1">{material.name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{material.category}</p>
          <div className="space-y-1 text-xs">
            <p><span className="font-medium">RIS:</span> {material.ris}</p>
            <p><span className="font-medium">LIS:</span> {material.lis}</p>
            <p><span className="font-medium">Carbon:</span> {material.total.toFixed(1)} kg CO₂e</p>
            <p><span className="font-medium">Cost:</span> ${material.cost.toFixed(0)}/{material.functionalUnit}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Material Sustainability Quadrants</CardTitle>
        <CardDescription>
          Materials plotted by Regenerative Impact (RIS) vs Life Impact (LIS). 
          Click any point to see details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span>Regenerative (High RIS, Low LIS)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Transitional (Balanced)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Linear (Low RIS, High LIS)</span>
          </div>
        </div>

        {/* Scatter Plot */}
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            {/* Background quadrants */}
            <defs>
              <pattern id="regenerative" patternUnits="userSpaceOnUse" width="10" height="10">
                <rect width="10" height="10" fill="#10b98110" />
              </pattern>
              <pattern id="linear" patternUnits="userSpaceOnUse" width="10" height="10">
                <rect width="10" height="10" fill="#ef444410" />
              </pattern>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            {/* Axes */}
            <XAxis 
              type="number" 
              dataKey="x" 
              name="LIS" 
              domain={[0, 100]}
              label={{ value: 'Life Impact Score (LIS) →', position: 'bottom', offset: 40 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="RIS" 
              domain={[0, 100]}
              label={{ value: '← Regenerative Impact Score (RIS)', angle: -90, position: 'left', offset: 40 }}
            />

            {/* Reference lines for quadrants */}
            <ReferenceLine x={50} stroke="#9ca3af" strokeDasharray="5 5" />
            <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="5 5" />

            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

            {/* Scatter points */}
            <Scatter
              data={scatterData}
              onClick={(data) => onMaterialClick && onMaterialClick(data.material)}
              style={{ cursor: 'pointer' }}
            >
              {scatterData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getQuadrantColor(entry.y, entry.x)}
                  r={8}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Quadrant descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
              🌱 Regenerative Quadrant
            </h4>
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              High regenerative potential with low environmental impact. These materials actively restore ecosystems.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              ⚡ Transitional Quadrant
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Balanced materials moving toward sustainability. Room for improvement in either regeneration or impact reduction.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
              ⚠️ Linear Quadrant
            </h4>
            <p className="text-sm text-red-800 dark:text-red-200">
              High environmental impact with minimal regenerative benefits. Consider alternatives when possible.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              📊 How to Read
            </h4>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              Top-left corner = Best (high RIS, low LIS). Bottom-right = Worst (low RIS, high LIS). Size represents carbon footprint.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
