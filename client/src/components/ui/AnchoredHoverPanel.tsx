import React from "react";

type Line = { label: string; value: number; colorClass: string; key: string };

export function AnchoredHoverPanel({
  visible,
  top,
  left,
  lines,
  title,
  activeKey,
  width = 320,
}: {
  visible: boolean;
  top: number;    // y in px relative to container
  left: number;   // x in px relative to container (panel center)
  title: string;
  lines: Line[];
  activeKey?: string;
  width?: number;
}) {
  if (!visible) return null;
  const half = width / 2;
  const panelLeft = Math.max(16, left - half);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: panelLeft,
        width,
        pointerEvents: "none",
        transition: "opacity 120ms ease, transform 120ms ease",
      }}
      className="bg-white/95 backdrop-blur rounded-xl shadow-lg border p-3"
    >
      <div className="font-semibold mb-2">{title}</div>
      <ul className="space-y-1 text-sm">
        {lines.map((l) => (
          <li
            key={l.key}
            className={`flex items-center gap-2 ${activeKey === l.key ? "font-semibold" : "opacity-80"}`}
          >
            <span className={`inline-block w-3 h-3 rounded-full ${l.colorClass}`} />
            <span className="grow">{l.label}</span>
            <span>{new Intl.NumberFormat().format(l.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
