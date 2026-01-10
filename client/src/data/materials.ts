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
];

