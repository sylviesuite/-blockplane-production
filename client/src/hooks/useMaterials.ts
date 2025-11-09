/**
 * useMaterials Hook
 * 
 * React hook for loading materials from Supabase
 * Replaces hardcoded mock data
 */

import { useState, useEffect } from 'react';
import { getMaterialsWithScores, getMaterialDetail } from '../data/materialsRepo';
import { adaptMaterialsFromView, adaptMaterialFromSupabase } from '../lib/materialAdapter';
import type { Material } from '../types';

interface UseMaterialsResult {
  materials: Material[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Load all materials with scores
 */
export function useMaterials(): UseMaterialsResult {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMaterialsWithScores();
      const adapted = adaptMaterialsFromView(data);
      setMaterials(adapted);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return {
    materials,
    loading,
    error,
    refetch: fetchMaterials,
  };
}

interface UseMaterialDetailResult {
  material: Material | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Load single material with full details
 */
export function useMaterialDetail(materialId: string | null): UseMaterialDetailResult {
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMaterial = async () => {
    if (!materialId) {
      setMaterial(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getMaterialDetail(materialId);
      if (data) {
        const adapted = adaptMaterialFromSupabase(data);
        setMaterial(adapted);
      } else {
        setMaterial(null);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error loading material detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterial();
  }, [materialId]);

  return {
    material,
    loading,
    error,
    refetch: fetchMaterial,
  };
}
