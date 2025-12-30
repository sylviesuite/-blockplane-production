import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import MaterialBrowser from "./MaterialBrowser";

type ConnectionStatus = "idle" | "connected" | "fallback";

export default function MaterialsList() {
  const isDev = import.meta.env.DEV;
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [placeholderMaterials, setPlaceholderMaterials] = useState<any[]>([]);
  const [loadingPlaceholders, setLoadingPlaceholders] = useState(true);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);

  const materialsCheck = trpc.materialAPI.list.useQuery(undefined, {
    enabled: isDev,
    retry: 0,
    refetchOnWindowFocus: false,
    onSuccess: () => {
      setStatus("connected");
    },
    onError: (error) => {
      setFallbackReason(error.message);
      setStatus("fallback");
    },
  });

  useEffect(() => {
    if (!isDev) return;
    if (status !== "fallback") return;

    let cancelled = false;
    setLoadingPlaceholders(true);

    (async () => {
      const { assertDevOnly, PLACEHOLDER_ONLY__MATERIALS } = await import("../dev/placeholders");
      assertDevOnly("materials list");

      if (cancelled) return;
      setPlaceholderMaterials(PLACEHOLDER_ONLY__MATERIALS);
      setLoadingPlaceholders(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [status, isDev]);

  useEffect(() => {
    if (!isDev) return;
    if (import.meta.env.VITE_TRPC_URL) return;
    console.warn("VITE_TRPC_URL is not defined – the TRPC client will fall back to /api/trpc for backend requests.");
  }, [isDev]);

  if (!isDev) {
    return <MaterialBrowser />;
  }

  const statusLabel =
    status === "connected"
      ? "Connected to backend"
      : status === "fallback"
        ? "Using placeholders (backend unavailable)"
        : "Connecting to backend...";

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900">Materials</h1>
          <p className="text-sm text-slate-600">
            {statusLabel}
            {status === "fallback" && fallbackReason ? ` – ${fallbackReason}` : ""}
          </p>
        </div>

        {status === "fallback" ? (
          loadingPlaceholders ? (
            <div className="text-sm text-slate-500">Loading placeholders...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {placeholderMaterials.map((material) => (
                <Card key={material.id} className="border-slate-200">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-lg">{material.name}</CardTitle>
                      <Badge variant="outline">{material.category}</Badge>
                    </div>
                    <CardDescription className="text-xs">{material.unit}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-600">{material.notes}</p>
                    <div className="text-xs text-slate-500">CPI {material.cpi}</div>
                    <div className="flex items-center gap-3 text-xs">
                      <span>RIS {material.ris}</span>
                      <span>LIS {material.lis}</span>
                    </div>
                  </CardContent>
                  <CardContent className="pt-0">
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Detail (placeholder)
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <MaterialBrowser />
        )}
      </div>
    </div>
  );
}
