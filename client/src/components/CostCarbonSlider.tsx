import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Leaf, TrendingDown, TrendingUp } from "lucide-react";

interface CostCarbonSliderProps {
  onPreferenceChange: (preference: number) => void;
  initialPreference?: number;
}

/**
 * Interactive slider for adjusting cost-carbon trade-off preference
 * 
 * 0 = Prioritize lowest cost
 * 50 = Balanced approach
 * 100 = Prioritize lowest carbon
 */
export function CostCarbonSlider({ onPreferenceChange, initialPreference = 50 }: CostCarbonSliderProps) {
  const [preference, setPreference] = useState(initialPreference);

  const handleChange = (value: number[]) => {
    const newPreference = value[0];
    setPreference(newPreference);
    onPreferenceChange(newPreference);
  };

  const getPreferenceLabel = () => {
    if (preference < 25) return "Cost Focused";
    if (preference < 45) return "Cost Preferred";
    if (preference < 55) return "Balanced";
    if (preference < 75) return "Carbon Preferred";
    return "Carbon Focused";
  };

  const getPreferenceColor = () => {
    if (preference < 25) return "text-red-600";
    if (preference < 45) return "text-orange-600";
    if (preference < 55) return "text-yellow-600";
    if (preference < 75) return "text-lime-600";
    return "text-green-600";
  };

  const getPreferenceDescription = () => {
    if (preference < 25) {
      return "Showing lowest-cost materials first, regardless of carbon impact.";
    }
    if (preference < 45) {
      return "Prioritizing cost savings while considering carbon when prices are similar.";
    }
    if (preference < 55) {
      return "Balancing cost and carbon - showing materials with best overall value.";
    }
    if (preference < 75) {
      return "Prioritizing carbon reduction while keeping costs reasonable.";
    }
    return "Showing lowest-carbon materials first, accepting cost premiums for sustainability.";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Cost-Carbon Trade-off
          <Leaf className="w-5 h-5 ml-auto" />
        </CardTitle>
        <CardDescription>
          Adjust the slider to prioritize cost savings or carbon reduction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="w-4 h-4" />
              <span>Lowest Cost</span>
            </div>
            <div className={`font-semibold ${getPreferenceColor()}`}>
              {getPreferenceLabel()}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Lowest Carbon</span>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <Slider
            value={[preference]}
            onValueChange={handleChange}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            {getPreferenceDescription()}
          </p>
        </div>

        {/* Visual indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4" />
              Cost Weight
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${100 - preference}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {(100 - preference).toFixed(0)}%
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Leaf className="w-4 h-4" />
              Carbon Weight
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${preference}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {preference.toFixed(0)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
