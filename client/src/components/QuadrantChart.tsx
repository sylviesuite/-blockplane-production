import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Label } from "recharts";
import { Material } from "../types";

interface QuadrantChartProps {
  materials: Material[];
  onMaterialClick?: (material: Material) => void;
}

const QUADRANT_COLORS = {
  Regenerative: "#22c55e",  // Green
  Costly: "#eab308",        // Yellow
  Transitional: "#3b82f6", // Blue
  Problematic: "#ef4444",   // Red
};

const QUADRANT_LABELS = {
  Regenerative: { x: 75, y: 75, text: "Regenerative\n(Best Choice)" },
  Costly: { x: 75, y: 25, text: "Costly\n(Low Impact, Not Regenerative)" },
  Transitional: { x: 25, y: 75, text: "Transitional\n(High Impact, Some Benefits)" },
  Problematic: { x: 25, y: 25, text: "Problematic\n(Worst Choice)" },
};

export function QuadrantChart({ materials, onMaterialClick }: QuadrantChartProps) {
  // Transform materials into scatter plot data
  const data = materials
    .filter(m => m.scores)
    .map(m => ({
      material: m,
      lis: m.scores!.lis,
      ris: m.scores!.ris,
      name: m.name,
      quadrant: getQuadrant(m.scores!.lis, m.scores!.ris),
    }));

  function getQuadrant(lis: number, ris: number): keyof typeof QUADRANT_COLORS {
    if (lis >= 50 && ris >= 50) return "Regenerative";
    if (lis >= 50 && ris < 50) return "Costly";
    if (lis < 50 && ris >= 50) return "Transitional";
    return "Problematic";
  }

  return (
    <div className="w-full h-[500px] bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Material Quadrant Analysis</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          
          <XAxis 
            type="number" 
            dataKey="lis" 
            domain={[0, 100]} 
            name="LIS"
            label={{ value: "LIS (Lifecycle Impact Score)", position: "bottom", offset: 40 }}
          />
          
          <YAxis 
            type="number" 
            dataKey="ris" 
            domain={[0, 100]} 
            name="RIS"
            label={{ value: "RIS (Regenerative Impact Score)", angle: -90, position: "left", offset: 40 }}
          />
          
          {/* Quadrant dividing lines */}
          <ReferenceLine x={50} stroke="#666" strokeWidth={2} strokeDasharray="5 5" />
          <ReferenceLine y={50} stroke="#666" strokeWidth={2} strokeDasharray="5 5" />
          
          <Tooltip 
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm">LIS: {data.lis}</p>
                    <p className="text-sm">RIS: {data.ris}</p>
                    <p className="text-sm font-medium mt-1" style={{ color: QUADRANT_COLORS[data.quadrant] }}>
                      {data.quadrant}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Scatter 
            data={data} 
            onClick={(data) => onMaterialClick?.(data.material)}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={QUADRANT_COLORS[entry.quadrant]}
                r={8}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {Object.entries(QUADRANT_COLORS).map(([quadrant, color]) => (
          <div key={quadrant} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span>{quadrant}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
