import { afterEach, describe, expect, it } from "vitest";
import {
  calculateAllScores,
  calculateCPI,
  calculateLIS,
  calculateNPV,
  calculateRIS,
  classifyCPIBand,
  classifyQuadrant,
  computeParisAlignment,
  buildInsightScores,
  buildStaticInsightText,
  toRISChartData,
  MaterialCost,
  RISComponents,
  RIS_WEIGHTS,
} from "./scoring";

const sampleComponents: RISComponents = {
  carbonRecovery: 85,
  durability: 75,
  circularity: 65,
  materialHealth: 80,
  biodiversity: 55,
};

const sampleCost: MaterialCost = {
  capex: 200,
  maintPerYear: 5,
  energyPerYear: 4,
  salvageValue: 50,
  lifespanYears: 30,
};

const originalWeights = { ...RIS_WEIGHTS };

afterEach(() => {
  Object.assign(RIS_WEIGHTS, originalWeights);
});

describe("calculateRIS", () => {
  it("returns zero when all RIS components are zero", () => {
    const zeroComponents: RISComponents = {
      carbonRecovery: 0,
      durability: 0,
      circularity: 0,
      materialHealth: 0,
      biodiversity: 0,
    };
    expect(calculateRIS(zeroComponents)).toBe(0);
  });

  it("matches the weighted sum for asymmetric data", () => {
    const expected = Math.round(
      sampleComponents.carbonRecovery * RIS_WEIGHTS.carbonRecovery +
        sampleComponents.durability * RIS_WEIGHTS.durability +
        sampleComponents.circularity * RIS_WEIGHTS.circularity +
        sampleComponents.materialHealth * RIS_WEIGHTS.materialHealth +
        sampleComponents.biodiversity * RIS_WEIGHTS.biodiversity
    );
    expect(calculateRIS(sampleComponents)).toBe(expected);
  });

  it("uses the raw weighted sum when weights do not sum to 1", () => {
    Object.assign(RIS_WEIGHTS, {
      carbonRecovery: 0.5,
      durability: 0.2,
      circularity: 0.15,
      materialHealth: 0.1,
      biodiversity: 0.1,
    });

    const customComponents: RISComponents = {
      carbonRecovery: 60,
      durability: 20,
      circularity: 40,
      materialHealth: 10,
      biodiversity: 5,
    };

    const expected = Math.round(
      customComponents.carbonRecovery * RIS_WEIGHTS.carbonRecovery +
        customComponents.durability * RIS_WEIGHTS.durability +
        customComponents.circularity * RIS_WEIGHTS.circularity +
        customComponents.materialHealth * RIS_WEIGHTS.materialHealth +
        customComponents.biodiversity * RIS_WEIGHTS.biodiversity
    );

    expect(calculateRIS(customComponents)).toBe(expected);
  });
});

describe("calculateLIS", () => {
  it("computes LIS consistent with the baseline", () => {
    expect(calculateLIS(150)).toBe(75);
  });

  it("returns finite numbers for zero and tiny carbon outputs", () => {
    expect(Number.isFinite(calculateLIS(0))).toBe(true);
    expect(Number.isFinite(calculateLIS(0.0001))).toBe(true);
  });
});

describe("calculateNPV", () => {
  it("returns smaller values when the discount rate increases", () => {
    const lowRate = calculateNPV(10, 10, 0.01);
    const highRate = calculateNPV(10, 10, 0.05);
    expect(highRate).toBeLessThan(lowRate);
  });

  it("returns larger values when the annual payment increases", () => {
    const lowAnnual = calculateNPV(5, 10, 0.03);
    const highAnnual = calculateNPV(15, 10, 0.03);
    expect(highAnnual).toBeGreaterThan(lowAnnual);
  });
});

describe("quadrant classification", () => {
  it("puts high RIS and low LIS into the Regenerative quadrant", () => {
    expect(classifyQuadrant(30, 80)).toBe("Regenerative");
  });

  it("puts high LIS and high RIS into the Transitional quadrant", () => {
    expect(classifyQuadrant(55, 65)).toBe("Transitional");
  });

  it("puts high LIS and low RIS into the Costly quadrant", () => {
    expect(classifyQuadrant(75, 40)).toBe("Costly");
  });

  it("puts low LIS and low RIS into the Problematic quadrant", () => {
    expect(classifyQuadrant(30, 30)).toBe("Problematic");
  });
});

