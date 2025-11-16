import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGIONS, type Region } from "@/lib/regionalCost";

interface RegionSelectorProps {
  value: string;
  onChange: (regionId: string) => void;
  label?: string;
  showDescription?: boolean;
}

/**
 * Region selector component for choosing construction market location
 */
export function RegionSelector({ 
  value, 
  onChange, 
  label = "Location",
  showDescription = true 
}: RegionSelectorProps) {
  const selectedRegion = REGIONS.find(r => r.id === value);

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          {REGIONS.map((region) => (
            <SelectItem key={region.id} value={region.id}>
              <div className="flex items-center justify-between gap-4">
                <span>{region.name}</span>
                <span className="text-xs text-muted-foreground">
                  {region.multiplier === 1.0 
                    ? "Baseline" 
                    : region.multiplier > 1.0
                    ? `+${((region.multiplier - 1) * 100).toFixed(0)}%`
                    : `-${((1 - region.multiplier) * 100).toFixed(0)}%`
                  }
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showDescription && selectedRegion && (
        <p className="text-xs text-muted-foreground">
          {selectedRegion.description}
        </p>
      )}
    </div>
  );
}
