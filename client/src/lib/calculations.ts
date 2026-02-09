// TODO: `shared/scoring.ts` is the new canonical source of truth for all LIS/RIS/CPI calculations.
// This file only re-exports LIS/RIS/CPI scoring utilities and types.

export type {
  MaterialCost,
  MaterialScores,
  Quadrant,
  RISComponents,
  RISTier,
} from "@shared/scoring";

export {
  calculateAllScores,
  calculateCPI,
  calculateLIS,
  calculateNPV,
  calculateRIS,
  classifyQuadrant,
  getRISTier,
  LIS_BENCHMARK,
  RIS_WEIGHTS,
} from "@shared/scoring";
