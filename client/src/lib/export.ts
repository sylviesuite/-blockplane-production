import { formatCPI } from '@shared/scoring';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface Material {
  id: number | string;
  name: string;
  category: string;
  totalCarbon?: number;
  functionalUnit?: string;
  risScores?: {
    ris: number;
    lis: number;
  };
  pricing?: {
    costPerUnit: number;
  };
  /** Cost-Performance Index (2 decimals in exports) */
  cpi?: number;
  /** Top-level LIS/RIS when risScores not used */
  lis?: number;
  ris?: number;
  /** Cost per unit when pricing not used */
  cost?: number;
  /** Benchmark reference label */
  benchmarkReference?: string;
  /** Insight summary for PDF (first material with this is used) */
  insightSummary?: string;
  /** Whether insight is static vs dynamic */
  insightStatic?: boolean;
  /** Better alternatives for PDF (first material with this is used) */
  betterAlternatives?: { name: string; reason: string; cpi?: number }[];
}

/**
 * Export chart element to PNG
 */
export async function exportChartToPNG(
  elementId: string,
  filename: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher resolution
  });

  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/** Format number for export: no null, no raw floats. CPI uses formatCPI. */
function fmtNum(value: number | undefined | null, decimals: number): string {
  if (value == null || !Number.isFinite(value)) return '';
  return Number(value).toFixed(decimals);
}

/** CPI column index in CSV row (for tests). */
export const CSV_CPI_COLUMN_INDEX = 7;

/**
 * Build a single CSV row for a material (same logic as export). Used for CPI coherence tests.
 */
