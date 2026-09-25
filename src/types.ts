export type Tool =
  | 'select' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'ellipse' | 'polygon' | 'polyline' | 'text' | 'latex' | 'eraser'
  // Electronics
  | 'wire' | 'resistor' | 'capacitor' | 'inductor' | 'battery' | 'diode' | 'led' | 'transistor' | 'ground'
  | 'ammeter' | 'voltmeter' | 'switch' | 'bulb' | 'transformer' | 'opamp' | 'logic_and' | 'logic_or' | 'logic_not'
  // Mechanics
  | 'force' | 'mass' | 'pulley' | 'spring' | 'axes' | 'incline' | 'pendulum' | 'lever' | 'fulcrum' | 'wedge'
  // EMT
  | 'magnet' | 'coil' | 'solenoid' | 'charge' | 'fieldline' | 'emwave' | 'current_loop'
  // Optics
  | 'lens' | 'mirror' | 'prism' | 'diffraction_grating' | 'ray' | 'optical_axis'
  // Waves
  | 'wave' | 'standing_wave' | 'pulse'
  // Thermo
  | 'piston' | 'cylinder' | 'flame' | 'thermometer'
  // Nuclear/Quantum
  | 'atom' | 'nucleus' | 'energy_level' | 'decay_arrow'
  // Misc
  | 'protractor' | 'angle_arc' | 'dimension' | 'label_box' | 'cloud';

export type PhysicsCategory =
  | 'mechanics' | 'electronics' | 'optics' | 'electromagnetism'
  | 'thermodynamics' | 'waves' | 'nuclear' | 'quantum' | 'misc';

export interface Point {
  x: number;
  y: number;
}

export interface NodePoint {
  id: string;
  x: number;
  y: number;
  type: 'vertex' | 'control' | 'handle' | 'anchor';
  locked?: boolean;
  label?: string;
}

export interface DiagramElement {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Point[];
  nodes?: NodePoint[];
  text?: string;
  latex?: string;
  color: string;
  strokeWidth: number;
  fillColor?: string;
  fontSize?: number;
  fontFamily?: string;
  rotation?: number;
  label?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  magnitude?: number;
  selected?: boolean;
  opacity?: number;
  dashed?: boolean;
  dashArray?: string;
  zIndex?: number;
  locked?: boolean;
  visible?: boolean;
  name?: string;
  // Specific properties
  chargeSign?: '+' | '-' | '0';
  springCoils?: number;
  resistorStyle?: 'zigzag' | 'rectangle';
  lensType?: 'convex' | 'concave';
  mirrorType?: 'plane' | 'concave' | 'convex';
  waveAmplitude?: number;
  waveFrequency?: number;
}

export interface CanvasState {
  elements: DiagramElement[];
  selectedIds: string[];
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
