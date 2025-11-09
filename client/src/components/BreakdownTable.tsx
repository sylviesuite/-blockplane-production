import { useState } from 'react';
import { Material } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface BreakdownTableProps {
  materials: Material[];
}

type SortField = 'name' | 'materialType' | 'total' | 'pointOfOrigin' | 'transport' | 'construction' | 'production' | 'disposal';
type SortDirection = 'asc' | 'desc';

// Calculate intensity rating based on carbon value
function getIntensityRating(value: number): { label: string; color: string } {
  if (value < 50) return { label: 'Low', color: 'text-green-600 bg-green-50' };
  if (value < 150) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
  return { label: 'High', color: 'text-red-600 bg-red-50' };
}

export default function BreakdownTable({ materials }: BreakdownTableProps) {
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
        aValue = 0;
        bValue = 0;
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
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-30" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  if (!materials || materials.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No materials data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th 
              className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Material Name
                <SortIcon field="name" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('materialType')}
            >
              <div className="flex items-center">
                Type
                <SortIcon field="materialType" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('pointOfOrigin')}
            >
              <div className="flex items-center justify-end">
                Point of Origin
                <SortIcon field="pointOfOrigin" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('transport')}
            >
              <div className="flex items-center justify-end">
                Transport
                <SortIcon field="transport" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('construction')}
            >
              <div className="flex items-center justify-end">
                Construction
                <SortIcon field="construction" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('production')}
            >
              <div className="flex items-center justify-end">
                Production
                <SortIcon field="production" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('disposal')}
            >
              <div className="flex items-center justify-end">
                Disposal
                <SortIcon field="disposal" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('total')}
            >
              <div className="flex items-center justify-end">
                Total Carbon
                <SortIcon field="total" />
              </div>
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">
              Intensity
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedMaterials.map((material) => {
            const intensity = getIntensityRating(material.total);
            return (
              <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{material.name}</td>
                <td className="px-4 py-3 text-gray-600">{material.materialType}</td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {material.phases.pointOfOrigin.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {material.phases.transport.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {material.phases.construction.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {material.phases.production.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {material.phases.disposal.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {material.total.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${intensity.color}`}>
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
