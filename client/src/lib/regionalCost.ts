/**
 * Regional Cost Adjustment Utilities
 * 
 * Applies location-based cost multipliers to material base costs.
 * Based on construction cost indices for major US markets.
 */

export interface Region {
  id: string;
  name: string;
  multiplier: number; // Cost multiplier relative to national average
  description: string;
}

/**
 * Major US construction markets with cost multipliers
 * Based on RSMeans City Cost Indexes (2024)
 */
export const REGIONS: Region[] = [
  {
    id: "national",
    name: "National Average",
    multiplier: 1.0,
    description: "US national average construction costs"
  },
  {
    id: "nyc",
    name: "New York City",
    multiplier: 1.45,
    description: "Manhattan and surrounding boroughs - highest labor and material costs"
  },
  {
    id: "sf",
    name: "San Francisco Bay Area",
    multiplier: 1.38,
    description: "SF, Oakland, San Jose - high labor costs, strict building codes"
  },
  {
    id: "la",
    name: "Los Angeles",
    multiplier: 1.22,
    description: "LA metro area - above average costs, seismic requirements"
  },
  {
    id: "seattle",
    name: "Seattle",
    multiplier: 1.28,
    description: "Seattle metro - high labor costs, growing market"
  },
  {
    id: "boston",
    name: "Boston",
    multiplier: 1.32,
    description: "Boston metro - high labor costs, historic preservation requirements"
  },
  {
    id: "chicago",
    name: "Chicago",
    multiplier: 1.18,
    description: "Chicago metro - above average costs, strong union presence"
  },
  {
    id: "denver",
    name: "Denver",
    multiplier: 1.12,
    description: "Denver metro - moderate premium, growing market"
  },
  {
    id: "miami",
    name: "Miami",
    multiplier: 1.08,
    description: "Miami metro - hurricane requirements, moderate costs"
  },
  {
    id: "atlanta",
    name: "Atlanta",
    multiplier: 0.95,
    description: "Atlanta metro - near national average"
  },
  {
    id: "dallas",
    name: "Dallas-Fort Worth",
    multiplier: 0.92,
    description: "DFW metro - below average costs, business-friendly"
  },
  {
    id: "phoenix",
    name: "Phoenix",
    multiplier: 0.90,
    description: "Phoenix metro - below average costs, desert climate"
  },
  {
    id: "rural",
    name: "Rural / Small Town",
    multiplier: 0.78,
    description: "Rural areas and small towns - lowest costs, limited supplier access"
  }
];

/**
 * Get region by ID
 */
export function getRegion(regionId: string): Region | undefined {
  return REGIONS.find(r => r.id === regionId);
}

/**
 * Apply regional cost adjustment to a base cost
 */
export function applyRegionalCost(baseCost: number, regionId: string): number {
  const region = getRegion(regionId);
  if (!region) return baseCost;
  return baseCost * region.multiplier;
}

/**
 * Calculate cost difference between two regions
 */
export function calculateRegionalDifference(
  baseCost: number,
  fromRegionId: string,
  toRegionId: string
): {
  fromCost: number;
  toCost: number;
  difference: number;
  percentDifference: number;
} {
  const fromCost = applyRegionalCost(baseCost, fromRegionId);
  const toCost = applyRegionalCost(baseCost, toRegionId);
  const difference = toCost - fromCost;
  const percentDifference = (difference / fromCost) * 100;

  return {
    fromCost,
    toCost,
    difference,
    percentDifference
  };
}

/**
 * Get all regions sorted by cost (lowest to highest)
 */
export function getRegionsSortedByCost(): Region[] {
  return [...REGIONS].sort((a, b) => a.multiplier - b.multiplier);
}

/**
 * Format regional cost for display
 */
export function formatRegionalCost(baseCost: number, regionId: string): string {
  const adjustedCost = applyRegionalCost(baseCost, regionId);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(adjustedCost);
}

/**
 * Get cost range across all regions
 */
export function getCostRange(baseCost: number): {
  min: number;
  max: number;
  minRegion: Region;
  maxRegion: Region;
} {
  const sortedRegions = getRegionsSortedByCost();
  const minRegion = sortedRegions[0];
  const maxRegion = sortedRegions[sortedRegions.length - 1];

  return {
    min: applyRegionalCost(baseCost, minRegion.id),
    max: applyRegionalCost(baseCost, maxRegion.id),
    minRegion,
    maxRegion
  };
}
