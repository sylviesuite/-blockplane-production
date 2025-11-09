import React from "react";
import { PHASES, phaseColor } from "@/lib/lifecycleFormatters";
import type { PhaseKey } from "@/lib/lifecycleFormatters";
export default function Legend({active, onToggle}:{active:PhaseKey[]; onToggle:(k:PhaseKey)=>void}) {
  return (
    <div className="flex flex-wrap gap-3">
      {PHASES.map(p=>{
        const on = active.includes(p.key as PhaseKey);
        return (
          <button key={p.key} onClick={()=>onToggle(p.key as PhaseKey)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition
                        ${on?"bg-white/80 shadow border-slate-300":"bg-slate-50 border-slate-200 opacity-70 hover:opacity-100"}`}
          >
            <span className="h-2 w-2 rounded-full" style={{background: phaseColor(p.key as PhaseKey)}} />
            <span className="font-medium">{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}
