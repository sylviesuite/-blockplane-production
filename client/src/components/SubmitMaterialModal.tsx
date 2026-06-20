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
import { CheckCircle, Loader2, Sparkles } from "lucide-react";

const CATEGORIES = [
  "Timber", "Steel", "Concrete", "Earth", "Insulation", "Composites",
  "Masonry", "Roofing", "Cladding", "Flooring", "Windows", "Mechanical",
  "Finishes", "Foundation", "Landscaping", "Wall Systems",
];

const FUNCTIONAL_UNITS = ["sq ft", "linear ft", "cubic yard", "cubic ft", "each", "gallon"];

const forest = "#1a2e1f";
const amber = "#c17f24";

interface Props {
  open: boolean;
  onClose: () => void;
}

type CarbonPath = "manual" | "estimate";

interface AiEstimate {
  carbonValue: number;
  functionalUnit: string;
  reasoning: string;
}

export function SubmitMaterialModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [carbonPath, setCarbonPath] = useState<CarbonPath>("manual");
  const [carbonValue, setCarbonValue] = useState("");
  const [functionalUnit, setFunctionalUnit] = useState("sq ft");
  const [source, setSource] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiEstimate, setAiEstimate] = useState<AiEstimate | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const submit = trpc.materialAPI.submitMaterial.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => setError(e.message),
  });

  const estimate = trpc.materialAPI.estimateCarbon.useMutation();

  function handleClose() {
    setName(""); setCategory(""); setDescription(""); setCarbonValue("");
    setFunctionalUnit("sq ft"); setSource(""); setManufacturer("");
    setSubmitterName(""); setSubmitterEmail(""); setHoneypot("");
    setSubmitted(false); setError(null);
    setCarbonPath("manual"); setAiEstimate(null); setAiError(null);
    onClose();
  }

  async function handleEstimate() {
    if (!name.trim() || !category) return;
    setAiEstimate(null);
    setAiError(null);
    try {
      const result = await estimate.mutateAsync({
        name: name.trim(),
        category,
        description: description.trim() || undefined,
      });
      setAiEstimate(result);
      setCarbonValue(String(result.carbonValue));
      setFunctionalUnit(result.functionalUnit);
    } catch (err: any) {
      setAiError(err?.message ?? "Estimation failed. Try entering a value manually.");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const isAiEstimate = carbonPath === "estimate";
    const submissionSource = isAiEstimate
      ? "AI-estimated from user description"
      : source.trim()
        ? `User submission — ${source.trim()}`
        : "User submission";

    const descWithEstimate = isAiEstimate && aiEstimate
      ? [
          description.trim(),
          `[AI preview estimate: ${aiEstimate.carbonValue.toFixed(3)} kg CO₂e/${aiEstimate.functionalUnit} — ${aiEstimate.reasoning}]`,
        ].filter(Boolean).join("\n\n")
      : description.trim() || undefined;

    submit.mutate({
      name: name.trim(),
      category,
      description: descWithEstimate,
      carbonValue: isAiEstimate ? undefined : (carbonValue ? parseFloat(carbonValue) : undefined),
      functionalUnit,
      source: submissionSource,
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
            {/* Honeypot */}
            <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
              <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>

            {/* Material basics */}
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
                <SelectContent className="bg-white">
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

            {/* Carbon path selector */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium block mb-2">Carbon data</label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  className={`flex-1 text-xs font-medium px-3 py-2 rounded-md border transition-colors ${
                    carbonPath === "manual"
                      ? "border-[#c17f24] bg-[#c17f24]/10 text-[#c17f24]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                  onClick={() => setCarbonPath("manual")}
                >
                  I have a carbon value
                </button>
                <button
                  type="button"
                  className={`flex-1 text-xs font-medium px-3 py-2 rounded-md border transition-colors ${
                    carbonPath === "estimate"
                      ? "border-[#3f8c52] bg-[#3f8c52]/10 text-[#3f8c52]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                  onClick={() => setCarbonPath("estimate")}
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Estimate for me
                </button>
              </div>

              {carbonPath === "manual" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium block mb-1">
                        Carbon (kg CO₂e)
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
                        <SelectContent className="bg-white">
                          {FUNCTIONAL_UNITS.map((u) => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Where did you get this value?</label>
                    <Input
                      placeholder="e.g. Manufacturer EPD, internal LCA report, ICE Database"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {carbonPath === "estimate" && (
                <div className="space-y-3">
                  {!aiEstimate && !aiError && (
                    <>
                      <p className="text-xs text-gray-500">
                        We'll use AI to estimate the embodied carbon based on the material name,
                        category, and description above.
                        {!description.trim() && (
                          <span className="text-amber-600 font-medium"> Adding a description improves accuracy.</span>
                        )}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleEstimate}
                        disabled={estimate.isPending || !name.trim() || !category}
                      >
                        {estimate.isPending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            Estimating…
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            Generate estimate
                          </>
                        )}
                      </Button>
                    </>
                  )}

                  {aiError && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
                      <p className="font-medium text-amber-800">Estimation failed</p>
                      <p className="text-xs text-amber-600 mt-1">{aiError}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleEstimate}
                        disabled={estimate.isPending}
                        className="mt-2 text-xs h-7"
                      >
                        Try again
                      </Button>
                    </div>
                  )}

                  {aiEstimate && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <p className="text-sm font-semibold text-emerald-800">AI estimate</p>
                      </div>
                      <p className="text-lg font-bold text-emerald-700">
                        {aiEstimate.carbonValue.toFixed(3)}{" "}
                        <span className="text-sm font-normal">kg CO₂e / {aiEstimate.functionalUnit}</span>
                      </p>
                      <p className="text-xs text-emerald-600">{aiEstimate.reasoning}</p>
                      <p className="text-[10px] text-gray-400 border-t border-emerald-200 pt-2">
                        This estimate will be submitted with "estimated" confidence and reviewed by our team before publishing.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manufacturer */}
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
