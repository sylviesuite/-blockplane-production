/**
 * Material Recommendations Engine
 * 
 * AI-powered algorithm to suggest better material alternatives
 */

import type { Material } from "../client/src/types";

export interface MaterialRecommendation {
  material: Material;
  carbonSavings: number; // kg CO₂e saved vs original
  costDelta: number; // $ difference (negative = cheaper, positive = more expensive)
  risDelta: number; // RIS improvement
  lisDelta: number; // LIS improvement (negative = better)
  score: number; // Overall recommendation score (0-100)
  confidence: number; // Confidence level (0-100)
  reasons: string[]; // Why this is recommended
}

/**
 * Find better alternatives to a given material
 */
export function findAlternatives(
  currentMaterial: Material,
  allMaterials: Material[],
  options: {
    maxResults?: number;
    prioritizeCarbon?: boolean;
    prioritizeCost?: boolean;
    prioritizeRIS?: boolean;
  } = {}
): MaterialRecommendation[] {
  const {
    maxResults = 5,
    prioritizeCarbon = true,
    prioritizeCost = false,
    prioritizeRIS = true,
  } = options;

  // Filter to same category (functional equivalence)
  const sameCategoryMaterials = allMaterials.filter(
    m => m.category === currentMaterial.category && m.id !== currentMaterial.id
  );

  // Calculate recommendations
  const recommendations: MaterialRecommendation[] = sameCategoryMaterials.map(material => {
    const carbonSavings = currentMaterial.total - material.total;
    const costDelta = material.cost - currentMaterial.cost;
    const risDelta = material.ris - currentMaterial.ris;
    const lisDelta = material.lis - currentMaterial.lis; // Negative is better

    // Calculate score (0-100)
    let score = 50; // Base score

    // Carbon improvement (up to +30 points)
    if (carbonSavings > 0) {
      const carbonImprovement = Math.min(carbonSavings / currentMaterial.total, 1);
      score += carbonImprovement * 30 * (prioritizeCarbon ? 1.5 : 1);
    } else {
      score -= 15; // Penalty for worse carbon
    }

    // RIS improvement (up to +25 points)
    if (risDelta > 0) {
      score += (risDelta / 100) * 25 * (prioritizeRIS ? 1.5 : 1);
    } else if (risDelta < 0) {
      score -= 10; // Penalty for worse RIS
    }

    // LIS improvement (up to +20 points, negative LIS delta is good)
    if (lisDelta < 0) {
      score += (Math.abs(lisDelta) / 100) * 20;
    } else if (lisDelta > 0) {
      score -= 10; // Penalty for worse LIS
    }

    // Cost consideration (up to ±15 points)
    if (prioritizeCost) {
      if (costDelta < 0) {
        // Cheaper is good
        score += Math.min(Math.abs(costDelta) / currentMaterial.cost, 0.5) * 15;
      } else {
        // More expensive is bad
        score -= Math.min(costDelta / currentMaterial.cost, 0.5) * 15;
      }
    } else {
      // Even if not prioritizing cost, penalize if >50% more expensive
      if (costDelta > currentMaterial.cost * 0.5) {
        score -= 10;
      }
    }

    // Confidence calculation (based on data quality and improvement magnitude)
    let confidence = 70; // Base confidence
    
    // Higher confidence if multiple metrics improve
    const improvementCount = [
      carbonSavings > 0,
      risDelta > 0,
      lisDelta < 0,
    ].filter(Boolean).length;
    confidence += improvementCount * 10;

    // Lower confidence if cost significantly higher
    if (costDelta > currentMaterial.cost * 0.3) {
      confidence -= 15;
    }

    confidence = Math.max(0, Math.min(100, confidence));

    // Generate reasons
    const reasons: string[] = [];
    
    if (carbonSavings > 0) {
      const percentSavings = ((carbonSavings / currentMaterial.total) * 100).toFixed(0);
      reasons.push(`${percentSavings}% lower embodied carbon (saves ${carbonSavings.toFixed(1)} kg CO₂e)`);
    }
    
    if (risDelta > 0) {
      reasons.push(`${risDelta} points higher Regenerative Impact Score`);
    }
    
    if (lisDelta < 0) {
      reasons.push(`${Math.abs(lisDelta)} points lower Life Impact Score (less environmental damage)`);
    }
    
    if (costDelta < 0) {
      const percentSavings = ((Math.abs(costDelta) / currentMaterial.cost) * 100).toFixed(0);
      reasons.push(`${percentSavings}% cost savings ($${Math.abs(costDelta).toFixed(0)} cheaper per ${material.functionalUnit})`);
    } else if (costDelta > 0) {
      const percentIncrease = ((costDelta / currentMaterial.cost) * 100).toFixed(0);
      reasons.push(`${percentIncrease}% cost premium ($${costDelta.toFixed(0)} more per ${material.functionalUnit})`);
    }

    if (reasons.length === 0) {
      reasons.push("Similar performance profile with different characteristics");
    }

    return {
      material,
      carbonSavings,
      costDelta,
      risDelta,
      lisDelta,
      score: Math.max(0, Math.min(100, score)),
      confidence,
      reasons,
    };
  });

  // Sort by score (highest first) and return top results
  return recommendations
    .filter(r => r.score > 30) // Only show recommendations with decent score
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Get a summary explanation of why an alternative is better
 */
export function getRecommendationSummary(rec: MaterialRecommendation): string {
  const { material, carbonSavings, risDelta, costDelta } = rec;
  
  let summary = `${material.name} is recommended because it `;
  
  const benefits: string[] = [];
  
  if (carbonSavings > 0) {
    benefits.push(`reduces carbon by ${carbonSavings.toFixed(1)} kg CO₂e`);
  }
  
  if (risDelta > 0) {
    benefits.push(`has ${risDelta} points higher regenerative capacity`);
  }
  
  if (costDelta < 0) {
    benefits.push(`costs $${Math.abs(costDelta).toFixed(0)} less`);
  } else if (costDelta > 0 && costDelta < 100) {
    benefits.push(`has only a modest cost premium of $${costDelta.toFixed(0)}`);
  }
  
  if (benefits.length === 0) {
    return `${material.name} offers similar performance with different sustainability characteristics.`;
  }
  
  summary += benefits.join(", ") + ".";
  
  return summary;
}
