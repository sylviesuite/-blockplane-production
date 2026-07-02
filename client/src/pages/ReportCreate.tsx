import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { generateClientReportPDF } from "@/lib/export";
import type { ClientReportMaterial } from "@/lib/export";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, X, Loader2 } from "lucide-react";

const MAX_MATERIALS = 20;

type Step = "idle" | "creating" | "generating" | "done";

export default function ReportCreate() {
  const [, navigate] = useLocation();

  // Form fields
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [notes, setNotes] = useState("");

  // Material picker
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Submission state
  const [step, setStep] = useState<Step>("idle");

  const { data: allMaterials, isLoading: materialsLoading } = trpc.materials.getAll.useQuery();
  const createReport = trpc.reports.create.useMutation();

  const filtered = useMemo(() => {
    if (!allMaterials) return [];
    const q = search.trim().toLowerCase();
    if (!q) return allMaterials;
    return allMaterials.filter(
      (m: any) =>
        m.name.toLowerCase().includes(q) ||
        (m.category ?? "").toLowerCase().includes(q)
    );
  }, [allMaterials, search]);

  function toggleMaterial(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_MATERIALS) {
        next.add(id);
      } else {
        toast.error(`You can include at most ${MAX_MATERIALS} materials per report.`);
      }
      return next;
    });
  }

  function removeSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const selectedMaterials = useMemo(
    () => (allMaterials ?? []).filter((m: any) => selected.has(String(m.id))),
    [allMaterials, selected]
  );

  const canSubmit =
    step === "idle" && title.trim().length > 0 && selected.size > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const materialIds = Array.from(selected);

    try {
      setStep("creating");
      const { id: reportId } = await createReport.mutateAsync({
        title: title.trim(),
        clientName: clientName.trim() || undefined,
        notes: notes.trim() || undefined,
        materialIds,
      });

      if (!reportId) throw new Error("Report created but no ID returned.");

      setStep("generating");
      const apiBase = import.meta.env.VITE_API_URL ?? "https://blockplane-production.onrender.com";
      const res = await fetch(`${apiBase}/api/reports/generate-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reportId }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Generate failed: ${text.slice(0, 200)}`);
      }

      const data = await res.json();

      await generateClientReportPDF(
        {
          title: title.trim(),
          clientName: clientName.trim() || null,
          notes: notes.trim() || null,
          generatedAt: data.generatedAt,
          materials: data.materials as ClientReportMaterial[],
        },
        `${title.trim().replace(/\s+/g, "-").toLowerCase()}-report`
      );

      setStep("done");
      toast.success("Report generated and downloaded.");
    } catch (err: any) {
      setStep("idle");
      toast.error(err?.message ?? "Something went wrong. Please try again.");
    }
  }

  const busy = step === "creating" || step === "generating";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div style={{ backgroundColor: "#1a2e1f" }}>
        <div className="container py-4">
          <h1 className="text-4xl font-bold text-white mb-1">Generate Client Report</h1>
          <p className="text-sm" style={{ color: "rgba(245,242,236,0.6)" }}>
            Select materials, add details, and download a PDF with live EC3 verification.
          </p>
        </div>
      </div>

      {step === "done" ? (
        <div className="container py-16 text-center">
          <FileText className="w-12 h-12 mx-auto text-emerald-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Report downloaded</h2>
          <p className="text-muted-foreground mb-6">
            Your PDF has been saved to your downloads folder.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setTitle("");
                setClientName("");
                setNotes("");
                setSelected(new Set());
                setSearch("");
                setStep("idle");
              }}
            >
              Create another report
            </Button>
            <Button onClick={() => navigate("/reports")}>View all reports</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="container py-8 max-w-4xl">
          {/* Report details */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Report details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">
                  Report title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Phase 1 Materials Assessment"
                  disabled={busy}
                  className="mt-1"
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="clientName">Client name (optional)</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Meridian Developments"
                  disabled={busy}
                  className="mt-1"
                  maxLength={200}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any context or caveats to include on the cover page…"
                  disabled={busy}
                  className="mt-1 resize-none"
                  rows={3}
                  maxLength={2000}
                />
              </div>
            </div>
          </section>

          {/* Material picker */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Select materials</h2>
              <span className="text-sm text-muted-foreground">
                {selected.size} / {MAX_MATERIALS} selected
              </span>
            </div>

            {/* Selected chips */}
            {selectedMaterials.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedMaterials.map((m: any) => (
                  <Badge
                    key={m.id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {m.name}
                    <button
                      type="button"
                      onClick={() => removeSelected(String(m.id))}
                      disabled={busy}
                      className="ml-1 rounded-full hover:bg-muted p-0.5"
                      aria-label={`Remove ${m.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or category…"
                disabled={busy}
                className="pl-9"
              />
            </div>

            {/* List */}
            <div className="border rounded-md overflow-hidden">
              {materialsLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading materials…
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground text-sm">
                  No materials match your search.
                </p>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y">
                  {filtered.map((m: any) => {
                    const id = String(m.id);
                    const isChecked = selected.has(id);
                    const atLimit = selected.size >= MAX_MATERIALS && !isChecked;
                    return (
                      <label
                        key={id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-emerald-50 dark:bg-emerald-950/30"
                            : atLimit
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => !atLimit && toggleMaterial(id)}
                          disabled={busy || atLimit}
                          aria-label={m.name}
                          className="h-4 w-4 rounded border border-input accent-emerald-600 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {m.category}
                            {m.totalCarbon != null
                              ? ` · ${Number(m.totalCarbon).toFixed(2)} kg CO₂e / ${m.functionalUnit ?? "unit"}`
                              : ""}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={!canSubmit || busy}
              className="min-w-44"
            >
              {step === "creating" && (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving report…</>
              )}
              {step === "generating" && (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating PDF…</>
              )}
              {step === "idle" && "Create report & download PDF"}
            </Button>

            {!canSubmit && step === "idle" && (
              <p className="text-sm text-muted-foreground">
                {title.trim().length === 0 && selected.size === 0
                  ? "Add a title and select at least one material."
                  : title.trim().length === 0
                  ? "A report title is required."
                  : "Select at least one material."}
              </p>
            )}
          </div>

          <p className="mt-4 text-xs text-muted-foreground max-w-xl">
            EC3 verification data is fetched live from Building Transparency at generation
            time and is not stored by BlockPlane. Materials where EC3 is unavailable will
            be noted in the PDF.
          </p>
        </form>
      )}
    </div>
  );
}
