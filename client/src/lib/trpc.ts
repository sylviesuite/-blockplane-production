import { useMemo } from "react";
import type { ReactNode } from "react";
import { localMaterials } from "@/data/materials";
import { fullMaterialsFromSeed } from "@/data/materialsFull";

// MOCK TRPC SURROGATE - temporary data layer for frontend-only iteration.
// Materials Explorer uses full seed inventory (85+) when available.
export const IS_MOCK_TRPC = true;

type TrpcProviderProps = {
  children: ReactNode;
};

const noopRefetch = async () => {};
const warnMissing = (name: string) => {
  console.warn(`[mock trpc] ${name} is not backed by a backend yet.`);
};

type ConfidenceLevel = "High" | "Medium" | "Low" | "None";

type MockMaterial = {
  id: string;
  name: string;
  category: string;
  description: string;
  totalCarbon: string;
  costPerUnit: string;
  functionalUnit: string;
  lisScore: number;
  risScore: number;
  cpiScore: number;
  confidenceLevel: ConfidenceLevel;
  isRegenerative: number;
  lifecycleBreakdown: {
    a1a3: string;
    a4: string;
    a5: string;
    b: string;
    c1c4: string;
  };
  lifecycle: { phase: string; value: string }[];
  epdMetadata: Array<{
    source: string;
    manufacturer?: string;
    epdUrl?: string;
    referenceYear?: string;
  }>;
  dataQuality: Record<string, any> | null;
  currency: string;
  lastVerified: string;
  verificationNotes: string;
};

const buildLifecycle = (lis: number, ris: number, cpi: number) => {
  const base = lis + ris + cpi;
  const breakdown = {
    a1a3: (base * 0.25).toFixed(1),
    a4: (base * 0.15).toFixed(1),
    a5: (base * 0.1).toFixed(1),
    b: (base * 0.3).toFixed(1),
    c1c4: (base * 0.2).toFixed(1),
  };
  const lifecycle = [
    { phase: "A1-A3", value: breakdown.a1a3 },
    { phase: "A4", value: breakdown.a4 },
    { phase: "A5", value: breakdown.a5 },
    { phase: "B", value: breakdown.b },
    { phase: "C1-C4", value: breakdown.c1c4 },
  ];
  return { lifecycle, lifecycleBreakdown: breakdown };
};

/** Full inventory for Materials Explorer (85+). Falls back to localMaterials if seed data unavailable. */
const materialsForExplorer =
  fullMaterialsFromSeed?.length > 0 ? fullMaterialsFromSeed : localMaterials;

const enhanceMaterials = materialsForExplorer.map((material) => {
  const { lifecycle, lifecycleBreakdown } = buildLifecycle(material.lis, material.ris, material.cpi);
  const confidenceLevel: ConfidenceLevel =
    material.ris >= 70 ? "High" : material.ris >= 45 ? "Medium" : "Low";
  return {
    id: material.id,
    name: material.name,
    category: material.category,
    description: material.description,
    totalCarbon: ((material.lis + material.ris) * 1.2).toFixed(1),
    costPerUnit: (material.cpi * 1.1).toFixed(2),
    functionalUnit: "m²",
    lisScore: material.lis,
    risScore: material.ris,
    cpiScore: material.cpi,
    confidenceLevel,
    isRegenerative: material.regenerative ? 1 : 0,
    lifecycle,
    lifecycleBreakdown,
    epdMetadata: [
      {
        source: `${material.name} Data Pack`,
        manufacturer: "BlockPlane Local",
        referenceYear: "2025",
      },
    ],
    dataQuality: { source: "Local placeholder data", version: "1.0" },
    currency: "USD",
    lastVerified: new Date().toISOString(),
    verificationNotes: "Locally curated placeholder data for browsing scenarios.",
  } satisfies MockMaterial;
});

type SearchFilters = {
  query?: string;
  categories?: string[];
  minRIS?: number;
  maxCarbon?: number;
  regenerativeOnly?: boolean;
  sortBy?: "name" | "carbon" | "cost" | "ris" | "lis";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

const paginateMaterials = (materials: MockMaterial[], page: number, pageSize: number) => {
  const totalItems = materials.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const cappedPage = Math.min(Math.max(page, 1), totalPages);
  const start = (cappedPage - 1) * pageSize;
  const items = materials.slice(start, start + pageSize);
  return { items, totalItems, totalPages, currentPage: cappedPage, pageSize };
};

const filterMaterials = (materials: MockMaterial[], filters: SearchFilters) => {
  return materials.filter((mat) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      if (!mat.name.toLowerCase().includes(q) && !mat.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(mat.category)) return false;
    }
    if (typeof filters.minRIS === "number" && mat.risScore < filters.minRIS) return false;
    if (typeof filters.maxCarbon === "number" && parseFloat(mat.totalCarbon) > filters.maxCarbon) return false;
    if (filters.regenerativeOnly && mat.isRegenerative !== 1) return false;
    return true;
  });
};

