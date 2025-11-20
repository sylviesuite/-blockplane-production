import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format large CO₂e values - use tonnes (t) for values >= 1000 kg
 */
export function formatCO2eValue(value: number, unit: string): { value: string; unit: string } {
  if (unit.includes("kg CO₂e") && value >= 1000) {
    return {
      value: (value / 1000).toFixed(2),
      unit: unit.replace("kg", "t"),
    };
  }
  return {
    value: value.toFixed(1),
    unit,
  };
}
