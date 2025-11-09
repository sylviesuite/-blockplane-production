import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Info } from "lucide-react";

type MACData = {
  name: string;
  mac: number;
  co2Reduction: number;
};

type MACCurveModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: MACData[];
};

export function MACCurveModal({ open, onOpenChange, data }: MACCurveModalProps) {
  const sortedData = [...data].sort((a, b) => a.mac - b.mac);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] overflow-y-auto"
        style={{ 
          background: 'var(--canvas)', 
          borderColor: 'var(--ring-lifecycle)' 
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--text)' }}>
            Marginal Abatement Cost (MAC) Curve
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div 
            className="flex items-start gap-2 p-3 rounded-lg border"
            style={{ 
              background: 'var(--legend-pill)', 
              borderColor: 'var(--ring-lifecycle)' 
            }}
          >
            <Info className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--text-sub)' }} />
            <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
              <strong>MAC ($/tCO₂e)</strong> = (Material Cost - Baseline Cost) / (Baseline CO₂e - Material CO₂e).
              Negative MAC values (green) indicate cost savings with lower emissions. 
              Positive values indicate higher cost but lower emissions.
            </p>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: 'var(--text)', fontSize: 12 }}
                />
                <YAxis 
                  label={{ 
                    value: '$/tCO₂e', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'var(--text)' }
                  }}
                  tick={{ fill: 'var(--text-sub)', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--canvas)',
                    border: '1px solid var(--ring-lifecycle)',
                    borderRadius: '8px',
                    color: 'var(--text)'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}/tCO₂e`, 'MAC']}
                />
                <Bar dataKey="mac" radius={[4, 4, 0, 0]}>
                  {sortedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.mac <= 0 ? '#10b981' : 'var(--phase-prod)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--ring-lifecycle)' }}>
            <div>
              <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text)' }}>
                Cost-Saving Options (MAC ≤ 0)
              </h4>
              <ul className="space-y-1">
                {sortedData.filter(d => d.mac <= 0).map(d => (
                  <li key={d.name} className="text-sm flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#10b981]" />
                    <span style={{ color: 'var(--text-sub)' }}>
                      {d.name}: <strong>${d.mac.toFixed(2)}</strong>/tCO₂e
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text)' }}>
                Cost-Incurring Options (MAC &gt; 0)
              </h4>
              <ul className="space-y-1">
                {sortedData.filter(d => d.mac > 0).map(d => (
                  <li key={d.name} className="text-sm flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--phase-prod)' }} />
                    <span style={{ color: 'var(--text-sub)' }}>
                      {d.name}: <strong>${d.mac.toFixed(2)}</strong>/tCO₂e
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
