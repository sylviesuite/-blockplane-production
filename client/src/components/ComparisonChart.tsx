import { Material } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonChartProps {
  materials: Material[];
}

export default function ComparisonChart({ materials }: ComparisonChartProps) {
  if (materials.length < 2) {
    return (
      <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center">
        <p className="text-slate-800 dark:text-slate-200 font-medium">
          Select 2 or more materials to see the comparison chart
        </p>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Use the checkboxes in the table below to select materials for comparison
        </p>
      </div>
    );
  }

  const chartData = materials.map(material => ({
    name: material.name,
    'Point of Origin': material.phases.pointOfOrigin,
    'Transport': material.phases.transport,
    'Construction': material.phases.construction,
    'Production': material.phases.production,
    'Disposal': material.phases.disposal,
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
        Lifecycle Phase Comparison
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Comparing {materials.length} selected materials across all lifecycle phases (kg CO₂e)
      </p>

      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
          <XAxis type="number" unit=" kg CO₂e" style={{ fontSize: '11px' }} tick={{ fill: '#94a3b8' }} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: '#e2e8f0' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(15 23 42)',
              border: '1px solid rgb(51 65 85)',
              borderRadius: '8px',
              padding: '10px 12px',
            }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend
            layout="horizontal"
            wrapperStyle={{ paddingTop: '12px' }}
            iconType="square"
            iconSize={10}
            formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>}
          />
          <Bar dataKey="Point of Origin" stackId="a" fill="#10b981" />
          <Bar dataKey="Transport" stackId="a" fill="#3b82f6" />
          <Bar dataKey="Construction" stackId="a" fill="#f59e0b" />
          <Bar dataKey="Production" stackId="a" fill="#8b5cf6" />
          <Bar dataKey="Disposal" stackId="a" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        {materials.map((material, index) => (
          <div key={material.id} className="text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 truncate" title={material.name}>{material.name}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{material.total.toFixed(1)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">kg CO₂e total</p>
          </div>
        ))}
      </div>
    </div>
  );
}
