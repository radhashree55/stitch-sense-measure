
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Measurement, MEASUREMENT_TYPES } from '../types/measurement';

interface PDFExportProps {
  imageUrl: string | null;
  measurements: Measurement[];
}

const PDFExport: React.FC<PDFExportProps> = ({ imageUrl, measurements }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!previewRef.current || measurements.length === 0) {
      toast.error('No measurements to export');
      return;
    }

    try {
      toast.info('Generating PDF...');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('Apparel Measurement Report', pageWidth / 2, 20, { align: 'center' });
      
      // Add date
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      let yPosition = 45;
      
      // Add image if available
      if (imageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = async () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate image dimensions to fit in PDF
            const maxWidth = pageWidth - 40;
            const maxHeight = 100;
            const aspectRatio = img.height / img.width;
            
            let imgWidth = Math.min(maxWidth, img.width);
            let imgHeight = imgWidth * aspectRatio;
            
            if (imgHeight > maxHeight) {
              imgHeight = maxHeight;
              imgWidth = imgHeight / aspectRatio;
            }
            
            canvas.width = imgWidth;
            canvas.height = imgHeight;
            ctx?.drawImage(img, 0, 0, imgWidth, imgHeight);
            
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            pdf.addImage(imgData, 'JPEG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
            
            yPosition += imgHeight + 15;
            
            // Add measurements table
            addMeasurementsTable(pdf, yPosition);
            
            // Save PDF
            pdf.save(`measurement-report-${Date.now()}.pdf`);
            toast.success('PDF generated successfully!');
          };
          img.src = imageUrl;
        } catch (error) {
          console.error('Error adding image to PDF:', error);
          // Continue without image
          addMeasurementsTable(pdf, yPosition);
          pdf.save(`measurement-report-${Date.now()}.pdf`);
          toast.success('PDF generated successfully!');
        }
      } else {
        addMeasurementsTable(pdf, yPosition);
        pdf.save(`measurement-report-${Date.now()}.pdf`);
        toast.success('PDF generated successfully!');
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const addMeasurementsTable = (pdf: jsPDF, startY: number) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Table header
    pdf.setFontSize(14);
    pdf.text('Measurements Table', 20, startY);
    
    startY += 10;
    
    // Table styling
    pdf.setFontSize(10);
    const rowHeight = 8;
    const colWidths = [40, 60, 30, 20];
    const colStartX = [20, 60, 120, 150];
    
    // Draw table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, startY, pageWidth - 40, rowHeight, 'F');
    
    pdf.setTextColor(0, 0, 0);
    pdf.text('Type', colStartX[0] + 2, startY + 5);
    pdf.text('Label', colStartX[1] + 2, startY + 5);
    pdf.text('Value (cm)', colStartX[2] + 2, startY + 5);
    pdf.text('Unit', colStartX[3] + 2, startY + 5);
    
    startY += rowHeight;
    
    // Draw measurements
    measurements.forEach((measurement, index) => {
      const typeConfig = MEASUREMENT_TYPES.find(t => t.value === measurement.type);
      
      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(20, startY, pageWidth - 40, rowHeight, 'F');
      }
      
      pdf.text(typeConfig?.label || measurement.type, colStartX[0] + 2, startY + 5);
      pdf.text(measurement.label, colStartX[1] + 2, startY + 5);
      pdf.text(measurement.value.toString(), colStartX[2] + 2, startY + 5);
      pdf.text(measurement.unit, colStartX[3] + 2, startY + 5);
      
      startY += rowHeight;
    });
    
    // Add summary
    startY += 10;
    pdf.setFontSize(12);
    pdf.text('Summary:', 20, startY);
    
    startY += 8;
    pdf.setFontSize(10);
    pdf.text(`Total Measurements: ${measurements.length}`, 20, startY);
    
    startY += 5;
    const totalLength = measurements.reduce((sum, m) => sum + m.value, 0);
    pdf.text(`Total Length: ${totalLength.toFixed(1)} cm`, 20, startY);
  };

  const currentDate = new Date().toLocaleDateString();
  const totalMeasurements = measurements.length;
  const totalLength = measurements.reduce((sum, m) => sum + m.value, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export PDF Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                Generate a comprehensive PDF report with your measurements and annotated image.
              </p>
              <div className="mt-2 text-sm text-muted-foreground">
                <span>📊 {totalMeasurements} measurements</span>
                <span className="ml-4">📏 {totalLength.toFixed(1)} cm total</span>
              </div>
            </div>
            <Button 
              onClick={generatePDF}
              disabled={measurements.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={previewRef} className="space-y-6 p-4 bg-white text-black">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold">Apparel Measurement Report</h1>
              <p className="text-sm text-gray-600 mt-2">Generated on: {currentDate}</p>
            </div>

            {/* Image Section */}
            {imageUrl && (
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Measured Apparel
                </h2>
                <div className="border rounded-lg p-4 inline-block">
                  <img
                    src={imageUrl}
                    alt="Measured apparel"
                    className="max-w-md max-h-64 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Measurements Table */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Measurements Table</h2>
              {measurements.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No measurements to display</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Value (cm)</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measurements.map((measurement) => {
                      const typeConfig = MEASUREMENT_TYPES.find(t => t.value === measurement.type);
                      return (
                        <TableRow key={measurement.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: typeConfig?.color }}
                              />
                              {typeConfig?.label || measurement.type}
                            </div>
                          </TableCell>
                          <TableCell>{measurement.label}</TableCell>
                          <TableCell>{measurement.value}</TableCell>
                          <TableCell>{measurement.unit}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Summary */}
            {measurements.length > 0 && (
              <div className="border-t pt-4">
                <h2 className="text-lg font-semibold mb-4">Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Total Measurements</div>
                    <div className="text-xl font-bold">{totalMeasurements}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Total Length</div>
                    <div className="text-xl font-bold">{totalLength.toFixed(1)} cm</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFExport;
