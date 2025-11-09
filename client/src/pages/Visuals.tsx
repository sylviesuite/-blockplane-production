import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = {
  origin: "#b08968",
  production: "#667085",
  transport: "#98a2b3",
  construction: "#f59e0b",
  disposal: "#22c55e",
  grid: "#e7e5e4",
  axis: "#78716c",
};

const data = [
  { name: "Douglas Fir\nFraming", origin: 260, production: 540, transport: 210, construction: 120, disposal: 80 },
  { name: "Concrete\nFoundation", origin: 520, production: 3200, transport: 380, construction: 700, disposal: 420 },
  { name: "Steel Rebar", origin: 980, production: 4800, transport: 420, construction: 650, disposal: 520 },
  { name: "Fiberglass\nInsulation", origin: 320, production: 980, transport: 140, construction: 220, disposal: 110 },
  { name: "Asphalt Shingles", origin: 860, production: 2200, transport: 360, construction: 540, disposal: 620 },
  { name: "Vinyl Siding", origin: 900, production: 1800, transport: 300, construction: 480, disposal: 520 },
];

function fmt(n:number){ return `${n.toLocaleString()} MJ`; }

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s:number,p:any)=>s+(p.value||0),0);
  return (
    <div className="rounded-lg border bg-white px-3 py-2 text-sm shadow">
      <div className="font-semibold mb-1">{String(label)}</div>
      <div className="space-y-0.5">
        {payload.map((p:any)=>(
          <div key={p.dataKey} className="flex items-center gap-2">
            <span style={{ width:10, height:10, borderRadius:9999, background:p.color, display:"inline-block" }} />
            <span className="text-stone-600">{p.dataKey}</span>
            <span className="ml-auto font-medium">{fmt(p.value)}</span>
          </div>
        ))}
        <div className="mt-1 pt-1 border-t text-stone-700 flex justify-between">
          <span>Total</span><span className="font-semibold">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default function Visuals(){
  return (
    <div className="container mx-auto max-w-6xl px-4 my-8">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
        <div className="px-6 pt-5">
          <h2 className="text-2xl font-semibold">Comparative Energy Breakdown</h2>
          <p className="mt-1 text-stone-600">Embodied energy by lifecycle phase (MJ). Horizontal stacked comparison.</p>
        </div>
        <div className="p-6">
          <div style={{ height: 460 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top:8, right:24, bottom:8, left:120 }}>
                <XAxis type="number" tick={{ fill: COLORS.axis }} axisLine={{ stroke: COLORS.grid }} tickLine={{ stroke: COLORS.grid }}/>
                <YAxis type="category" dataKey="name" tick={{ fill: COLORS.axis }} width={120} />
                <Tooltip content={<Tip />} />
                <Legend verticalAlign="top" height={0} />
                <Bar dataKey="origin"       stackId="a" fill={COLORS.origin}/>
                <Bar dataKey="production"   stackId="a" fill={COLORS.production}/>
                <Bar dataKey="transport"    stackId="a" fill={COLORS.transport}/>
                <Bar dataKey="construction" stackId="a" fill={COLORS.construction}/>
                <Bar dataKey="disposal"     stackId="a" fill={COLORS.disposal}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