const useSearchQuery = (input?: SearchFilters, options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const query = input?.query?.trim().toLowerCase() ?? "";
  const categoriesKey = input?.categories?.join(",") ?? "";
  const page = input?.page ?? 1;
  const pageSize = input?.pageSize ?? 12;
  const sortBy = input?.sortBy ?? "name";
  const sortOrder = input?.sortOrder ?? "asc";

  const data = useMemo(() => {
    if (!enabled) return null;
    const filtered = filterMaterials(enhanceMaterials, {
      ...input,
      query,
      categories: input?.categories,
    });
    const sorted = [...filtered].sort((a, b) => {
      let aVal: number | string = "";
      let bVal: number | string = "";
      switch (sortBy) {
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
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return paginateMaterials(sorted, page, pageSize);
  }, [enabled, query, categoriesKey, input?.minRIS, input?.maxCarbon, input?.regenerativeOnly, sortBy, sortOrder, page, pageSize]);

  return {
    data,
    isLoading: false,
    error: null,
    refetch: noopRefetch,
  };
};

const useGetById = (input?: { id?: string | number }, options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const queryId = input?.id?.toString();
  const material = useMemo(() => {
    if (!enabled || !queryId) return null;
    return enhanceMaterials.find((mat) => mat.id === queryId) ?? null;
  }, [enabled, queryId]);
  return { data: material, isLoading: false, error: null, refetch: noopRefetch };
};

const useGetRecommendations = (
  input?: { materialId?: string | number; maxResults?: number },
  options?: { enabled?: boolean }
) => {
  const enabled = options?.enabled ?? true;
  const queryId = input?.materialId?.toString();
  const maxResults = input?.maxResults ?? 3;

  const data = useMemo(() => {
    if (!enabled || !queryId) return null;
    const current = enhanceMaterials.find((mat) => mat.id === queryId);
    if (!current) return null;
    return enhanceMaterials
      .filter((mat) => mat.id !== queryId)
      .map((candidate) => ({
        material: candidate,
        score: candidate.risScore - current.risScore + (current.lisScore - candidate.lisScore) * 0.1,
        carbonSavings: parseFloat(current.totalCarbon) - parseFloat(candidate.totalCarbon),
        costDelta: parseFloat(candidate.costPerUnit) - parseFloat(current.costPerUnit),
        risDelta: candidate.risScore - current.risScore,
        lisDelta: candidate.lisScore - current.lisScore,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }, [enabled, queryId, maxResults]);

  return { data, isLoading: false, error: null, refetch: noopRefetch };
};

const useGetCategories = () => {
  const data = useMemo(() => {
    const grouping: Record<string, number> = {};
    enhanceMaterials.forEach((material) => {
      grouping[material.category] = (grouping[material.category] || 0) + 1;
    });
    return Object.entries(grouping).map(([name, count]) => ({ name, count }));
  }, []);
  return { data, isLoading: false, error: null, refetch: noopRefetch };
};

const createQueryStub = <T>(name: string, payload: T | null = null) => (): QueryResult<T> => {
  warnMissing(name);
  return { data: payload, isLoading: false, error: null, refetch: noopRefetch };
};

const createMutationStub = <T>(name: string, response: T | null = null) => (
  options?: MutationOptions<T>
): MutationResult<T> => ({
  mutate: (_variables?: any, opts?: MutationOptions<T>) => {
    warnMissing(name);
    opts?.onSuccess?.(response as T, _variables);
  },
  mutateAsync: async (_variables?: any, opts?: MutationOptions<T>) => {
    warnMissing(name);
    opts?.onSuccess?.(response as T, _variables);
    return response ?? undefined;
  },
  isPending: false,
  isLoading: false,
  isError: false,
  error: null,
});

const adminMaterialStats = {
  total: enhanceMaterials.length,
  byCategory: Object.entries(
    enhanceMaterials.reduce<Record<string, number>>((acc, next) => {
      acc[next.category] = (acc[next.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([category, count]) => ({ category, count })),
};

const analyticsKPIs = {
  totalCarbonAvoided: enhanceMaterials.reduce((sum, material) => sum + parseFloat(material.totalCarbon) * 0.2, 0),
  totalSubstitutions: 14,
  substitutionRate: 18.4,
  aiEngagementRate: 42.6,
  totalAIInteractions: 128,
  recommendationAcceptanceRate: 34.1,
  totalSuggestionsShown: 240,
  totalRecommendationsAccepted: 82,
  totalMaterialsViewed: enhanceMaterials.length * 5,
  totalSessions: 48,
  totalMaterialsTracked: enhanceMaterials.length,
};

const topAlternatives = [
  { alternativeName: "Rammed Earth", recommendationCount: 56, avgCarbonSaved: 25.3, acceptanceCount: 42 },
  { alternativeName: "Hempcrete Infill", recommendationCount: 38, avgCarbonSaved: 14.1, acceptanceCount: 26 },
  { alternativeName: "OSB Board", recommendationCount: 30, avgCarbonSaved: 11.7, acceptanceCount: 15 },
];

const materialRecommendations = enhanceMaterials.slice(0, 3).map((material) => ({
  material,
  carbonSavings: Math.max(0, parseFloat(material.totalCarbon) * 0.1),
  costDelta: -Math.max(0, parseFloat(material.costPerUnit) * 0.1),
  risDelta: Math.round(material.risScore * 0.1),
  summary: `${material.name} offers a cleaner lifecycle and higher RIS lift.`,
  reasons: ["Lower carbon impact", "Higher durability and resilience (RIS)"],
  confidence: material.confidenceLevel === "High" ? 80 : material.confidenceLevel === "Medium" ? 60 : 30,
}));

const aiResponse = (input?: any) => ({
  answer: `Mock response for ${input?.question ?? "your prompt"}.`,
  choices: [
    {
      message: {
        content: `Mock response text for ${input?.question ?? "the latest chat"}.`,
      },
    },
  ],
});

export const trpc = {
  Provider({ children }: TrpcProviderProps) {
    return children;
  },
  materialAPI: {
    search: {
      useQuery: useSearchQuery,
    },
    getCategories: {
      useQuery: useGetCategories,
    },
    getById: {
      useQuery: useGetById,
    },
    getRecommendations: {
      useQuery: useGetRecommendations,
    },
  },
  materials: {
    list: {
      useQuery: () => ({
        data: enhanceMaterials,
        isLoading: false,
        error: null,
        refetch: noopRefetch,
      }),
    },
    getAll: {
      useQuery: () => ({
        data: enhanceMaterials,
        isLoading: false,
        error: null,
        refetch: noopRefetch,
      }),
    },
    getById: {
      useQuery: useGetById,
    },
  },
  analytics: {
    getKPIs: {
      useQuery: () => ({
        data: analyticsKPIs,
        isLoading: false,
        error: null,
        refetch: noopRefetch,
      }),
    },
    getTopAlternatives: {
      useQuery: () => ({
        data: topAlternatives,
        isLoading: false,
        error: null,
        refetch: noopRefetch,
      }),
    },
    logEvent: {
      useMutation: (options?: MutationOptions) => createMutationStub("analytics.logEvent")(options),
    },
  },
  recommendations: {
    getAlternatives: {
      useQuery: () => ({
        data: materialRecommendations,
        isLoading: false,
        error: null,
        refetch: noopRefetch,
      }),
    },
  },
  swapAssistant: {
    getRecommendations: {
      useMutation: (options?: MutationOptions) =>
        createMutationStub("swapAssistant.getRecommendations", {
          explanation: "Mock recommendations generated.",
          recommendations: materialRecommendations.map((rec) => rec.material),
          region: "national",
          projectArea: 1000,
        })(options),
    },
    generateSpec: {
      useMutation: (options?: MutationOptions) =>
        createMutationStub("swapAssistant.generateSpec", {
          materialName: "Mock Material",
          specText: "This is a mock specification output.",
        })(options),
    },
  },
  admin: {
    getMaterialStats: {
      useQuery: () => ({
        data: adminMaterialStats,
        isLoading: false,
        error: null,
        refetch: noopRefetch,
      }),
    },
    getUsageStats: {
      useQuery: () => ({
        data: {
          totalEvents: 42,
          totalCarbonSaved: analyticsKPIs.totalCarbonAvoided,
          mostViewedMaterials: enhanceMaterials.map((material) => ({
            materialName: material.name,
            count: Math.floor(Math.random() * 20) + 1,
          })),
        },
        isLoading: false,
        error: null,
        refetch: noopRefetch,
      }),
    },
    deleteMaterial: {
      useMutation: (options?: MutationOptions) => createMutationStub("admin.deleteMaterial")(options),
    },
    createMaterial: {
      useMutation: (options?: MutationOptions) => createMutationStub("admin.createMaterial")(options),
    },
    bulkImport: {
      useMutation: (options?: MutationOptions) => createMutationStub("admin.bulkImport")(options),
    },
  },
  ai: {
    chat: {
      useMutation: (options?: MutationOptions) => createMutationStub("ai.chat", aiResponse())(options),
    },
    ask: {
      useMutation: (options?: MutationOptions) => createMutationStub("ai.ask", { answer: "Mock AI answer." })(options),
    },
  },
} as const;
