/**
 * Supplier Integration Framework
 * 
 * This module provides a framework for integrating with material supplier APIs
 * to get real-time pricing, availability, and lead times.
 * 
 * In production, this would connect to actual supplier APIs like:
 * - BuildingGreen
 * - Ecobuild
 * - Local distributor APIs
 * - Manufacturer direct APIs
 * 
 * For now, we use mock data to demonstrate the integration pattern.
 */

export interface SupplierQuote {
  supplierId: string;
  supplierName: string;
  materialId: number;
  materialName: string;
  pricePerUnit: number;
  unit: string;
  availability: 'in-stock' | 'backorder' | 'custom-order';
  leadTimeDays: number;
  minimumOrder: number;
  location: string;
  distance: number; // miles from project site
  shippingCost: number;
  totalCost: number;
  certifications: string[];
  contactEmail: string;
  contactPhone: string;
  lastUpdated: Date;
}

export interface SupplierSearchParams {
  materialId: number;
  materialName: string;
  quantity: number;
  projectLocation: string; // zip code or city
  maxDistance?: number; // miles
  preferCertified?: boolean;
}

/**
 * Mock supplier database
 * In production, this would be replaced with actual API calls
 */
const MOCK_SUPPLIERS = [
  {
    id: 'supplier-1',
    name: 'Green Building Supply Co.',
    location: 'Seattle, WA',
    specialties: ['Timber', 'Insulation'],
    certifications: ['FSC', 'LEED'],
  },
  {
    id: 'supplier-2',
    name: 'Sustainable Steel Solutions',
    location: 'Portland, OR',
    specialties: ['Steel', 'Composites'],
    certifications: ['Recycled Content', 'ISO 14001'],
  },
  {
    id: 'supplier-3',
    name: 'EcoConcrete Partners',
    location: 'San Francisco, CA',
    specialties: ['Concrete', 'Masonry'],
    certifications: ['EPD', 'Carbon Neutral'],
  },
  {
    id: 'supplier-4',
    name: 'Natural Insulation Distributors',
    location: 'Denver, CO',
    specialties: ['Insulation', 'Earth'],
    certifications: ['Organic', 'Cradle to Cradle'],
  },
  {
    id: 'supplier-5',
    name: 'Regional Timber Merchants',
    location: 'Boston, MA',
    specialties: ['Timber', 'Composites'],
    certifications: ['FSC', 'Local Sourcing'],
  },
];

/**
 * Search for supplier quotes for a material
 * 
 * In production, this would:
 * 1. Call multiple supplier APIs in parallel
 * 2. Normalize responses to common format
 * 3. Calculate shipping costs based on distance
 * 4. Filter by availability and lead time
 * 5. Sort by total cost or other criteria
 */
export async function searchSupplierQuotes(
  params: SupplierSearchParams
): Promise<SupplierQuote[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock: Generate quotes from relevant suppliers
  const quotes: SupplierQuote[] = MOCK_SUPPLIERS
    .filter(supplier => {
      // Filter by material category (mock logic)
      return true; // In production, check if supplier carries this material
    })
    .map(supplier => {
      // Generate mock quote
      const basePrice = 100 + Math.random() * 400; // $100-500
      const distance = Math.random() * (params.maxDistance || 500);
      const shippingCost = distance * 0.5 * params.quantity; // $0.50 per mile per unit
      const leadTime = supplier.specialties.length > 1 ? 7 : 14; // Days

      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        materialId: params.materialId,
        materialName: params.materialName,
        pricePerUnit: parseFloat(basePrice.toFixed(2)),
        unit: 'm³',
        availability: Math.random() > 0.3 ? 'in-stock' : 'backorder',
        leadTimeDays: leadTime,
        minimumOrder: 10,
        location: supplier.location,
        distance: parseFloat(distance.toFixed(1)),
        shippingCost: parseFloat(shippingCost.toFixed(2)),
        totalCost: parseFloat((basePrice * params.quantity + shippingCost).toFixed(2)),
        certifications: supplier.certifications,
        contactEmail: `sales@${supplier.name.toLowerCase().replace(/\s+/g, '')}.com`,
        contactPhone: `(555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        lastUpdated: new Date(),
      };
    });

  // Sort by total cost
  quotes.sort((a, b) => a.totalCost - b.totalCost);

  return quotes;
}

/**
 * Get supplier details
 */
export async function getSupplierDetails(supplierId: string) {
  const supplier = MOCK_SUPPLIERS.find(s => s.id === supplierId);
  
  if (!supplier) {
    throw new Error('Supplier not found');
  }

  return {
    ...supplier,
    description: `Leading supplier of sustainable building materials in the ${supplier.location} region.`,
    yearsInBusiness: Math.floor(Math.random() * 30 + 5),
    rating: (4 + Math.random()).toFixed(1),
    reviewCount: Math.floor(Math.random() * 500 + 50),
    website: `https://www.${supplier.name.toLowerCase().replace(/\s+/g, '')}.com`,
  };
}

/**
 * Request a formal quote from supplier
 * In production, this would send an email or API request to the supplier
 */
export async function requestFormalQuote(params: {
  supplierId: string;
  materialId: number;
  quantity: number;
  projectName: string;
  contactEmail: string;
  deliveryDate: Date;
}): Promise<{ success: boolean; quoteId: string }> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));

  // In production:
  // 1. Send quote request to supplier API
  // 2. Store request in database
  // 3. Send confirmation email to user
  // 4. Track quote status

  return {
    success: true,
    quoteId: `QUOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  };
}

/**
 * Get local suppliers by region
 */
export async function getLocalSuppliers(location: string, maxDistance: number = 100) {
  // In production, use geocoding to calculate actual distances
  return MOCK_SUPPLIERS.map(supplier => ({
    ...supplier,
    distance: Math.random() * maxDistance,
  })).filter(s => s.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}
