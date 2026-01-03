export interface MaterialInsightPromptInput {
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

const explainScores =
  "LIS (Lifecycle Impact Score) represents the materials’ total carbon burden over its life. " +
  "RIS (Regenerative Impact Score) reflects how much recovery and circularity the material delivers. " +
  "CPI (Cost-Performance Index) shows the dollars-per-kilogram CO₂e efficiency—lower is better.";

export function buildMaterialInsightPrompt(input: MaterialInsightPromptInput): string {
  const { materialName, lis, ris, cpi, context } = input;

  const facts: string[] = [];
  if (materialName) facts.push(`Material: ${materialName}`);
  if (lis !== undefined) facts.push(`LIS: ${lis}`);
  if (ris !== undefined) facts.push(`RIS: ${ris}`);
  if (cpi !== undefined) facts.push(`CPI: ${cpi}`);

  const contextLines = [];
  if (context?.region) contextLines.push(`Region: ${context.region}`);
  if (context?.climateZone) contextLines.push(`Climate zone: ${context.climateZone}`);
  if (context?.buildingType) contextLines.push(`Building type: ${context.buildingType}`);

  return `
You are a calm, practical sustainability advisor for designers and builders.
${explainScores}

Facts:
${facts.join("\n")}
${contextLines.length > 0 ? `Context:\n${contextLines.join("\n")}` : ""}

Task:
1. What this score suggests — interpret the LIS/RIS/CPI balance in accessible terms.
2. Best next move — give a concrete, realistic action the team could take.
3. Watch-outs / assumptions — surface any caveats and assumptions.
Keep each section concise. Avoid fear or FOMO language. Stay under 160 words total. Use polite, steady tone.
`.trim();
}

