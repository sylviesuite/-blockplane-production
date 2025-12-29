import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MaterialBrowser from "./MaterialBrowser";

export default function MaterialsList() {
  const [placeholderMaterials, setPlaceholderMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(import.meta.env.DEV);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let cancelled = false;
    (async () => {
      const { assertDevOnly, PLACEHOLDER_ONLY__MATERIALS } = await import("../dev/placeholders");
      assertDevOnly("materials list");
      if (cancelled) return;
      setPlaceholderMaterials(PLACEHOLDER_ONLY__MATERIALS);
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!import.meta.env.DEV) {
    return <MaterialBrowser />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container">
        <div className="mb-6 space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Materials (Dev Placeholder)</h1>
          <p className="text-sm text-slate-600">
            This view uses mock data to keep the UI intact while the real backend is unavailable.
          </p>
        </div>

        {isLoading ? (
          <div className="text-sm text-slate-500">Loading placeholders...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {placeholderMaterials.map(material => (
              <Card key={material.id} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg">{material.name}</CardTitle>
                    <Badge variant="outline">{material.category}</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {material.functionalUnit}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">{material.notes}</p>
                  <div className="text-xs text-slate-500">
                    CPI {material.cpi}
                  </div>
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
        )}
      </div>
    </div>
  );
}

