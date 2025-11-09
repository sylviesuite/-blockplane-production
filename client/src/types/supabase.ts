/**
 * Supabase Database Types
 * 
 * Types matching the BlockPlane Supabase schema
 */

export type MaterialClass = 
  | 'structure'
  | 'enclosure'
  | 'insulation'
  | 'siding'
  | 'roofing'
  | 'finish'
  | 'binder'
  | 'fenestration'
  | 'fastener'
  | 'misc';

export type FunctionalUnit = 'm2' | 'm3' | 'each' | 'kg' | 'lm';

export type TransportMode = 'truck' | 'rail' | 'ship';

export type Quadrant = 'Regenerative' | 'Transitional' | 'Costly' | 'Problematic';

export interface MaterialRow {
  id: string;
  slug: string;
  name: string;
  class: MaterialClass;
  functional_unit: FunctionalUnit;
  unit_notes?: string | null;
  density_kg_m3?: number | null;
  mass_per_fu_kg?: number | null;
  source_region?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LifecycleValuesRow {
  id: number;
  material_id: string;
  a1_3_kgco2e?: number;
  a4_distance_km?: number;
  a4_mode?: TransportMode;
  a4_factor_kgco2e_per_tkm?: number | null;
  a4_kgco2e?: number;
  a5_construction_kwh_m2?: number | null;
  a5_kgco2e?: number;
  b_maint_interval_years?: number | null;
  b_maint_kgco2e_per_cycle?: number;
  c1_kgco2e?: number;
  c2_kgco2e?: number;
  c3_kgco2e?: number;
  c4_kgco2e?: number;
  d_credit_kgco2e?: number;
  ee_a1_3_mj?: number | null;
  ee_a4_mj?: number | null;
  ee_a5_mj?: number | null;
  ee_b_mj?: number | null;
  total_kgco2e?: number;
}

export interface RISScoresRow {
  id: number;
  material_id: string;
  carbon_recovery?: number;
  durability?: number;
  circularity?: number;
  material_health?: number;
  biodiversity?: number;
  ris_score?: number;
  lis_score?: number;
  quadrant?: Quadrant;
}

// View type that joins materials + lifecycle_values + ris_scores
export interface MaterialWithScoresRow {
  id: string;
  slug: string;
  name: string;
  material_type: MaterialClass;
  functional_unit: FunctionalUnit;
  source_region?: string | null;
  
  // Lifecycle phases (mapped from lifecycle_values)
  point_of_origin?: number;  // a1_3_kgco2e
  transport?: number;         // a4_kgco2e
  construction?: number;      // a5_kgco2e
  production?: number;        // b_maint_kgco2e_per_cycle
  disposal?: number;          // c1 + c2 + c3 + c4
  total?: number;             // total_kgco2e
  
  // Scores
  ris_score?: number;
  lis_score?: number;
  quadrant?: Quadrant;
  
  // Unit
  unit?: FunctionalUnit;
}

export interface Database {
  public: {
    Tables: {
      materials: {
        Row: MaterialRow;
        Insert: Omit<MaterialRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MaterialRow, 'id' | 'created_at' | 'updated_at'>>;
      };
      lifecycle_values: {
        Row: LifecycleValuesRow;
        Insert: Omit<LifecycleValuesRow, 'id' | 'total_kgco2e'>;
        Update: Partial<Omit<LifecycleValuesRow, 'id' | 'total_kgco2e'>>;
      };
      ris_scores: {
        Row: RISScoresRow;
        Insert: Omit<RISScoresRow, 'id'>;
        Update: Partial<Omit<RISScoresRow, 'id'>>;
      };
    };
    Views: {
      materials_with_scores: {
        Row: MaterialWithScoresRow;
      };
    };
  };
}
