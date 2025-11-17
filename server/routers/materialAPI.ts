/**
 * Material Database API for Revit Plugin Integration
 * 
 * This router provides comprehensive material data access for the BlockPlane Revit plugin.
 * All procedures include confidence levels and data quality metadata for "radical honesty".
 * 
 * Key Features:
 * - Advanced search with filters (category, RIS, carbon, regenerative)
 * - Sorting options (carbon, cost, RIS, name)
 * - Pagination support
 * - Confidence and data quality tracking
 * - EPD metadata with source attribution
 * - Material recommendations
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { 
  getAllMaterials, 
  getMaterialById, 
  getMaterialsByCategory 
} from "../db";

/**
 * Material search/filter input schema
 */
const materialSearchSchema = z.object({
  // Text search
  query: z.string().optional(),
  
  // Category filters
  categories: z.array(z.enum([
    "Timber", 
    "Steel", 
    "Concrete", 
    "Earth", 
    "Insulation", 
    "Composites", 
    "Masonry"
  ])).optional(),
  
  // RIS/LIS filters
  minRIS: z.number().min(0).max(100).optional(),
  maxRIS: z.number().min(0).max(100).optional(),
  minLIS: z.number().min(0).max(100).optional(),
  maxLIS: z.number().min(0).max(100).optional(),
  
  // Carbon filters
  maxCarbon: z.number().optional(), // Maximum total carbon (kg CO₂e)
  
  // Cost filters
  minCost: z.number().optional(),
  maxCost: z.number().optional(),
  
  // Regenerative filter
  regenerativeOnly: z.boolean().optional(),
  
  // Confidence filter
  minConfidence: z.enum(["High", "Medium", "Low", "None"]).optional(),
  
  // Sorting
  sortBy: z.enum(["name", "carbon", "cost", "ris", "lis"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  
  // Pagination
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

/**
 * Helper function to apply filters to materials
 */
function filterMaterials(materials: any[], filters: z.infer<typeof materialSearchSchema>) {
  let filtered = [...materials];
  
  // Text search (name and description)
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(query) || 
      (m.description && m.description.toLowerCase().includes(query))
    );
  }
  
  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(m => filters.categories!.includes(m.category));
  }
  
  // RIS filters
  if (filters.minRIS !== undefined) {
    filtered = filtered.filter(m => m.risScore >= filters.minRIS!);
  }
  if (filters.maxRIS !== undefined) {
    filtered = filtered.filter(m => m.risScore <= filters.maxRIS!);
  }
  
  // LIS filters
  if (filters.minLIS !== undefined) {
    filtered = filtered.filter(m => m.lisScore >= filters.minLIS!);
  }
  if (filters.maxLIS !== undefined) {
    filtered = filtered.filter(m => m.lisScore <= filters.maxLIS!);
  }
  
  // Carbon filter
  if (filters.maxCarbon !== undefined) {
    filtered = filtered.filter(m => parseFloat(m.totalCarbon) <= filters.maxCarbon!);
  }
  
  // Cost filters
  if (filters.minCost !== undefined) {
    filtered = filtered.filter(m => parseFloat(m.costPerUnit) >= filters.minCost!);
  }
  if (filters.maxCost !== undefined) {
    filtered = filtered.filter(m => parseFloat(m.costPerUnit) <= filters.maxCost!);
  }
  
  // Regenerative filter
  if (filters.regenerativeOnly) {
    filtered = filtered.filter(m => m.isRegenerative === 1);
  }
  
  // Confidence filter
  if (filters.minConfidence) {
    const confidenceLevels = ["None", "Low", "Medium", "High"];
    const minLevel = confidenceLevels.indexOf(filters.minConfidence);
    filtered = filtered.filter(m => {
      const materialLevel = confidenceLevels.indexOf(m.confidenceLevel);
      return materialLevel >= minLevel;
    });
  }
  
  return filtered;
}

/**
 * Helper function to sort materials
 */
function sortMaterials(materials: any[], sortBy: string, sortOrder: "asc" | "desc") {
  const sorted = [...materials];
  
  sorted.sort((a, b) => {
    let aVal: any;
    let bVal: any;
    
    switch (sortBy) {
      case "name":
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case "carbon":
        aVal = parseFloat(a.totalCarbon);
        bVal = parseFloat(b.totalCarbon);
        break;
      case "cost":
        aVal = parseFloat(a.costPerUnit);
        bVal = parseFloat(b.costPerUnit);
        break;
      case "ris":
        aVal = a.risScore;
        bVal = b.risScore;
        break;
      case "lis":
        aVal = a.lisScore;
        bVal = b.lisScore;
        break;
      default:
        return 0;
    }
    
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

/**
 * Helper function to paginate results
 */
function paginateMaterials(materials: any[], page: number, pageSize: number) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    items: materials.slice(startIndex, endIndex),
    totalItems: materials.length,
    totalPages: Math.ceil(materials.length / pageSize),
    currentPage: page,
    pageSize,
  };
}

/**
 * Material API Router
 */
export const materialAPIRouter = router({
  /**
   * Search materials with advanced filters, sorting, and pagination
   * This is the primary endpoint for the Revit plugin material browser
   */
  search: publicProcedure
    .input(materialSearchSchema)
    .query(async ({ input }) => {
      const allMaterials = await getAllMaterials();
      
      // Apply filters
      const filtered = filterMaterials(allMaterials, input);
      
      // Apply sorting
      const sorted = sortMaterials(filtered, input.sortBy, input.sortOrder);
      
      // Apply pagination
      const paginated = paginateMaterials(sorted, input.page, input.pageSize);
      
      return {
        ...paginated,
        filters: {
          query: input.query,
          categories: input.categories,
          minRIS: input.minRIS,
          maxRIS: input.maxRIS,
          minLIS: input.minLIS,
          maxLIS: input.maxLIS,
          maxCarbon: input.maxCarbon,
          minCost: input.minCost,
          maxCost: input.maxCost,
          regenerativeOnly: input.regenerativeOnly,
          minConfidence: input.minConfidence,
        },
        sorting: {
          sortBy: input.sortBy,
          sortOrder: input.sortOrder,
        },
      };
    }),

  /**
   * Get a single material by ID with full details
   * Includes lifecycle data, EPD metadata, and confidence information
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const material = await getMaterialById(input.id);
      
      if (!material) {
        throw new Error(`Material with ID ${input.id} not found`);
      }
      
      // Transform lifecycle data for easier consumption
      const lifecycleBreakdown = {
        a1a3: material.lifecycle.find(lc => lc.phase === "A1-A3")?.value || "0",
        a4: material.lifecycle.find(lc => lc.phase === "A4")?.value || "0",
        a5: material.lifecycle.find(lc => lc.phase === "A5")?.value || "0",
        b: material.lifecycle.find(lc => lc.phase === "B")?.value || "0",
        c1c4: material.lifecycle.find(lc => lc.phase === "C1-C4")?.value || "0",
      };
      
      return {
        ...material,
        lifecycleBreakdown,
        dataQuality: material.dataQuality ? JSON.parse(material.dataQuality) : null,
      };
    }),

  /**
   * Get all available categories with material counts
   */
  getCategories: publicProcedure.query(async () => {
    const allMaterials = await getAllMaterials();
    
    const categories = [
      "Timber",
      "Steel", 
      "Concrete",
      "Earth",
      "Insulation",
      "Composites",
      "Masonry"
    ];
    
    return categories.map(category => ({
      name: category,
      count: allMaterials.filter(m => m.category === category).length,
    }));
  }),

  /**
   * Get material recommendations based on a reference material
   * Used by Revit plugin for material swap suggestions
   */
  getRecommendations: publicProcedure
    .input(z.object({
      materialId: z.number(),
      maxResults: z.number().min(1).max(10).default(5),
      prioritizeCarbon: z.boolean().default(true),
      prioritizeCost: z.boolean().default(false),
      prioritizeRIS: z.boolean().default(true),
      sameCategory: z.boolean().default(true), // Only recommend materials in same category
    }))
    .query(async ({ input }) => {
      const allMaterials = await getAllMaterials();
      const currentMaterial = allMaterials.find(m => m.id === input.materialId);
      
      if (!currentMaterial) {
        throw new Error(`Material with ID ${input.materialId} not found`);
      }
      
      // Filter candidates
      let candidates = allMaterials.filter(m => {
        // Exclude the current material
        if (m.id === input.materialId) return false;
        
        // Filter by category if requested
        if (input.sameCategory && m.category !== currentMaterial.category) return false;
        
        return true;
      });
      
      // Score each candidate
      const scored = candidates.map(candidate => {
        let score = 0;
        
        // Carbon improvement (lower is better)
        if (input.prioritizeCarbon) {
          const carbonDiff = parseFloat(currentMaterial.totalCarbon) - parseFloat(candidate.totalCarbon);
          const carbonImprovement = (carbonDiff / parseFloat(currentMaterial.totalCarbon)) * 100;
          score += carbonImprovement * 0.4; // 40% weight
        }
        
        // RIS improvement (higher is better)
        if (input.prioritizeRIS) {
          const risDiff = candidate.risScore - currentMaterial.risScore;
          score += risDiff * 0.4; // 40% weight
        }
        
        // Cost improvement (lower is better)
        if (input.prioritizeCost) {
          const costDiff = parseFloat(currentMaterial.costPerUnit) - parseFloat(candidate.costPerUnit);
          const costImprovement = (costDiff / parseFloat(currentMaterial.costPerUnit)) * 100;
          score += costImprovement * 0.2; // 20% weight
        }
        
        return {
          material: candidate,
          score,
          carbonSavings: parseFloat(currentMaterial.totalCarbon) - parseFloat(candidate.totalCarbon),
          costDelta: parseFloat(candidate.costPerUnit) - parseFloat(currentMaterial.costPerUnit),
          risDelta: candidate.risScore - currentMaterial.risScore,
          lisDelta: candidate.lisScore - currentMaterial.lisScore,
        };
      });
      
      // Sort by score (descending) and take top results
      scored.sort((a, b) => b.score - a.score);
      const topRecommendations = scored.slice(0, input.maxResults);
      
      // Add recommendation reasons
      return topRecommendations.map(rec => {
        const reasons: string[] = [];
        
        if (rec.carbonSavings > 0) {
          reasons.push(`Reduces carbon by ${rec.carbonSavings.toFixed(2)} kg CO₂e (${((rec.carbonSavings / parseFloat(currentMaterial.totalCarbon)) * 100).toFixed(1)}%)`);
        }
        
        if (rec.risDelta > 0) {
          reasons.push(`Improves RIS score by ${rec.risDelta} points`);
        }
        
        if (rec.costDelta < 0) {
          reasons.push(`Saves $${Math.abs(rec.costDelta).toFixed(2)} per ${currentMaterial.functionalUnit}`);
        }
        
        if (rec.material.isRegenerative === 1) {
          reasons.push("Regenerative material");
        }
        
        return {
          ...rec,
          reasons,
          confidence: rec.material.confidenceLevel,
        };
      });
    }),

  /**
   * Get statistics about the material database
   * Useful for Revit plugin to show data coverage
   */
  getStats: publicProcedure.query(async () => {
    const allMaterials = await getAllMaterials();
    
    const stats = {
      totalMaterials: allMaterials.length,
      byCategory: {} as Record<string, number>,
      byConfidence: {
        High: 0,
        Medium: 0,
        Low: 0,
        None: 0,
      },
      regenerativeMaterials: allMaterials.filter(m => m.isRegenerative === 1).length,
      averageRIS: allMaterials.reduce((sum, m) => sum + m.risScore, 0) / allMaterials.length,
      averageLIS: allMaterials.reduce((sum, m) => sum + m.lisScore, 0) / allMaterials.length,
      averageCarbon: allMaterials.reduce((sum, m) => sum + parseFloat(m.totalCarbon), 0) / allMaterials.length,
    };
    
    // Count by category
    allMaterials.forEach(m => {
      stats.byCategory[m.category] = (stats.byCategory[m.category] || 0) + 1;
    });
    
    // Count by confidence
    allMaterials.forEach(m => {
      stats.byConfidence[m.confidenceLevel as keyof typeof stats.byConfidence]++;
    });
    
    return stats;
  }),
});
