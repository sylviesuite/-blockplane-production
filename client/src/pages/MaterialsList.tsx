import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { localMaterials } from "@/data/materials";

export default function MaterialsList() {
  const [materials, setMaterials] = useState(localMaterials);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      if (!localMaterials.length) {
        throw new Error("No materials available.");
      }
      setMaterials(localMaterials);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = () => {
    setLoading(true);
    setError(null);
    setMaterials(localMaterials);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900">Materials</h1>
          <p className="text-sm text-slate-600">
            Browse the catalog and click any material to view its details.
          </p>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Loading materials…</div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={retry} className="mt-2">
              Retry
            </Button>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-sm text-slate-500">No materials found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {materials.map((material) => (
              <Card
                key={material.id}
                className="border-slate-200 hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg">{material.name}</CardTitle>
                    <Badge variant="outline">{material.category}</Badge>
                  </div>
                  <CardDescription className="text-xs">{material.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">{material.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>LIS {material.lis}</span>
                    <span>RIS {material.ris}</span>
                  </div>
                  <div className="text-xs text-slate-500">CPI {material.cpi}</div>
                </CardContent>
                <CardContent className="pt-0">
                  <Link href={`/materials/${material.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
