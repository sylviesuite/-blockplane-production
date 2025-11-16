/**
 * Green Building Incentives Database
 * 
 * Database of financial incentives, tax credits, and green building programs
 * that can offset the cost premium of sustainable materials.
 */

export interface Incentive {
  id: string;
  name: string;
  type: "tax_credit" | "rebate" | "grant" | "leed_credit" | "certification" | "utility_rebate";
  description: string;
  value: string; // Dollar amount or percentage
  eligibility: string[];
  categories: string[]; // Material categories this applies to
  region: "federal" | "state" | "local" | "utility";
  url?: string;
  expirationDate?: string;
}

/**
 * Comprehensive database of green building incentives
 */
export const INCENTIVES: Incentive[] = [
  // Federal Tax Credits
  {
    id: "ira-179d",
    name: "IRS Section 179D - Energy Efficient Commercial Buildings",
    type: "tax_credit",
    description: "Tax deduction up to $5.00/sq ft for energy-efficient commercial buildings. Covers HVAC, building envelope, and lighting systems.",
    value: "Up to $5.00/sq ft",
    eligibility: ["Commercial buildings", "Government buildings", "Non-profit buildings"],
    categories: ["Insulation", "Timber", "Composites"],
    region: "federal",
    url: "https://www.irs.gov/businesses/energy-efficient-commercial-buildings-deduction"
  },
  {
    id: "ira-45l",
    name: "IRS Section 45L - New Energy Efficient Home Credit",
    type: "tax_credit",
    description: "Tax credit up to $5,000 per dwelling unit for builders of energy-efficient homes meeting ENERGY STAR or Zero Energy Ready Home standards.",
    value: "Up to $5,000 per unit",
    eligibility: ["Residential builders", "Developers"],
    categories: ["Insulation", "Timber", "Composites"],
    region: "federal",
    url: "https://www.irs.gov/businesses/new-energy-efficient-home-credit"
  },
  {
    id: "ira-48c",
    name: "Advanced Manufacturing Production Credit (48C)",
    type: "tax_credit",
    description: "30% investment tax credit for manufacturing facilities producing clean energy components and materials.",
    value: "30% of investment",
    eligibility: ["Manufacturers", "Industrial facilities"],
    categories: ["Steel", "Concrete", "Composites"],
    region: "federal",
    url: "https://www.energy.gov/infrastructure/qualifying-advanced-energy-project-credit-48c-program"
  },

  // LEED Credits
  {
    id: "leed-mr-recycled",
    name: "LEED MR Credit: Building Product Disclosure and Optimization",
    type: "leed_credit",
    description: "Earn LEED points for using materials with recycled content, regional materials, or EPD documentation. Can contribute to higher LEED certification level.",
    value: "Up to 4 LEED points",
    eligibility: ["LEED-registered projects"],
    categories: ["Steel", "Timber", "Concrete", "Masonry", "Composites"],
    region: "federal",
    url: "https://www.usgbc.org/credits/new-construction-core-and-shell-schools-new-construction-retail-new-construction-data-55"
  },
  {
    id: "leed-mr-regional",
    name: "LEED MR Credit: Regional Materials",
    type: "leed_credit",
    description: "Earn points for using materials extracted, harvested, or manufactured within 100 miles of project site.",
    value: "1-2 LEED points",
    eligibility: ["LEED-registered projects"],
    categories: ["Timber", "Earth", "Masonry", "Concrete"],
    region: "federal",
    url: "https://www.usgbc.org/credits/regional-materials"
  },
  {
    id: "leed-mr-biobased",
    name: "LEED MR Credit: Bio-based Materials",
    type: "leed_credit",
    description: "Earn points for using rapidly renewable or bio-based materials (bamboo, cork, hemp, mycelium, etc.).",
    value: "1-2 LEED points",
    eligibility: ["LEED-registered projects"],
    categories: ["Timber", "Insulation", "Composites", "Earth"],
    region: "federal",
    url: "https://www.usgbc.org/credits/bio-based-materials"
  },

  // State Programs
  {
    id: "ca-sgip",
    name: "California Self-Generation Incentive Program (SGIP)",
    type: "rebate",
    description: "Rebates for energy storage and renewable energy systems. Sustainable building materials can qualify as part of integrated energy efficiency projects.",
    value: "$200-$1,000 per kWh",
    eligibility: ["California projects", "Energy storage systems"],
    categories: ["Insulation", "Timber"],
    region: "state",
    url: "https://www.cpuc.ca.gov/sgip/"
  },
  {
    id: "ny-green-jobs",
    name: "NY Green Jobs - Green Prove-It Program",
    type: "grant",
    description: "Grants up to $1M for projects demonstrating innovative green building technologies and materials.",
    value: "Up to $1,000,000",
    eligibility: ["New York projects", "Innovative green technologies"],
    categories: ["Timber", "Steel", "Concrete", "Insulation", "Composites"],
    region: "state",
    url: "https://www.nyserda.ny.gov/green-jobs"
  },
  {
    id: "ma-mass-save",
    name: "Mass Save - Commercial & Industrial Programs",
    type: "rebate",
    description: "Rebates for energy-efficient building envelope improvements including insulation and air sealing.",
    value: "Up to $0.50/sq ft",
    eligibility: ["Massachusetts projects", "Commercial/industrial buildings"],
    categories: ["Insulation", "Timber"],
    region: "state",
    url: "https://www.masssave.com/business"
  },

  // Utility Rebates
  {
    id: "utility-insulation",
    name: "Utility Company Insulation Rebates",
    type: "utility_rebate",
    description: "Many utility companies offer rebates for upgrading insulation. Check with local utility provider for specific programs.",
    value: "$0.10-$1.00 per sq ft",
    eligibility: ["Varies by utility", "Residential and commercial"],
    categories: ["Insulation"],
    region: "utility",
    url: "https://www.dsireusa.org/"
  },
  {
    id: "utility-cool-roof",
    name: "Cool Roof Rebate Programs",
    type: "utility_rebate",
    description: "Rebates for reflective roofing materials that reduce cooling loads. Common in hot climates.",
    value: "$0.15-$0.75 per sq ft",
    eligibility: ["Varies by utility", "Commercial buildings"],
    categories: ["Composites", "Steel"],
    region: "utility",
    url: "https://www.dsireusa.org/"
  },

  // Certifications with Financial Value
  {
    id: "living-building",
    name: "Living Building Challenge Certification",
    type: "certification",
    description: "Most rigorous green building standard. Projects often qualify for expedited permitting, density bonuses, and marketing premiums.",
    value: "Varies - expedited permits, density bonuses",
    eligibility: ["Any project type", "Must meet LBC imperatives"],
    categories: ["Timber", "Earth", "Insulation", "Composites"],
    region: "federal",
    url: "https://living-future.org/lbc/"
  },
  {
    id: "passive-house",
    name: "Passive House Certification",
    type: "certification",
    description: "Ultra-low energy building standard. Projects often qualify for utility rebates and green financing.",
    value: "Varies - utility rebates, green financing",
    eligibility: ["Any project type", "Must meet Passive House standards"],
    categories: ["Insulation", "Timber", "Composites"],
    region: "federal",
    url: "https://www.phius.org/"
  },

  // Green Financing
  {
    id: "pace-financing",
    name: "PACE Financing (Property Assessed Clean Energy)",
    type: "grant",
    description: "Low-interest financing for energy efficiency and renewable energy improvements, repaid through property taxes.",
    value: "100% project financing",
    eligibility: ["Commercial and residential", "Varies by state"],
    categories: ["Insulation", "Timber", "Steel", "Concrete"],
    region: "state",
    url: "https://www.energy.gov/eere/slsc/property-assessed-clean-energy-programs"
  }
];

