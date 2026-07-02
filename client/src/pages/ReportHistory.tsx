import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { generateClientReportPDF } from "@/lib/export";
import type { ClientReportMaterial } from "@/lib/export";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Loader2, Plus } from "lucide-react";

type DownloadingId = string | null;
type DeletingId = string | null;

export default function ReportHistory() {
  const [, navigate] = useLocation();
  const [downloadingId, setDownloadingId] = useState<DownloadingId>(null);
  const [deletingId, setDeletingId] = useState<DeletingId>(null);

  const { data: reports, isLoading, refetch } = trpc.reports.list.useQuery();
  const deleteReport = trpc.reports.delete.useMutation();

  async function handleDownload(report: any) {
    if (downloadingId) return;
    setDownloadingId(report.id);
    try {
      const apiBase = import.meta.env.VITE_API_URL ?? "https://blockplane-production.onrender.com";
      const res = await fetch(`${apiBase}/api/reports/generate-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reportId: report.id }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Generate failed: ${text.slice(0, 200)}`);
      }

      const data = await res.json();

      await generateClientReportPDF(
        {
          title: report.title,
          clientName: report.client_name ?? null,
          notes: report.notes ?? null,
          generatedAt: data.generatedAt,
          materials: data.materials as ClientReportMaterial[],
        },
        `${report.title.replace(/\s+/g, "-").toLowerCase()}`
      );

      toast.success("Report downloaded.");
    } catch (err: any) {
      toast.error(err?.message ?? "Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete(report: any) {
    if (!window.confirm(`Delete "${report.title}"? This cannot be undone.`)) return;
    setDeletingId(report.id);
    try {
      await deleteReport.mutateAsync({ id: report.id });
      toast.success("Report deleted.");
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div style={{ backgroundColor: "#1a2e1f" }}>
        <div className="container py-4 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Reports</h1>
            <p className="text-sm" style={{ color: "rgba(245,242,236,0.6)" }}>
              Your saved client reports — download or delete at any time.
            </p>
          </div>
          <Button
            onClick={() => navigate("/reports/new")}
            className="mb-1 flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white border-0"
          >
            <Plus className="w-4 h-4" />
            New report
          </Button>
        </div>
      </div>

      <div className="container py-8 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading reports…
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No reports yet</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Generate your first client report with live EC3 verification data.
            </p>
            <Button onClick={() => navigate("/reports/new")}>Create a report</Button>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Client</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Materials</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((report: any) => {
                  const isDownloading = downloadingId === report.id;
                  const isDeleting = deletingId === report.id;
                  const busy = isDownloading || isDeleting;
                  return (
                    <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{report.title}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {report.client_name ?? <span className="italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {Array.isArray(report.material_ids) ? report.material_ids.length : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                        {new Date(report.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(report)}
                            disabled={busy}
                            className="flex items-center gap-1.5"
                          >
                            {isDownloading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">Download</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(report)}
                            disabled={busy}
                            className="flex items-center gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
