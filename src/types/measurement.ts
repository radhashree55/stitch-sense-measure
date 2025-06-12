
export interface Point {
  x: number;
  y: number;
}

export interface Measurement {
  id: string;
  type: MeasurementType;
  pointA: Point;
  pointB: Point;
  value: number;
  unit: string;
  label: string;
}

export type MeasurementType = 
  | 'chest'
  | 'waist'
  | 'collar'
  | 'shoulder'
  | 'length'
  | 'sleeve'
  | 'tag'
  | 'custom';

export const MEASUREMENT_TYPES: { value: MeasurementType; label: string; color: string }[] = [
  { value: 'chest', label: 'Chest', color: '#ef4444' },
  { value: 'waist', label: 'Waist', color: '#f97316' },
  { value: 'collar', label: 'Collar', color: '#eab308' },
  { value: 'shoulder', label: 'Shoulder', color: '#22c55e' },
  { value: 'length', label: 'Length', color: '#3b82f6' },
  { value: 'sleeve', label: 'Sleeve', color: '#8b5cf6' },
  { value: 'tag', label: 'Tag', color: '#ec4899' },
  { value: 'custom', label: 'Custom', color: '#6b7280' }
];
