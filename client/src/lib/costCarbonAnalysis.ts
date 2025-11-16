/**
 * Cost-Carbon Analysis Utilities
 * 
 * Functions for analyzing trade-offs between material cost and carbon impact,
 * calculating break-even points, and optimizing material selections within budget constraints.
 */

export interface MaterialWithCost {
  id: number;
  name: string;
  category: string;
  totalCarbon: number;
  cost: number;
  functionalUnit: string;
  risScore?: number;
  lisScore?: number;
}

export interface CostCarbonMetrics {
  costPremium: number; // Absolute cost difference
  costPremiumPercent: number; // Percentage cost increase
  carbonSavings: number; // Absolute carbon reduction
  carbonSavingsPercent: number; // Percentage carbon reduction
  costPerKgCO2Saved: number; // Cost premium per kg CO2 saved
  carbonPriceEquivalent: number; // Equivalent carbon price at $50/ton
}

export interface BreakEvenAnalysis {
  paybackYears: number | null; // Years to break even (if applicable)
  carbonPriceBreakEven: number; // Carbon price needed to justify premium
  totalCostAdvantage: number; // Including carbon value at $50/ton
  recommendation: string;
}

export interface BudgetOptimization {
  selectedMaterials: MaterialWithCost[];
  totalCost: number;
  totalCarbon: number;
  carbonSavings: number;
  utilizationPercent: number; // % of budget used
}

/**
 * Calculate cost-carbon metrics comparing two materials
 */
export function calculateCostCarbonMetrics(
  baseline: MaterialWithCost,
  alternative: MaterialWithCost
): CostCarbonMetrics {
  const costPremium = alternative.cost - baseline.cost;
  const costPremiumPercent = (costPremium / baseline.cost) * 100;
  
  const carbonSavings = baseline.totalCarbon - alternative.totalCarbon;
  const carbonSavingsPercent = (carbonSavings / baseline.totalCarbon) * 100;
  
  const costPerKgCO2Saved = carbonSavings !== 0 ? costPremium / carbonSavings : 0;
  
  // Carbon price equivalent at $50/ton = $0.05/kg
  const carbonPriceEquivalent = carbonSavings * 0.05;
  
  return {
    costPremium,
    costPremiumPercent,
    carbonSavings,
    carbonSavingsPercent,
    costPerKgCO2Saved,
    carbonPriceEquivalent,
  };
}

/**
 * Perform break-even analysis for a premium sustainable material
 */
export function calculateBreakEven(
  baseline: MaterialWithCost,
  alternative: MaterialWithCost,
  assumptions: {
    energySavingsPerYear?: number; // Annual energy cost savings
    maintenanceSavingsPerYear?: number; // Annual maintenance savings
    lifespanYears?: number; // Expected lifespan
    carbonPrice?: number; // $/ton CO2
  } = {}
): BreakEvenAnalysis {
  const metrics = calculateCostCarbonMetrics(baseline, alternative);
  
  const {
    energySavingsPerYear = 0,
    maintenanceSavingsPerYear = 0,
    lifespanYears = 30,
    carbonPrice = 50, // $50/ton default
  } = assumptions;
  
  const annualSavings = energySavingsPerYear + maintenanceSavingsPerYear;
  
  // Payback period (if there are operational savings)
  const paybackYears = annualSavings > 0 
    ? metrics.costPremium / annualSavings 
    : null;
  
  // Carbon price needed to justify the premium
  const carbonPriceBreakEven = metrics.carbonSavings > 0
    ? (metrics.costPremium / metrics.carbonSavings) * 1000 // Convert to $/ton
    : Infinity;
  
  // Total cost advantage including carbon value
  const carbonValue = (metrics.carbonSavings / 1000) * carbonPrice;
  const totalCostAdvantage = carbonValue - metrics.costPremium;
  
  // Generate recommendation
  let recommendation = "";
  if (metrics.costPremium <= 0) {
    recommendation = "✅ Lower cost AND lower carbon - clear winner!";
  } else if (totalCostAdvantage > 0) {
    recommendation = `✅ Worth it! Carbon savings worth $${carbonValue.toFixed(2)} at $${carbonPrice}/ton CO₂`;
  } else if (paybackYears && paybackYears < lifespanYears / 2) {
    recommendation = `✅ Pays back in ${paybackYears.toFixed(1)} years through operational savings`;
  } else if (metrics.carbonSavingsPercent > 50) {
    recommendation = `⚠️ ${metrics.carbonSavingsPercent.toFixed(0)}% carbon reduction, but ${metrics.costPremiumPercent.toFixed(0)}% cost premium`;
  } else {
    recommendation = `❌ ${metrics.costPremiumPercent.toFixed(0)}% cost premium for ${metrics.carbonSavingsPercent.toFixed(0)}% carbon reduction`;
  }
  
  return {
    paybackYears,
    carbonPriceBreakEven,
    totalCostAdvantage,
    recommendation,
  };
}

