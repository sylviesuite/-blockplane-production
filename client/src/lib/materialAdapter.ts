/**
 * Material Data Adapter
 * 
 * Transforms Supabase database rows into the Material type
 * used by the application components
 */

import type { Material } from '../types';
import type { MaterialWithScoresRow } from '../types/supabase';

/**
 * Transform a single MaterialWithScoresRow from Supabase into Material type
 */
export function adaptMaterialFromSupabase(row: MaterialWithScoresRow): Material {
  return {
    id: row.id,
    name: row.name,
    materialType: row.material_type || 'misc',
    sourceRegion: row.source_region || undefined,
    
    // Lifecycle phases
    phases: {
      pointOfOrigin: row.point_of_origin || 0,
      production: row.production || 0,
      transport: row.transport || 0,
      construction: row.construction || 0,
      disposal: row.disposal || 0,
    },
    
    // Total carbon
    total: row.total || 0,
    
    // Metadata
    meta: {
      unit: row.unit || row.functional_unit || 'm2',
    },
    
    // Optional scores
    scores: row.ris_score || row.lis_score ? {
      lis: row.lis_score || 0,
      ris: row.ris_score || 0,
      risTier: mapQuadrantToTier(row.quadrant),
      cpi: 0, // Not calculated yet
    } : undefined,
  };
}

/**
 * Transform an array of MaterialWithScoresRow into Material[]
 */
export function adaptMaterialsFromView(rows: MaterialWithScoresRow[]): Material[] {
  return rows.map(adaptMaterialFromSupabase);
}

/**
 * Map Supabase quadrant to RIS tier
 */
function mapQuadrantToTier(quadrant?: string): 'Gold' | 'Silver' | 'Bronze' | 'Problematic' {
  switch (quadrant) {
    case 'Regenerative':
      return 'Gold';
    case 'Transitional':
      return 'Silver';
    case 'Costly':
      return 'Bronze';
    case 'Problematic':
    default:
      return 'Problematic';
  }
}

/**
 * Calculate intensity rating for a material based on total carbon
 */
export function getIntensityRating(total: number): {
  label: 'Low' | 'Medium' | 'High';
  color: string;
} {
  if (total < 50) {
    return { label: 'Low', color: 'text-green-600 bg-green-50' };
  }
  if (total < 150) {
    return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
  }
  return { label: 'High', color: 'text-red-600 bg-red-50' };
}
