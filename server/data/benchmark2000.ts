/**
 * Benchmark 2000 — BlockPlane reference building model.
 *
 * A conventional 2,000 sq ft two-story wood-frame home in Northern Michigan
 * built to standard code-minimum practices. This model defines the carbon
 * baseline against which LIS/RIS scores are calibrated (LIS 100 = this house).
 *
 * Carbon intensities are cradle-to-gate (A1–A3) reference values derived from
 * published EPD averages. Quantities are calculated from first principles below.
 *
 * Geometry assumptions:
 *   Footprint:      40 ft × 25 ft = 1,000 sq ft per floor
 *   Perimeter:      2 × (40 + 25) = 130 LF
 *   Ceiling height: 9 ft per story
 *   Ext. wall area: 130 LF × 9 ft × 2 stories = 2,340 sq ft
 *   Roof pitch:     4/12 → pitch factor 1.054; + 10% overhang ≈ 1,160 sq ft
 */

const M2_TO_SQFT = 10.764; // 1 m² = 10.764 sq ft

export interface BenchmarkAssembly {
  id: string;
  name: string;
  materialName: string;     // canonical name for DB lookup / display
  dbSearchQuery: string;    // search term for materialAPI.search
  quantity: number;         // sq ft (or count for unit items)
  unit: "sqft" | "unit";
  carbonPerSqFt: number;    // kg CO₂e / sq ft reference intensity
  carbonTotal: number;      // kg CO₂e total = carbonPerSqFt × quantity
  swappable: boolean;       // whether the swap tool applies
  notes: string;
}

export interface BenchmarkHouse {
  name: string;
  sqft: number;
  description: string;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  roofStyle: string;
  footprint: string;
  garage: string;
}

export const BENCHMARK_HOUSE: BenchmarkHouse = {
  name: "Benchmark 2000",
  sqft: 2000,
  description: "2,000 sq ft · 3 bed / 2.5 bath · two-story · gabled 4/12 roof",
  bedrooms: 3,
  bathrooms: 2.5,
  stories: 2,
  roofStyle: "Gabled 4/12",
  footprint: "40′ × 25′",
  garage: "None",
};

function assembly(
  id: string,
  name: string,
  materialName: string,
  dbSearchQuery: string,
  quantity: number,
  unit: "sqft" | "unit",
  refCarbon_per_m2: number,
  carbonTotalOverride: number | null,
  swappable: boolean,
  notes: string,
): BenchmarkAssembly {
  const carbonPerSqFt = refCarbon_per_m2 / M2_TO_SQFT;
  const carbonTotal = carbonTotalOverride ?? Math.round(carbonPerSqFt * quantity);
  return { id, name, materialName, dbSearchQuery, quantity, unit, carbonPerSqFt, carbonTotal, swappable, notes };
}

