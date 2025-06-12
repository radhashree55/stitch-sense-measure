
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Measurement, Point, MeasurementType, MEASUREMENT_TYPES } from '../types/measurement';

interface MeasurementCanvasProps {
  imageUrl: string;
  measurements: Measurement[];
  onMeasurementAdd: (measurement: Measurement) => void;
  onMeasurementUpdate: (id: string, updates: Partial<Measurement>) => void;
  onMeasurementDelete: (id: string) => void;
}

const MeasurementCanvas: React.FC<MeasurementCanvasProps> = ({
  imageUrl,
  measurements,
  onMeasurementAdd,
  onMeasurementUpdate,
  onMeasurementDelete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isCreatingMeasurement, setIsCreatingMeasurement] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [selectedMeasurementType, setSelectedMeasurementType] = useState<MeasurementType>('chest');
  const [measurementValue, setMeasurementValue] = useState<string>('');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setImageLoaded(true);
      drawCanvas();
    };
    image.src = imageUrl;
    imageRef.current = image;
  }, [imageUrl]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [measurements, imageLoaded, currentPoints]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    const containerWidth = canvas.parentElement?.clientWidth || 800;
    const aspectRatio = image.height / image.width;
    const canvasWidth = Math.min(containerWidth, image.width);
    const canvasHeight = canvasWidth * aspectRatio;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Calculate scale factors
    const scaleX = canvas.width / image.width;
    const scaleY = canvas.height / image.height;

    // Draw existing measurements
    measurements.forEach((measurement) => {
      const typeConfig = MEASUREMENT_TYPES.find(t => t.value === measurement.type);
      const color = typeConfig?.color || '#6b7280';
      
      drawMeasurementLine(
        ctx,
        { x: measurement.pointA.x * scaleX, y: measurement.pointA.y * scaleY },
        { x: measurement.pointB.x * scaleX, y: measurement.pointB.y * scaleY },
        color,
        measurement.label,
        `${measurement.value} ${measurement.unit}`
      );
    });

    // Draw current measurement being created
    if (currentPoints.length === 1) {
      drawPoint(ctx, { x: currentPoints[0].x * scaleX, y: currentPoints[0].y * scaleY }, '#3b82f6');
    } else if (currentPoints.length === 2) {
      drawMeasurementLine(
        ctx,
        { x: currentPoints[0].x * scaleX, y: currentPoints[0].y * scaleY },
        { x: currentPoints[1].x * scaleX, y: currentPoints[1].y * scaleY },
        '#3b82f6',
        'New Measurement',
        ''
      );
    }
  };

  const drawPoint = (ctx: CanvasRenderingContext2D, point: Point, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawMeasurementLine = (
    ctx: CanvasRenderingContext2D,
    pointA: Point,
    pointB: Point,
    color: string,
    label: string,
    value: string
  ) => {
    // Draw points
    drawPoint(ctx, pointA, color);
    drawPoint(ctx, pointB, color);

    // Draw dotted line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pointA.x, pointA.y);
    ctx.lineTo(pointB.x, pointB.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw label
    const midX = (pointA.x + pointB.x) / 2;
    const midY = (pointA.y + pointB.y) / 2;
    
    ctx.fillStyle = color;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, midX, midY - 10);
    
    if (value) {
      ctx.font = '10px sans-serif';
      ctx.fillText(value, midX, midY + 10);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCreatingMeasurement) return;

    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / canvas.width) * image.width;
    const y = ((e.clientY - rect.top) / canvas.height) * image.height;

    const newPoint: Point = { x, y };

    if (currentPoints.length === 0) {
      setCurrentPoints([newPoint]);
      toast.info('Click on the second point to complete the measurement');
    } else if (currentPoints.length === 1) {
      setCurrentPoints([currentPoints[0], newPoint]);
      toast.success('Measurement line created! Enter the value and save.');
    }
  };

  const handleSaveMeasurement = () => {
    if (currentPoints.length !== 2 || !measurementValue) {
      toast.error('Please complete the measurement and enter a value');
      return;
    }

    const typeConfig = MEASUREMENT_TYPES.find(t => t.value === selectedMeasurementType);
    const label = selectedMeasurementType === 'custom' && customLabel 
      ? customLabel 
      : typeConfig?.label || 'Measurement';

    const newMeasurement: Measurement = {
      id: Date.now().toString(),
      type: selectedMeasurementType,
      pointA: currentPoints[0],
      pointB: currentPoints[1],
      value: parseFloat(measurementValue),
      unit: 'cm',
      label
    };

    onMeasurementAdd(newMeasurement);
    setCurrentPoints([]);
    setMeasurementValue('');
    setCustomLabel('');
    setIsCreatingMeasurement(false);
    toast.success('Measurement saved successfully!');
  };

  const handleCancelMeasurement = () => {
    setCurrentPoints([]);
    setMeasurementValue('');
    setCustomLabel('');
    setIsCreatingMeasurement(false);
  };

  const startNewMeasurement = () => {
    setIsCreatingMeasurement(true);
    setCurrentPoints([]);
    toast.info('Click on the first point to start measuring');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <Button
          onClick={startNewMeasurement}
          disabled={isCreatingMeasurement}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Measurement
        </Button>

        {isCreatingMeasurement && (
          <>
            <Select
              value={selectedMeasurementType}
              onValueChange={(value: MeasurementType) => setSelectedMeasurementType(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEASUREMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedMeasurementType === 'custom' && (
              <Input
                placeholder="Custom label"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="w-32"
              />
            )}

            <Input
              type="number"
              placeholder="Value (cm)"
              value={measurementValue}
              onChange={(e) => setMeasurementValue(e.target.value)}
              className="w-24"
            />

            <Button
              onClick={handleSaveMeasurement}
              disabled={currentPoints.length !== 2 || !measurementValue}
              size="sm"
            >
              Save
            </Button>

            <Button
              onClick={handleCancelMeasurement}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Measurement Canvas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={`border rounded-lg max-w-full ${
                isCreatingMeasurement ? 'cursor-crosshair' : 'cursor-default'
              }`}
            />
            {isCreatingMeasurement && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded text-sm">
                {currentPoints.length === 0 
                  ? 'Click first point' 
                  : currentPoints.length === 1 
                  ? 'Click second point' 
                  : 'Enter value and save'
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {measurements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {measurements.map((measurement) => {
                const typeConfig = MEASUREMENT_TYPES.find(t => t.value === measurement.type);
                return (
                  <div
                    key={measurement.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: typeConfig?.color }}
                      />
                      <span className="font-medium">{measurement.label}</span>
                      <span className="text-muted-foreground">
                        {measurement.value} {measurement.unit}
                      </span>
                    </div>
                    <Button
                      onClick={() => onMeasurementDelete(measurement.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default MeasurementCanvas;
