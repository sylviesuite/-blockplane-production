import React from "react";

type PhaseKey = "pointOfOrigin" | "production" | "transport" | "construction" | "disposal";
export type LifecycleDatum = { label: string; phases: Record<PhaseKey, number> };

export default function LifecycleBar({ data }: { data: LifecycleDatum[] }) {
  return (
    <div className="space-y-3">
      {data.map((row) => {
        const total = Object.values(row.phases).reduce((a,b)=>a+b,0) || 1;
        return (
          <div key={row.label}>
            <div className="text-sm font-medium mb-1">{row.label} — {total.toFixed(2)}</div>
            <div className="flex h-4 rounded overflow-hidden border">
              {Object.entries(row.phases).map(([k,v]) => (
                <div key={k} style={{ width: `${(v/total)*100}%` }} title={`${k}: ${v}`}>
                  <div className="h-full" />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
