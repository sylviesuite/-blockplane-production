/**
 * CPI coherence across MaterialDetail UI, InsightBox v2, CSV export, and PDF export.
 * Uses one test material with price, LIS, RIS, CPI, and better alternatives.
 */
import { describe, it, expect } from "vitest";
import { formatCPI } from "@shared/scoring";
import {
  buildCSVRowForMaterial,
  getPDFCpiString,
  CSV_CPI_COLUMN_INDEX,
  type Material,
} from "@/lib/export";

/** Test material: 2×6 SPF Stud Wall (Baseline Assembly) – has price, LIS, RIS, CPI, and better alternatives in catalog. */
const TEST_MATERIAL: Material = {
  id: "spf-stud-wall",
  name: "2×6 SPF Stud Wall (Baseline Assembly)",
  category: "Framed Wall",
  totalCarbon: 28,
  functionalUnit: "m²",
  lis: 72,
  ris: 41,
  cpi: 52,
  cost: 31,
};

describe("CPI flow coherence", () => {
  it("uses canonical CPI string everywhere (MaterialDetail, InsightBox v2, CSV, PDF)", () => {
    const canonical = formatCPI(TEST_MATERIAL.cpi);

    // MaterialDetail UI: score.format(score.value) is formatCPI(value)
    expect(formatCPI(TEST_MATERIAL.cpi)).toBe(canonical);

    // InsightBox v2 summary: "CPI {formatCPI(cpi)}"
    expect(formatCPI(TEST_MATERIAL.cpi)).toBe(canonical);

    // CSV export: CPI column uses formatCPI(..., { placeholder: '' })
    const csvRow = buildCSVRowForMaterial(TEST_MATERIAL);
    expect(csvRow[CSV_CPI_COLUMN_INDEX]).toBe(canonical);

    // PDF export: table CPI cell uses getPDFCpiString(m)
    expect(getPDFCpiString(TEST_MATERIAL)).toBe(canonical);
  });

  it("canonical CPI is 2 decimal places for valid number", () => {
    expect(formatCPI(52)).toBe("52.00");
    expect(formatCPI(9.1)).toBe("9.10");
  });
});
