import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Image, Share2, FileSpreadsheet } from 'lucide-react';
import { exportChartToPNG, exportMaterialsToCSV, exportComparisonToPDF, generateShareableURL, copyToClipboard } from '@/lib/export';
import { toast } from 'sonner';

interface ExportMenuProps {
  materials: any[];
  chartElementId?: string;
  filename?: string;
  shareParams?: {
    materials?: number[];
    impactWeight?: number;
    carbonWeight?: number;
    costWeight?: number;
    category?: string;
  };
}

export function ExportMenu({ materials, chartElementId, filename = 'export', shareParams }: ExportMenuProps) {
  const handleExportPNG = async () => {
    if (!chartElementId) {
      toast.error('Chart export not available');
      return;
    }
    
    try {
      await exportChartToPNG(chartElementId, filename);
      toast.success('Chart exported as PNG!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export chart');
    }
  };

  const handleExportCSV = () => {
    try {
      exportMaterialsToCSV(materials, filename);
      toast.success('Data exported as CSV!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    if (!chartElementId) {
      toast.error('PDF export not available');
      return;
    }
    
    try {
      await exportComparisonToPDF(materials, chartElementId, filename);
      toast.success('Report exported as PDF!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleShare = async () => {
    if (!shareParams) {
      toast.error('Sharing not available for this view');
      return;
    }
    
    try {
      const url = generateShareableURL(shareParams);
      await copyToClipboard(url);
      toast.success('Shareable link copied to clipboard!');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {chartElementId && (
          <>
            <DropdownMenuItem onClick={handleExportPNG} className="gap-2">
              <Image className="h-4 w-4" />
              Export Chart as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF} className="gap-2">
              <FileText className="h-4 w-4" />
              Export Report as PDF
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem onClick={handleExportCSV} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export Data as CSV
        </DropdownMenuItem>
        
        {shareParams && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              Copy Shareable Link
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
