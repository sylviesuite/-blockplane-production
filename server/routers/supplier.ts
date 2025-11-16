import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { searchSupplierQuotes, getSupplierDetails, requestFormalQuote, getLocalSuppliers } from '../lib/supplierIntegration';

export const supplierRouter = router({
  /**
   * Search for supplier quotes for a material
   */
  searchQuotes: publicProcedure
    .input(z.object({
      materialId: z.number(),
      materialName: z.string(),
      quantity: z.number(),
      projectLocation: z.string(),
      maxDistance: z.number().optional(),
      preferCertified: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const quotes = await searchSupplierQuotes(input);
      return {
        success: true,
        count: quotes.length,
        data: quotes,
      };
    }),

  /**
   * Get supplier details
   */
  getDetails: publicProcedure
    .input(z.object({ supplierId: z.string() }))
    .query(async ({ input }) => {
      const details = await getSupplierDetails(input.supplierId);
      return {
        success: true,
        data: details,
      };
    }),

  /**
   * Request a formal quote from supplier
   */
  requestQuote: publicProcedure
    .input(z.object({
      supplierId: z.string(),
      materialId: z.number(),
      quantity: z.number(),
      projectName: z.string(),
      contactEmail: z.string().email(),
      deliveryDate: z.date(),
    }))
    .mutation(async ({ input }) => {
      const result = await requestFormalQuote(input);
      return result;
    }),

  /**
   * Get local suppliers by region
   */
  getLocalSuppliers: publicProcedure
    .input(z.object({
      location: z.string(),
      maxDistance: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const suppliers = await getLocalSuppliers(input.location, input.maxDistance);
      return {
        success: true,
        count: suppliers.length,
        data: suppliers,
      };
    }),
});
