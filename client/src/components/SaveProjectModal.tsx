import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const forest = "#1a2e1f";
const amber = "#c17f24";

interface Props {
  open: boolean;
  onClose: () => void;
  projectData: Record<string, unknown>;
  defaultName?: string;
}

export function SaveProjectModal({ open, onClose, projectData, defaultName = "" }: Props) {
  const [name, setName] = useState(defaultName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = trpc.projects.save.useMutation({
    onSuccess: () => setSaved(true),
    onError: (e) => setError(e.message),
  });

  function handleClose() {
    setName(defaultName);
    setSaved(false);
    setError(null);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    save.mutate({ name: name.trim(), projectData });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="bg-white dark:bg-zinc-900 max-w-sm">
        <DialogHeader>
          <DialogTitle style={{ color: forest }}>Save Project</DialogTitle>
          <DialogDescription>
            Give this view a name so you can return to it later.
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle className="h-10 w-10 mx-auto" style={{ color: amber }} />
            <p className="font-semibold" style={{ color: forest }}>Project saved!</p>
            <p className="text-sm text-gray-500">
              Find it under <strong>My Projects</strong> in the header.
            </p>
            <Button onClick={handleClose} style={{ backgroundColor: forest, color: "#fff" }}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <Input
              required
              placeholder="e.g. My Timber-First Spec"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
            )}
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={save.isPending || !name.trim()}
                style={{ backgroundColor: amber, color: "#fff" }}
              >
                {save.isPending ? "Saving…" : "Save Project"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
