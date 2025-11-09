import { useState } from 'react';
import BreakdownTable from '../components/BreakdownTable';
import { Material } from '../types';

// Mock data for testing
const MOCK_MATERIALS: Material[] = [
  {
    id: '1',
    name: 'Cross-Laminated Timber (CLT)',
    materialType: 'Wood',
    sourceRegion: 'Pacific Northwest',
    phases: {
      pointOfOrigin: 145.2,
      production: 0,
      transport: 12.8,
      construction: 8.5,
      disposal: 3.2,
    },
    total: 169.7,
    meta: { unit: 'kg CO₂e per m³' },
  },
  {
    id: '2',
    name: 'Rammed Earth',
    materialType: 'Earth',
    sourceRegion: 'Local',
    phases: {
      pointOfOrigin: 25.4,
      production: 0,
      transport: 5.2,
      construction: 15.8,
      disposal: 1.1,
    },
    total: 47.5,
    meta: { unit: 'kg CO₂e per m³' },
  },
  {
    id: '3',
    name: 'Recycled Steel',
    materialType: 'Metal',
    sourceRegion: 'Regional',
    phases: {
      pointOfOrigin: 450.0,
      production: 0,
      transport: 35.0,
      construction: 12.0,
      disposal: 8.5,
    },
    total: 505.5,
    meta: { unit: 'kg CO₂e per tonne' },
  },
];

export default function Lifecycle() {
  const [materials] = useState<Material[]>(MOCK_MATERIALS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Lifecycle Breakdown
          </h1>
          <p className="text-lg text-slate-600">
            Detailed phase-by-phase carbon analysis with sortable columns and intensity ratings
          </p>
        </div>

        {/* Breakdown Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Material Comparison Table
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Click column headers to sort. Intensity ratings: Low (&lt;50), Medium (50-150), High (&gt;150)
          </p>
          <BreakdownTable materials={materials} />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Point of Origin
            </h3>
            <p className="text-sm text-gray-600">
              Emissions from raw material extraction and initial processing
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Transport
            </h3>
            <p className="text-sm text-gray-600">
              Carbon footprint from moving materials to construction site
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Construction
            </h3>
            <p className="text-sm text-gray-600">
              Emissions during installation and assembly on-site
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
