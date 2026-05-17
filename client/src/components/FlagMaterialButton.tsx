import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FLAG_TYPES = [
  { value: "wrong_data",     label: "Incorrect data values" },
  { value: "missing_data",   label: "Missing information" },
  { value: "wrong_category", label: "Wrong category" },
  { value: "duplicate",      label: "Duplicate entry" },
  { value: "other",          label: "Other issue" },
];

interface Props {
  materialId: string;
  userId?: string;
}

type State = "idle" | "open" | "submitting" | "success" | "error";

export function FlagMaterialButton({ materialId, userId }: Props) {
  const [state, setState] = useState<State>("idle");
  const [flagType, setFlagType] = useState("");
  const [notes, setNotes] = useState("");

  const base = import.meta.env.VITE_API_URL ?? "";

  async function submit() {
    if (!flagType) return;
    setState("submitting");
    try {
      const res = await fetch(`${base}/api/flag-material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId, flagType, notes: notes.trim() || undefined, userId }),
      });
      if (!res.ok) throw new Error();
      setState("success");
    } catch {
      setState("error");
    }
  }

  function reset() {
    setFlagType("");
    setNotes("");
    setState("idle");
  }

  if (state === "success") {
    return (
      <p className="text-xs text-muted-foreground mt-3">
        Thanks — we'll review this shortly.
      </p>
    );
  }

  if (state === "error") {
    return (
      <p className="text-xs text-red-500 mt-3">
        Something went wrong. Please try again.{" "}
        <button className="underline" onClick={reset}>Try again</button>
      </p>
    );
  }

  if (state === "idle") {
    return (
      <button
        onClick={() => setState("open")}
        className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors mt-3"
      >
        <Flag className="w-3 h-3" />
        Flag this data
      </button>
    );
  }

  return (
    <div className="mt-3 border border-border rounded-lg p-3 space-y-2 bg-card">
      <p className="text-xs font-medium">Report an issue with this data</p>
      <Select value={flagType} onValueChange={setFlagType}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Select issue type…" />
        </SelectTrigger>
        <SelectContent>
          {FLAG_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value} className="text-xs">
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Optional notes (max 500 chars)"
        maxLength={500}
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="text-xs resize-none"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          className="h-7 text-xs"
          disabled={!flagType || state === "submitting"}
          onClick={submit}
        >
          {state === "submitting" ? "Submitting…" : "Submit"}
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={reset}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