/**
 * Find incentives applicable to a material category
 */
export function getIncentivesByCategory(category: string): Incentive[] {
  return INCENTIVES.filter(incentive => 
    incentive.categories.includes(category)
  );
}

/**
 * Find incentives by type
 */
export function getIncentivesByType(type: Incentive["type"]): Incentive[] {
  return INCENTIVES.filter(incentive => incentive.type === type);
}

/**
 * Find incentives by region
 */
export function getIncentivesByRegion(region: Incentive["region"]): Incentive[] {
  return INCENTIVES.filter(incentive => incentive.region === region);
}

/**
 * Calculate potential incentive value for a material
 * Returns estimated dollar value based on typical project size
 */
export function estimateIncentiveValue(
  category: string,
  projectArea: number = 1000 // Default 1000 sq ft
): {
  incentives: Incentive[];
  estimatedValue: string;
  leedPoints: number;
} {
  const applicableIncentives = getIncentivesByCategory(category);
  const leedPoints = applicableIncentives
    .filter(i => i.type === "leed_credit")
    .reduce((sum, i) => {
      const match = i.value.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

  // Rough estimation logic
  let estimatedMin = 0;
  let estimatedMax = 0;

  applicableIncentives.forEach(incentive => {
    if (incentive.value.includes("sq ft")) {
      const match = incentive.value.match(/\$?([\d.]+)/);
      if (match) {
        const perSqFt = parseFloat(match[1]);
        estimatedMin += perSqFt * projectArea * 0.5; // Conservative estimate
        estimatedMax += perSqFt * projectArea;
      }
    }
  });

  const estimatedValue = estimatedMin > 0 
    ? `$${estimatedMin.toFixed(0)} - $${estimatedMax.toFixed(0)}`
    : "Varies by project";

  return {
    incentives: applicableIncentives,
    estimatedValue,
    leedPoints
  };
}

/**
 * Get incentive type badge color
 */
export function getIncentiveTypeBadge(type: Incentive["type"]): {
  label: string;
  color: string;
} {
  const badges = {
    tax_credit: { label: "Tax Credit", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    rebate: { label: "Rebate", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
    grant: { label: "Grant", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
    leed_credit: { label: "LEED Credit", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
    certification: { label: "Certification", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
    utility_rebate: { label: "Utility Rebate", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300" }
  };
  return badges[type];
}
