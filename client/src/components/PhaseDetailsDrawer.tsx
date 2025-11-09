import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { phaseConfig, PhaseKey } from "@/pages/LifecycleBreakdown";
import { ExternalLink } from "lucide-react";

interface PhaseDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: string;
  phase: PhaseKey | null;
  value: number;
  units: "kgCO2e" | "MJ";
}

const phaseDescriptions: Record<PhaseKey, string> = {
  "Point of Origin → Production": "Emissions from raw material extraction, processing, and manufacturing at the point of origin.",
  "Transport": "Carbon footprint from transporting materials from production facilities to the construction site.",
  "Construction": "On-site emissions during the building phase, including equipment use and installation processes.",
  "Maintenance": "Lifecycle emissions from repairs, replacements, and ongoing maintenance over the building's lifetime.",
  "End of Life": "End-of-life impacts including demolition, waste processing, and material disposal or recycling.",
};

const calculationSteps: Record<PhaseKey, string[]> = {
  "Point of Origin → Production": [
    "Raw material extraction energy consumption",
    "Manufacturing process emissions",
    "Factory overhead and facility operations",
    "Quality control and packaging impacts",
  ],
  "Transport": [
    "Distance from production to site",
    "Transportation mode fuel efficiency",
    "Loading and unloading equipment",
    "Storage and warehousing impacts",
  ],
  "Construction": [
    "On-site equipment fuel consumption",
    "Installation process energy use",
    "Waste generated during construction",
    "Worker transportation to site",
  ],
  "Maintenance": [
    "Expected service life of material",
    "Frequency of repairs or replacements",
    "Cleaning and upkeep requirements",
    "Performance degradation over time",
  ],
  "End of Life": [
    "Demolition energy requirements",
    "Transportation to disposal facilities",
    "Landfill or recycling processing",
    "Potential for material recovery",
  ],
};

export const PhaseDetailsDrawer = ({
  open,
  onOpenChange,
  material,
  phase,
  value,
  units,
}: PhaseDetailsDrawerProps) => {
  if (!phase) return null;

  const phaseInfo = phaseConfig[phase];
  const formatNumber = (val: number) => new Intl.NumberFormat("en-US").format(val);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-2xl">
            {material} — {phaseInfo.label}
          </DrawerTitle>
          <DrawerDescription className="text-base mt-2">
            {phaseDescriptions[phase]}
          </DrawerDescription>
          <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-sm text-muted-foreground mb-1">Total Impact</p>
            <p className="text-3xl font-bold text-foreground">
              {formatNumber(value)} {units === "kgCO2e" ? "kg CO₂e" : "MJ"}
            </p>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <h3 className="font-semibold text-foreground mb-3">How we calculated this:</h3>
          <ul className="space-y-2">
            {calculationSteps[phase].map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5 ${phaseInfo.colorClass} bg-current/20`}
                >
                  {index + 1}
                </span>
                <span className="flex-1">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <DrawerFooter>
          <Button variant="outline" className="w-full" asChild>
            <a
              href="https://docs.lovable.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              Learn more about LCA methodology
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
          <DrawerClose asChild>
            <Button variant="secondary" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
