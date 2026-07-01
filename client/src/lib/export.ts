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

// ── Client Report PDF ─────────────────────────────────────────────────────────

export interface ClientReportMaterial {
  id: string;
  name: string;
  category: string;
  // BlockPlane catalog data
  totalCarbon: number | null;
  functionalUnit: string | null;
  lisScore: number | null;
  risScore: number | null;
  confidenceLevel: string | null;
  source: string | null;
  // EC3 live verification — in memory only at report time, never persisted
  ec3Checked: boolean;
  ec3MatchFound: boolean;
  ec3LowestGwp: number | null;
  ec3Unit: string | null;
  ec3EpdName: string | null;
  ec3Manufacturer: string | null;
  ec3VerificationStatus: string | null;
  ec3CheckedAt: string | null;
}

export interface ClientReportData {
  title: string;
  clientName: string | null;
  notes: string | null;
  generatedAt: string;
  materials: ClientReportMaterial[];
}

export async function generateClientReportPDF(
  report: ClientReportData,
  filename: string = 'client-report'
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  const generatedDate = new Date(report.generatedAt).toLocaleString();

  // ── Cover page ─────────────────────────────────────────────────────────────
  pdf.setFontSize(11);
  pdf.setTextColor(100);
  pdf.text('BLOCKPLANE', margin, margin);

  pdf.setFontSize(9);
  pdf.text('CLIENT REPORT', margin, margin + 6);

  pdf.setDrawColor(200);
  pdf.line(margin, margin + 10, pageWidth - margin, margin + 10);

  pdf.setFontSize(18);
  pdf.setTextColor(0);
  const titleLines = pdf.splitTextToSize(report.title, contentWidth);
  pdf.text(titleLines, margin, margin + 22);
  let yPos = margin + 22 + titleLines.length * 8;

  if (report.clientName) {
    pdf.setFontSize(11);
    pdf.setTextColor(60);
    pdf.text(`Client: ${report.clientName}`, margin, yPos + 4);
    yPos += 10;
  }

  pdf.setFontSize(9);
  pdf.setTextColor(100);
  pdf.text(`Generated: ${generatedDate}`, margin, yPos + 4);
  yPos += 10;

  if (report.notes) {
    pdf.setFontSize(10);
    pdf.setTextColor(40);
    const noteLines = pdf.splitTextToSize(report.notes, contentWidth);
    pdf.text(noteLines, margin, yPos + 6);
    yPos += noteLines.length * 5 + 10;
  }

  yPos += 6;
  pdf.setDrawColor(220);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  pdf.setFontSize(8);
  pdf.setTextColor(120);
  const coverAttrib = pdf.splitTextToSize(
    'EC3 data in this report was retrieved live from Building Transparency at the time of generation and is not stored by BlockPlane. All EC3 results are attributed to the EC3 platform (buildingtransparency.org).',
    contentWidth
  );
  pdf.text(coverAttrib, margin, yPos);

  // ── Materials pages ────────────────────────────────────────────────────────
  pdf.addPage();
  yPos = margin;

  for (const mat of report.materials) {
    // Estimate height needed for this material block (~95mm) and add page if needed
    if (yPos + 95 > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
    }

    // Material header
    pdf.setFontSize(13);
    pdf.setTextColor(0);
    const headerText = `${mat.name}  —  ${mat.category}`;
    const headerLines = pdf.splitTextToSize(headerText, contentWidth);
    pdf.text(headerLines, margin, yPos);
    yPos += headerLines.length * 6 + 2;

    pdf.setDrawColor(180);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;

    // BlockPlane section
    pdf.setFontSize(8);
    pdf.setTextColor(80);
    pdf.text('BLOCKPLANE CATALOG DATA', margin, yPos);
    yPos += 5;

    pdf.setFontSize(9);
    pdf.setTextColor(30);
    const carbonStr =
      mat.totalCarbon != null && Number.isFinite(mat.totalCarbon)
        ? `${Number(mat.totalCarbon).toFixed(2)} kg CO₂e per ${mat.functionalUnit ?? 'unit'}`
        : 'Not available';
    pdf.text(`Carbon (A1–A3): ${carbonStr}`, margin + 2, yPos);
    yPos += 5;

    const lisStr = mat.lisScore != null ? Number(mat.lisScore).toFixed(1) : '—';
    pdf.text(`Life Impact Score (LIS): ${lisStr}`, margin + 2, yPos);
    yPos += 5;

    const risStr = mat.risScore != null ? Number(mat.risScore).toFixed(1) : '—';
    pdf.text(`Regenerative Impact Score (RIS): ${risStr}`, margin + 2, yPos);
    yPos += 5;

    pdf.text(`Data Confidence: ${mat.confidenceLevel ?? '—'}`, margin + 2, yPos);
    yPos += 5;

    if (mat.source) {
      const srcLines = pdf.splitTextToSize(`Source: ${mat.source}`, contentWidth - 4);
      pdf.text(srcLines, margin + 2, yPos);
      yPos += srcLines.length * 5;
    }

    yPos += 5;

    // EC3 section
    pdf.setFontSize(8);
    pdf.setTextColor(80);
    pdf.text('EC3 LIVE VERIFICATION — DATA VIA BUILDING TRANSPARENCY', margin, yPos);
    yPos += 5;

    pdf.setFontSize(9);
    pdf.setTextColor(30);

    if (!mat.ec3Checked) {
      pdf.setTextColor(140);
      pdf.text('EC3 verification unavailable at time of generation.', margin + 2, yPos);
      yPos += 5;
    } else if (!mat.ec3MatchFound) {
      pdf.setTextColor(140);
      pdf.text('No matching EPD found in EC3 database at time of generation.', margin + 2, yPos);
      yPos += 5;
    } else {
      pdf.setTextColor(30);
      const gwpStr =
        mat.ec3LowestGwp != null
          ? `${Number(mat.ec3LowestGwp).toFixed(3)} kg CO₂e per ${mat.ec3Unit ?? 'unit'}`
          : '—';
      pdf.text(`Best Available GWP: ${gwpStr}`, margin + 2, yPos);
      yPos += 5;

      if (mat.ec3EpdName) {
        const epdLines = pdf.splitTextToSize(`EPD: ${mat.ec3EpdName}`, contentWidth - 4);
        pdf.text(epdLines, margin + 2, yPos);
        yPos += epdLines.length * 5;
      }
      if (mat.ec3Manufacturer) {
        pdf.text(`Manufacturer: ${mat.ec3Manufacturer}`, margin + 2, yPos);
        yPos += 5;
      }
      if (mat.ec3VerificationStatus) {
        pdf.text(`Third-Party Verification: ${mat.ec3VerificationStatus}`, margin + 2, yPos);
        yPos += 5;
      }
    }

    if (mat.ec3CheckedAt) {
      pdf.setFontSize(8);
      pdf.setTextColor(130);
      pdf.text(`Verified at: ${new Date(mat.ec3CheckedAt).toLocaleString()}`, margin + 2, yPos);
      yPos += 4;
    }

    yPos += 8;
  }

  // ── Attribution page ───────────────────────────────────────────────────────
  if (yPos + 40 > pageHeight - margin) {
    pdf.addPage();
    yPos = margin;
  }

  yPos += 4;
  pdf.setDrawColor(200);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  pdf.setFontSize(9);
  pdf.setTextColor(80);
  pdf.text('Data Sources & Attribution', margin, yPos);
  yPos += 6;

  pdf.setFontSize(8);
  pdf.setTextColor(110);
  const attribText = pdf.splitTextToSize(
    'BlockPlane catalog data (carbon, LIS/RIS scores, confidence levels) is sourced from BlockPlane\'s materials database. ' +
    'EC3 verification data is retrieved live from the EC3 platform (buildingtransparency.org) operated by Building Transparency at the time of report generation. ' +
    'EC3-derived values are not stored by BlockPlane and reflect EPD availability at the moment this report was generated. ' +
    'Results may differ if the report is regenerated at a later date as the EC3 database is updated.',
    contentWidth
  );
  pdf.text(attribText, margin, yPos);

  // Footer on each page
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(150);
    pdf.text('Generated by BlockPlane', margin, pageHeight - 10);
    pdf.text(
      `EC3 data via Building Transparency  |  Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

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
