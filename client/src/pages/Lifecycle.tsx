import BreakdownTable from '../components/BreakdownTable';
import { useMaterials } from '../hooks/useMaterials';

export default function Lifecycle() {
  const { materials, loading, error } = useMaterials();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
          <p className="text-slate-600">Loading materials from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Data</h2>
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
          <p className="text-slate-600 text-sm">
            Please check your Supabase connection and try again.
          </p>
        </div>
      </div>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-yellow-900 mb-2">No Materials Found</h2>
            <p className="text-yellow-700 text-sm">
              Your database doesn't have any materials yet. Add some materials to see them here.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-sm text-emerald-600 mt-2">
            ✅ Connected to Supabase • {materials.length} materials loaded
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
              Emissions from raw material extraction and initial processing (A1-A3)
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Transport
            </h3>
            <p className="text-sm text-gray-600">
              Carbon footprint from moving materials to construction site (A4)
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Construction
            </h3>
            <p className="text-sm text-gray-600">
              Emissions during installation and assembly on-site (A5)
            </p>
          </div>
        </div>

        {/* Data Source Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Data sourced from Supabase • Real-time updates • {materials.length} materials in database
          </p>
        </div>
      </div>
    </div>
  );
}
