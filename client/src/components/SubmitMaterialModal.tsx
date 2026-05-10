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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

const CATEGORIES = [
  "Timber", "Steel", "Concrete", "Earth", "Insulation", "Composites",
  "Masonry", "Roofing", "Cladding", "Flooring", "Windows", "Mechanical",
  "Finishes", "Foundation", "Landscaping",
];

const FUNCTIONAL_UNITS = ["sq ft", "linear ft", "cubic yard", "cubic ft", "each", "gallon"];

const forest = "#1a2e1f";
const amber = "#c17f24";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SubmitMaterialModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [carbonValue, setCarbonValue] = useState("");
  const [functionalUnit, setFunctionalUnit] = useState("sq ft");
  const [source, setSource] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [honeypot, setHoneypot] = useState(""); // must stay empty
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = trpc.materialAPI.submitMaterial.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => setError(e.message),
  });

  function handleClose() {
    // Reset form state on close
    setName(""); setCategory(""); setDescription(""); setCarbonValue("");
    setFunctionalUnit("sq ft"); setSource(""); setManufacturer("");
    setSubmitterName(""); setSubmitterEmail(""); setHoneypot("");
    setSubmitted(false); setError(null);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    submit.mutate({
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      carbonValue: carbonValue ? parseFloat(carbonValue) : undefined,
      functionalUnit,
      source: source.trim() || undefined,
      manufacturer: manufacturer.trim() || undefined,
      submitterName: submitterName.trim() || undefined,
      submitterEmail: submitterEmail.trim() || undefined,
      honeypot,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="bg-white dark:bg-zinc-900 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: forest }}>Submit a Material</DialogTitle>
          <DialogDescription>
            Know a Northern Michigan building material we're missing? Submit it for review and we'll
            add verified carbon data to the database.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="h-12 w-12 mx-auto" style={{ color: amber }} />
            <p className="text-base font-semibold" style={{ color: forest }}>
              Submission received — thank you!
            </p>
            <p className="text-sm text-gray-500">
              We'll review it and reach out if we have questions.
            </p>
            <Button onClick={handleClose} className="mt-2" style={{ backgroundColor: forest, color: "#fff" }}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Honeypot — hidden from real users, filled by bots */}
            <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
              <input
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Required fields */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Material name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Northern Michigan White Cedar Bevel Siding"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Format: [Species/Material] [Product Type] [Dimension/Grade]
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <Select required value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Description</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={2}
                placeholder="Briefly describe the material and its Northern Michigan relevance"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />
            </div>

            {/* Carbon estimate */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Carbon estimate (kg CO₂e)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder="e.g. 0.85"
                  value={carbonValue}
                  onChange={(e) => setCarbonValue(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Per unit</label>
                <Select value={functionalUnit} onValueChange={setFunctionalUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNCTIONAL_UNITS.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Source & manufacturer */}
            <div>
              <label className="text-sm font-medium block mb-1">Source / EPD link</label>
              <Input
                placeholder="URL or document name where carbon data was found"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Manufacturer / supplier</label>
              <Input
                placeholder="e.g. Northern Michigan Lumber Co."
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
            </div>

            {/* Optional contact */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Your info (optional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Name</label>
                  <Input
                    placeholder="Your name"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submit.isPending || !name.trim() || !category}
                style={{ backgroundColor: amber, color: "#fff" }}
              >
                {submit.isPending ? "Submitting…" : "Submit Material"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
