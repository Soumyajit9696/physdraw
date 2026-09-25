import { ShapeTemplate } from '../types';

export const shapeTemplates: ShapeTemplate[] = [
  // Electronics
  { type: 'resistor', name: 'Resistor', category: 'electronics', icon: '⏛', description: 'Electrical resistor' },
  { type: 'capacitor', name: 'Capacitor', category: 'electronics', icon: '⊣⊢', description: 'Electrical capacitor' },
  { type: 'inductor', name: 'Inductor', category: 'electronics', icon: '⌇', description: 'Electrical inductor' },
  { type: 'battery', name: 'Battery', category: 'electronics', icon: '🔋', description: 'Battery/Voltage source' },
  { type: 'diode', name: 'Diode', category: 'electronics', icon: '⊳|', description: 'Semiconductor diode' },
  { type: 'led', name: 'LED', category: 'electronics', icon: '💡', description: 'Light emitting diode' },
  { type: 'transistor', name: 'Transistor', category: 'electronics', icon: '⊣⊢⊣', description: 'BJT Transistor' },
  { type: 'ground', name: 'Ground', category: 'electronics', icon: '⏚', description: 'Ground symbol' },
  { type: 'wire', name: 'Wire', category: 'electronics', icon: '—', description: 'Connecting wire' },
  { type: 'ammeter', name: 'Ammeter', category: 'electronics', icon: 'Ⓐ', description: 'Current meter' },
  { type: 'voltmeter', name: 'Voltmeter', category: 'electronics', icon: 'Ⓥ', description: 'Voltage meter' },
  { type: 'switch', name: 'Switch', category: 'electronics', icon: '⌁', description: 'Circuit switch' },
  { type: 'bulb', name: 'Light Bulb', category: 'electronics', icon: '💡', description: 'Light bulb/lamp' },
  { type: 'transformer', name: 'Transformer', category: 'electronics', icon: '⫛', description: 'Transformer' },
  { type: 'opamp', name: 'Op-Amp', category: 'electronics', icon: '▷', description: 'Operational amplifier' },
  { type: 'logic_and', name: 'AND Gate', category: 'electronics', icon: '&', description: 'Logic AND gate' },
  { type: 'logic_or', name: 'OR Gate', category: 'electronics', icon: '≥1', description: 'Logic OR gate' },
  { type: 'logic_not', name: 'NOT Gate', category: 'electronics', icon: '1', description: 'Logic NOT gate' },

  // Mechanics
  { type: 'force', name: 'Force Arrow', category: 'mechanics', icon: '→', description: 'Force vector arrow' },
  { type: 'mass', name: 'Mass Block', category: 'mechanics', icon: '▬', description: 'Mass block/object' },
  { type: 'pulley', name: 'Pulley', category: 'mechanics', icon: '◎', description: 'Pulley wheel' },
  { type: 'spring', name: 'Spring', category: 'mechanics', icon: '⌇⌇', description: 'Spring element' },
  { type: 'axes', name: 'Coordinate Axes', category: 'mechanics', icon: '⊥', description: 'X-Y coordinate axes' },
  { type: 'incline', name: 'Inclined Plane', category: 'mechanics', icon: '⟋', description: 'Inclined plane/ramp' },
  { type: 'pendulum', name: 'Pendulum', category: 'mechanics', icon: '🔔', description: 'Simple pendulum' },
  { type: 'lever', name: 'Lever', category: 'mechanics', icon: '⚖', description: 'Lever beam' },
  { type: 'fulcrum', name: 'Fulcrum', category: 'mechanics', icon: '△', description: 'Fulcrum/triangle support' },
  { type: 'wedge', name: 'Wedge', category: 'mechanics', icon: '◣', description: 'Wedge shape' },

  // Electromagnetism
  { type: 'magnet', name: 'Magnet', category: 'electromagnetism', icon: '🧲', description: 'Bar magnet' },
  { type: 'coil', name: 'Coil/Solenoid', category: 'electromagnetism', icon: '⌇⌇⌇', description: 'Electromagnetic coil' },
  { type: 'solenoid', name: 'Solenoid Cross', category: 'electromagnetism', icon: '⊙', description: 'Solenoid cross-section' },
  { type: 'charge', name: 'Electric Charge', category: 'electromagnetism', icon: '⊕', description: 'Point charge' },
  { type: 'fieldline', name: 'Field Lines', category: 'electromagnetism', icon: '⋮', description: 'Field lines' },
  { type: 'emwave', name: 'EM Wave', category: 'electromagnetism', icon: '⫘', description: 'Electromagnetic wave' },
  { type: 'current_loop', name: 'Current Loop', category: 'electromagnetism', icon: '↻', description: 'Current carrying loop' },

  // Optics
  { type: 'lens', name: 'Lens', category: 'optics', icon: '⎮⎮', description: 'Convex/Concave lens' },
  { type: 'mirror', name: 'Mirror', category: 'optics', icon: '|', description: 'Plane mirror' },
  { type: 'prism', name: 'Prism', category: 'optics', icon: '△', description: 'Triangular prism' },
  { type: 'diffraction_grating', name: 'Diffraction Grating', category: 'optics', icon: '|||', description: 'Diffraction grating' },
  { type: 'ray', name: 'Light Ray', category: 'optics', icon: '→', description: 'Light ray with arrow' },
  { type: 'optical_axis', name: 'Optical Axis', category: 'optics', icon: '—', description: 'Principal axis' },

  // Waves
  { type: 'wave', name: 'Sine Wave', category: 'waves', icon: '∿', description: 'Sine wave' },
  { type: 'standing_wave', name: 'Standing Wave', category: 'waves', icon: '⎍', description: 'Standing wave pattern' },
  { type: 'pulse', name: 'Pulse', category: 'waves', icon: '⌓', description: 'Wave pulse' },

  // Thermodynamics
  { type: 'piston', name: 'Piston', category: 'thermodynamics', icon: '⊟', description: 'Piston/cylinder' },
  { type: 'cylinder', name: 'Cylinder', category: 'thermodynamics', icon: '▭', description: 'Gas cylinder' },
  { type: 'flame', name: 'Flame/Heat', category: 'thermodynamics', icon: '🔥', description: 'Heat source' },
  { type: 'thermometer', name: 'Thermometer', category: 'thermodynamics', icon: '🌡', description: 'Thermometer' },

  // Nuclear/Quantum
  { type: 'atom', name: 'Atom Model', category: 'quantum', icon: '⚛', description: 'Bohr atom model' },
  { type: 'nucleus', name: 'Nucleus', category: 'nuclear', icon: '⬤', description: 'Atomic nucleus' },
  { type: 'energy_level', name: 'Energy Level', category: 'quantum', icon: '≡', description: 'Energy level diagram' },
  { type: 'decay_arrow', name: 'Decay Arrow', category: 'nuclear', icon: '⇝', description: 'Radioactive decay' },

  // Misc
  { type: 'protractor', name: 'Protractor', category: 'misc', icon: '◠', description: 'Angle protractor' },
  { type: 'angle_arc', name: 'Angle Arc', category: 'misc', icon: '∠', description: 'Angle measurement arc' },
  { type: 'dimension', name: 'Dimension Line', category: 'misc', icon: '↔', description: 'Dimension/measurement line' },
  { type: 'label_box', name: 'Label Box', category: 'misc', icon: '▢', description: 'Text label box' },
  { type: 'cloud', name: 'System Boundary', category: 'misc', icon: '☁', description: 'System boundary/cloud' },
];

export const categoryColors: Record<string, string> = {
  mechanics: '#3B82F6',
  electronics: '#10B981',
  optics: '#F59E0B',
  electromagnetism: '#8B5CF6',
  thermodynamics: '#EF4444',
  waves: '#06B6D4',
  nuclear: '#EC4899',
  quantum: '#6366F1',
  misc: '#6B7280',
};
