import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { ScoreConfidenceBadge } from "@/components/ScoreConfidenceBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Leaf, Lock, X, Search, Sparkles, Link2 } from "lucide-react";

const forest = "#1a2e1f";
const amber = "#c17f24";

type Material = {
  id: string;
  name: string;
  category: string;
  manufacturer: string | null;
  description: string | null;
  totalCarbon: string;
  lisScore: number;
  risScore: number | null;
  functionalUnit: string;
  costPerUnit: string;
  confidenceLevel: string;
  isRegenerative: number;
  scoreConfidence?: string;
  sourceUrl?: string | null;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="sticky left-0 z-10 bg-muted/80 backdrop-blur-sm px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </td>
      {children}
    </tr>
  );
}

export default function ComparePage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load materials from URL ?ids=... on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ids = params.get("ids")?.split(",").filter(Boolean) ?? [];
    if (!ids.length) return;
    Promise.all(ids.map(id => utils.materialAPI.getById.fetch({ id })))
      .then(results => setMaterials(results.filter(Boolean) as Material[]))
      .catch(() => {});
  }, []);

  // Sync URL when materials change
  useEffect(() => {
    if (materials.length === 0) {
      window.history.replaceState(null, "", "/compare");
    } else {
      const ids = materials.map(m => m.id).join(",");
      window.history.replaceState(null, "", `/compare?ids=${ids}`);
    }
  }, [materials]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: searchResults } = trpc.materialAPI.search.useQuery(
    { query: searchQuery, pageSize: 8 },
    { enabled: searchQuery.length >= 2 }
  );

  const addMaterial = (m: Material) => {
    if (!materials.find(x => x.id === m.id)) {
      setMaterials(prev => [...prev, m]);
      setInsight(null);
    }
    setSearchQuery("");
    setDropdownOpen(false);
  };

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    setInsight(null);
  };

  const clearAll = () => {
    setMaterials([]);
    setInsight(null);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const generateInsight = async () => {
    setInsightLoading(true);
    setInsight(null);
    try {
      const base = import.meta.env.VITE_API_URL ?? "";
      const res = await fetch(`${base}/api/compare-insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materials: materials.map(m => ({
            name: m.name,
            lis: m.lisScore,
            ris: m.risScore,
            cpi: parseFloat(m.costPerUnit),
          })),
        }),
      });
      const data = await res.json();
      setInsight(data.text ?? "Something went wrong.");
    } catch {
      setInsight("Something went wrong. Please try again.");
    } finally {
      setInsightLoading(false);
    }
  };

  // Best-value calculations (only meaningful with 2+ materials)
  const multi = materials.length > 1;
  const carbons = materials.map(m => parseFloat(m.totalCarbon) / 10.764);
  const costs = materials.map(m => parseFloat(m.costPerUnit));
  const lisScores = materials.map(m => m.lisScore);
  const risScores = materials.map(m => m.risScore ?? 0);

  const minCarbon = multi ? Math.min(...carbons) : null;
  const minCost = multi ? Math.min(...costs) : null;
  const minLis = multi ? Math.min(...lisScores) : null; // lower LIS = less lifecycle impact = better
  const maxRis = multi ? Math.max(...risScores) : null;

  const isFrontier = (m: Material) => (m.risScore ?? 0) >= 80 || !!m.sourceUrl;

  const bestCell = (isBest: boolean) =>
    isBest ? "bg-emerald-50 text-emerald-800" : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero strip */}
      <div style={{ backgroundColor: forest }} className="border-b border-black/10">
        <div className="container py-5">
          <h1 className="text-3xl font-bold text-white mb-1">Compare materials</h1>
          <p className="text-sm" style={{ color: "rgba(245,242,236,0.6)" }}>
            Add any number of materials to compare side by side
          </p>
        </div>
      </div>

      <div className="container py-6 space-y-6">

        {/* Search / add bar */}
        <div className="flex items-center gap-3">
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              placeholder="Search and add a material…"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => searchQuery.length >= 2 && setDropdownOpen(true)}
              className="pl-9"
            />
            {dropdownOpen && searchResults && searchResults.items.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                {(searchResults.items as Material[])
                  .filter(m => !materials.find(x => x.id === m.id))
                  .slice(0, 8)
                  .map(m => (
                    <button
                      key={m.id}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex items-center justify-between gap-2 border-b border-border last:border-0"
                      onMouseDown={e => { e.preventDefault(); addMaterial(m); }}
                    >
                      <span className="font-medium truncate">{m.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{m.category}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {materials.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => searchInputRef.current?.focus()}
              >
                + Add another
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
                Clear all
              </Button>
            </>
          )}
        </div>

        {/* Empty state */}
        {materials.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <p className="text-base font-medium mb-1">No materials added yet</p>
            <p className="text-sm">Search above to start comparing — try "timber", "hempcrete", or "concrete"</p>
          </div>
        )}

        {/* Comparison table */}
        {materials.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  {/* Label column header (empty) */}
                  <th className="sticky left-0 z-10 bg-muted/80 backdrop-blur-sm w-36 min-w-[9rem] px-4 py-3" />
                  {materials.map(m => (
                    <th
                      key={m.id}
                      className="min-w-[200px] px-4 py-3 text-left font-semibold align-top border-l border-border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/materials/${m.id}`} className="hover:underline leading-snug">
                          {m.name}
                        </Link>
                        <button
                          onClick={() => removeMaterial(m.id)}
                          title="Remove"
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Category */}
                <Row label="Category">
                  {materials.map(m => (
                    <td key={m.id} className="px-4 py-3 border-l border-border">
                      <Badge variant="outline" className="text-xs">{m.category}</Badge>
                    </td>
                  ))}
                </Row>

                {/* Manufacturer */}
                <Row label="Manufacturer">
                  {materials.map(m => (
                    <td key={m.id} className="px-4 py-3 border-l border-border text-sm text-muted-foreground">
                      {m.manufacturer || "—"}
                    </td>
                  ))}
                </Row>

                {/* Carbon */}
                <Row label="Carbon">
                  {materials.map((m, i) => (
                    <td
                      key={m.id}
                      className={`px-4 py-3 border-l border-border font-semibold ${bestCell(minCarbon !== null && carbons[i] === minCarbon)}`}
                    >
                      {carbons[i].toFixed(2)}
                      <span className="text-xs font-normal text-muted-foreground ml-1">kg CO₂e/sq ft</span>
                    </td>
                  ))}
                </Row>

                {/* Cost */}
                <Row label="Cost">
                  {materials.map((m, i) => (
                    <td
                      key={m.id}
                      className={`px-4 py-3 border-l border-border font-semibold ${bestCell(minCost !== null && costs[i] === minCost)}`}
                    >
                      ${costs[i].toFixed(2)}
                      <span className="text-xs font-normal text-muted-foreground ml-1">/{m.functionalUnit}</span>
                    </td>
                  ))}
                </Row>

                {/* LIS */}
                <Row label="LIS score">
                  {materials.map((m, i) => (
                    <td
                      key={m.id}
                      className={`px-4 py-3 border-l border-border font-semibold ${bestCell(minLis !== null && lisScores[i] === minLis)}`}
                    >
                      {m.lisScore}
                      <span className="text-xs font-normal text-muted-foreground ml-1">/ 100</span>
                    </td>
                  ))}
                </Row>

                {/* RIS */}
                <Row label="RIS score">
                  {materials.map((m, i) => (
                    <td
                      key={m.id}
                      className={`px-4 py-3 border-l border-border font-semibold ${bestCell(maxRis !== null && risScores[i] === maxRis)}`}
                    >
                      {m.risScore !== null ? (
                        <>
                          {m.risScore}
                          <span className="text-xs font-normal text-muted-foreground ml-1">/ 100</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </td>
                  ))}
                </Row>

                {/* Score confidence */}
                <Row label="Confidence">
                  {materials.map(m => (
                    <td key={m.id} className="px-4 py-3 border-l border-border">
                      <ScoreConfidenceBadge confidence={(m as any).scoreConfidence} />
                    </td>
                  ))}
                </Row>

                {/* Regenerative */}
                <Row label="Regenerative">
                  {materials.map(m => (
                    <td key={m.id} className="px-4 py-3 border-l border-border">
                      {m.isRegenerative === 1 ? (
                        <Badge className="text-xs bg-emerald-600 hover:bg-emerald-600 text-white gap-1">
                          <Leaf className="w-3 h-3" /> Yes
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </td>
                  ))}
                </Row>

                {/* Frontier */}
                <Row label="Frontier">
                  {materials.map(m => (
                    <td key={m.id} className="px-4 py-3 border-l border-border">
                      {isFrontier(m) ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                          Frontier
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </td>
                  ))}
                </Row>

                {/* Description */}
                <Row label="Description">
                  {materials.map(m => (
                    <td key={m.id} className="px-4 py-3 border-l border-border text-xs text-muted-foreground leading-relaxed max-w-xs">
                      {m.description || "—"}
                    </td>
                  ))}
                </Row>
              </tbody>
            </table>
          </div>
        )}

        {/* Share link */}
        {materials.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Share this comparison:</span>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 font-medium transition-colors"
              style={{ color: copied ? "#3f8c52" : amber }}
            >
              <Link2 className="w-3.5 h-3.5" />
              {copied ? "Link copied!" : "Copy link"}
            </button>
          </div>
        )}

        {/* AI comparison insight */}
        {materials.length >= 2 && (
          <div className="rounded-xl border border-border p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: amber }} />
              <h2 className="text-base font-semibold">AI Comparison Insight</h2>
            </div>

            {!user ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/60 rounded-lg p-4">
                <Lock className="w-4 h-4 shrink-0" />
                <span>
                  <Link href="/login" className="underline font-medium" style={{ color: amber }}>
                    Sign in
                  </Link>{" "}
                  to get AI-powered analysis of this comparison
                </span>
              </div>
            ) : insight ? (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed">{insight}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInsight(null)}
                  className="text-xs"
                >
                  Regenerate
                </Button>
              </div>
            ) : (
              <Button
                onClick={generateInsight}
                disabled={insightLoading}
                className="gap-2"
                style={{ backgroundColor: forest, color: "#f5f2ec" }}
              >
                <Sparkles className="w-4 h-4" />
                {insightLoading ? "Generating…" : "Generate comparison insight"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
