export type LocalMaterial = {
  id: string;
  name: string;
  category: string;
  description: string;
  carbonKgPerM2: number;
  costPerM2: number;
  ris: number;
  lis: number;
  regenerative: boolean;
  tags?: string[];
  context?: {
    climateZone?: string;
    region?: string;
    buildingType?: string;
  };
};

export const localMaterials: LocalMaterial[] = [
  {
    id: "rammed-earth",
    name: "Rammed Earth (Structural Wall)",
    category: "Earthen Construction",
    description:
      "Load-bearing rammed earth wall with low-cement stabilization and regional soils, delivering excellent thermal mass and sequestering potential.",
    carbonKgPerM2: 7.8,
    costPerM2: 72,
    lis: 32,
    ris: 84,
    regenerative: true,
    tags: ["rammed earth", "mass wall", "high thermal mass", "local soil"],
    context: {
      climateZone: "CZ6",
      region: "Great Plains",
      buildingType: "Wall Assembly",
    },
  },
  {
    id: "hempcrete-infill",
    name: "Hempcrete Infill (Lime-based)",
    category: "Bio-Based Insulation",
    description:
      "Hemp-lime infill for lightweight, vapor-open walls that sequester carbon while keeping assemblies breathable.",
    carbonKgPerM2: 5.3,
    costPerM2: 64,
    lis: 45,
    ris: 89,
    regenerative: true,
    tags: ["hempcrete", "bio-based", "vapor-open", "carbon storing"],
    context: {
      climateZone: "CZ5",
      region: "Pacific Northwest",
      buildingType: "Insulation / Infill",
    },
  },
  {
    id: "spf-stud-wall",
    name: "2×6 SPF Stud Wall (Baseline Assembly)",
    category: "Framed Wall",
    description:
      "Conventional 2×6 SPF studs with fiberglass batt insulation, representing a typical baseline assembly in North America.",
    carbonKgPerM2: 28,
    costPerM2: 31,
    lis: 72,
    ris: 41,
    regenerative: false,
    tags: ["2x6", "stud wall", "fiberglass", "baseline"],
    context: {
      climateZone: "CZ3",
      region: "Northeast",
      buildingType: "Wall Assembly",
    },
  },
  {
    id: "osb-sheathing",
    name: "OSB Sheathing Board",
    category: "Engineered Wood",
    description:
      "Engineered strand board sheathing blended with resin; efficient for structural panels but relies on adhesives and limited recyclability.",
    carbonKgPerM2: 22,
    costPerM2: 33,
    lis: 62,
    ris: 57,
    regenerative: false,
    tags: ["OSB", "sheathing", "engineered wood", "structural panel"],
    context: {
      climateZone: "CZ4",
      region: "Midwest",
      buildingType: "Sheathing / Panel",
    },
  },
  {
    id: "gypsum-drywall",
    name: "Gypsum Drywall (½\")",
    category: "Interior Finish",
    description:
      "Standard gypsum board for interior finishes; widely available and recyclable in many regions but still carries moderate emissions.",
    carbonKgPerM2: 18,
    costPerM2: 26,
    lis: 48,
    ris: 43,
    regenerative: false,
    tags: ["drywall", "gypsum", "interior", "finish"],
    context: {
      climateZone: "CZ3",
      region: "Southeast",
      buildingType: "Interior Finish",
    },
  },
];

