
import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from './ImageUpload';
import MeasurementCanvas from './MeasurementCanvas';
import MeasurementTable from './MeasurementTable';
import PDFExport from './PDFExport';
import { Measurement } from '../types/measurement';

const MeasurementTool = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [annotatedImageData, setAnnotatedImageData] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setActiveTab('measure');
  };

  const handleMeasurementAdd = (measurement: Measurement) => {
    setMeasurements(prev => [...prev, measurement]);
  };

  const handleMeasurementUpdate = (id: string, updates: Partial<Measurement>) => {
    setMeasurements(prev => 
      prev.map(m => m.id === id ? { ...m, ...updates } : m)
    );
  };

  const handleMeasurementDelete = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  // Update annotated image when measurements change or when switching to export tab
  useEffect(() => {
    if (canvasRef.current && measurements.length > 0) {
      // Small delay to ensure canvas is rendered
      setTimeout(() => {
        if (canvasRef.current) {
          const imageData = canvasRef.current.toDataURL('image/png', 1.0);
          setAnnotatedImageData(imageData);
          console.log('Annotated image data updated:', imageData.length);
        }
      }, 100);
    }
  }, [measurements, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // When switching to export tab, capture the current canvas state
    if (value === 'export' && canvasRef.current && measurements.length > 0) {
      setTimeout(() => {
        if (canvasRef.current) {
          const imageData = canvasRef.current.toDataURL('image/png', 1.0);
          setAnnotatedImageData(imageData);
          console.log('Canvas captured for export:', imageData.length);
        }
      }, 100);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="measure" disabled={!uploadedImage}>Add Measurements</TabsTrigger>
            <TabsTrigger value="table" disabled={measurements.length === 0}>Measurement Table</TabsTrigger>
            <TabsTrigger value="export" disabled={measurements.length === 0}>Export PDF</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <ImageUpload onImageUpload={handleImageUpload} />
          </TabsContent>

          <TabsContent value="measure" className="mt-6">
            {uploadedImage && (
              <MeasurementCanvas
                imageUrl={uploadedImage}
                measurements={measurements}
                onMeasurementAdd={handleMeasurementAdd}
                onMeasurementUpdate={handleMeasurementUpdate}
                onMeasurementDelete={handleMeasurementDelete}
                canvasRef={canvasRef}
              />
            )}
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <MeasurementTable
              measurements={measurements}
              onMeasurementUpdate={handleMeasurementUpdate}
              onMeasurementDelete={handleMeasurementDelete}
            />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <PDFExport
              imageUrl={uploadedImage}
              measurements={measurements}
              canvasRef={canvasRef}
              annotatedImageData={annotatedImageData}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default MeasurementTool;
