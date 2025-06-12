
import React, { useState } from 'react';
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

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default MeasurementTool;
