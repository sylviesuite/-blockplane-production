import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { RISComponents } from "../types";

interface RISRadarChartProps {
  risComponents: RISComponents;
  materialName?: string;
}

export function RISRadarChart({ risComponents, materialName }: RISRadarChartProps) {
  const data = [
    {
      component: "Carbon Recovery",
      value: risComponents.carbonRecovery,
      fullMark: 100,
    },
    {
      component: "Durability",
      value: risComponents.durability,
      fullMark: 100,
    },
    {
      component: "Circularity",
      value: risComponents.circularity,
      fullMark: 100,
    },
    {
      component: "Material Health",
      value: risComponents.materialHealth,
      fullMark: 100,
    },
    {
      component: "Biodiversity",
      value: risComponents.biodiversity,
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full h-[400px] bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">
        RIS Component Breakdown {materialName && `- ${materialName}`}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="component" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar 
            name="RIS Score" 
            dataKey="value" 
            stroke="#22c55e" 
            fill="#22c55e" 
            fillOpacity={0.6} 
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Component scores list */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {data.map((item) => (
          <div key={item.component} className="flex justify-between">
            <span className="text-gray-600">{item.component}:</span>
            <span className="font-medium">{item.value}/100</span>
          </div>
        ))}
      </div>
    </div>
  );
}
