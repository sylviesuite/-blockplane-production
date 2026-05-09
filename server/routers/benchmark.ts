import { router, publicProcedure } from "../_core/trpc";
import { BENCHMARK_HOUSE, BENCHMARK_ASSEMBLIES, BENCHMARK_REFERENCE_TOTAL_KG } from "../data/benchmark2000";

export const benchmarkRouter = router({
  getSpec: publicProcedure.query(() => {
    return {
      house: BENCHMARK_HOUSE,
      assemblies: BENCHMARK_ASSEMBLIES,
      referenceTotal: BENCHMARK_REFERENCE_TOTAL_KG,
    };
  }),
});
