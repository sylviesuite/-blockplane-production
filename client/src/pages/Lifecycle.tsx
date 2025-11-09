import { useState } from 'react';
import BreakdownTable from '../components/BreakdownTable';
import AIAssistant from '../components/AIAssistant';
import ComparisonChart from '../components/ComparisonChart';
import MaterialTypeFilters, { filterMaterialsByType } from '../components/MaterialTypeFilters';
import { useMaterials } from '../hooks/useMaterials';
import { exportMaterialsToCSV } from '../utils/exportCSV';
import { Download } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Lifecycle() {
  const { materials, loading, error } = useMaterials();
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Filter materials by type
  const filteredMaterials = filterMaterialsByType(materials, activeFilter);
  
  // Get selected materials for AI Assistant
  const selectedMaterials = filteredMaterials.filter(m => selectedMaterialIds.includes(m.id));
  const materialsForAI = selectedMaterials.length > 0 ? selectedMaterials : filteredMaterials;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading materials data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Data</h2>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <h2 className="text-yellow-800 font-semibold mb-2">No Materials Found</h2>
          <p className="text-yellow-600 text-sm">
            No materials are currently in the database. Please add materials to see the breakdown table.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Lifecycle Carbon Breakdown
          </h1>
          <p className="text-slate-600 mt-2">
            Detailed phase-by-phase analysis of embodied carbon across material lifecycles
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Status Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-emerald-800">
            ✅ Connected to Supabase • {materials.length} materials loaded
            {activeFilter !== 'all' && (
              <span className="ml-2">
                • Filtered to {filteredMaterials.length} materials
              </span>
            )}
            {selectedMaterialIds.length > 0 && (
              <span className="ml-2 font-semibold">
                • {selectedMaterialIds.length} selected for AI analysis
              </span>
            )}
          </p>
        </div>

        {/* Material Type Filters */}
        <MaterialTypeFilters 
          materials={materials}
          activeFilter={activeFilter}
          onFilterChange={(filter) => {
            setActiveFilter(filter);
            setSelectedMaterialIds([]); // Clear selection when filter changes
          }}
        />

        {/* AI Assistant */}
        <div className="mb-8">
          <AIAssistant materials={materialsForAI} />
          {selectedMaterialIds.length > 0 && (
            <div className="mt-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
              💡 AI is analyzing only the {selectedMaterialIds.length} selected material{selectedMaterialIds.length > 1 ? 's' : ''}. 
              <button 
                onClick={() => setSelectedMaterialIds([])}
                className="ml-2 underline hover:text-emerald-900"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>

        {/* Comparison Chart */}
        {selectedMaterialIds.length >= 2 && (
          <div className="mb-8">
            <ComparisonChart materials={selectedMaterials} />
          </div>
        )}

        {/* Breakdown Table */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Material Comparison Table
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Select materials to focus AI analysis. Click column headers to sort. Intensity ratings: Low (&lt;50), Medium (50-150), High (&gt;150)
              </p>
            </div>
            <Button
              onClick={() => {
                const materialsToExport = selectedMaterialIds.length > 0 ? selectedMaterials : materials;
                const filename = selectedMaterialIds.length > 0 
                  ? `selected-materials-${new Date().toISOString().split('T')[0]}.csv`
                  : `all-materials-${new Date().toISOString().split('T')[0]}.csv`;
                exportMaterialsToCSV(materialsToExport, filename);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export {selectedMaterialIds.length > 0 ? `Selected (${selectedMaterialIds.length})` : 'All'} to CSV
            </Button>
          </div>
          <BreakdownTable 
            materials={filteredMaterials} 
            selectedMaterials={selectedMaterialIds}
            onSelectionChange={setSelectedMaterialIds}
          />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Point of Origin (A1-A3)</h3>
            <p className="text-sm text-gray-600">
              Raw material extraction, transport to manufacturer, and manufacturing processes
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Transport (A4)</h3>
            <p className="text-sm text-gray-600">
              Transportation from manufacturing facility to construction site
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Construction (A5)</h3>
            <p className="text-sm text-gray-600">
              Installation and construction processes at the building site
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Production (B)</h3>
            <p className="text-sm text-gray-600">
              Maintenance, repair, and replacement over the building's service life
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Disposal (C1-C4)</h3>
            <p className="text-sm text-gray-600">
              Deconstruction, transport to disposal, waste processing, and final disposal
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Total Carbon</h3>
            <p className="text-sm text-gray-600">
              Sum of all lifecycle phases measured in kg CO₂e per functional unit
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
