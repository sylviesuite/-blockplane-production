/**
 * BlockPlane Materials Database - Seed Script
 * 
 * Populates the database with 26 production-ready building materials
 * across 4 categories (Timber, Steel, Concrete, Earth).
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
    name: "Cold-Formed Steel Studs",
    category: "Steel",
    functionalUnit: "m²",
    totalCarbon: "28.40",
    description: "Light-gauge steel framing members formed at room temperature. Lightweight, dimensionally stable, and commonly made with recycled content.",
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
