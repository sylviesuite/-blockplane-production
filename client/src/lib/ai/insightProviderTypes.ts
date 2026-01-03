export interface MaterialInsightInput {
  materialId: string;
  materialName?: string;
  lis?: number;
  ris?: number;
  cpi?: number;
  context?: {
    climateZone?: string;
    region?: string;
    buildingType?: string;
  };
}

export interface InsightGenerationResult {
  text: string;
}

export interface InsightProvider {
  generateMaterialInsight(input: MaterialInsightInput): Promise<InsightGenerationResult>;
}

export type AIProviderName = "mock" | "openai" | "claude";

