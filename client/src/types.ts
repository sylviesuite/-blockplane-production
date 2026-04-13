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
  value: number;              // $/m²
  unit: string;               // e.g. "m²", "kg", "tonne"
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

  // Flat score accessors (mirror scores.ris / scores.lis for component convenience)
  ris?: number;
  lis?: number;

  // Classification & display
  category?: string;
  functionalUnit?: string;

  // Extended material properties
  embodiedEnergy_MJ_per_kg?: number;
  co2_kg_per_kg?: number;
  notes?: string;
  description?: string;
};
