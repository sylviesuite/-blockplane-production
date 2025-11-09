import { RISComponents, RISTier, MaterialCost } from "../types";

/**
 * LIS (Lifecycle Impact Score) Calculation
 * 
 * Measures total environmental damage normalized against a benchmark.
 * Scale: 0-200+ (higher = worse, meaning higher environmental impact)
 * 
 * Benchmark: 200 kgCO₂e/m² represents the 2000 wall-system average
 * - LIS = 100 means equal to baseline
 * - LIS < 100 means better than baseline
 * - LIS > 100 means worse than baseline
 */

const LIS_BENCHMARK = 200; // kgCO₂e/m² - can be adjusted based on material category

export function calculateLIS(totalCarbon: number, benchmark: number = LIS_BENCHMARK): number {
  // Higher LIS = Worse (more carbon)
  const score = (totalCarbon / benchmark) * 100;
  
  // Round to 1 decimal place
  return Math.round(score * 10) / 10;
}

/**
 * RIS (Regenerative Impact Score) Calculation
 * 
 * Measures a material's potential to create positive environmental and social impact.
 * Scale: 0-100 (higher = better, more regenerative)
 * 
 * Components:
 * - Carbon Recovery (30%): Biogenic carbon sequestration
 * - Durability (25%): Expected service life
 * - Circularity (20%): Recycled content and recyclability
 * - Material Health (15%): VOCs, toxicity, transparency
 * - Biodiversity (10%): Ecosystem impact and restoration
 */

const RIS_WEIGHTS = {
  carbonRecovery: 0.30,
  durability: 0.25,
  circularity: 0.20,
  materialHealth: 0.15,
  biodiversity: 0.10,
};

export function calculateRIS(components: RISComponents): number {
  const weightedSum = 
    (components.carbonRecovery * RIS_WEIGHTS.carbonRecovery) +
    (components.durability * RIS_WEIGHTS.durability) +
    (components.circularity * RIS_WEIGHTS.circularity) +
    (components.materialHealth * RIS_WEIGHTS.materialHealth) +
    (components.biodiversity * RIS_WEIGHTS.biodiversity);

  return Math.round(weightedSum);
}

/**
 * RIS Tier Classification
 * 
 * Categorizes materials into four tiers based on RIS score.
 */

export function getRISTier(ris: number): RISTier {
  if (ris >= 75) return "Gold";
  if (ris >= 60) return "Silver";
  if (ris >= 40) return "Bronze";
  return "Problematic";
}

/**
 * CPI (Cost-Performance Index) Calculation
 * 
 * Measures the cost-effectiveness of a material relative to its environmental impact.
 * Lower CPI = better value (less cost per unit of impact)
 * 
 * Formula: Total Lifecycle Cost / Total Carbon Impact
 */

export function calculateCPI(
  totalCarbon: number,
  cost: MaterialCost | undefined,
  years: number = 30,
  discountRate: number = 0.03
): number {
  if (!cost || totalCarbon === 0) return 0;
  
  // Calculate Net Present Value of lifecycle costs
  const npvMaintenance = calculateNPV(cost.maintPerYear, years, discountRate);
  const npvEnergy = calculateNPV(cost.energyPerYear, years, discountRate);
  const npvSalvage = cost.salvageValue / Math.pow(1 + discountRate, years);
  
  const totalCost = 
    cost.capex + 
    npvMaintenance + 
    npvEnergy - 
    npvSalvage;
  
  // CPI = Total Cost / Total Carbon Impact
  // Lower is better (less cost per unit of carbon)
  return Number((totalCost / totalCarbon).toFixed(2));
}

/**
 * Helper: Calculate Net Present Value of annual costs
 */
function calculateNPV(annualCost: number, years: number, discountRate: number): number {
  let npv = 0;
  for (let year = 1; year <= years; year++) {
    npv += annualCost / Math.pow(1 + discountRate, year);
  }
  return npv;
}

/**
 * Quadrant Classification
 * 
 * Categorizes materials into four quadrants based on LIS and RIS scores:
 * - Regenerative: Low LIS (< 50), High RIS (>= 50) - Best choice (low impact, high regeneration)
 * - Transitional: High LIS (>= 50), High RIS (>= 50) - Acceptable (higher impact but regenerative)
 * - Costly: High LIS (>= 50), Low RIS (< 50) - Poor (high impact, not regenerative)
 * - Problematic: Low LIS (< 50), Low RIS (< 50) - Worst (moderate impact, not regenerative)
 * 
 * Note: LIS scale where higher = worse (more carbon)
 */

export type Quadrant = "Regenerative" | "Transitional" | "Costly" | "Problematic";

export function classifyQuadrant(lis: number, ris: number): Quadrant {
  const LIS_THRESHOLD = 50;  // 50 = half of baseline (100 kgCO2e vs 200 baseline)
  const RIS_THRESHOLD = 50;
  
  // Lower LIS = Better (less carbon)
  // Higher RIS = Better (more regenerative)
  
  if (lis < LIS_THRESHOLD && ris >= RIS_THRESHOLD) {
    return "Regenerative";  // Low impact, high regeneration
  } else if (lis >= LIS_THRESHOLD && ris >= RIS_THRESHOLD) {
    return "Transitional";  // Higher impact but regenerative
  } else if (lis >= LIS_THRESHOLD && ris < RIS_THRESHOLD) {
    return "Costly";  // High impact, not regenerative
  } else {
    return "Problematic";  // Moderate impact, not regenerative
  }
}

/**
 * Helper: Calculate all scores for a material at once
 */

export function calculateAllScores(
  totalCarbon: number,
  risComponents: RISComponents | undefined,
  cost: MaterialCost | undefined,
  years: number = 30
) {
  const lis = calculateLIS(totalCarbon);
  const ris = risComponents ? calculateRIS(risComponents) : 0;
  const risTier = getRISTier(ris);
  const cpi = calculateCPI(totalCarbon, cost, years);
  const quadrant = classifyQuadrant(lis, ris);
  
  return {
    lis,
    ris,
    risTier,
    cpi,
    quadrant,
  };
}
