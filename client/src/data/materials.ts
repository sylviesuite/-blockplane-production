export type LocalMaterial = {
  id: string;
  name: string;
  category: string;
  description: string;
  lis: number;
  ris: number;
  cpi: number;
  context?: {
    climateZone?: string;
    region?: string;
    buildingType?: string;
  };
};

export const localMaterials: LocalMaterial[] = [
  {
    id: "rammed-earth",
    name: "Rammed Earth",
    category: "Earthen Construction",
    description:
      "Stabilized rammed earth walls sourced from regional soils; low embodied carbon and excellent thermal mass for arid climates.",
    lis: 18,
    ris: 82,
    cpi: 42,
    context: {
      climateZone: "CZ6",
      region: "Great Lakes",
      buildingType: "Residential",
    },
  },
  {
    id: "osb-board",
    name: "OSB Board",
    category: "Engineered Wood",
    description:
      "Oriented strand board with certified wood fiber, widely used for sheathing; balances cost with structural performance.",
    lis: 55,
    ris: 38,
    cpi: 33,
    context: {
      climateZone: "CZ4",
      region: "Midwest",
      buildingType: "Sheathing / Structural",
    },
  },
  {
    id: "hempcrete-infill",
    name: "Hempcrete Infill",
    category: "Bio-Based Insulation",
    description:
      "Lightweight hemp-lime composite providing thermal and moisture buffering; sequesters carbon while delivering a breathable assembly.",
    lis: 27,
    ris: 76,
    cpi: 48,
    context: {
      climateZone: "CZ6",
      region: "Pacific Northwest",
      buildingType: "Envelope / Insulation",
    },
  },
  {
    id: "rammed-earth-wall",
    name: "Rammed Earth Wall",
    category: "Earthen Construction",
    description:
      "Load-bearing rammed earth wall with low-cement stabilization, sourced within 100 km to keep embodied carbon ultra-low.",
    lis: 15,
    ris: 80,
    cpi: 39,
    context: {
      climateZone: "CZ6",
      region: "Great Plains",
      buildingType: "Wall Assembly",
    },
  },
  {
    id: "hempcrete-infill-lime",
    name: "Hempcrete Infill (Lime Blend)",
    category: "Bio-Based Insulation",
    description:
      "Hemp-lime infill with a vapor-open lime binder, offering sequestration alongside high RIS performance for breathable walls.",
    lis: 22,
    ris: 78,
    cpi: 45,
    context: {
      climateZone: "CZ5",
      region: "Pacific Northwest",
      buildingType: "Insulation / Infill",
    },
  },
  {
    id: "fiberglass-stud-wall",
    name: "Standard 2x6 Stud Wall (Fiberglass)",
    category: "Wood Construction",
    description:
      "Typical North American wall using SPF studs and fiberglass batt insulation; easy to frame but carries moderate embodied carbon.",
    lis: 55,
    ris: 42,
    cpi: 52,
    context: {
      climateZone: "CZ3",
      region: "Northeast",
      buildingType: "Wall Assembly",
    },
  },
  {
    id: "osb-sheathing",
    name: "OSB Sheathing",
    category: "Engineered Wood",
    description:
      "Engineered strand board sheathing with resin binders; efficient but resin content and end-of-life recycling remain issues.",
    lis: 48,
    ris: 35,
    cpi: 37,
    context: {
      climateZone: "CZ4",
      region: "Midwest",
      buildingType: "Sheathing / Panel",
    },
  },
  {
    id: "gypsum-drywall-1-2",
    name: "Gypsum Drywall (½\")",
    category: "Interior Finish",
    description:
      "Standard gypsum board used for interior finishes; locally manufactured and recyclable in some regions but brittle at end-of-life.",
    lis: 44,
    ris: 32,
    cpi: 40,
    context: {
      climateZone: "CZ3",
      region: "Southeast",
      buildingType: "Interior Finish",
    },
  },
];

