import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const forest = "#1a2e1f";
const cream = "#f5f2ec";
const amber = "#c17f24";
const borderOnDark = "rgba(245,242,236,0.12)";

type RISMedal = "gold" | "silver" | "bronze";

function getMedal(ris: number): RISMedal {
  if (ris >= 90) return "gold";
  if (ris >= 85) return "silver";
  return "bronze";
}

const MEDAL: Record<RISMedal, { bg: string; color: string; label: string }> = {
  gold:   { bg: "#D4AF37", color: "#1a2e1f", label: "Gold" },
  silver: { bg: "#A8A9AD", color: "#1a2e1f", label: "Silver" },
  bronze: { bg: "#CD7F32", color: "#1a2e1f", label: "Bronze" },
};

function formatCategory(raw: string): string {
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FrontierTeaser() {
  const { data: allFrontier = [], isLoading } = trpc.materialAPI.getFrontier.useQuery();
  const top6 = allFrontier
    .filter((m) => m.manufacturer && m.manufacturer.trim() !== "" && m.manufacturer !== "Various")
    .slice(0, 6);

  return (
    <section style={{ backgroundColor: forest }}>
      <div
        className="mx-auto max-w-6xl px-6 py-20"
        style={{ borderTop: `1px solid ${borderOnDark}` }}
      >
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: amber }}
            >
              Frontier Materials
            </span>
            <h2
              className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ color: cream }}
            >
              The highest-performing sustainable materials in our database.
            </h2>
            <p className="mt-2 text-sm" style={{ color: "rgba(245,242,236,0.55)" }}>
              Ranked by Regenerative Impact Score — materials that sequester carbon, restore ecosystems, or enable true circularity.
            </p>
          </div>
        </div>

        {/* Card grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {top6.map((m) => {
              const ris = m.risScore ?? 0;
              const medal = getMedal(ris);
              const ms = MEDAL[medal];
              return (
                <Link key={m.id} href={`/materials/${m.id}`}>
                  <article
                    className="flex h-full cursor-pointer flex-col p-6 transition-colors"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.13)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.11)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)")
                    }
                  >
                    {/* Top row: category + medal badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="truncate text-xs uppercase tracking-wider"
                        style={{ color: "#9a9588" }}
                      >
                        {formatCategory(m.category)}
                      </span>
                      <span
                        className="flex-shrink-0 rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: ms.bg, color: ms.color }}
                      >
                        {ms.label}
                      </span>
                    </div>

                    {/* Material name */}
                    <h3
                      className="mt-3 text-base font-semibold leading-snug"
                      style={{ color: cream }}
                    >
                      {m.name.length > 40 ? m.name.slice(0, 40).trimEnd() + "…" : m.name}
                    </h3>

                    {/* Manufacturer */}
                    {m.manufacturer && (
                      <p
                        className="mt-1 truncate text-xs"
                        style={{ color: "rgba(245,242,236,0.45)" }}
                      >
                        {m.manufacturer}
                      </p>
                    )}

                    {/* RIS score */}
                    <div className="mt-auto flex items-baseline gap-1.5 pt-5">
                      <span
                        className="text-3xl font-semibold tabular-nums"
                        style={{ color: ms.bg }}
                      >
                        {ris}
                      </span>
                      <span className="text-xs" style={{ color: "#9a9588" }}>
                        RIS
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/frontier"
            className="inline-block rounded-md border px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              borderColor: borderOnDark,
              color: cream,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(245,242,236,0.06)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            View all Frontier Materials →
          </Link>
        </div>
      </div>
    </section>
  );
}
