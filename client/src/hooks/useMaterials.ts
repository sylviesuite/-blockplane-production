/**
 * useMaterials Hook
 * 
 * React hook for loading materials via tRPC
 * Provides type-safe access to materials database
 */

import { trpc } from '../lib/trpc';
import type { Material } from '../types';

interface UseMaterialsResult {
  materials: Material[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Load all materials with scores
 */
export function useMaterials(): UseMaterialsResult {
  const { data, isLoading, error, refetch } = trpc.materials.getAll.useQuery();

  // Transform tRPC data to Material type
  const materials: Material[] = (data || []).map(m => ({
    id: m.id.toString(),
    name: m.name,
    category: m.category,
    functionalUnit: m.functionalUnit,
    total: parseFloat(m.totalCarbon),
    phases: {
      pointOfOrigin: parseFloat(m.lifecycle.find((lc: { phase: string; value: string }) => lc.phase === 'A1-A3')?.value || '0'),
      transport: parseFloat(m.lifecycle.find((lc: { phase: string; value: string }) => lc.phase === 'A4')?.value || '0'),
      construction: parseFloat(m.lifecycle.find((lc: { phase: string; value: string }) => lc.phase === 'A5')?.value || '0'),
      production: parseFloat(m.lifecycle.find((lc: { phase: string; value: string }) => lc.phase === 'B')?.value || '0'),
      disposal: parseFloat(m.lifecycle.find((lc: { phase: string; value: string }) => lc.phase === 'C1-C4')?.value || '0'),
    },
    materialType: '',
    ris: m.risScore,
    lis: m.lisScore,
    cost: { value: parseFloat(m.costPerUnit), unit: m.functionalUnit },
    description: m.description || '',
  }));

  return {
    materials,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}

interface UseMaterialDetailResult {
  material: Material | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Load single material with full details
 */
export function useMaterialDetail(materialId: string | null): UseMaterialDetailResult {
  const { data, isLoading, error, refetch } = trpc.materials.getById.useQuery(
    { id: materialId! },
    { enabled: !!materialId }
  );

  let material: Material | null = null;
  if (data) {
    material = {
      id: data.id.toString(),
      name: data.name,
      category: data.category,
      functionalUnit: data.functionalUnit,
      total: parseFloat(data.totalCarbon),
      phases: {
        pointOfOrigin: parseFloat(data.lifecycle.find((lc: { phase: string; value: string }) => lc.phase === 'A1-A3')?.value || '0'),
        transport: parseFloat(data.lifecycle.find((lc: { phase: string; value: string }) => lc.phase === 'A4')?.value || '0'),
        construction: parseFloat(data.lifecycle.find((lc: { phase: string; value: string }) => lc.phase === 'A5')?.value || '0'),
        production: parseFloat(data.lifecycle.find((lc: { phase: string; value: string }) => lc.phase === 'B')?.value || '0'),
        disposal: parseFloat(data.lifecycle.find((lc: { phase: string; value: string }) => lc.phase === 'C1-C4')?.value || '0'),
      },
      materialType: '',
      ris: data.risScore,
      lis: data.lisScore,
      cost: { value: parseFloat(data.costPerUnit), unit: data.functionalUnit },
      description: data.description || '',
    };
  }

  return {
    material,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}
