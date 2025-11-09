import { Material } from '../types';

export function exportMaterialsToCSV(materials: Material[], filename: string = 'materials-export.csv') {
  if (materials.length === 0) {
    alert('No materials to export');
    return;
  }

  // CSV headers
  const headers = [
    'Material Name',
    'Type',
    'Point of Origin (kg CO₂e)',
    'Transport (kg CO₂e)',
    'Construction (kg CO₂e)',
    'Production (kg CO₂e)',
    'Disposal (kg CO₂e)',
    'Total Carbon (kg CO₂e)',
    'Functional Unit',
  ];

  // Convert materials to CSV rows
  const rows = materials.map(material => [
    `"${material.name}"`,
    `"${material.materialType}"`,
    material.phases.pointOfOrigin.toFixed(2),
    material.phases.transport.toFixed(2),
    material.phases.construction.toFixed(2),
    material.phases.production.toFixed(2),
    material.phases.disposal.toFixed(2),
    material.total.toFixed(2),
    `"${material.functionalUnit || 'm²'}"`,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
