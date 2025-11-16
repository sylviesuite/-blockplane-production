/**
 * BlockPlane Materials Database - Seed Script
 * 
 * Populates the database with 80+ production-ready building materials
 * across 7 categories (Timber, Steel, Concrete, Earth, Insulation, Composites, Masonry).
 * Includes both sustainable alternatives AND conventional baseline materials for comparison.
 * 
 * Each material includes:
 * - Lifecycle carbon values (A1-A3, A4, A5, B, C1-C4)
 * - RIS (Regenerative Impact Score, 0-100)
 * - LIS (Life Impact Score, 0-100)
 * - Cost per functional unit (USD)
 * - Realistic functional units (m³, m² - NO "per kg")
 * 
 * Data sources: Industry EPDs, ICE Database, Circular Ecology, RICS
 */

import { drizzle } from "drizzle-orm/mysql2";
import { materials, lifecycleValues, risScores, pricing, epdMetadata } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const materialsData = [
  // ============================================================================
  // TIMBER CATEGORY (8 materials)
  // ============================================================================
  {
    name: "Cross-Laminated Timber (CLT)",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "93.20",
    description: "Engineered wood panels made from layers of lumber boards stacked crosswise and glued together. High strength-to-weight ratio, carbon storage, and excellent seismic performance.",
    lifecycle: {
      "A1-A3": "78.50",
      "A4": "8.20",
      "A5": "4.50",
      "B": "0.00",
      "C1-C4": "2.00"
    },
    ris: 75,
    lis: 25,
    cost: "850.00",
    epd: { source: "ICE Database v3.0", year: 2019 }
  },
  {
    name: "Glulam (Glued Laminated Timber)",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "86.40",
    description: "Structural engineered wood product made from layers of dimensional lumber bonded with adhesives. Excellent for long-span applications and curved designs.",
    lifecycle: {
      "A1-A3": "72.30",
      "A4": "7.80",
      "A5": "4.20",
      "B": "0.00",
      "C1-C4": "2.10"
    },
    ris: 72,
    lis: 28,
    cost: "780.00"
  },
  {
    name: "Mass Timber Panels",
    category: "Timber",
    functionalUnit: "m²",
    totalCarbon: "18.50",
    description: "Large-format engineered wood panels for walls and floors. Combines structural efficiency with carbon sequestration and rapid installation.",
    lifecycle: {
      "A1-A3": "15.20",
      "A4": "1.80",
      "A5": "1.00",
      "B": "0.00",
      "C1-C4": "0.50"
    },
    ris: 78,
    lis: 22,
    cost: "95.00"
  },
  {
    name: "Engineered Bamboo",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "64.80",
    description: "Rapidly renewable structural material made from laminated bamboo strips. High strength, fast growth cycle (3-5 years), and excellent carbon sequestration.",
    lifecycle: {
      "A1-A3": "52.40",
      "A4": "8.50",
      "A5": "2.80",
      "B": "0.00",
      "C1-C4": "1.10"
    },
    ris: 85,
    lis: 18,
    cost: "620.00"
  },
  {
    name: "Cork Panels",
    category: "Timber",
    functionalUnit: "m²",
    totalCarbon: "8.20",
    description: "Natural insulation and finish material harvested from cork oak bark. Renewable harvest every 9 years without harming trees, excellent thermal and acoustic properties.",
    lifecycle: {
      "A1-A3": "6.50",
      "A4": "1.20",
      "A5": "0.30",
      "B": "0.00",
      "C1-C4": "0.20"
    },
    ris: 88,
    lis: 15,
    cost: "42.00"
  },
  {
    name: "Reclaimed Wood",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "35.60",
    description: "Salvaged timber from demolished buildings or structures. Minimal processing, unique character, prevents landfill waste, and avoids new tree harvesting.",
    lifecycle: {
      "A1-A3": "28.40",
      "A4": "4.20",
      "A5": "2.50",
      "B": "0.00",
      "C1-C4": "0.50"
    },
    ris: 68,
    lis: 22,
    cost: "480.00"
  },
  {
    name: "FSC-Certified Softwood",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "52.30",
    description: "Responsibly sourced softwood lumber from sustainably managed forests. FSC certification ensures environmental, social, and economic standards.",
    lifecycle: {
      "A1-A3": "42.80",
      "A4": "5.50",
      "A5": "2.80",
      "B": "0.00",
      "C1-C4": "1.20"
    },
    ris: 65,
    lis: 30,
    cost: "420.00"
  },
  {
    name: "FSC-Certified Hardwood",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "68.70",
    description: "Responsibly sourced hardwood lumber from sustainably managed forests. Higher density and durability than softwood, with FSC environmental certification.",
    lifecycle: {
      "A1-A3": "56.20",
      "A4": "7.20",
      "A5": "3.50",
      "B": "0.00",
      "C1-C4": "1.80"
    },
    ris: 62,
    lis: 35,
    cost: "680.00"
  },

  // ============================================================================
  // STEEL CATEGORY (7 materials)
  // ============================================================================
  {
    name: "Recycled Steel Rebar",
    category: "Steel",
    functionalUnit: "m³",
    totalCarbon: "163.40",
    description: "Reinforcing bars made from 90%+ recycled steel. Reduces virgin material extraction, maintains structural performance, and supports circular economy.",
    lifecycle: {
      "A1-A3": "142.80",
      "A4": "12.50",
      "A5": "5.20",
      "B": "0.00",
      "C1-C4": "2.90"
    },
    ris: 45,
    lis: 35,
    cost: "180.00",
    epd: { source: "WorldSteel LCA Database", year: 2020 }
  },
  {
    name: "Recycled Steel Sections",
    category: "Steel",
    functionalUnit: "m³",
    totalCarbon: "178.60",
    description: "Structural steel beams and columns made from recycled content. High strength-to-weight ratio, durability, and recyclability at end of life.",
    lifecycle: {
      "A1-A3": "155.20",
      "A4": "14.80",
      "A5": "6.20",
      "B": "0.00",
      "C1-C4": "2.40"
    },
    ris: 42,
    lis: 38,
    cost: "220.00"
  },
  {
    name: "Hot-Rolled Steel Beams",
    category: "Steel",
    functionalUnit: "m³",
    totalCarbon: "235.80",
    description: "Virgin steel structural members formed at high temperature. Standard construction material with high embodied energy but excellent structural properties.",
    lifecycle: {
      "A1-A3": "208.40",
      "A4": "16.20",
      "A5": "8.50",
      "B": "0.00",
      "C1-C4": "2.70"
    },
    ris: 25,
    lis: 72,
    cost: "280.00"
  },
  {
    name: "Cold-Formed Steel Studs (3-5/8\")",
    category: "Steel",
    functionalUnit: "m²",
    totalCarbon: "28.40",
    description: "Light-gauge steel framing studs, 3-5/8\" depth. Standard for interior non-load-bearing walls. Lightweight, dimensionally stable, recycled content.",
    lifecycle: {
      "A1-A3": "24.50",
      "A4": "2.20",
      "A5": "1.30",
      "B": "0.00",
      "C1-C4": "0.40"
    },
    ris: 38,
    lis: 45,
    cost: "32.00"
  },
  {
    name: "Cold-Formed Steel Studs (6\")",
    category: "Steel",
    functionalUnit: "m²",
    totalCarbon: "32.60",
    description: "Light-gauge steel framing studs, 6\" depth. Used for exterior walls and load-bearing applications. Allows more insulation depth.",
    lifecycle: {
      "A1-A3": "28.20",
      "A4": "2.50",
      "A5": "1.50",
      "B": "0.00",
      "C1-C4": "0.40"
    },
    ris: 38,
    lis: 45,
    cost: "38.00"
  },
  {
    name: "Cold-Formed Steel Studs (8\")",
    category: "Steel",
    functionalUnit: "m²",
    totalCarbon: "38.80",
    description: "Heavy-duty light-gauge steel studs, 8\" depth. For commercial applications and maximum insulation cavity depth.",
    lifecycle: {
      "A1-A3": "33.60",
      "A4": "2.90",
      "A5": "1.90",
      "B": "0.00",
      "C1-C4": "0.40"
    },
    ris: 38,
    lis: 45,
    cost: "45.00"
  },
  {
    name: "Metal Track & Channels",
    category: "Steel",
    functionalUnit: "m²",
    totalCarbon: "26.20",
    description: "Cold-formed steel track for top and bottom plates. Complements metal stud framing systems. Recycled content.",
    lifecycle: {
      "A1-A3": "22.60",
      "A4": "2.00",
      "A5": "1.20",
      "B": "0.00",
      "C1-C4": "0.40"
    },
    ris: 38,
    lis: 45,
    cost: "28.00"
  },
  {
    name: "Stainless Steel (Recycled)",
    category: "Steel",
    functionalUnit: "m³",
    totalCarbon: "198.50",
    description: "Corrosion-resistant steel alloy made from recycled content. Long service life, minimal maintenance, and high recyclability offset higher initial carbon.",
    lifecycle: {
      "A1-A3": "172.80",
      "A4": "15.20",
      "A5": "7.80",
      "B": "0.00",
      "C1-C4": "2.70"
    },
    ris: 48,
    lis: 42,
    cost: "420.00"
  },
  {
    name: "Weathering Steel (Corten)",
    category: "Steel",
    functionalUnit: "m²",
    totalCarbon: "42.80",
    description: "Self-protecting steel that forms stable rust-like patina. Eliminates need for painting, reduces maintenance, and provides distinctive aesthetic.",
    lifecycle: {
      "A1-A3": "37.20",
      "A4": "3.50",
      "A5": "1.60",
      "B": "0.00",
      "C1-C4": "0.50"
    },
    ris: 35,
    lis: 52,
    cost: "58.00"
  },
  {
    name: "Galvanized Steel Decking",
    category: "Steel",
    functionalUnit: "m²",
    totalCarbon: "35.60",
    description: "Zinc-coated steel floor/roof decking. Corrosion protection, structural efficiency, and often incorporates recycled steel content.",
    lifecycle: {
      "A1-A3": "30.80",
      "A4": "2.80",
      "A5": "1.50",
      "B": "0.00",
      "C1-C4": "0.50"
    },
    ris: 32,
    lis: 55,
    cost: "38.00"
  },

  // ============================================================================
  // CONCRETE CATEGORY (6 materials)
  // ============================================================================
  {
    name: "Hempcrete",
    category: "Concrete",
    functionalUnit: "m³",
    totalCarbon: "26.40",
    description: "Bio-composite made from hemp hurds and lime binder. Carbon-negative material that sequesters CO₂, provides excellent insulation, and regulates humidity naturally.",
    lifecycle: {
      "A1-A3": "18.50",
      "A4": "4.20",
      "A5": "2.80",
      "B": "0.00",
      "C1-C4": "0.90"
    },
    ris: 92,
    lis: 12,
    cost: "450.00",
    epd: { source: "RICS Carbon Database", year: 2021 }
  },
  {
    name: "Geopolymer Concrete",
    category: "Concrete",
    functionalUnit: "m³",
    totalCarbon: "142.80",
    description: "Alternative concrete using industrial byproducts (fly ash, slag) instead of Portland cement. Reduces carbon by 60-80% compared to conventional concrete.",
    lifecycle: {
      "A1-A3": "125.40",
      "A4": "10.20",
      "A5": "5.50",
      "B": "0.00",
      "C1-C4": "1.70"
    },
    ris: 58,
    lis: 38,
    cost: "185.00",
    epd: { source: "Circular Ecology Research", year: 2022 }
  },
  {
    name: "Recycled Aggregate Concrete",
    category: "Concrete",
    functionalUnit: "m³",
    totalCarbon: "285.60",
    description: "Concrete made with crushed recycled concrete as aggregate replacement. Diverts demolition waste from landfills and reduces virgin aggregate extraction.",
    lifecycle: {
      "A1-A3": "252.80",
      "A4": "18.50",
      "A5": "11.20",
      "B": "0.00",
      "C1-C4": "3.10"
    },
    ris: 35,
    lis: 58,
    cost: "145.00"
  },
  {
    name: "Fly Ash Concrete (30% replacement)",
    category: "Concrete",
    functionalUnit: "m³",
    totalCarbon: "325.40",
    description: "Concrete with 30% Portland cement replaced by fly ash. Improves workability and durability while reducing carbon footprint by utilizing industrial byproduct.",
    lifecycle: {
      "A1-A3": "288.50",
      "A4": "20.80",
      "A5": "12.50",
      "B": "0.00",
      "C1-C4": "3.60"
    },
    ris: 28,
    lis: 65,
    cost: "135.00"
  },
  {
    name: "Standard Portland Cement Concrete",
    category: "Concrete",
    functionalUnit: "m³",
    totalCarbon: "420.50",
    description: "Conventional concrete with 100% Portland cement. Industry baseline material with high embodied carbon from cement calcination process.",
    lifecycle: {
      "A1-A3": "375.80",
      "A4": "24.50",
      "A5": "15.20",
      "B": "0.00",
      "C1-C4": "5.00"
    },
    ris: 12,
    lis: 85,
    cost: "120.00",
    epd: { source: "ICE Database v3.0", year: 2019 }
  },
  {
    name: "High-Strength Concrete",
    category: "Concrete",
    functionalUnit: "m³",
    totalCarbon: "536.20",
    description: "Concrete with compressive strength >40 MPa achieved through higher cement content. Used for specialized applications but has highest carbon footprint.",
    lifecycle: {
      "A1-A3": "482.50",
      "A4": "28.80",
      "A5": "18.50",
      "B": "0.00",
      "C1-C4": "6.40"
    },
    ris: 8,
    lis: 92,
    cost: "195.00"
  },

  // ============================================================================
  // EARTH CATEGORY (5 materials)
  // ============================================================================
  {
    name: "Rammed Earth",
    category: "Earth",
    functionalUnit: "m³",
    totalCarbon: "38.50",
    description: "Compressed earth walls made from local soil, sand, gravel, and stabilizer. Excellent thermal mass, minimal processing, and uses locally sourced materials.",
    lifecycle: {
      "A1-A3": "32.40",
      "A4": "2.80",
      "A5": "2.50",
      "B": "0.00",
      "C1-C4": "0.80"
    },
    ris: 78,
    lis: 18,
    cost: "280.00",
    epd: { source: "RICS Carbon Database", year: 2021 }
  },
  {
    name: "Compressed Earth Blocks",
    category: "Earth",
    functionalUnit: "m²",
    totalCarbon: "12.80",
    description: "Modular masonry units made from compressed earth and stabilizer. Low-tech production, local materials, and excellent thermal performance.",
    lifecycle: {
      "A1-A3": "10.50",
      "A4": "1.20",
      "A5": "0.80",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 82,
    lis: 16,
    cost: "24.00"
  },
  {
    name: "Adobe Bricks",
    category: "Earth",
    functionalUnit: "m²",
    totalCarbon: "9.50",
    description: "Sun-dried earth bricks made from clay, sand, straw, and water. Ancient building technique with minimal energy input and complete biodegradability.",
    lifecycle: {
      "A1-A3": "7.80",
      "A4": "0.80",
      "A5": "0.60",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 85,
    lis: 14,
    cost: "18.00"
  },
  {
    name: "Straw Bale",
    category: "Earth",
    functionalUnit: "m²",
    totalCarbon: "5.20",
    description: "Agricultural waste product used as structural or insulation material. Carbon-negative when considering avoided decomposition emissions, excellent insulation.",
    lifecycle: {
      "A1-A3": "3.80",
      "A4": "0.80",
      "A5": "0.40",
      "B": "0.00",
      "C1-C4": "0.20"
    },
    ris: 95,
    lis: 8,
    cost: "12.00"
  },
  {
    name: "Mycelium Composite Panels",
    category: "Earth",
    functionalUnit: "m²",
    totalCarbon: "3.80",
    description: "Bio-fabricated panels grown from fungal mycelium and agricultural waste. Completely biodegradable, carbon-negative, and represents future of regenerative materials.",
    lifecycle: {
      "A1-A3": "2.50",
      "A4": "0.60",
      "A5": "0.40",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 98,
    lis: 5,
    cost: "65.00",
    epd: { source: "Ecovative Design EPD", year: 2023 }
  },

  // ============================================================================
  // INSULATION CATEGORY (8 materials)
  // ============================================================================
  {
    name: "Sheep Wool Insulation",
    category: "Insulation",
    functionalUnit: "m³",
    totalCarbon: "12.40",
    description: "Natural insulation from sheep fleece. Renewable, biodegradable, regulates moisture, and provides excellent thermal and acoustic performance.",
    lifecycle: {
      "A1-A3": "9.80",
      "A4": "1.50",
      "A5": "0.80",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 85,
    lis: 18,
    cost: "48.00"
  },
  {
    name: "Hemp Fiber Insulation",
    category: "Insulation",
    functionalUnit: "m³",
    totalCarbon: "10.20",
    description: "Insulation made from industrial hemp fibers. Fast-growing renewable crop, carbon-sequestering, naturally pest-resistant.",
    lifecycle: {
      "A1-A3": "7.80",
      "A4": "1.40",
      "A5": "0.70",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 88,
    lis: 15,
    cost: "42.00"
  },
  {
    name: "Cellulose Insulation (Recycled)",
    category: "Insulation",
    functionalUnit: "m³",
    totalCarbon: "8.60",
    description: "Made from recycled newspaper and cardboard. Diverts waste, low embodied energy, excellent fire resistance with borate treatment.",
    lifecycle: {
      "A1-A3": "6.80",
      "A4": "1.20",
      "A5": "0.40",
      "B": "0.00",
      "C1-C4": "0.20"
    },
    ris: 78,
    lis: 22,
    cost: "28.00"
  },
  {
    name: "Wood Fiber Insulation Boards",
    category: "Insulation",
    functionalUnit: "m²",
    totalCarbon: "14.80",
    description: "Rigid insulation boards from wood chips and sawdust. Carbon-storing, breathable, provides thermal mass and acoustic dampening.",
    lifecycle: {
      "A1-A3": "12.20",
      "A4": "1.60",
      "A5": "0.70",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 82,
    lis: 20,
    cost: "52.00"
  },
  {
    name: "Mycelium Insulation Panels",
    category: "Insulation",
    functionalUnit: "m²",
    totalCarbon: "4.20",
    description: "Bio-fabricated insulation grown from mushroom mycelium. Carbon-negative, compostable, fire-resistant, and represents cutting-edge bio-materials.",
    lifecycle: {
      "A1-A3": "2.80",
      "A4": "0.70",
      "A5": "0.40",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 95,
    lis: 8,
    cost: "68.00"
  },
  {
    name: "Aerogel Insulation",
    category: "Insulation",
    functionalUnit: "m²",
    totalCarbon: "45.60",
    description: "Ultra-high-performance silica-based insulation. Thinnest insulation available, ideal for space-constrained retrofits despite higher embodied carbon.",
    lifecycle: {
      "A1-A3": "38.20",
      "A4": "4.50",
      "A5": "2.20",
      "B": "0.00",
      "C1-C4": "0.70"
    },
    ris: 35,
    lis: 55,
    cost: "185.00"
  },
  {
    name: "Recycled Denim Insulation",
    category: "Insulation",
    functionalUnit: "m³",
    totalCarbon: "9.40",
    description: "Made from post-consumer denim textile waste. Diverts landfill waste, safe to handle, excellent acoustic properties, no VOCs.",
    lifecycle: {
      "A1-A3": "7.20",
      "A4": "1.50",
      "A5": "0.50",
      "B": "0.00",
      "C1-C4": "0.20"
    },
    ris: 75,
    lis: 25,
    cost: "38.00"
  },
  {
    name: "Cork Insulation Boards",
    category: "Insulation",
    functionalUnit: "m²",
    totalCarbon: "11.20",
    description: "Rigid insulation from compressed cork granules. Renewable harvest, naturally fire-resistant, provides thermal and acoustic insulation.",
    lifecycle: {
      "A1-A3": "8.80",
      "A4": "1.60",
      "A5": "0.50",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 86,
    lis: 16,
    cost: "58.00"
  },

  // ============================================================================
  // COMPOSITES CATEGORY (6 materials)
  // ============================================================================
  {
    name: "Flax Fiber Composite Panels",
    category: "Composites",
    functionalUnit: "m²",
    totalCarbon: "18.60",
    description: "Bio-composite panels from flax fibers and bio-resin. Renewable, lightweight, high strength-to-weight ratio, carbon-storing.",
    lifecycle: {
      "A1-A3": "15.20",
      "A4": "2.10",
      "A5": "1.00",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 72,
    lis: 28,
    cost: "78.00"
  },
  {
    name: "Recycled Plastic Lumber",
    category: "Composites",
    functionalUnit: "m³",
    totalCarbon: "95.40",
    description: "Structural lumber made from post-consumer recycled plastics. Diverts plastic waste, rot-proof, low maintenance, ideal for outdoor applications.",
    lifecycle: {
      "A1-A3": "82.50",
      "A4": "8.20",
      "A5": "3.80",
      "B": "0.00",
      "C1-C4": "0.90"
    },
    ris: 55,
    lis: 42,
    cost: "320.00"
  },
  {
    name: "Fiber Cement Boards",
    category: "Composites",
    functionalUnit: "m²",
    totalCarbon: "22.80",
    description: "Composite of cellulose fibers and cement. Durable, fire-resistant, weather-proof, lower carbon than pure cement products.",
    lifecycle: {
      "A1-A3": "19.20",
      "A4": "2.20",
      "A5": "1.10",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 42,
    lis: 52,
    cost: "38.00"
  },
  {
    name: "Bio-Resin Composite Panels",
    category: "Composites",
    functionalUnit: "m²",
    totalCarbon: "16.40",
    description: "Natural fiber composites with plant-based resin binders. Renewable, low-VOC, biodegradable alternative to petroleum-based composites.",
    lifecycle: {
      "A1-A3": "13.20",
      "A4": "2.00",
      "A5": "0.90",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 68,
    lis: 32,
    cost: "72.00"
  },
  {
    name: "Bamboo Composite Decking",
    category: "Composites",
    functionalUnit: "m²",
    totalCarbon: "24.60",
    description: "Composite decking from bamboo fibers and recycled plastic. Combines rapid renewability of bamboo with plastic waste diversion.",
    lifecycle: {
      "A1-A3": "20.40",
      "A4": "2.80",
      "A5": "1.10",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 65,
    lis: 35,
    cost: "85.00"
  },
  {
    name: "Recycled Rubber Flooring",
    category: "Composites",
    functionalUnit: "m²",
    totalCarbon: "32.40",
    description: "Flooring tiles from recycled tire rubber. Diverts landfill waste, durable, shock-absorbing, ideal for high-traffic areas.",
    lifecycle: {
      "A1-A3": "27.80",
      "A4": "2.80",
      "A5": "1.40",
      "B": "0.00",
      "C1-C4": "0.40"
    },
    ris: 58,
    lis: 38,
    cost: "48.00"
  },

  // ============================================================================
  // MASONRY CATEGORY (4 materials)
  // ============================================================================
  {
    name: "Autoclaved Aerated Concrete (AAC)",
    category: "Masonry",
    functionalUnit: "m³",
    totalCarbon: "185.60",
    description: "Lightweight concrete blocks with air pockets. Excellent insulation, fire resistance, reduced material use compared to standard concrete.",
    lifecycle: {
      "A1-A3": "162.40",
      "A4": "14.20",
      "A5": "7.20",
      "B": "0.00",
      "C1-C4": "1.80"
    },
    ris: 45,
    lis: 48,
    cost: "220.00"
  },
  {
    name: "Recycled Brick",
    category: "Masonry",
    functionalUnit: "m²",
    totalCarbon: "18.40",
    description: "Salvaged bricks from demolished buildings. Eliminates firing energy, preserves character, diverts demolition waste from landfills.",
    lifecycle: {
      "A1-A3": "14.80",
      "A4": "2.20",
      "A5": "1.10",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 62,
    lis: 32,
    cost: "45.00"
  },
  {
    name: "Natural Stone (Local)",
    category: "Masonry",
    functionalUnit: "m²",
    totalCarbon: "28.60",
    description: "Locally-quarried stone with minimal processing. Extremely durable, low maintenance, minimal embodied energy when sourced locally.",
    lifecycle: {
      "A1-A3": "22.80",
      "A4": "3.50",
      "A5": "1.80",
      "B": "0.00",
      "C1-C4": "0.50"
    },
    ris: 52,
    lis: 42,
    cost: "120.00"
  },
  {
    name: "Calcium Silicate Bricks",
    category: "Masonry",
    functionalUnit: "m²",
    totalCarbon: "32.80",
    description: "Bricks made from lime and silica, steam-cured instead of fired. Lower carbon than fired clay bricks, excellent compressive strength.",
    lifecycle: {
      "A1-A3": "27.60",
      "A4": "3.20",
      "A5": "1.60",
      "B": "0.00",
      "C1-C4": "0.40"
    },
    ris: 48,
    lis: 45,
    cost: "52.00"
  },

  // ============================================================================
  // ADDITIONAL TIMBER (2 materials)
  // ============================================================================
  {
    name: "Timber Frame System",
    category: "Timber",
    functionalUnit: "m²",
    totalCarbon: "22.40",
    description: "Pre-fabricated timber frame wall panels. Fast installation, carbon storage, excellent thermal performance with integrated insulation.",
    lifecycle: {
      "A1-A3": "18.60",
      "A4": "2.40",
      "A5": "1.10",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 70,
    lis: 28,
    cost: "125.00"
  },
  {
    name: "Wood Fiber Cement Boards",
    category: "Timber",
    functionalUnit: "m²",
    totalCarbon: "19.80",
    description: "Composite boards combining wood fibers with minimal cement binder. Lower carbon than pure cement, biodegradable fibers, good moisture resistance.",
    lifecycle: {
      "A1-A3": "16.20",
      "A4": "2.20",
      "A5": "1.10",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 66,
    lis: 32,
    cost: "48.00"
  },

  // ============================================================================
  // ADDITIONAL STEEL (3 materials)
  // ============================================================================
  {
    name: "Structural Steel (90% Recycled)",
    category: "Steel",
    functionalUnit: "m³",
    totalCarbon: "155.80",
    description: "High-recycled-content structural steel sections. Maintains performance while significantly reducing virgin material extraction and processing energy.",
    lifecycle: {
      "A1-A3": "135.60",
      "A4": "12.80",
      "A5": "5.60",
      "B": "0.00",
      "C1-C4": "1.80"
    },
    ris: 48,
    lis: 38,
    cost: "240.00"
  },
  {
    name: "Steel Mesh (Recycled)",
    category: "Steel",
    functionalUnit: "m²",
    totalCarbon: "15.60",
    description: "Welded wire mesh from recycled steel. Used for concrete reinforcement, fencing, and security applications with circular material sourcing.",
    lifecycle: {
      "A1-A3": "13.20",
      "A4": "1.50",
      "A5": "0.70",
      "B": "0.00",
      "C1-C4": "0.20"
    },
    ris: 42,
    lis: 45,
    cost: "28.00"
  },
  {
    name: "Pre-Weathered Steel Cladding",
    category: "Steel",
    functionalUnit: "m²",
    totalCarbon: "38.40",
    description: "Factory-weathered corten steel panels. Eliminates on-site weathering time, consistent appearance, zero maintenance coating requirements.",
    lifecycle: {
      "A1-A3": "33.20",
      "A4": "3.20",
      "A5": "1.60",
      "B": "0.00",
      "C1-C4": "0.40"
    },
    ris: 38,
    lis: 52,
    cost: "68.00"
  },

  // ============================================================================
  // ADDITIONAL CONCRETE (4 materials)
  // ============================================================================
  {
    name: "Alkali-Activated Concrete",
    category: "Concrete",
    functionalUnit: "m³",
    totalCarbon: "135.60",
    description: "Concrete using alkali-activated industrial byproducts instead of Portland cement. 70% carbon reduction, excellent durability and chemical resistance.",
    lifecycle: {
      "A1-A3": "118.80",
      "A4": "10.20",
      "A5": "5.20",
      "B": "0.00",
      "C1-C4": "1.40"
    },
    ris: 62,
    lis: 35,
    cost: "195.00"
  },
  {
    name: "Pervious Concrete",
    category: "Concrete",
    functionalUnit: "m²",
    totalCarbon: "48.60",
    description: "Porous concrete allowing water infiltration. Reduces stormwater runoff, recharges groundwater, mitigates urban heat island effect.",
    lifecycle: {
      "A1-A3": "42.20",
      "A4": "3.80",
      "A5": "2.10",
      "B": "0.00",
      "C1-C4": "0.50"
    },
    ris: 58,
    lis: 38,
    cost: "68.00"
  },
  {
    name: "Ultra-High Performance Concrete (UHPC)",
    category: "Concrete",
    functionalUnit: "m³",
    totalCarbon: "425.80",
    description: "Advanced concrete with exceptional strength and durability. Higher initial carbon offset by reduced material volumes and extended service life.",
    lifecycle: {
      "A1-A3": "378.60",
      "A4": "28.40",
      "A5": "16.20",
      "B": "0.00",
      "C1-C4": "2.60"
    },
    ris: 32,
    lis: 68,
    cost: "850.00"
  },
  {
    name: "Carbon-Cured Concrete",
    category: "Concrete",
    functionalUnit: "m³",
    totalCarbon: "245.60",
    description: "Concrete cured using captured CO₂ instead of water. Permanently sequesters carbon while improving strength and reducing water consumption.",
    lifecycle: {
      "A1-A3": "215.80",
      "A4": "18.20",
      "A5": "9.80",
      "B": "0.00",
      "C1-C4": "1.80"
    },
    ris: 52,
    lis: 45,
    cost: "285.00"
  },

  // ============================================================================
  // ADDITIONAL EARTH (3 materials)
  // ============================================================================
  {
    name: "Stabilized Earth Blocks",
    category: "Earth",
    functionalUnit: "m²",
    totalCarbon: "12.60",
    description: "Compressed earth blocks with minimal cement stabilizer. Local materials, low energy production, excellent thermal mass.",
    lifecycle: {
      "A1-A3": "9.80",
      "A4": "1.80",
      "A5": "0.70",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 75,
    lis: 22,
    cost: "32.00"
  },
  {
    name: "Earth Plaster",
    category: "Earth",
    functionalUnit: "m²",
    totalCarbon: "3.20",
    description: "Natural clay-based wall finish. Breathable, humidity-regulating, zero-VOC, biodegradable, and can be locally sourced.",
    lifecycle: {
      "A1-A3": "2.40",
      "A4": "0.50",
      "A5": "0.20",
      "B": "0.00",
      "C1-C4": "0.10"
    },
    ris: 90,
    lis: 10,
    cost: "18.00"
  },
  {
    name: "Earth Bag Construction",
    category: "Earth",
    functionalUnit: "m²",
    totalCarbon: "8.40",
    description: "Structural walls from earth-filled polypropylene bags. Ultra-low cost, uses local soil, excellent thermal mass and seismic resistance.",
    lifecycle: {
      "A1-A3": "6.20",
      "A4": "1.40",
      "A5": "0.60",
      "B": "0.00",
      "C1-C4": "0.20"
    },
    ris: 82,
    lis: 18,
    cost: "22.00"
  },

  // ============================================================================
  // CONVENTIONAL DIMENSIONAL LUMBER (8 materials)
  // ============================================================================
  {
    name: "2x4 Studs (SPF)",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "58.60",
    description: "Standard 2x4 dimensional lumber (Spruce-Pine-Fir). Most common framing material in North America. Baseline for comparing engineered wood alternatives.",
    lifecycle: {
      "A1-A3": "48.20",
      "A4": "6.20",
      "A5": "3.00",
      "B": "0.00",
      "C1-C4": "1.20"
    },
    ris: 58,
    lis: 38,
    cost: "380.00"
  },
  {
    name: "2x6 Studs (SPF)",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "56.40",
    description: "Standard 2x6 dimensional lumber for exterior walls and deeper framing. Allows more insulation depth than 2x4.",
    lifecycle: {
      "A1-A3": "46.40",
      "A4": "6.00",
      "A5": "2.80",
      "B": "0.00",
      "C1-C4": "1.20"
    },
    ris: 58,
    lis: 38,
    cost: "420.00"
  },
  {
    name: "2x8 Joists (SPF)",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "54.80",
    description: "Standard floor and ceiling joists. Common for residential construction with moderate spans.",
    lifecycle: {
      "A1-A3": "45.20",
      "A4": "5.80",
      "A5": "2.60",
      "B": "0.00",
      "C1-C4": "1.20"
    },
    ris: 58,
    lis: 38,
    cost: "450.00"
  },
  {
    name: "2x10 Joists (SPF)",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "53.60",
    description: "Larger joists for longer spans and heavier loads. Standard for residential floors.",
    lifecycle: {
      "A1-A3": "44.20",
      "A4": "5.60",
      "A5": "2.60",
      "B": "0.00",
      "C1-C4": "1.20"
    },
    ris: 58,
    lis: 38,
    cost: "480.00"
  },
  {
    name: "2x12 Joists (SPF)",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "52.80",
    description: "Heavy-duty joists for maximum spans. Used in commercial and large residential projects.",
    lifecycle: {
      "A1-A3": "43.60",
      "A4": "5.40",
      "A5": "2.60",
      "B": "0.00",
      "C1-C4": "1.20"
    },
    ris: 58,
    lis: 38,
    cost: "520.00"
  },
  {
    name: "4x4 Posts (SPF)",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "55.20",
    description: "Standard structural posts for decks, pergolas, and light framing. Common in outdoor construction.",
    lifecycle: {
      "A1-A3": "45.60",
      "A4": "5.80",
      "A5": "2.60",
      "B": "0.00",
      "C1-C4": "1.20"
    },
    ris: 58,
    lis: 38,
    cost: "440.00"
  },
  {
    name: "Plywood Sheathing (CDX)",
    category: "Timber",
    functionalUnit: "m²",
    totalCarbon: "16.80",
    description: "Standard construction-grade plywood for roof, wall, and floor sheathing. CDX grade (C-D exterior glue).",
    lifecycle: {
      "A1-A3": "13.80",
      "A4": "1.80",
      "A5": "0.90",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 52,
    lis: 42,
    cost: "38.00"
  },
  {
    name: "OSB Sheathing (7/16\")",
    category: "Timber",
    functionalUnit: "m²",
    totalCarbon: "14.60",
    description: "Oriented Strand Board - economical alternative to plywood. Standard for wall and roof sheathing.",
    lifecycle: {
      "A1-A3": "12.20",
      "A4": "1.50",
      "A5": "0.70",
      "B": "0.00",
      "C1-C4": "0.20"
    },
    ris: 48,
    lis: 45,
    cost: "28.00"
  },

  // ============================================================================
  // ENGINEERED WOOD PRODUCTS (4 materials)
  // ============================================================================
  {
    name: "I-Joists (Engineered Wood Joists)",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "78.40",
    description: "Engineered I-beam joists with OSB web and solid wood flanges. Lightweight, consistent quality, longer spans than dimensional lumber.",
    lifecycle: {
      "A1-A3": "65.80",
      "A4": "7.60",
      "A5": "3.80",
      "B": "0.00",
      "C1-C4": "1.20"
    },
    ris: 68,
    lis: 32,
    cost: "520.00"
  },
  {
    name: "LVL Beams (Laminated Veneer Lumber)",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "82.60",
    description: "Structural beams made from thin wood veneers laminated together. High strength, dimensional stability, ideal for headers and beams.",
    lifecycle: {
      "A1-A3": "69.20",
      "A4": "7.80",
      "A5": "4.20",
      "B": "0.00",
      "C1-C4": "1.40"
    },
    ris: 70,
    lis: 30,
    cost: "680.00"
  },
  {
    name: "PSL Beams (Parallel Strand Lumber)",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "88.40",
    description: "Engineered lumber from long wood strands bonded with adhesive. Excellent for columns and beams, very high strength.",
    lifecycle: {
      "A1-A3": "74.20",
      "A4": "8.20",
      "A5": "4.60",
      "B": "0.00",
      "C1-C4": "1.40"
    },
    ris: 66,
    lis: 34,
    cost: "720.00"
  },
  {
    name: "LSL Studs (Laminated Strand Lumber)",
    category: "Timber",
    functionalUnit: "m³",
    totalCarbon: "76.80",
    description: "Engineered lumber from short wood strands. Consistent quality, no warping, ideal for studs and rim boards.",
    lifecycle: {
      "A1-A3": "64.60",
      "A4": "7.40",
      "A5": "3.60",
      "B": "0.00",
      "C1-C4": "1.20"
    },
    ris: 64,
    lis: 36,
    cost: "580.00"
  },

  // ============================================================================
  // CONVENTIONAL INSULATION (4 materials)
  // ============================================================================
  {
    name: "Fiberglass Batt Insulation (R-13)",
    category: "Insulation",
    functionalUnit: "m³",
    totalCarbon: "28.40",
    description: "Standard fiberglass insulation batts. Most common wall insulation in North America. Baseline for comparing natural alternatives.",
    lifecycle: {
      "A1-A3": "24.20",
      "A4": "2.80",
      "A5": "1.10",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 28,
    lis: 65,
    cost: "22.00"
  },
  {
    name: "Mineral Wool Insulation (Rockwool)",
    category: "Insulation",
    functionalUnit: "m³",
    totalCarbon: "42.60",
    description: "Stone wool insulation made from basalt rock. Fire-resistant, sound-dampening, higher embodied carbon than fiberglass.",
    lifecycle: {
      "A1-A3": "36.80",
      "A4": "3.80",
      "A5": "1.60",
      "B": "0.00",
      "C1-C4": "0.40"
    },
    ris: 32,
    lis: 58,
    cost: "48.00"
  },
  {
    name: "XPS Foam Board (Extruded Polystyrene)",
    category: "Insulation",
    functionalUnit: "m²",
    totalCarbon: "52.80",
    description: "Rigid foam insulation with high R-value per inch. Petroleum-based, high embodied carbon, moisture-resistant.",
    lifecycle: {
      "A1-A3": "45.60",
      "A4": "4.50",
      "A5": "2.20",
      "B": "0.00",
      "C1-C4": "0.50"
    },
    ris: 18,
    lis: 78,
    cost: "42.00"
  },
  {
    name: "EPS Foam Board (Expanded Polystyrene)",
    category: "Insulation",
    functionalUnit: "m²",
    totalCarbon: "38.60",
    description: "Lightweight rigid foam insulation. Lower cost and carbon than XPS, but less moisture-resistant.",
    lifecycle: {
      "A1-A3": "33.20",
      "A4": "3.50",
      "A5": "1.60",
      "B": "0.00",
      "C1-C4": "0.30"
    },
    ris: 22,
    lis: 72,
    cost: "28.00"
  },

  // ============================================================================
  // CONVENTIONAL MASONRY & FINISHES (5 materials)
  // ============================================================================
  {
    name: "Fired Clay Bricks (Standard)",
    category: "Masonry",
    functionalUnit: "m²",
    totalCarbon: "48.60",
    description: "Traditional kiln-fired clay bricks. High embodied energy from firing process. Standard for masonry construction.",
    lifecycle: {
      "A1-A3": "42.20",
      "A4": "3.80",
      "A5": "2.10",
      "B": "0.00",
      "C1-C4": "0.50"
    },
    ris: 25,
    lis: 68,
    cost: "58.00"
  },
  {
    name: "Gypsum Drywall (1/2\")",
    category: "Masonry",
    functionalUnit: "m²",
    totalCarbon: "8.60",
    description: "Standard gypsum wallboard for interior walls and ceilings. Most common interior finish material.",
    lifecycle: {
      "A1-A3": "7.20",
      "A4": "0.80",
      "A5": "0.40",
      "B": "0.00",
      "C1-C4": "0.20"
    },
    ris: 15,
    lis: 75,
    cost: "12.00"
  },
  {
    name: "Asphalt Shingles (3-Tab)",
    category: "Composites",
    functionalUnit: "m²",
    totalCarbon: "18.40",
    description: "Standard asphalt roofing shingles. Most common residential roofing material in North America. Petroleum-based.",
    lifecycle: {
      "A1-A3": "15.80",
      "A4": "1.60",
      "A5": "0.80",
      "B": "0.00",
      "C1-C4": "0.20"
    },
    ris: 12,
    lis: 82,
    cost: "22.00"
  },
  {
    name: "Virgin Aluminum Sheet",
    category: "Steel",
    functionalUnit: "m²",
    totalCarbon: "185.60",
    description: "Primary aluminum from bauxite ore. Extremely high embodied energy. Used for cladding, flashing, and roofing.",
    lifecycle: {
      "A1-A3": "168.40",
      "A4": "10.20",
      "A5": "5.80",
      "B": "0.00",
      "C1-C4": "1.20"
    },
    ris: 8,
    lis: 92,
    cost: "85.00"
  },
  {
    name: "Float Glass (6mm)",
    category: "Composites",
    functionalUnit: "m²",
    totalCarbon: "42.80",
    description: "Standard flat glass for windows. High-temperature manufacturing process, significant embodied energy.",
    lifecycle: {
      "A1-A3": "37.60",
      "A4": "3.20",
      "A5": "1.60",
      "B": "0.00",
      "C1-C4": "0.40"
    },
    ris: 10,
    lis: 85,
    cost: "45.00"
  },

  // ============================================================================
  // CONVENTIONAL CONCRETE (3 materials)
  // ============================================================================
  {
    name: "Ready-Mix Concrete (3000 PSI)",
    category: "Concrete",
    functionalUnit: "m³",
    totalCarbon: "298.60",
    description: "Standard ready-mix concrete for general construction. Baseline for comparing low-carbon alternatives.",
    lifecycle: {
      "A1-A3": "265.20",
      "A4": "19.80",
      "A5": "11.20",
      "B": "0.00",
      "C1-C4": "2.40"
    },
    ris: 18,
    lis: 78,
    cost: "145.00"
  },
  {
    name: "Ready-Mix Concrete (4000 PSI)",
    category: "Concrete",
    functionalUnit: "m³",
    totalCarbon: "325.80",
    description: "Higher-strength ready-mix for structural applications. More cement content = higher carbon.",
    lifecycle: {
      "A1-A3": "289.60",
      "A4": "21.20",
      "A5": "12.40",
      "B": "0.00",
      "C1-C4": "2.60"
    },
    ris: 16,
    lis: 80,
    cost: "165.00"
  },
  {
    name: "Concrete Masonry Units (CMU Blocks)",
    category: "Masonry",
    functionalUnit: "m²",
    totalCarbon: "52.60",
    description: "Standard concrete blocks (8x8x16). Common for foundation walls, commercial construction, and load-bearing walls.",
    lifecycle: {
      "A1-A3": "46.20",
      "A4": "3.80",
      "A5": "2.10",
      "B": "0.00",
      "C1-C4": "0.50"
    },
    ris: 20,
    lis: 72,
    cost: "32.00"
  },

  // ============================================================================
  // VIRGIN STEEL (2 materials)
  // ============================================================================
  {
    name: "Virgin Steel Rebar (Grade 60)",
    category: "Steel",
    functionalUnit: "m³",
    totalCarbon: "285.60",
    description: "Primary steel rebar from iron ore. Baseline for comparing recycled steel alternatives. High embodied carbon.",
    lifecycle: {
      "A1-A3": "252.80",
      "A4": "18.60",
      "A5": "11.20",
      "B": "0.00",
      "C1-C4": "3.00"
    },
    ris: 12,
    lis: 85,
    cost: "280.00"
  },
  {
    name: "Virgin Steel Structural Sections",
    category: "Steel",
    functionalUnit: "m³",
    totalCarbon: "312.40",
    description: "Primary structural steel beams and columns. Standard for commercial construction. Compare with recycled alternatives.",
    lifecycle: {
      "A1-A3": "276.80",
      "A4": "20.40",
      "A5": "12.20",
      "B": "0.00",
      "C1-C4": "3.00"
    },
    ris: 10,
    lis: 88,
    cost: "380.00"
  }
];

async function seed() {
  console.log("🌱 Starting materials database seed...\n");

  try {
    // Clear existing data
    console.log("🧹 Cleaning existing data...");
    await db.delete(lifecycleValues);
    await db.delete(risScores);
    await db.delete(pricing);
    await db.delete(epdMetadata);
    await db.delete(materials);
    console.log("✅ Existing data cleared\n");

    // Insert materials
    console.log("📦 Inserting materials...");
    let insertedCount = 0;

    for (const materialData of materialsData) {
      // Insert material
      const [material] = await db.insert(materials).values({
        name: materialData.name,
        category: materialData.category,
        functionalUnit: materialData.functionalUnit,
        totalCarbon: materialData.totalCarbon,
        description: materialData.description
      });

      const materialId = material.insertId;
      insertedCount++;

      // Insert lifecycle values
      for (const [phase, value] of Object.entries(materialData.lifecycle)) {
        await db.insert(lifecycleValues).values({
          materialId,
          phase,
          value
        });
      }

      // Insert RIS/LIS scores
      await db.insert(risScores).values({
        materialId,
        risScore: materialData.ris,
        lisScore: materialData.lis
      });

      // Insert pricing
      await db.insert(pricing).values({
        materialId,
        costPerUnit: materialData.cost,
        currency: "USD"
      });

      // Insert EPD metadata if available
      if (materialData.epd) {
        await db.insert(epdMetadata).values({
          materialId,
          source: materialData.epd.source,
          referenceYear: materialData.epd.year
        });
      }

      console.log(`  ✓ ${materialData.name} (${materialData.category})`);
    }

    console.log(`\n✅ Successfully inserted ${insertedCount} materials\n`);

    // Verify counts by category
    console.log("📊 Materials by category:");
    const results = await db
      .select({
        category: materials.category,
        count: db.fn.count()
      })
      .from(materials)
      .groupBy(materials.category);

    results.forEach(row => {
      console.log(`  ${row.category}: ${row.count}`);
    });

    console.log("\n🎉 Seed completed successfully!");

  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
