import { describe, it, expect } from "vitest";
import { extractJson } from "./materialResearchAgent";

// Minimal valid payload — fields beyond name/totalCarbon are optional for parsing
const BASE = {
  name: "Test Material",
  category: "insulation",
  functionalUnit: "sq ft",
  totalCarbon: 1.5,
  costPerUnit: 2.0,
  risScore: 45,
  lisScore: 50,
  isRegenerative: 0,
  description: "A test material",
  manufacturer: "ACME",
  region: "Northern Michigan",
  source: "ICE Database",
  confidenceLevel: "Medium",
  a1a3: 1.2,
  a4: 0.2,
  a5: 0.1,
  b: 0,
  c1c4: 0.3,
  transportMethod: "truck",
  transportDistanceKm: 50,
};

function makeJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({ ...BASE, ...overrides });
}

describe("extractJson", () => {
  // ── Clean input ───────────────────────────────────────────────────────────

  it("parses clean JSON", () => {
    const result = extractJson(makeJson());
    expect(result?.name).toBe("Test Material");
    expect(result?.totalCarbon).toBe(1.5);
  });

  // ── Markdown fences ───────────────────────────────────────────────────────

  it("strips ```json ... ``` fence (Earth / Masonry pattern)", () => {
    const input = "```json\n" + makeJson() + "\n```";
    const result = extractJson(input);
    expect(result?.name).toBe("Test Material");
  });

  it("strips ``` ... ``` fence without language tag", () => {
    const input = "```\n" + makeJson() + "\n```";
    expect(extractJson(input)?.name).toBe("Test Material");
  });

  it("extracts JSON when prose precedes a fence (Cladding / Flooring pattern)", () => {
    const input =
      "Here is the material data for Northern Michigan cedar siding:\n\n```json\n" +
      makeJson({ name: "Cedar Siding", category: "cladding" }) +
      "\n```";
    const result = extractJson(input);
    expect(result?.name).toBe("Cedar Siding");
  });

  it("extracts JSON when prose follows a fence (Windows pattern)", () => {
    const input =
      "```json\n" +
      makeJson({ name: "Triple-Pane Window", category: "windows" }) +
      "\n```\n\nNote: values are estimates based on Marvin EPD data.";
    expect(extractJson(input)?.name).toBe("Triple-Pane Window");
  });

  // ── Prose without fences ──────────────────────────────────────────────────

  it("extracts JSON embedded in prose without a fence (Mechanical pattern)", () => {
    const json = makeJson({ name: "Heat Pump", category: "mechanical", totalCarbon: 920 });
    const input =
      "Based on web search results for Northern Michigan HVAC suppliers, here is the data:\n\n" +
      json +
      "\n\nThis reflects a Mitsubishi Hyper Heat unit installed in Traverse City.";
    const result = extractJson(input);
    expect(result?.name).toBe("Heat Pump");
    expect(result?.totalCarbon).toBe(920);
  });

  // ── String-typed numbers ──────────────────────────────────────────────────

  it("coerces totalCarbon from string to number", () => {
    const input = makeJson({ totalCarbon: "5.2" });
    const result = extractJson(input);
    expect(result?.totalCarbon).toBe(5.2);
  });

  it("coerces all numeric fields from strings (Masonry pattern)", () => {
    const input = makeJson({
      totalCarbon: "3.1",
      costPerUnit: "12.50",
      risScore: "40",
      lisScore: "55",
      isRegenerative: "0",
      a1a3: "2.8",
      a4: "0.2",
      a5: "0.1",
      b: "0",
      c1c4: "0.4",
      transportDistanceKm: "80",
    });
    const result = extractJson(input);
    expect(result?.totalCarbon).toBe(3.1);
    expect(result?.risScore).toBe(40);
    expect(result?.a1a3).toBe(2.8);
    expect(result?.transportDistanceKm).toBe(80);
  });

  // ── Combined: fence + string numbers ─────────────────────────────────────

  it("handles fence-wrapped JSON with all-string numbers (Earth pattern)", () => {
    const input =
      "```json\n" +
      makeJson({ name: "Rammed Earth", category: "earth", totalCarbon: "58.0", risScore: "72" }) +
      "\n```";
    const result = extractJson(input);
    expect(result?.name).toBe("Rammed Earth");
    expect(result?.totalCarbon).toBe(58.0);
    expect(result?.risScore).toBe(72);
  });

  it("handles prose + fence + string numbers (Flooring pattern)", () => {
    const input =
      "Searching for Northern Michigan hardwood flooring...\n\n```json\n" +
      makeJson({ name: "Hard Maple Flooring", category: "flooring", totalCarbon: "2.54" }) +
      "\n```";
    const result = extractJson(input);
    expect(result?.name).toBe("Hard Maple Flooring");
    expect(result?.totalCarbon).toBe(2.54);
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it("returns null for completely unparseable input", () => {
    expect(extractJson("Sorry, I could not find data for this material.")).toBeNull();
  });

  it("returns null when name field is missing", () => {
    const { name: _n, ...noName } = BASE;
    expect(extractJson(JSON.stringify(noName))).toBeNull();
  });

  it("returns null when totalCarbon is missing entirely", () => {
    const { totalCarbon: _c, ...noCarbon } = BASE;
    expect(extractJson(JSON.stringify(noCarbon))).toBeNull();
  });

  it("handles leading/trailing whitespace and BOM", () => {
    const input = "﻿  \n" + makeJson() + "\n  ";
    expect(extractJson(input)?.name).toBe("Test Material");
  });
});
