import { Material } from '../types';

interface MaterialTypeFiltersProps {
  materials: Material[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FILTER_CATEGORIES = [
  { id: 'all', label: 'All Materials', icon: '🏗️' },
  { id: 'timber', label: 'Timber', icon: '🌲', keywords: ['timber', 'wood', 'clt', 'cross-laminated'] },
  { id: 'steel', label: 'Steel', icon: '⚙️', keywords: ['steel', 'metal', 'iron'] },
  { id: 'concrete', label: 'Concrete', icon: '🧱', keywords: ['concrete', 'cement'] },
  { id: 'earth', label: 'Earth', icon: '🌍', keywords: ['earth', 'rammed', 'adobe', 'hempcrete'] },
];

export default function MaterialTypeFilters({ materials, activeFilter, onFilterChange }: MaterialTypeFiltersProps) {
  // Count materials in each category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return materials.length;
    
    const category = FILTER_CATEGORIES.find(c => c.id === categoryId);
    if (!category || !category.keywords) return 0;
    
    return materials.filter(material => {
      const materialName = material.name.toLowerCase();
      const materialType = material.materialType.toLowerCase();
      return category.keywords.some(keyword => 
        materialName.includes(keyword) || materialType.includes(keyword)
      );
    }).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-700">Quick Filter:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTER_CATEGORIES.map((category) => {
          const count = getCategoryCount(category.id);
          const isActive = activeFilter === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onFilterChange(category.id)}
              disabled={count === 0 && category.id !== 'all'}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
                ${isActive 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
                }
                ${count === 0 && category.id !== 'all' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="font-medium">{category.label}</span>
              <span className={`
                text-xs px-2 py-0.5 rounded-full
                ${isActive ? 'bg-emerald-700' : 'bg-gray-200 text-gray-600'}
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
      {activeFilter !== 'all' && (
        <div className="mt-3 text-sm text-gray-600">
          Showing {getCategoryCount(activeFilter)} {FILTER_CATEGORIES.find(c => c.id === activeFilter)?.label} materials
        </div>
      )}
    </div>
  );
}

export function filterMaterialsByType(materials: Material[], filterType: string): Material[] {
  if (filterType === 'all') return materials;
  
  const category = FILTER_CATEGORIES.find(c => c.id === filterType);
  if (!category || !category.keywords) return materials;
  
  return materials.filter(material => {
    const materialName = material.name.toLowerCase();
    const materialType = material.materialType.toLowerCase();
    return category.keywords.some(keyword => 
      materialName.includes(keyword) || materialType.includes(keyword)
    );
  });
}
