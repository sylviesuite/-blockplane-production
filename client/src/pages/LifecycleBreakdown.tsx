import React, { useMemo, useState } from "react";
import BreakdownTable from "../components/BreakdownTable";
import { useMaterials } from "../hooks/useMaterials";

/* ===========================
   Types & Mock Data (replace)
   =========================== */
type PhaseKey = "production" | "transport" | "construction" | "maintenance" | "endOfLife";

type Phase = { key: PhaseKey; label: string; value: number };
type Material = {
  id: string;
  name: string;
  category: string;
  region: string;
  total: number;       // in kg CO₂e
  unit: string;        // "kg CO₂e"
  phases: Phase[];
  ris?: number;        // 0–100
  lis?: number;        // 0–100
  epdId?: string;
  dataset?: string;
};

const MOCK: Material[] = [
  {
    id: "1",
    name: "Rammed Earth",
    category: "Earth",
    region: "PNW",
    total: 820,
    unit: "kg CO₂e",
    phases: [
      { key: "production", label: "Production", value: 320 },
      { key: "transport", label: "Transport", value: 80 },
      { key: "construction", label: "Construction", value: 210 },
      { key: "maintenance", label: "Maintenance", value: 100 },
      { key: "endOfLife", label: "End of Life", value: 110 }
    ],
    ris: 65,
    lis: 52,
    epdId: "EPD-123",
    dataset: "EC3"
  },
  {
    id: "2",
    name: '2x6 Wall',
    category: "Wood",
    region: "PNW",
    total: 1250,
    unit: "kg CO₂e",
    phases: [
      { key: "production", label: "Production", value: 600 },
      { key: "transport", label: "Transport", value: 160 },
      { key: "construction", label: "Construction", value: 280 },
      { key: "maintenance", label: "Maintenance", value: 120 },
      { key: "endOfLife", label: "End of Life", value: 90 }
    ],
    ris: 48,
    lis: 61,
    epdId: "EPD-456",
    dataset: "UL SPOT"
  },
  {
    id: "3",
    name: 'Hempcrete (6" infill)',
    category: "Bio-based",
    region: "PNW",
    total: 540,
    unit: "kg CO₂e",
    phases: [
      { key: "production", label: "Production", value: 200 },
      { key: "transport", label: "Transport", value: 70 },
      { key: "construction", label: "Construction", value: 140 },
      { key: "maintenance", label: "Maintenance", value: 80 },
      { key: "endOfLife", label: "End of Life", value: 50 }
    ],
    ris: 72
  },
  {
    id: "4",
    name: 'Drywall 4x8 (1/2")',
    category: "Mineral",
    region: "PNW",
    total: 550,
    unit: "kg CO₂e",
    phases: [
      { key: "production", label: "Production", value: 230 },
      { key: "transport", label: "Transport", value: 80 },
      { key: "construction", label: "Construction", value: 140 },
      { key: "maintenance", label: "Maintenance", value: 70 },
      { key: "endOfLife", label: "End of Life", value: 30 }
    ],
    lis: 58
  }
];

/* ===========================
   Helpers (palette, units, csv)
   =========================== */
const PHASES: { key: PhaseKey; label: string }[] = [
  { key: "production", label: "Production" },
  { key: "transport", label: "Transport" },
  { key: "construction", label: "Construction" },
  { key: "maintenance", label: "Maintenance" },
  { key: "endOfLife", label: "End of Life" },
];

const phaseColor = (k: PhaseKey) => ({
  production:   "var(--phase-prod, #1e3a8a)",
  transport:    "var(--phase-trans, #0e7490)",
  construction: "var(--phase-const, #047857)",
  maintenance:  "var(--phase-main, #a16207)",
  endOfLife:    "var(--phase-eol, #9f1239)",
}[k]);

function fmtUnit(val: number, unit: string) {
  const clean = unit.replace(/Ω/g, "g"); // defense against kΩ typo
  const isKg = /kg\s*CO₂e/i.test(clean) || /kg\s*CO2e/i.test(clean);
  if (isKg) {
    if (val >= 1000) return { value: +(val/1000).toFixed(2), unit: "t CO₂e" };
    return { value: +val.toFixed(2), unit: "kg CO₂e" };
  }
  return { value: +val.toFixed(2), unit: clean };
}

