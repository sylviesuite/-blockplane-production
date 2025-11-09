import { Material } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonChartProps {
  materials: Material[];
}

export default function ComparisonChart({ materials }: ComparisonChartProps) {
  if (materials.length < 2) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-800 font-medium">
          Select 2 or more materials to see the comparison chart
        </p>
        <p className="text-blue-600 text-sm mt-1">
          Use the checkboxes in the table below to select materials for comparison
        </p>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = materials.map(material => ({
    name: material.name.length > 20 ? material.name.substring(0, 20) + '...' : material.name,
    'Point of Origin': material.phases.pointOfOrigin,
    'Transport': material.phases.transport,
    'Construction': material.phases.construction,
    'Production': material.phases.production,
    'Disposal': material.phases.disposal,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Lifecycle Phase Comparison
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Comparing {materials.length} selected materials across all lifecycle phases (kg CO₂e)
      </p>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }}
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          <Bar dataKey="Point of Origin" stackId="a" fill="#10b981" />
          <Bar dataKey="Transport" stackId="a" fill="#3b82f6" />
          <Bar dataKey="Construction" stackId="a" fill="#f59e0b" />
          <Bar dataKey="Production" stackId="a" fill="#8b5cf6" />
          <Bar dataKey="Disposal" stackId="a" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200">
        {materials.map((material, index) => (
          <div key={index} className="text-center">
            <p className="text-xs text-gray-600 mb-1">{material.name}</p>
            <p className="text-2xl font-bold text-gray-900">{material.total.toFixed(1)}</p>
            <p className="text-xs text-gray-500">kg CO₂e total</p>
          </div>
        ))}
      </div>
    </div>
  );
}
