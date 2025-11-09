/**
 * Materials Repository
 * 
 * Data access layer for materials from Supabase
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Get all materials with scores from the view
 */
export async function getMaterialsWithScores() {
  const { data, error } = await supabase
    .from('materials_with_scores')
    .select('*');
  
  if (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Get single material with full details
 */
export async function getMaterialDetail(materialId: string) {
  const { data, error } = await supabase
    .from('materials')
    .select(`
      *,
      lifecycle_values (*),
      ris_scores (*),
      pricing (*),
      epd_metadata (*)
    `)
    .eq('id', materialId)
    .single();
  
  if (error) {
    console.error('Error fetching material detail:', error);
    throw error;
  }
  
  return data;
}