function qual(value: number, max=100) {
  const p = value/max;
  if (p >= 0.7) return { label: "High", tone: "bg-emerald-100 text-emerald-800" };
  if (p >= 0.4) return { label: "Medium", tone: "bg-amber-100 text-amber-800" };
  return { label: "Low", tone: "bg-rose-100 text-rose-800" };
}

function exportLifecycleCSV(rows: Material[]) {
  const headers = ["id","name","category","region","total","unit","phase","phase_value"];
  const out = [headers.join(",")];
  for (const r of rows) {
    for (const p of r.phases) {
      out.push([r.id, q(r.name), q(r.category), q(r.region), r.total, q(r.unit), q(p.label), p.value].join(","));
    }
  }
  const blob = new Blob([out.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "lifecycle_export.csv"; a.click();
  URL.revokeObjectURL(a.href);
}
const q = (s: string) => /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;

/* ===========================
   Reusable UI bits (inline)
   =========================== */
const ScoreBadge: React.FC<{label:string; value:number; max?:number}> = ({label, value, max=100}) => {
  const ql = qual(value, max);
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs ${ql.tone}`}>
      <span className="font-medium">{label}</span>
      <span className="font-semibold">{value} / {max}</span>
      <span>({ql.label})</span>
    </span>
  );
};

const Legend: React.FC<{active: PhaseKey[]; onToggle:(k:PhaseKey)=>void}> = ({active, onToggle}) => (
  <div className="flex flex-wrap gap-3">
    {PHASES.map(p=>{
      const on = active.includes(p.key);
      return (
        <button key={p.key} onClick={()=>onToggle(p.key)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition
                     ${on?"bg-white/80 shadow border-slate-300":"bg-slate-50 border-slate-200 opacity-70 hover:opacity-100"}`}
        >
          <span className="h-2 w-2 rounded-full" style={{background: phaseColor(p.key)}} />
          <span className="font-medium">{p.label}</span>
        </button>
      );
    })}
  </div>
);

const MicroStack: React.FC<{phases: Phase[]; total: number; active: PhaseKey[]}> = ({phases, total, active}) => (
  <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
    <div className="flex h-full">
      {phases.map(p => {
        const w = total > 0 ? (p.value/total)*100 : 0;
        const dim = !active.includes(p.key);
        return <div key={p.key} style={{width:`${w}%`, background: phaseColor(p.key), opacity: dim ? 0.25 : 1}} />;
      })}
    </div>
  </div>
);

const DrawerBar: React.FC<{phases: Phase[]; total:number; active:PhaseKey[]}> = ({phases,total,active}) => {
  let x=0;
  const rows = phases.map(p => {
    const w = total>0 ? (p.value/total)*100 : 0;
    const seg = { ...p, start:x, w }; x += w; return seg;
  });
  return (
    <svg viewBox="0 0 100 12" className="w-full h-12">
      <rect x="0" y="0" width="100" height="12" rx="2" fill="#eef2f7"/>
      {rows.map(r => {
        const dim = !active.includes(r.key);
        return (
          <g key={r.key}>
            <title>{`${r.label}: ${r.value}`}</title>
            <rect x={r.start} y={0} width={Math.max(0.0001,r.w)} height={12}
              rx="2" fill={phaseColor(r.key)} opacity={dim ? 0.25 : 1} />
          </g>
        );
      })}
    </svg>
  );
};

const TileCard: React.FC<{
  material: Material; active: PhaseKey[]; onOpen: (m:Material)=>void;
}> = ({ material, active, onOpen }) => {
  const { value, unit } = fmtUnit(material.total, material.unit);
  return (
    <button type="button" onClick={()=>onOpen(material)}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{material.name}</h3>
          <p className="text-xs text-slate-600 mt-1">{material.category} · {material.region}</p>
        </div>
        <span className="text-xs text-emerald-700 font-medium opacity-80">CO₂e</span>
      </div>

      <div className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
        {value} <span className="text-sm font-semibold text-slate-600">{unit}</span>
      </div>

      <div className="mt-3">
        <MicroStack phases={material.phases} total={material.total} active={active}/>
      </div>

      <div className="mt-3 text-sm text-emerald-800 font-medium opacity-0 group-hover:opacity-100 transition">
        Details →
      </div>
    </button>
  );
};

