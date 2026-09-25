import { ShapeTemplate } from '../types';

export const shapeTemplates: ShapeTemplate[] = [
  // Electronics
  { type: 'resistor', name: 'Resistor', category: 'electronics', icon: '⏛', description: 'Electrical resistor' },
  { type: 'capacitor', name: 'Capacitor', category: 'electronics', icon: '⊣⊢', description: 'Electrical capacitor' },
  { type: 'inductor', name: 'Inductor', category: 'electronics', icon: '⌇', description: 'Electrical inductor' },
  { type: 'battery', name: 'Battery', category: 'electronics', icon: '🔋', description: 'Battery/Voltage source' },
  { type: 'diode', name: 'Diode', category: 'electronics', icon: '⊳|', description: 'Semiconductor diode' },
  { type: 'transistor', name: 'Transistor', category: 'electronics', icon: '⊣⊢⊣', description: 'BJT Transistor' },
  { type: 'ground', name: 'Ground', category: 'electronics', icon: '⏚', description: 'Ground symbol' },
  { type: 'wire', name: 'Wire', category: 'electronics', icon: '—', description: 'Connecting wire' },
  
  // Mechanics
  { type: 'force', name: 'Force Arrow', category: 'mechanics', icon: '→', description: 'Force vector arrow' },
  { type: 'mass', name: 'Mass Block', category: 'mechanics', icon: '▬', description: 'Mass block/object' },
  { type: 'pulley', name: 'Pulley', category: 'mechanics', icon: '◎', description: 'Pulley wheel' },
  { type: 'spring', name: 'Spring', category: 'mechanics', icon: '⌇⌇', description: 'Spring element' },
  
  // Electromagnetism
  { type: 'magnet', name: 'Magnet', category: 'electromagnetism', icon: '🧲', description: 'Bar magnet' },
  { type: 'coil', name: 'Coil/Solenoid', category: 'electromagnetism', icon: '⌇⌇⌇', description: 'Electromagnetic coil' },
  { type: 'charge', name: 'Electric Charge', category: 'electromagnetism', icon: '⊕', description: 'Point charge' },
  { type: 'fieldline', name: 'Field Lines', category: 'electromagnetism', icon: '⋮', description: 'Field lines' },
  
  // Optics
  { type: 'lens', name: 'Lens', category: 'optics', icon: '⎮⎮', description: 'Convex/Concave lens' },
  { type: 'mirror', name: 'Mirror', category: 'optics', icon: '|', description: 'Plane mirror' },
  { type: 'prism', name: 'Prism', category: 'optics', icon: '△', description: 'Triangular prism' },
  
  // Waves
  { type: 'wave', name: 'Wave', category: 'waves', icon: '∿', description: 'Sine wave' },
  
  // Additional Mechanics
  { type: 'axes', name: 'Coordinate Axes', category: 'mechanics', icon: '⊥', description: 'X-Y coordinate axes' },
  { type: 'incline', name: 'Inclined Plane', category: 'mechanics', icon: '⟋', description: 'Inclined plane/ramp' },
  { type: 'pendulum', name: 'Pendulum', category: 'mechanics', icon: '🔔', description: 'Simple pendulum' },
  
  // Additional Electronics
  { type: 'ammeter', name: 'Ammeter', category: 'electronics', icon: 'Ⓐ', description: 'Current measuring device' },
  { type: 'voltmeter', name: 'Voltmeter', category: 'electronics', icon: 'Ⓥ', description: 'Voltage measuring device' },
  { type: 'switch', name: 'Switch', category: 'electronics', icon: '⌁', description: 'Circuit switch' },
  { type: 'bulb', name: 'Light Bulb', category: 'electronics', icon: '💡', description: 'Light bulb/lamp' },
];

export const categoryColors: Record<string, string> = {
  mechanics: '#3B82F6',
  electronics: '#10B981',
  optics: '#F59E0B',
  electromagnetism: '#8B5CF6',
  thermodynamics: '#EF4444',
  waves: '#06B6D4',
  nuclear: '#EC4899',
};
