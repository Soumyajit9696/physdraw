export type Tool = 'select' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'latex' | 'wire' | 'resistor' | 'capacitor' | 'inductor' | 'battery' | 'diode' | 'transistor' | 'ground' | 'force' | 'mass' | 'pulley' | 'spring' | 'magnet' | 'coil' | 'charge' | 'fieldline' | 'wave' | 'lens' | 'mirror' | 'prism' | 'eraser' | 'axes' | 'incline' | 'pendulum' | 'ammeter' | 'voltmeter' | 'switch' | 'bulb';

export type PhysicsCategory = 'mechanics' | 'electronics' | 'optics' | 'electromagnetism' | 'thermodynamics' | 'waves' | 'nuclear';

export interface Point {
  x: number;
  y: number;
}

export interface DiagramElement {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Point[];
  text?: string;
  latex?: string;
  color: string;
  strokeWidth: number;
  fillColor?: string;
  fontSize?: number;
  rotation?: number;
  label?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  magnitude?: number;
  selected?: boolean;
}

export interface CanvasState {
  elements: DiagramElement[];
  selectedId: string | null;
  tool: Tool;
  zoom: number;
  panOffset: Point;
}

export interface ShapeTemplate {
  type: Tool;
  name: string;
  category: PhysicsCategory;
  icon: string;
  description: string;
}
