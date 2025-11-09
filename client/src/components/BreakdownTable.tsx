import { useState } from 'react';
import { Material } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface BreakdownTableProps {
  materials: Material[];
  selectedMaterials?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

type SortField = 'name' | 'materialType' | 'total' | 'pointOfOrigin' | 'transport' | 'construction' | 'production' | 'disposal';
type SortDirection = 'asc' | 'desc';

// Calculate intensity rating based on carbon value
function getIntensityRating(value: number): { label: string; color: string } {
  if (value < 50) return { label: 'Low', color: 'text-green-600 bg-green-50' };
  if (value < 150) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
  return { label: 'High', color: 'text-red-600 bg-red-50' };
}

export default function BreakdownTable({ materials, selectedMaterials = [], onSelectionChange }: BreakdownTableProps) {
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedMaterials.length === materials.length) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all
      onSelectionChange(materials.map(m => m.id));
    }
  };

  const handleSelectMaterial = (materialId: string) => {
    if (!onSelectionChange) return;
    
    if (selectedMaterials.includes(materialId)) {
      // Deselect
      onSelectionChange(selectedMaterials.filter(id => id !== materialId));
    } else {
      // Select
      onSelectionChange([...selectedMaterials, materialId]);
    }
  };

  const sortedMaterials = [...materials].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'materialType':
        aValue = a.materialType;
        bValue = b.materialType;
        break;
      case 'total':
        aValue = a.total;
        bValue = b.total;
        break;
      case 'pointOfOrigin':
        aValue = a.phases.pointOfOrigin;
        bValue = b.phases.pointOfOrigin;
        break;
      case 'transport':
        aValue = a.phases.transport;
        bValue = b.phases.transport;
        break;
      case 'construction':
        aValue = a.phases.construction;
        bValue = b.phases.construction;
        break;
      case 'production':
        aValue = a.phases.production;
        bValue = b.phases.production;
        break;
      case 'disposal':
        aValue = a.phases.disposal;
        bValue = b.phases.disposal;
        break;
      default:
        aValue = a.total;
        bValue = b.total;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-40" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const allSelected = materials.length > 0 && selectedMaterials.length === materials.length;
  const someSelected = selectedMaterials.length > 0 && selectedMaterials.length < materials.length;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {onSelectionChange && (
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
              </th>
            )}
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Material Name
                <SortIcon field="name" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('materialType')}
            >
              <div className="flex items-center">
                Type
                <SortIcon field="materialType" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('pointOfOrigin')}
            >
              <div className="flex items-center justify-end">
                Point of Origin
                <SortIcon field="pointOfOrigin" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('transport')}
            >
              <div className="flex items-center justify-end">
                Transport
                <SortIcon field="transport" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('construction')}
            >
              <div className="flex items-center justify-end">
                Construction
                <SortIcon field="construction" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('production')}
            >
              <div className="flex items-center justify-end">
                Production
                <SortIcon field="production" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('disposal')}
            >
              <div className="flex items-center justify-end">
                Disposal
                <SortIcon field="disposal" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('total')}
            >
              <div className="flex items-center justify-end">
                Total Carbon
                <SortIcon field="total" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Intensity
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedMaterials.map((material) => {
            const intensity = getIntensityRating(material.total);
            const isSelected = selectedMaterials.includes(material.id);
            
            return (
              <tr 
                key={material.id} 
                className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-emerald-50' : ''}`}
              >
                {onSelectionChange && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectMaterial(material.id)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                  </td>
                )}
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{material.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">{material.materialType}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{material.phases.pointOfOrigin.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{material.phases.transport.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{material.phases.construction.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{material.phases.production.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{material.phases.disposal.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{material.total.toFixed(1)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${intensity.color}`}>
                    {intensity.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
