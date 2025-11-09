/**
 * Material Adapter
 * 
 * Converts Supabase database rows to frontend Material type
 * Bridges the gap between database schema and UI components
 */

import type { Material, LifecyclePhases, RISComponents, CostData } from '../types';
import type { MaterialDetail } from '../types/supabase';

/**
 * Convert Supabase MaterialDetail to frontend Material type
 */
export function adaptMaterialFromSupabase(dbMaterial: any): Material {
  const lifecycle = dbMaterial.lifecycle_values?.[0];
  const risScores = dbMaterial.ris_scores?.[0];
  const pricing = dbMaterial.pricing?.[0];
  const epd = dbMaterial.epd_metadata?.[0];

  // Build lifecycle phases
  const phases: LifecyclePhases = {
    pointOfOrigin: lifecycle?.a1_3_kgco2e || 0,
    production: 0, // A1-A3 is combined in our schema
    transport: lifecycle?.a4_kgco2e || 0,
    construction: lifecycle?.a5_kgco2e || 0,
    disposal: (lifecycle?.c1_kgco2e || 0) + 
              (lifecycle?.c2_kgco2e || 0) + 
              (lifecycle?.c3_kgco2e || 0) + 
              (lifecycle?.c4_kgco2e || 0),
  };

  // Build RIS components
  const risComponents: RISComponents = {
    carbonRecovery: risScores?.carbon_recovery || 0,
    durability: risScores?.durability || 0,
    circularity: risScores?.circularity || 0,
    materialHealth: risScores?.material_health || 0,
    biodiversity: risScores?.biodiversity || 0,
  };

  // Build cost data
  const costData: CostData | undefined = pricing ? {
    capex: pricing.price_usd_per_fu || 0,
    maintPerYear: 0, // TODO: Calculate from maintenance data
    energyPerYear: 0, // TODO: Calculate from energy data
    salvageValue: 0, // TODO: Add to schema
    lifespanYears: pricing.service_life_years || 50,
  } : undefined;

  // Build Material object
  const material: Material = {
    id: dbMaterial.id,
    slug: dbMaterial.slug,
    name: dbMaterial.name,
    materialType: dbMaterial.class,
    sourceRegion: dbMaterial.source_region || 'Unknown',
    functionalUnit: dbMaterial.functional_unit,
    unitNotes: dbMaterial.unit_notes,
    
    // Lifecycle data
    phases,
    total: lifecycle?.total_kgco2e || 0,
    
    // Scores
    lis: risScores?.lis_score || 0,
    ris: risScores?.ris_score || 0,
    risTier: mapQuadrantToTier(risScores?.quadrant),
    quadrant: risScores?.quadrant || 'Problematic',
    
    // RIS components
    risComponents,
    
    // Cost data
    costData,
    cpi: pricing?.cpi || (pricing?.price_usd_per_fu && risScores?.ris_score ? 
      pricing.price_usd_per_fu / risScores.ris_score : undefined),
    
    // Metadata
    meta: {
      unit: `kg CO₂e per ${dbMaterial.functional_unit}`,
      epdProgram: epd?.epd_program,
      epdId: epd?.epd_id,
      epdYear: epd?.epd_year,
      standard: epd?.standard,
      biogenicCarbon: epd?.biogenic_carbon_kgco2e_per_fu,
      recycledContent: epd?.recycled_content_frac,
      recyclability: epd?.recyclability_frac,
    },
  };

  return material;
}

/**
 * Map Supabase quadrant to frontend tier
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
 * Convert array of Supabase materials to frontend Material array
 */
export function adaptMaterialsFromSupabase(dbMaterials: any[]): Material[] {
  return dbMaterials.map(adaptMaterialFromSupabase);
}

/**
 * Convert materials_with_scores view to frontend Material type
 */
export function adaptMaterialFromView(viewRow: any): Material {
  const phases: LifecyclePhases = {
    pointOfOrigin: 0, // Not in view
    production: 0,
    transport: 0,
    construction: 0,
    disposal: 0,
  };

  const risComponents: RISComponents = {
    carbonRecovery: viewRow.carbon_recovery || 0,
    durability: viewRow.durability || 0,
    circularity: viewRow.circularity || 0,
    materialHealth: viewRow.material_health || 0,
    biodiversity: viewRow.biodiversity || 0,
  };

  const costData: CostData | undefined = viewRow.price_usd_per_fu ? {
    capex: viewRow.price_usd_per_fu,
    maintPerYear: 0,
    energyPerYear: 0,
    salvageValue: 0,
    lifespanYears: viewRow.service_life_years || 50,
  } : undefined;

  const material: Material = {
    id: viewRow.id,
    slug: viewRow.slug,
    name: viewRow.name,
    materialType: viewRow.class,
    sourceRegion: viewRow.source_region || 'Unknown',
    functionalUnit: viewRow.functional_unit,
    unitNotes: viewRow.unit_notes,
    
    phases,
    total: viewRow.total_kgco2e || 0,
    
    lis: viewRow.lis_score || 0,
    ris: viewRow.ris_score || 0,
    risTier: mapQuadrantToTier(viewRow.quadrant),
    quadrant: viewRow.quadrant || 'Problematic',
    
    risComponents,
    costData,
    cpi: viewRow.cpi,
    
    meta: {
      unit: `kg CO₂e per ${viewRow.functional_unit}`,
    },
  };

  return material;
}

/**
 * Convert array from materials_with_scores view
 */
export function adaptMaterialsFromView(viewRows: any[]): Material[] {
  return viewRows.map(adaptMaterialFromView);
}
