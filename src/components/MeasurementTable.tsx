
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, FileText } from 'lucide-react';
import { Measurement, MEASUREMENT_TYPES } from '../types/measurement';

interface MeasurementTableProps {
  measurements: Measurement[];
  onMeasurementUpdate: (id: string, updates: Partial<Measurement>) => void;
  onMeasurementDelete: (id: string) => void;
}

const MeasurementTable: React.FC<MeasurementTableProps> = ({
  measurements,
  onMeasurementUpdate,
  onMeasurementDelete
}) => {
  const handleValueChange = (id: string, newValue: string) => {
    const numericValue = parseFloat(newValue);
    if (!isNaN(numericValue)) {
      onMeasurementUpdate(id, { value: numericValue });
    }
  };

  const totalMeasurements = measurements.length;
  const measurementsByType = measurements.reduce((acc, measurement) => {
    acc[measurement.type] = (acc[measurement.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{totalMeasurements}</div>
            <div className="text-sm text-muted-foreground">Total Measurements</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {Object.keys(measurementsByType).length}
            </div>
            <div className="text-sm text-muted-foreground">Measurement Types</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {measurements.reduce((sum, m) => sum + m.value, 0).toFixed(1)} cm
            </div>
            <div className="text-sm text-muted-foreground">Total Length</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Measurement Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {measurements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No measurements added yet. Go to the "Add Measurements" tab to start.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Value (cm)</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Actions</TableHead>
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
                      <TableCell>
                        <Input
                          value={measurement.label}
                          onChange={(e) => onMeasurementUpdate(measurement.id, { label: e.target.value })}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={measurement.value}
                          onChange={(e) => handleValueChange(measurement.id, e.target.value)}
                          className="w-20"
                          step="0.1"
                        />
                      </TableCell>
                      <TableCell>{measurement.unit}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => onMeasurementDelete(measurement.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {measurements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MEASUREMENT_TYPES.map((type) => {
                const count = measurementsByType[type.value] || 0;
                const total = measurements
                  .filter(m => m.type === type.value)
                  .reduce((sum, m) => sum + m.value, 0);
                
                return (
                  <div key={type.value} className="text-center p-3 border rounded-lg">
                    <div
                      className="w-4 h-4 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: type.color }}
                    />
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {count} measurements
                    </div>
                    {total > 0 && (
                      <div className="text-sm font-medium">
                        {total.toFixed(1)} cm
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeasurementTable;
