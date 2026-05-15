import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, Layers, Ruler } from "lucide-react";
import { useLocation } from "wouter";

const forest = "#1a2e1f";

function typeLabel(type: string) {
  if (type === "benchmark") return "Benchmark 2000";
  return "Material Browser";
}

function typeIcon(type: string) {
  if (type === "benchmark") return <Ruler className="w-3 h-3" />;
  return <Layers className="w-3 h-3" />;
}

function loadUrl(project: any): string {
  const type = project.project_data?.type;
  if (type === "benchmark") return `/benchmark?load=${project.id}`;
  return `/materials?load=${project.id}`;
}

export default function MyProjects() {
  const [, navigate] = useLocation();
  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery();
  const deleteProject = trpc.projects.delete.useMutation({ onSuccess: () => refetch() });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteProject.mutate({ id }, { onSettled: () => setDeletingId(null) });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div style={{ backgroundColor: forest }}>
        <div className="container py-4">
          <h1 className="text-4xl font-bold text-white mb-1">My Projects</h1>
          <p className="text-sm" style={{ color: "rgba(245,242,236,0.6)" }}>
            Your saved material browser views and benchmark configurations
          </p>
        </div>
      </div>

      <div className="container py-8">
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {!isLoading && (!projects || projects.length === 0) && (
          <div className="text-center py-16 text-gray-500">
            <p className="mb-4">You haven't saved any projects yet.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/materials")}>
                Browse Materials
              </Button>
              <Button variant="outline" onClick={() => navigate("/benchmark")}>
                Open Benchmark 2000
              </Button>
            </div>
          </div>
        )}

        {!isLoading && projects && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project: any) => (
              <Card key={project.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      {typeIcon(project.project_data?.type)}
                      {typeLabel(project.project_data?.type)}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(project.updated_at ?? project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-base mt-2">{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 flex items-center gap-1"
                      style={{ backgroundColor: forest, color: "#fff" }}
                      onClick={() => navigate(loadUrl(project))}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 border-red-200"
                      disabled={deletingId === project.id}
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