export function buildCSVRowForMaterial(m: Material): string[] {
  const lis = m.risScores?.lis ?? m.lis;
  const ris = m.risScores?.ris ?? m.ris;
  const price = m.pricing?.costPerUnit ?? m.cost;
  const carbon = m.totalCarbon ?? (m as any).carbon;
  const cpiVal = m.cpi ?? (m as any).scores?.cpi;
  return [
    m.id ?? '',
    `"${(m.name ?? (m as any).material ?? '').replace(/"/g, '""')}"`,
    `"${(m.category ?? '').replace(/"/g, '""')}"`,
    carbon != null && Number.isFinite(carbon) ? Number(carbon).toFixed(2) : '',
    m.functionalUnit ?? 'm²',
    fmtNum(lis, 1),
    fmtNum(ris, 1),
    formatCPI(cpiVal, { placeholder: '' }),
    price != null && Number.isFinite(price) ? Number(price).toFixed(2) : '',
    (m.benchmarkReference ?? '').replace(/"/g, '""'),
  ];
}

/**
 * CPI string written to the PDF table for a material (for CPI coherence tests).
 */
export function getPDFCpiString(m: Material): string {
  const cpi = m.cpi ?? (m as any).scores?.cpi;
  return formatCPI(cpi, { placeholder: '—' });
}

/**
 * Export materials data to CSV
 */
export function exportMaterialsToCSV(
  materials: Material[],
  filename: string = 'materials'
): void {
  const headers = [
    'ID',
    'Name',
    'Category',
    'Total Carbon (kg CO₂e)',
    'Functional Unit',
    'LIS',
    'RIS',
    'CPI',
    'Price per Unit ($)',
    'Benchmark Reference',
  ];

  const rows = materials.map(m => buildCSVRowForMaterial(m));

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export comparison report to PDF
 */
export async function exportComparisonToPDF(
  materials: Material[],
  chartElementId: string,
  filename: string = 'material-comparison'
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Title
  pdf.setFontSize(20);
  pdf.text('Material Comparison Report', margin, margin);

  // Date
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, margin + 8);

  // Materials summary
  let yPos = margin + 20;
  pdf.setFontSize(14);
  pdf.text('Materials Compared:', margin, yPos);
  
  yPos += 8;
  pdf.setFontSize(10);
  const carbonVal = (m: Material) => m.totalCarbon ?? (m as any).carbon;
  const unit = (m: Material) => m.functionalUnit ?? 'm²';
  materials.forEach((m, idx) => {
    const carbon = carbonVal(m);
    const carbonStr = carbon != null && Number.isFinite(carbon) ? Number(carbon).toFixed(1) : 'N/A';
    pdf.text(
      `${idx + 1}. ${m.name} (${m.category ?? ''}) - ${carbonStr} kg CO₂e per ${unit(m)}`,
      margin + 5,
      yPos
    );
    yPos += 6;
  });

  // Add chart image
  const chartElement = document.getElementById(chartElementId);
  if (chartElement) {
    yPos += 10;
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add new page if needed
    if (yPos + imgHeight > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
    }
    
    pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
    yPos += imgHeight + 10;
  }

  // Detailed comparison table
  if (yPos + 60 > pageHeight - margin) {
    pdf.addPage();
    yPos = margin;
  }

  pdf.setFontSize(14);
  pdf.text('Detailed Comparison:', margin, yPos);
  yPos += 10;

  pdf.setFontSize(9);
  const tableHeaders = ['Material', 'Carbon', 'LIS', 'RIS', 'CPI', 'Price ($)'];
  const colWidth = (pageWidth - 2 * margin) / tableHeaders.length;

  // Table header
  tableHeaders.forEach((header, idx) => {
    pdf.text(header, margin + idx * colWidth, yPos);
  });
  yPos += 6;

  // Table rows
  materials.forEach((m) => {
    const carbon = m.totalCarbon ?? (m as any).carbon;
    const lis = m.risScores?.lis ?? m.lis;
    const ris = m.risScores?.ris ?? m.ris;
    const cpi = m.cpi ?? (m as any).scores?.cpi;
    const price = m.pricing?.costPerUnit ?? m.cost;
    pdf.text((m.name ?? '').substring(0, 18), margin, yPos);
    pdf.text(carbon != null && Number.isFinite(carbon) ? Number(carbon).toFixed(1) : '—', margin + colWidth, yPos);
    pdf.text(lis != null && Number.isFinite(lis) ? Number(lis).toFixed(1) : '—', margin + 2 * colWidth, yPos);
    pdf.text(ris != null && Number.isFinite(ris) ? String(Math.round(Number(ris))) : '—', margin + 3 * colWidth, yPos);
    pdf.text(cpi != null && Number.isFinite(cpi) ? Number(cpi).toFixed(2) : '—', margin + 4 * colWidth, yPos);
    pdf.text(price != null && Number.isFinite(price) ? `$${Number(price).toFixed(2)}` : 'N/A', margin + 5 * colWidth, yPos);
    yPos += 6;
  });

  // Insight summary (first material with insightSummary)
  const withInsight = materials.find(m => m.insightSummary);
  if (withInsight?.insightSummary) {
    if (yPos + 30 > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
    }
    yPos += 8;
    pdf.setFontSize(12);
    pdf.text('Insight Summary', margin, yPos);
    yPos += 6;
    pdf.setFontSize(9);
    const insightLines = pdf.splitTextToSize(withInsight.insightSummary, pageWidth - 2 * margin);
    pdf.text(insightLines, margin, yPos);
    yPos += insightLines.length * 5 + 4;
    pdf.setFontSize(8);
    pdf.text(`Source: ${withInsight.insightStatic === false ? 'dynamic' : 'static'}`, margin, yPos);
    yPos += 8;
  }

  // Better Alternatives (first material with betterAlternatives)
  const withAlts = materials.find(m => m.betterAlternatives?.length);
  if (withAlts?.betterAlternatives?.length) {
    if (yPos + 25 > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
    }
    yPos += 6;
    pdf.setFontSize(12);
    pdf.text('Better Alternatives', margin, yPos);
    yPos += 6;
    pdf.setFontSize(9);
    withAlts.betterAlternatives!.forEach(alt => {
      const cpiStr = alt.cpi != null && Number.isFinite(alt.cpi) ? ` (CPI ${formatCPI(alt.cpi)})` : '';
      pdf.text(`${alt.name}${cpiStr}: ${alt.reason}`, margin + 2, yPos);
      yPos += 5;
    });
    yPos += 4;
  }

  // Footer
  pdf.setFontSize(8);
  pdf.text(
    'Generated by BlockPlane Materials Explorer',
    margin,
    pageHeight - 10
  );

  pdf.save(`${filename}.pdf`);
}

/**
 * Generate shareable URL with query parameters
 */
export function generateShareableURL(params: {
  materials?: number[];
  impactWeight?: number;
  carbonWeight?: number;
  costWeight?: number;
  category?: string;
}): string {
  const baseUrl = window.location.origin;
  const searchParams = new URLSearchParams();

  if (params.materials && params.materials.length > 0) {
    searchParams.set('materials', params.materials.join(','));
  }
  if (params.impactWeight !== undefined) {
    searchParams.set('impactWeight', params.impactWeight.toString());
  }
  if (params.carbonWeight !== undefined) {
    searchParams.set('carbonWeight', params.carbonWeight.toString());
  }
  if (params.costWeight !== undefined) {
    searchParams.set('costWeight', params.costWeight.toString());
  }
  if (params.category) {
    searchParams.set('category', params.category);
  }

  return `${baseUrl}/analysis?${searchParams.toString()}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Failed to copy text:', err);
      throw new Error('Failed to copy to clipboard');
    }
    
    document.body.removeChild(textArea);
  }
}