describe("Insight scoring helpers", () => {
  it("builds InsightScores and includes the CPI band", () => {
    const insight = buildInsightScores({
      lis: 45,
      ris: 70,
      cpi: 20,
      quadrant: "Regenerative",
      risComponents: sampleComponents,
      parisAlignment: 88,
    });

    expect(insight.cpiBand).toBe("good");
    expect(insight.parisAlignment).toBe(88);
  });
});

describe("CPI band classification", () => {
  it("classifies 20 as good based on the current threshold", () => {
    expect(classifyCPIBand(20)).toBe("good");
  });

  it("classifies 80 as watch (between 50 and 150)", () => {
    expect(classifyCPIBand(80)).toBe("watch");
  });

  it("classifies 200 as warning (between 150 and 300)", () => {
    expect(classifyCPIBand(200)).toBe("warning");
  });

  it("classifies 1000, negative, or NaN as extreme", () => {
    expect(classifyCPIBand(1000)).toBe("extreme");
    expect(classifyCPIBand(-5)).toBe("extreme");
    expect(classifyCPIBand(Number.NaN)).toBe("extreme");
  });
});

describe("Paris alignment helper", () => {
  it("returns 100% when projectLis equals the Paris budget", () => {
    expect(computeParisAlignment({ projectLis: 150, parisLisBudget: 150 })).toBe(100);
  });

  it("caps values at 100% when project is better than budget", () => {
    expect(computeParisAlignment({ projectLis: 75, parisLisBudget: 150 })).toBe(100);
  });

  it("returns a lower percentage when projectLis exceeds the budget", () => {
    expect(computeParisAlignment({ projectLis: 300, parisLisBudget: 150 })).toBe(50);
  });

  it("defensively handles invalid inputs by returning 0", () => {
    expect(computeParisAlignment({ projectLis: Number.NaN, parisLisBudget: 150 })).toBe(0);
    expect(computeParisAlignment({ projectLis: 150, parisLisBudget: 0 })).toBe(0);
  });
});

describe("RIS chart data helper", () => {
  it("produces five labeled entries that mirror the input scores", () => {
    const radar = toRISChartData(sampleComponents);
    expect(radar).toHaveLength(5);
    expect(radar.map((d) => d.label)).toEqual([
      "Carbon Recovery",
      "Durability",
      "Circularity",
      "Material Health",
      "Biodiversity",
    ]);
    expect(radar.map((d) => d.score)).toEqual([
      sampleComponents.carbonRecovery,
      sampleComponents.durability,
      sampleComponents.circularity,
      sampleComponents.materialHealth,
      sampleComponents.biodiversity,
    ]);
  });
});

describe("all-score composition", () => {
  it("packages LIS, RIS, CPI, tier, and quadrant consistently", () => {
    const scores = calculateAllScores({
      totalCarbon: 120,
      risComponents: sampleComponents,
      cost: sampleCost,
      years: 30,
      discountRate: 0.03,
    });

    expect(scores.lis).toBe(calculateLIS(120));
    expect(scores.ris).toBe(calculateRIS(sampleComponents));
    expect(scores.cpi).toBeCloseTo(calculateCPI(120, sampleCost, 30, 0.03), 2);
    expect(scores.quadrant).toBeDefined();
  });
});

describe("buildStaticInsightText", () => {
  it("returns a static insight with source 'static'", () => {
    const scores = buildInsightScores({
      lis: 60,
      ris: 70,
      cpi: 25,
      quadrant: "Transitional",
      risComponents: sampleComponents,
      parisAlignment: 88,
    });

    const insight = buildStaticInsightText(scores);
    expect(insight.short).toBeTruthy();
    expect(insight.details).toContain("LIS");
    expect(insight.source).toBe("static");
  });
});