/**
 * Calculate cost-carbon efficiency score (0-100)
 * Higher score = better trade-off between cost and carbon
 */
export function calculateEfficiencyScore(material: MaterialWithCost): number {
  // Normalize cost and carbon to 0-100 scale
  // Lower cost = higher score, lower carbon = higher score
  
  // This is a simplified scoring - in production, you'd normalize against
  // the full dataset's min/max values
  const costScore = Math.max(0, 100 - (material.cost / 10));
  const carbonScore = Math.max(0, 100 - (material.totalCarbon / 5));
  
  // Weight carbon slightly higher (60/40 split)
  return (carbonScore * 0.6) + (costScore * 0.4);
}

/**
 * Optimize material selection within budget constraints
 * Returns materials that maximize carbon reduction while staying under budget
 */
export function optimizeWithinBudget(
  materials: MaterialWithCost[],
  budget: number,
  quantities: { [materialId: number]: number } // Quantity needed for each material type
): BudgetOptimization {
  // Sort materials by carbon efficiency (lowest carbon per dollar)
  const sortedMaterials = [...materials].sort((a, b) => {
    const efficiencyA = a.totalCarbon / a.cost;
    const efficiencyB = b.totalCarbon / b.cost;
    return efficiencyA - efficiencyB; // Lower carbon per dollar = better
  });
  
  const selectedMaterials: MaterialWithCost[] = [];
  let totalCost = 0;
  let totalCarbon = 0;
  
  // Greedy algorithm: select lowest carbon-per-dollar materials first
  for (const material of sortedMaterials) {
    const quantity = quantities[material.id] || 1;
    const materialCost = material.cost * quantity;
    
    if (totalCost + materialCost <= budget) {
      selectedMaterials.push(material);
      totalCost += materialCost;
      totalCarbon += material.totalCarbon * quantity;
    }
  }
  
  // Calculate baseline carbon (if we used highest-carbon materials)
  const baselineCarbon = materials.reduce((sum, m) => {
    const quantity = quantities[m.id] || 1;
    return sum + (m.totalCarbon * quantity);
  }, 0);
  
  const carbonSavings = baselineCarbon - totalCarbon;
  const utilizationPercent = (totalCost / budget) * 100;
  
  return {
    selectedMaterials,
    totalCost,
    totalCarbon,
    carbonSavings,
    utilizationPercent,
  };
}

/**
 * Filter materials by cost-carbon trade-off preference
 * @param materials - List of materials to filter
 * @param preference - 0 = lowest cost, 100 = lowest carbon, 50 = balanced
 */
export function filterByTradeoffPreference(
  materials: MaterialWithCost[],
  preference: number // 0-100
): MaterialWithCost[] {
  return materials
    .map(material => {
      // Calculate weighted score based on preference
      const costScore = 100 - (material.cost / Math.max(...materials.map(m => m.cost)) * 100);
      const carbonScore = 100 - (material.totalCarbon / Math.max(...materials.map(m => m.totalCarbon)) * 100);
      
      const weightedScore = (costScore * (100 - preference) / 100) + (carbonScore * preference / 100);
      
      return { material, score: weightedScore };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.material);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format carbon amount for display
 */
export function formatCarbon(kgCO2: number): string {
  if (kgCO2 >= 1000) {
    return `${(kgCO2 / 1000).toFixed(2)} tons CO₂e`;
  }
  return `${kgCO2.toFixed(2)} kg CO₂e`;
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
