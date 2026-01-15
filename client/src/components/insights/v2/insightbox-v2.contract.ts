export type InsightDriversV2 = {
  lis?: string[];
  ris?: string[];
  cpi?: string[];
};

export type InsightInputV2 = {
  materialId: string;
  materialName: string;
  lis?: number;
  ris?: number;
  cpi?: number;
  drivers?: InsightDriversV2;
  comparisonBenchmark?: string;
};

export type InsightOutputV2 = {
  takeaway: string;
  lis_drivers: string[];
  ris_drivers: string[];
  cpi_explainer: string;
  comparison?: string;
  confidence: string[];
  next_actions: string[];
};

export type InsightBlock = string;

const describeTier = (value: number | undefined, metric: "LIS" | "RIS" | "CPI") => {
  if (value === undefined) return "undisclosed";
  if (metric === "LIS") {
    if (value <= 30) return "low";
    if (value <= 60) return "moderate";
    return "elevated";
  }
  if (metric === "RIS") {
    if (value >= 70) return "strong";
    if (value >= 40) return "balanced";
    return "emerging";
  }
  if (metric === "CPI") {
    if (value <= 35) return "efficient";
    if (value <= 65) return "mid-range";
    return "premium";
  }
  return "undisclosed";
};

const buildDriverStatements = (
  metric: "LIS" | "RIS",
  value: number | undefined,
  positive: string,
  negative: string
) => {
  if (value === undefined) {
    return [`${metric} data pending.`];
  }

  const statements = [];
  if (metric === "LIS") {
    if (value <= 30) {
      statements.push(`Positive: ${positive}`);
      statements.push("Continue protecting low-carbon inputs to keep this score contained.");
    } else {
      statements.push(`Watch: ${negative}`);
      statements.push("Opportunity: revisit sourcing to reduce high-impact materials.");
    }
  } else {
    if (value >= 60) {
      statements.push(`Positive: ${positive}`);
      statements.push("Maintain regenerative practices to preserve this momentum.");
    } else {
      statements.push(`Area to grow: ${negative}`);
      statements.push("Opportunity: refresh program investments to help RIS improve.");
    }
  }

  return statements;
};

const buildNextActions = (materialName: string) => [
  `Confirm local sourcing partners that can deliver ${materialName || "this material"} consistently.`,
  "Verify maintenance and longevity expectations with the project team.",
  "Compare alternatives with higher RIS or lower CPI before finalizing the specification.",
];

const buildConfidenceNotes = (lis?: number, ris?: number, cpi?: number) => {
  const notes: string[] = ["Scores derive from deterministic LIS/RIS/CPI values."];
  if (lis === undefined) notes.push("LIS data missing for this version.");
  if (ris === undefined) notes.push("RIS data missing for this version.");
  if (cpi === undefined) notes.push("CPI data missing for this version.");
  if (notes.length === 1) {
    return ["No major uncertainties flagged."];
  }
  return notes;
};

const buildComparison = (input: InsightInputV2) => {
  if (input.comparisonBenchmark) return input.comparisonBenchmark;
  if (input.lis === undefined) return undefined;
  const descriptor = input.lis <= 35 ? "lower" : "higher";
  return `Compared to a Benchmark 2000 reference, LIS is ${descriptor} than expected.`;
};

export function renderInsightStaticV2(input: any): any {
  const typedInput = input as InsightInputV2;
  const { materialName, lis, ris, cpi, drivers } = typedInput;
  const driverHint =
    drivers?.lis?.[0] ?? drivers?.ris?.[0] ?? drivers?.cpi?.[0] ?? "the current lifecycle profile";

  const lisTier = describeTier(lis, "LIS");
  const risTier = describeTier(ris, "RIS");

  const takeaway = `${materialName || "This material"} sits in the ${lisTier} LIS tier with ${risTier} regenerative potential, driven by ${driverHint}.`;
  const lisDrivers = buildDriverStatements(
    "LIS",
    lis,
    "low-carbon sourcing keeps the lifecycle impact grounded.",
    "energy-intensive processing pushes the score upward."
  );
  const risDrivers = buildDriverStatements(
    "RIS",
    ris,
    "higher regenerative strategies such as reclaimed content create lift.",
    "limited regenerative inputs constrain overall potential."
  );
  const cpiExplainer = cpi
    ? `CPI sits at ${cpi.toFixed(1)}, indicating ${describeTier(cpi, "CPI")} cost intensity for this specification.`
    : "CPI data unavailable; confirm cost estimates before committing.";
  const confidence = buildConfidenceNotes(lis, ris, cpi);
  const next_actions = buildNextActions(materialName);
  const comparison = buildComparison(input);

  return {
    takeaway,
    lis_drivers: lisDrivers,
    ris_drivers: risDrivers,
    cpi_explainer: cpiExplainer,
    comparison,
    confidence,
    next_actions,
  };
}

