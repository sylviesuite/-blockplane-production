/**
 * Centralized scoring utilities for LIS/RIS/CPI calculations.
 * Provides the shared source of truth for lifecycle impact, regenerative impact, cost-performance, and derived quadrants.
 */

export type RISComponents = {
  carbonRecovery: number; // 0-100
  durability: number; // 0-100
  circularity: number; // 0-100
  materialHealth: number; // 0-100
  biodiversity: number; // 0-100
};

export type MaterialCost = {
  capex: number; // $/unit
  maintPerYear: number; // $/unit/year
  energyPerYear: number; // $/unit/year
  salvageValue: number; // $/unit
  lifespanYears: number;
};

export type RISTier = "Gold" | "Silver" | "Bronze" | "Problematic";
export type Quadrant = "Regenerative" | "Transitional" | "Costly" | "Problematic";

export interface MaterialScores {
  lis: number;
  ris: number;
  risTier: RISTier;
  cpi: number;
  quadrant: Quadrant;
}

export const LIS_BENCHMARK = 200; // kg CO₂e/m² baseline

export const RIS_WEIGHTS = {
  carbonRecovery: 0.30,
  durability: 0.25,
  circularity: 0.20,
  materialHealth: 0.15,
  biodiversity: 0.10,
};

/**
 * Calculate Life Impact Score (LIS) from total carbon.
 */
export function calculateLIS(totalCarbon: number, benchmark: number = LIS_BENCHMARK): number {
  const score = (totalCarbon / benchmark) * 100;
  return Math.round(score * 10) / 10;
}

/**
 * Calculate Regenerative Impact Score (RIS) by weighting components.
 * Falls back to an explicit score if components are not provided.
 */
export function calculateRIS(components?: RISComponents, fallback?: number): number {
  if (components) {
    const weightedSum =
      components.carbonRecovery * RIS_WEIGHTS.carbonRecovery +
      components.durability * RIS_WEIGHTS.durability +
      components.circularity * RIS_WEIGHTS.circularity +
      components.materialHealth * RIS_WEIGHTS.materialHealth +
      components.biodiversity * RIS_WEIGHTS.biodiversity;

    return Math.round(weightedSum);
  }

  if (fallback !== undefined) {
    return fallback;
  }

  return 0;
}

export function getRISTier(ris: number): RISTier {
  if (ris >= 75) return "Gold";
  if (ris >= 60) return "Silver";
  if (ris >= 40) return "Bronze";
  return "Problematic";
}

/**
 * Helper: Net Present Value of annual costs.
 */
export function calculateNPV(annualCost: number, years: number, discountRate: number): number {
  let npv = 0;
  for (let year = 1; year <= years; year++) {
    npv += annualCost / Math.pow(1 + discountRate, year);
  }
  return npv;
}

/**
 * Calculate Cost-Performance Index (CPI) as total lifecycle cost / total carbon.
 */
export function calculateCPI(
  totalCarbon: number,
  cost?: MaterialCost,
  years: number = 30,
  discountRate: number = 0.03
): number {
  if (!cost || totalCarbon === 0) return 0;

  const npvMaintenance = calculateNPV(cost.maintPerYear, years, discountRate);
  const npvEnergy = calculateNPV(cost.energyPerYear, years, discountRate);
  const npvSalvage = cost.salvageValue / Math.pow(1 + discountRate, years);

  const totalCost = cost.capex + npvMaintenance + npvEnergy - npvSalvage;
  return Number((totalCost / totalCarbon).toFixed(2));
}

export function classifyQuadrant(lis: number, ris: number): Quadrant {
  const LIS_THRESHOLD = 50;
  const RIS_THRESHOLD = 50;

  if (lis < LIS_THRESHOLD && ris >= RIS_THRESHOLD) {
    return "Regenerative";
  }
  if (lis >= LIS_THRESHOLD && ris >= RIS_THRESHOLD) {
    return "Transitional";
  }
  if (lis >= LIS_THRESHOLD && ris < RIS_THRESHOLD) {
    return "Costly";
  }
  return "Problematic";
}

export function calculateAllScores(options: {
  totalCarbon: number;
  risComponents?: RISComponents;
  risScoreOverride?: number;
  cost?: MaterialCost;
  years?: number;
  benchmark?: number;
  discountRate?: number;
}): MaterialScores {
  const lis = calculateLIS(options.totalCarbon, options.benchmark);
  const ris = calculateRIS(options.risComponents, options.risScoreOverride);
  const risTier = getRISTier(ris);
  const cpi = calculateCPI(options.totalCarbon, options.cost, options.years, options.discountRate);
  const quadrant = classifyQuadrant(lis, ris);

  return {
    lis,
    ris,
    risTier,
    cpi,
    quadrant,
  };
}

export type CPIBand = "good" | "watch" | "warning" | "extreme";

export const CPI_THRESHOLDS = {
  goodMax: 50,
  watchMax: 150,
  warningMax: 300,
} as const;

export function classifyCPIBand(cpi: number): CPIBand {
  if (!Number.isFinite(cpi) || cpi < 0) return "extreme";
  if (cpi <= CPI_THRESHOLDS.goodMax) return "good";
  if (cpi <= CPI_THRESHOLDS.watchMax) return "watch";
  if (cpi <= CPI_THRESHOLDS.warningMax) return "warning";
  return "extreme";
}

export interface InsightScores {
  lis: number;
  ris: number;
  cpi: number;
  quadrant: Quadrant;
  risComponents: RISComponents;
  parisAlignment: number;
  cpiBand: CPIBand;
}

export function buildInsightScores(args: {
  lis: number;
  ris: number;
  cpi: number;
  quadrant: Quadrant;
  risComponents: RISComponents;
  parisAlignment: number;
}): InsightScores {
  return {
    ...args,
    cpiBand: classifyCPIBand(args.cpi),
  };
}

export interface RISChartDatum {
  key: keyof RISComponents;
  label: string;
  score: number;
}

export function toRISChartData(components: RISComponents): RISChartDatum[] {
  return [
    { key: "carbonRecovery", label: "Carbon Recovery", score: components.carbonRecovery },
    { key: "durability", label: "Durability", score: components.durability },
    { key: "circularity", label: "Circularity", score: components.circularity },
    { key: "materialHealth", label: "Material Health", score: components.materialHealth },
    { key: "biodiversity", label: "Biodiversity", score: components.biodiversity },
  ];
}

export interface ParisAlignmentInput {
  projectLis: number;
  parisLisBudget: number;
}

export function computeParisAlignment({ projectLis, parisLisBudget }: ParisAlignmentInput): number {
  if (!Number.isFinite(projectLis) || !Number.isFinite(parisLisBudget) || parisLisBudget <= 0) {
    return 0;
  }

  const ratio = parisLisBudget / projectLis;
  const percent = ratio * 100;

  return Math.max(0, Math.min(100, percent));
}

