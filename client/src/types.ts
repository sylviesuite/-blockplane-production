export type PhaseMap = {
  pointOfOrigin: number;
  production: number;
  transport: number;
  construction: number;
  disposal: number;
};

export type RISComponents = {
  carbonRecovery: number;     // 0-100
  durability: number;          // 0-100
  circularity: number;         // 0-100
  materialHealth: number;      // 0-100
  biodiversity: number;        // 0-100
};

export type RISTier = "Gold" | "Silver" | "Bronze" | "Problematic";

export type MaterialCost = {
  capex: number;              // $/m²
  maintPerYear: number;       // $/m²/year
  energyPerYear: number;      // $/m²/year
  salvageValue: number;       // $/m²
  lifespanYears: number;
};

export type MaterialScores = {
  lis: number;                // 0-100 (higher = better, lower impact)
  ris: number;                // 0-100 (higher = better, more regenerative)
  risTier: RISTier;
  cpi: number;                // Cost-Performance Index (lower = better value)
};

export type ImpactCategories = {
  CO2e: number[];             // Lifecycle phases
  Water?: number[];
  Acidification?: number[];
  Resource?: number[];
  Energy?: number[];
};

export type Material = {
  id: string;
  name: string;
  materialType: string;
  sourceRegion?: string;

  // Primary metric (usually CO2e)
  phases: PhaseMap;
  total: number;
  meta?: { unit?: string };

  // Optional: embodied energy metric (MJ, kWh, etc.)
  phasesEnergy?: PhaseMap;
  totalEnergy?: number;
  metaEnergy?: { unit?: string };

  // Cost data (for CPI calculation)
  cost?: MaterialCost;

  // Calculated scores
  scores?: MaterialScores;

  // RIS component breakdown (for detailed analysis)
  risComponents?: RISComponents;

  // Multi-impact data (for advanced analysis)
  impacts?: ImpactCategories;
};
