import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getAllMaterials, getMaterialById } from '../db';

/**
 * Public REST API for external integrations
 * 
 * All endpoints are public and don't require authentication.
 * Rate limiting should be applied at the gateway level.
 * 
 * Base URL: /api/trpc/publicAPI
 * 
 * Available endpoints:
 * - getMaterials: Get all materials with optional filtering
 * - getMaterialById: Get single material by ID
 * - searchMaterials: Search materials by name/description
 * - getCategories: Get list of available categories
 * - compareMaterials: Compare 2-5 materials
 * - getDocumentation: Get API documentation
 */

export const publicAPIRouter = router({
  /**
   * Get all materials with optional filtering
   * 
   * Query parameters:
   * - category?: string (Timber, Steel, Concrete, Earth, Insulation, Composites, Masonry)
   * - minRIS?: number (0-100)
   * - maxCarbon?: number (kg CO₂e)
   * - maxCost?: number ($)
   * - regenerativeOnly?: boolean
   * 
   * Returns: Array of materials with full lifecycle data
   */
  getMaterials: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      minRIS: z.number().min(0).max(100).optional(),
      maxCarbon: z.number().optional(),
      maxCost: z.number().optional(),
      regenerativeOnly: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      let materials = await getAllMaterials();

      if (input) {
        if (input.category) {
          materials = materials.filter(m => m.category === input.category);
        }
        if (input.minRIS !== undefined) {
          materials = materials.filter(m => m.risScore >= input.minRIS!);
        }
        if (input.maxCarbon !== undefined) {
          materials = materials.filter(m => m.totalCarbon <= input.maxCarbon!);
        }
        if (input.maxCost !== undefined) {
          materials = materials.filter(m => m.cost <= input.maxCost!);
        }
        if (input.regenerativeOnly) {
          materials = materials.filter(m => m.risScore >= 70); // RIS >= 70 considered regenerative
        }
      }

      return {
        success: true,
        count: materials.length,
        data: materials,
      };
    }),

  /**
   * Get single material by ID
   * 
   * Path parameter:
   * - id: number (material ID)
   * 
   * Returns: Material object with full lifecycle data
   */
  getMaterialById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const material = await getMaterialById(input.id);
      
      if (!material) {
        throw new Error('Material not found');
      }

      return {
        success: true,
        data: material,
      };
    }),

  /**
   * Search materials by name or description
   * 
   * Query parameters:
   * - query: string (search term)
   * - limit?: number (max results, default 10)
   * 
   * Returns: Array of matching materials
   */
  searchMaterials: publicProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const allMaterials = await getAllMaterials();
      const searchTerm = input.query.toLowerCase();

      const results = allMaterials
        .filter(m => 
          m.name.toLowerCase().includes(searchTerm) ||
          m.category.toLowerCase().includes(searchTerm)
        )
        .slice(0, input.limit);

      return {
        success: true,
        count: results.length,
        data: results,
      };
    }),

  /**
   * Get list of available material categories
   * 
   * Returns: Array of category names
   */
  getCategories: publicProcedure
    .query(async () => {
      return {
        success: true,
        data: [
          "Timber",
          "Steel",
          "Concrete",
          "Earth",
          "Insulation",
          "Composites",
          "Masonry"
        ],
      };
    }),

  /**
   * Compare 2-5 materials
   * 
   * Body parameters:
   * - materialIds: number[] (2-5 material IDs)
   * 
   * Returns: Comparison data with metrics
   */
  compareMaterials: publicProcedure
    .input(z.object({
      materialIds: z.array(z.number()).min(2).max(5),
    }))
    .query(async ({ input }) => {
      const materials = await Promise.all(
        input.materialIds.map(id => getMaterialById(id))
      );

      const validMaterials = materials.filter(m => m !== undefined);

      if (validMaterials.length < 2) {
        throw new Error('At least 2 valid materials required for comparison');
      }

      // Calculate comparison metrics
      const bestCarbon = validMaterials.reduce((prev, curr) => 
        prev.totalCarbon < curr.totalCarbon ? prev : curr
      );
      const bestCost = validMaterials.reduce((prev, curr) => 
        prev.cost < curr.cost ? prev : curr
      );
      const bestRIS = validMaterials.reduce((prev, curr) => 
        prev.risScore > curr.risScore ? prev : curr
      );

      return {
        success: true,
        data: {
          materials: validMaterials,
          bestPerformers: {
            lowestCarbon: bestCarbon.id,
            lowestCost: bestCost.id,
            highestRIS: bestRIS.id,
          },
          averages: {
            carbon: validMaterials.reduce((sum, m) => sum + m.totalCarbon, 0) / validMaterials.length,
            cost: validMaterials.reduce((sum, m) => sum + m.cost, 0) / validMaterials.length,
            ris: validMaterials.reduce((sum, m) => sum + m.risScore, 0) / validMaterials.length,
          },
        },
      };
    }),

  /**
   * Get API documentation
   * 
   * Returns: API documentation object
   */
  getDocumentation: publicProcedure
    .query(async () => {
      return {
        success: true,
        version: "1.0.0",
        baseURL: "/api/trpc/publicAPI",
        endpoints: [
          {
            name: "getMaterials",
            method: "GET",
            description: "Get all materials with optional filtering",
            parameters: {
              category: "string (optional)",
              minRIS: "number 0-100 (optional)",
              maxCarbon: "number (optional)",
              maxCost: "number (optional)",
              regenerativeOnly: "boolean (optional)",
            },
            example: "/api/trpc/publicAPI.getMaterials?input={\"category\":\"Timber\",\"minRIS\":70}",
          },
          {
            name: "getMaterialById",
            method: "GET",
            description: "Get single material by ID",
            parameters: {
              id: "number (required)",
            },
            example: "/api/trpc/publicAPI.getMaterialById?input={\"id\":1}",
          },
          {
            name: "searchMaterials",
            method: "GET",
            description: "Search materials by name or description",
            parameters: {
              query: "string (required)",
              limit: "number (optional, default 10)",
            },
            example: "/api/trpc/publicAPI.searchMaterials?input={\"query\":\"CLT\",\"limit\":5}",
          },
          {
            name: "getCategories",
            method: "GET",
            description: "Get list of available material categories",
            parameters: {},
            example: "/api/trpc/publicAPI.getCategories",
          },
          {
            name: "compareMaterials",
            method: "GET",
            description: "Compare 2-5 materials",
            parameters: {
              materialIds: "number[] (2-5 IDs required)",
            },
            example: "/api/trpc/publicAPI.compareMaterials?input={\"materialIds\":[1,2,3]}",
          },
        ],
        rateLimits: {
          perMinute: 60,
          perHour: 1000,
          perDay: 10000,
        },
        notes: [
          "All endpoints are public and don't require authentication",
          "Rate limiting is applied per IP address",
          "All responses include a 'success' boolean field",
          "Errors return HTTP 400/404/500 with error message",
          "tRPC format: append query parameters as JSON-encoded 'input' parameter",
        ],
      };
    }),
});