/* ===========================
   Page Component (default)
   =========================== */
export default function LifecycleBreakdown() {
  const { materials: realMaterials, loading, error } = useMaterials();
  const [materials] = useState<Material[]>(MOCK);
  const [activePhases, setActivePhases] = useState<PhaseKey[]>(PHASES.map(p=>p.key));
  const [detail, setDetail] = useState<Material | null>(null);
  const togglePhase = (k: PhaseKey) =>
    setActivePhases(prev => prev.includes(k) ? prev.filter(x=>x!==k) : [...prev, k]);

  const onExportAll = () => exportLifecycleCSV(materials);

  const grid = useMemo(() => materials, [materials]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-10">
      {/* Hero row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Lifecycle Breakdown</h1>
          <p className="text-sm text-slate-600 mt-1">Compact tiles + focused detail drawer. Toggle phases to filter.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onExportAll} className="rounded-md border px-3 py-1.5 text-sm hover:bg-white">Export Data</button>
        </div>
      </div>

      {/* Phase pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {PHASES.map(p=>{
          const on = activePhases.includes(p.key);
          return (
            <button key={p.key} onClick={()=>togglePhase(p.key)}
              className={`rounded-full px-3 py-1 text-xs border transition ${on ? "bg-white shadow border-slate-300" : "bg-slate-50 border-slate-200 opacity-70 hover:opacity-100"}`}>
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Detailed Breakdown Table */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Detailed Phase Breakdown</h2>
        <BreakdownTable materials={realMaterials || []} />
      </div>

      {/* Tiles */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {grid.map(m => (
          <TileCard key={m.id} material={m} active={activePhases} onOpen={setDetail}/>
        ))}
      </div>

      {/* Drawer */}
      {detail && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setDetail(null)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[560px] bg-white shadow-2xl p-6 overflow-y-auto transition duration-200 ease-out">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{detail.name}</h2>
                <p className="text-xs text-slate-600 mt-1">{detail.category} · {detail.region}</p>
              </div>
              <button onClick={()=>setDetail(null)} className="rounded-full border px-3 py-1 text-xs hover:bg-slate-50">Close</button>
            </div>

            {(() => {
              const { value, unit } = fmtUnit(detail.total, detail.unit);
              return (
                <div className="mt-4">
                  <div className="text-3xl font-extrabold text-slate-900">
                    {value} <span className="text-sm font-semibold text-slate-600">{unit}</span>
                  </div>
                  <div className="mt-1 text-xs text-emerald-700 font-medium">CO₂e</div>
                </div>
              );
            })()}

            <div className="mt-6 space-y-4">
              <Legend active={activePhases} onToggle={togglePhase}/>
              <DrawerBar phases={detail.phases} total={detail.total} active={activePhases}/>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {typeof detail.ris === "number" && <ScoreBadge label="RIS" value={detail.ris} />}
              {typeof detail.lis === "number" && <ScoreBadge label="LIS" value={detail.lis} />}
            </div>

            <div className="mt-6 rounded-lg border p-4 bg-slate-50">
              <div className="text-sm font-semibold text-slate-800">Data Source</div>
              <div className="mt-1 text-sm text-slate-700">
                {detail.epdId ? <>EPD: <span className="font-mono">{detail.epdId}</span></> : "EPD: —"}
                {detail.dataset ? <> · Dataset: <span className="font-mono">{detail.dataset}</span></> : null}
                {detail.region ? <> · Region: {detail.region}</> : null}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={()=>exportLifecycleCSV([detail])}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
                >
                  Export Data
                </button>
                <button className="rounded-md bg-emerald-600 text-white px-3 py-1.5 text-sm hover:bg-emerald-700">
                  View Source
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 flex items-center justify-between border-t pt-4 text-sm text-slate-600">
        <span>Lifecycle Breakdown — Compact Tiles + Focused Detail Drawer</span>
        <div className="flex gap-4">
          <a className="hover:underline" href="#">Docs</a>
          <a className="hover:underline" href="#">Methodology</a>
          <a className="hover:underline" href="#">Support</a>
        </div>
      </div>
    </div>
  );
}