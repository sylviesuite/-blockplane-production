import React, { useMemo } from "react";
import type { PhaseKey } from "@/lib/lifecycleFormatters";
import { phaseColor } from "@/lib/lifecycleFormatters";

export type PhaseRow = { key: PhaseKey; label: string; value: number };

export default function DrawerBar({phases,total,active}:{phases:PhaseRow[]; total:number; active:PhaseKey[]}) {
  const rows = useMemo(()=>{
    let x=0;
    return phases.map(p=>{
      const w = total>0 ? (p.value/total)*100 : 0;
      const seg = { ...p, start:x, w };
      x += w;
      return seg;
    });
  },[phases,total]);
  return (
    <svg viewBox="0 0 100 12" className="w-full h-12">
      <rect x="0" y="0" width="100" height="12" rx="2" fill="#eef2f7"/>
      {rows.map(r=>{
        const dim = !active.includes(r.key);
        return (
          <g key={r.key}>
            <title>{`${r.label}: ${r.value}`}</title>
            <rect x={r.start} y={0} width={Math.max(0.0001,r.w)} height={12}
              rx="2" fill={phaseColor(r.key)} opacity={dim?0.25:1}/>
          </g>
        );
      })}
    </svg>
  );
}
