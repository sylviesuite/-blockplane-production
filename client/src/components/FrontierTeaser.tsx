import { useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const teal = "#0F6E56";
const amber = "#c17f24";
const text = "#1c1c1a";
const muted = "#5a5a56";
const borderSoft = "rgba(28,28,26,0.08)";

const GL_HIGH = new Set(["Timber", "Earth", "Insulation", "Landscaping"]);

function deriveRISSignal(ris: number | null): "Very High" | "High" | null {
  if (!ris) return null;
  if (ris >= 90) return "Very High";
  if (ris >= 80) return "High";
  return null;
}

const RIS_STYLE: Record<string, { bg: string; color: string }> = {
  "Very High": { bg: "#EAF3DE", color: "#27500A" },
  "High":      { bg: "#E1F5EE", color: "#085041" },
};

export function FrontierTeaser() {
  const { data: raw = [] } = trpc.materialAPI.getFrontier.useQuery();

  const top6 = useMemo(() =>
    (raw as any[])
      .filter((m) => {
        const sig = deriveRISSignal(m.risScore);
        return sig === "Very High" && GL_HIGH.has(m.category);
      })
      .slice(0, 6),
  [raw]);

  if (top6.length === 0) return null;

  return (
    <section style={{ backgroundColor: "#f5f2ec" }}>
      <div
        className="mx-auto max-w-6xl px-6 py-16"
        style={{ borderTop: `1px solid ${borderSoft}` }}
      >
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: teal }}
            >
              Frontier
            </p>
            <h2
              className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ color: text }}
            >
              Frontier materials
            </h2>
            <p className="mt-1 text-sm" style={{ color: muted }}>
              Emerging high-impact options for your next project
            </p>
          </div>
          <Link href="/frontier" className="text-sm font-medium" style={{ color: amber }}>
            View all →
          </Link>
        </div>

        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: "rgba(28,28,26,0.03)",
            border: `1px solid ${borderSoft}`,
          }}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {top6.map((m: any) => {
              const sig = deriveRISSignal(m.risScore);
              const badge = sig ? RIS_STYLE[sig] : null;
              return (
                <Link key={m.id} href={`/materials/${m.id}`}>
                  <div
                    className="cursor-pointer rounded-md p-3 transition-shadow hover:shadow-sm"
                    style={{ backgroundColor: "white", border: `1px solid ${borderSoft}` }}
                  >
                    <p
                      className="mb-1.5 text-xs font-medium leading-snug"
                      style={{ color: text }}
                    >
                      {m.name}
                    </p>
                    {badge && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: badge.bg, color: badge.color }}
                      >
                        {sig} RIS
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
