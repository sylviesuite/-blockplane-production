import React from "react";
import { qual } from "@/lib/lifecycleFormatters";
export default function ScoreBadge({label, value, max=100}:{label:string; value:number; max?:number}) {
  const q = qual(value, max);
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs ${q.tone}`}>
      <span className="font-medium">{label}</span>
      <span className="font-semibold">{value} / {max}</span>
      <span>({q.label})</span>
    </span>
  );
}