export const BENCHMARK_ASSEMBLIES: BenchmarkAssembly[] = [
  assembly(
    "foundation-walls",
    "Foundation — Poured Concrete Walls",
    "Poured Concrete",
    "concrete",
    1040,  // 130 LF perimeter × 8 ft basement wall height
    "sqft",
    48,    // ~8″ wall, A1–A3
    null,
    true,
    "130 LF perimeter × 8 ft basement wall height",
  ),
  assembly(
    "foundation-slab",
    "Foundation — Concrete Basement Slab",
    "Concrete Slab",
    "concrete slab",
    1000,  // 1,000 sq ft house footprint
    "sqft",
    24,    // ~4″ slab
    null,
    true,
    "1,000 sq ft basement floor slab, 4″ thick",
  ),
  assembly(
    "wall-framing",
    "Wall Framing — 2×6 Douglas Fir 16″ o.c.",
    "Douglas Fir Lumber",
    "douglas fir",
    3540,  // exterior 2,340 + interior partitions 1,200
    "sqft",
    12,    // dimensional framing lumber
    null,
    true,
    "Exterior walls 2,340 sq ft + interior partitions 1,200 sq ft",
  ),
  assembly(
    "wall-sheathing",
    "Wall Sheathing — OSB",
    "OSB Sheathing",
    "OSB",
    2340,  // exterior wall area
    "sqft",
    17,    // 7/16″ OSB
    null,
    true,
    "Exterior wall sheathing only, 2,340 sq ft",
  ),
  assembly(
    "wall-insulation",
    "Wall Insulation — Fiberglass Batts R-21",
    "Fiberglass Batt Insulation",
    "fiberglass insulation",
    2340,
    "sqft",
    4,     // R-21 batt
    null,
    true,
    "Full exterior wall cavity, 2,340 sq ft",
  ),
  assembly(
    "exterior-cladding",
    "Exterior Cladding — Vinyl Siding",
    "Vinyl Siding",
    "vinyl siding",
    2090,  // 2,340 minus ~250 sq ft of window openings
    "sqft",
    10,
    null,
    true,
    "Gross exterior wall area minus window openings (~250 sq ft)",
  ),
  assembly(
    "attic-insulation",
    "Attic Insulation — Fiberglass Batts R-49",
    "Fiberglass Batt Insulation",
    "fiberglass insulation",
    1000,  // attic floor = house footprint
    "sqft",
    8,     // thicker R-49 batt
    null,
    true,
    "Attic floor over conditioned space, 1,000 sq ft",
  ),
  assembly(
    "roofing",
    "Roofing — Asphalt Shingles",
    "Asphalt Shingles",
    "asphalt shingles",
    1160,  // 1,000 × 1.054 pitch factor + 10% overhang
    "sqft",
    14,    // architectural asphalt shingles
    null,
    true,
    "4/12 pitch factor 1.054 + overhangs; 1,160 sq ft rake area",
  ),
  assembly(
    "windows",
    "Windows — Double-Pane Vinyl (18 units)",
    "Double-Pane Vinyl Window",
    "vinyl window",
    270,   // 18 windows × ~15 sq ft avg
    "sqft",
    195,   // vinyl frame + IGU assembly
    null,
    true,
    "18 windows × ~15 sq ft average = 270 sq ft",
  ),
  assembly(
    "drywall",
    "Interior Walls — Gypsum Drywall",
    "Gypsum Drywall",
    "drywall gypsum",
    4200,  // both faces of all partitions + interior face of ext. walls
    "sqft",
    8,     // 5/8″ gypsum board
    null,
    true,
    "Both sides of interior partitions + interior face of exterior walls",
  ),
  assembly(
    "subfloor",
    "Subfloor — OSB",
    "OSB Subfloor",
    "OSB",
    2000,  // both floor levels
    "sqft",
    17,    // 3/4″ OSB
    null,
    true,
    "Both floor levels, 2,000 sq ft total",
  ),
  assembly(
    "flooring-carpet",
    "Interior Flooring — Carpet",
    "Carpet",
    "carpet",
    1600,  // excl. bathrooms / tile areas (~400 sq ft)
    "sqft",
    22,    // mid-grade residential carpet
    null,
    true,
    "Carpeted areas; bathrooms/utility excluded (~400 sq ft tiled)",
  ),
  assembly(
    "hvac",
    "Heating — Natural Gas Forced Air",
    "Natural Gas Furnace",
    "natural gas furnace",
    1,     // 1 system
    "unit",
    0,     // unit item — total set by override
    300,   // kg CO₂e for one residential furnace + air handler
    false, // unit-based; not directly swappable via area search
    "1 furnace + air handler; embodied carbon of equipment only",
  ),
];

/** Pre-computed reference total (kg CO₂e) for the whole house. */
export const BENCHMARK_REFERENCE_TOTAL_KG = BENCHMARK_ASSEMBLIES.reduce(
  (sum, a) => sum + a.carbonTotal,
  0,
);
