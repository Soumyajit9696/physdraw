import React from 'react';
import { DiagramElement, NodePoint } from '../types';

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (elements: DiagramElement[]) => void;
}

const createId = () => crypto.randomUUID();
const createNode = (x: number, y: number): NodePoint => ({ id: createId(), x, y, type: 'vertex' });

interface Template {
  name: string;
  description: string;
  icon: string;
  category: string;
  elements: DiagramElement[];
}

const templates: Template[] = [
  {
    name: 'RC Circuit',
    description: 'Resistor-Capacitor series circuit with nodes',
    icon: '⚡',
    category: 'Electronics',
    elements: [
      { id: createId(), type: 'battery', x: 100, y: 150, width: 60, height: 40, color: '#1f2937', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'wire', x: 160, y: 170, width: 80, height: 0, color: '#1f2937', strokeWidth: 2,
        points: [{x: 160, y: 170}, {x: 240, y: 170}],
        nodes: [createNode(160, 170), createNode(240, 170)] },
      { id: createId(), type: 'resistor', x: 240, y: 150, width: 60, height: 40, color: '#1f2937', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'wire', x: 300, y: 170, width: 80, height: 0, color: '#1f2937', strokeWidth: 2,
        points: [{x: 300, y: 170}, {x: 380, y: 170}],
        nodes: [createNode(300, 170), createNode(380, 170)] },
      { id: createId(), type: 'capacitor', x: 380, y: 150, width: 60, height: 40, color: '#1f2937', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'wire', x: 440, y: 170, width: 60, height: 80, color: '#1f2937', strokeWidth: 2,
        points: [{x: 440, y: 170}, {x: 500, y: 170}, {x: 500, y: 250}],
        nodes: [createNode(440, 170), createNode(500, 170), createNode(500, 250)] },
      { id: createId(), type: 'wire', x: 100, y: 250, width: 400, height: 0, color: '#1f2937', strokeWidth: 2,
        points: [{x: 100, y: 250}, {x: 500, y: 250}],
        nodes: [createNode(100, 250), createNode(500, 250)] },
      { id: createId(), type: 'wire', x: 100, y: 170, width: 0, height: 80, color: '#1f2937', strokeWidth: 2,
        points: [{x: 100, y: 170}, {x: 100, y: 250}],
        nodes: [createNode(100, 170), createNode(100, 250)] },
      { id: createId(), type: 'text', x: 250, y: 125, width: 50, height: 20, text: 'R', color: '#1f2937', strokeWidth: 2, fontSize: 14, nodes: [] },
      { id: createId(), type: 'text', x: 390, y: 125, width: 50, height: 20, text: 'C', color: '#1f2937', strokeWidth: 2, fontSize: 14, nodes: [] },
      { id: createId(), type: 'text', x: 105, y: 125, width: 50, height: 20, text: 'V', color: '#1f2937', strokeWidth: 2, fontSize: 14, nodes: [] },
    ],
  },
  {
    name: 'Free Body Diagram',
    description: 'Block with force vectors (draggable nodes)',
    icon: '→',
    category: 'Mechanics',
    elements: [
      { id: createId(), type: 'mass', x: 200, y: 200, width: 80, height: 80, color: '#1f2937', strokeWidth: 2, fillColor: '#DBEAFE', nodes: [] },
      { id: createId(), type: 'force', x: 240, y: 200, width: 0, height: -80, color: '#EF4444', strokeWidth: 2, label: 'N',
        points: [{x: 240, y: 200}, {x: 240, y: 120}],
        nodes: [createNode(240, 200), createNode(240, 120)] },
      { id: createId(), type: 'force', x: 240, y: 280, width: 0, height: 80, color: '#3B82F6', strokeWidth: 2, label: 'mg',
        points: [{x: 240, y: 280}, {x: 240, y: 360}],
        nodes: [createNode(240, 280), createNode(240, 360)] },
      { id: createId(), type: 'force', x: 280, y: 240, width: 80, height: 0, color: '#10B981', strokeWidth: 2, label: 'F',
        points: [{x: 280, y: 240}, {x: 360, y: 240}],
        nodes: [createNode(280, 240), createNode(360, 240)] },
      { id: createId(), type: 'force', x: 200, y: 240, width: -60, height: 0, color: '#F59E0B', strokeWidth: 2, label: 'f',
        points: [{x: 200, y: 240}, {x: 140, y: 240}],
        nodes: [createNode(200, 240), createNode(140, 240)] },
      { id: createId(), type: 'line', x: 100, y: 280, width: 300, height: 0, color: '#6B7280', strokeWidth: 2,
        points: [{x: 100, y: 280}, {x: 400, y: 280}],
        nodes: [createNode(100, 280), createNode(400, 280)] },
      { id: createId(), type: 'text', x: 220, y: 225, width: 40, height: 20, text: 'm', color: '#1f2937', strokeWidth: 2, fontSize: 16, nodes: [] },
    ],
  },
  {
    name: 'Inclined Plane',
    description: 'Block on inclined plane with force decomposition',
    icon: '⟋',
    category: 'Mechanics',
    elements: [
      { id: createId(), type: 'incline', x: 100, y: 100, width: 250, height: 150, color: '#1f2937', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'mass', x: 180, y: 120, width: 50, height: 50, color: '#1f2937', strokeWidth: 2, fillColor: '#DBEAFE', nodes: [] },
      { id: createId(), type: 'force', x: 205, y: 120, width: 0, height: -60, color: '#EF4444', strokeWidth: 2, label: 'N',
        points: [{x: 205, y: 120}, {x: 205, y: 60}],
        nodes: [createNode(205, 120), createNode(205, 60)] },
      { id: createId(), type: 'force', x: 205, y: 170, width: 0, height: 60, color: '#3B82F6', strokeWidth: 2, label: 'mg',
        points: [{x: 205, y: 170}, {x: 205, y: 230}],
        nodes: [createNode(205, 170), createNode(205, 230)] },
      { id: createId(), type: 'text', x: 185, y: 135, width: 30, height: 20, text: 'm', color: '#1f2937', strokeWidth: 2, fontSize: 14, nodes: [] },
    ],
  },
  {
    name: 'Bar Magnet Field',
    description: 'Magnetic field lines around bar magnet',
    icon: '🧲',
    category: 'EMT',
    elements: [
      { id: createId(), type: 'magnet', x: 200, y: 180, width: 120, height: 40, color: '#1f2937', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'fieldline', x: 150, y: 160, width: 220, height: 0, color: '#8B5CF6', strokeWidth: 1,
        points: [{x: 150, y: 160}, {x: 370, y: 160}],
        nodes: [createNode(150, 160), createNode(370, 160)] },
      { id: createId(), type: 'fieldline', x: 150, y: 200, width: 220, height: 0, color: '#8B5CF6', strokeWidth: 1,
        points: [{x: 150, y: 200}, {x: 370, y: 200}],
        nodes: [createNode(150, 200), createNode(370, 200)] },
      { id: createId(), type: 'fieldline', x: 150, y: 240, width: 220, height: 0, color: '#8B5CF6', strokeWidth: 1,
        points: [{x: 150, y: 240}, {x: 370, y: 240}],
        nodes: [createNode(150, 240), createNode(370, 240)] },
      { id: createId(), type: 'text', x: 220, y: 150, width: 30, height: 20, text: 'B', color: '#8B5CF6', strokeWidth: 2, fontSize: 14, nodes: [] },
    ],
  },
  {
    name: 'Convex Lens',
    description: 'Ray diagram for convex lens',
    icon: '🔬',
    category: 'Optics',
    elements: [
      { id: createId(), type: 'lens', x: 250, y: 120, width: 20, height: 160, color: '#1f2937', strokeWidth: 2, lensType: 'convex', nodes: [] },
      { id: createId(), type: 'optical_axis', x: 100, y: 200, width: 300, height: 0, color: '#6B7280', strokeWidth: 1,
        points: [{x: 100, y: 200}, {x: 400, y: 200}],
        nodes: [createNode(100, 200), createNode(400, 200)] },
      { id: createId(), type: 'arrow', x: 150, y: 200, width: 0, height: -50, color: '#EF4444', strokeWidth: 2,
        points: [{x: 150, y: 200}, {x: 150, y: 150}],
        nodes: [createNode(150, 200), createNode(150, 150)] },
      { id: createId(), type: 'arrow', x: 350, y: 200, width: 0, height: 40, color: '#3B82F6', strokeWidth: 2,
        points: [{x: 350, y: 200}, {x: 350, y: 240}],
        nodes: [createNode(350, 200), createNode(350, 240)] },
      { id: createId(), type: 'ray', x: 150, y: 150, width: 100, height: 50, color: '#10B981', strokeWidth: 1,
        points: [{x: 150, y: 150}, {x: 250, y: 200}],
        nodes: [createNode(150, 150), createNode(250, 200)] },
      { id: createId(), type: 'ray', x: 250, y: 200, width: 100, height: 40, color: '#10B981', strokeWidth: 1,
        points: [{x: 250, y: 200}, {x: 350, y: 240}],
        nodes: [createNode(250, 200), createNode(350, 240)] },
      { id: createId(), type: 'text', x: 140, y: 135, width: 40, height: 20, text: 'Object', color: '#EF4444', strokeWidth: 2, fontSize: 10, nodes: [] },
      { id: createId(), type: 'text', x: 340, y: 255, width: 40, height: 20, text: 'Image', color: '#3B82F6', strokeWidth: 2, fontSize: 10, nodes: [] },
    ],
  },
  {
    name: 'Pendulum',
    description: 'Simple pendulum with forces',
    icon: '🔔',
    category: 'Mechanics',
    elements: [
      { id: createId(), type: 'pendulum', x: 180, y: 80, width: 100, height: 150, color: '#1f2937', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'force', x: 250, y: 200, width: 0, height: 50, color: '#3B82F6', strokeWidth: 2, label: 'mg',
        points: [{x: 250, y: 200}, {x: 250, y: 250}],
        nodes: [createNode(250, 200), createNode(250, 250)] },
      { id: createId(), type: 'force', x: 250, y: 200, width: -40, height: -30, color: '#EF4444', strokeWidth: 2, label: 'T',
        points: [{x: 250, y: 200}, {x: 210, y: 170}],
        nodes: [createNode(250, 200), createNode(210, 170)] },
    ],
  },
  {
    name: 'EM Wave',
    description: 'Electromagnetic wave with E and B fields',
    icon: '⫘',
    category: 'EMT',
    elements: [
      { id: createId(), type: 'emwave', x: 80, y: 140, width: 300, height: 120, color: '#1f2937', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'arrow', x: 380, y: 200, width: 50, height: 0, color: '#6B7280', strokeWidth: 1.5, label: 'propagation',
        points: [{x: 380, y: 200}, {x: 430, y: 200}],
        nodes: [createNode(380, 200), createNode(430, 200)] },
    ],
  },
  {
    name: 'Point Charges',
    description: 'Electric field between charges',
    icon: '⊕',
    category: 'EMT',
    elements: [
      { id: createId(), type: 'charge', x: 150, y: 180, width: 40, height: 40, color: '#EF4444', strokeWidth: 2, fillColor: '#FEE2E2', chargeSign: '+', nodes: [] },
      { id: createId(), type: 'charge', x: 350, y: 180, width: 40, height: 40, color: '#3B82F6', strokeWidth: 2, fillColor: '#DBEAFE', chargeSign: '-', nodes: [] },
      { id: createId(), type: 'fieldline', x: 190, y: 200, width: 160, height: 0, color: '#8B5CF6', strokeWidth: 1.5,
        points: [{x: 190, y: 200}, {x: 350, y: 200}],
        nodes: [createNode(190, 200), createNode(350, 200)] },
      { id: createId(), type: 'fieldline', x: 190, y: 185, width: 160, height: 0, color: '#8B5CF6', strokeWidth: 1,
        points: [{x: 190, y: 185}, {x: 350, y: 185}],
        nodes: [createNode(190, 185), createNode(350, 185)] },
      { id: createId(), type: 'fieldline', x: 190, y: 215, width: 160, height: 0, color: '#8B5CF6', strokeWidth: 1,
        points: [{x: 190, y: 215}, {x: 350, y: 215}],
        nodes: [createNode(190, 215), createNode(350, 215)] },
      { id: createId(), type: 'text', x: 155, y: 170, width: 30, height: 20, text: 'q₁', color: '#EF4444', strokeWidth: 2, fontSize: 12, nodes: [] },
      { id: createId(), type: 'text', x: 355, y: 170, width: 30, height: 20, text: 'q₂', color: '#3B82F6', strokeWidth: 2, fontSize: 12, nodes: [] },
    ],
  },
  {
    name: 'Atom Model',
    description: 'Bohr model of atom',
    icon: '⚛',
    category: 'Quantum',
    elements: [
      { id: createId(), type: 'atom', x: 180, y: 120, width: 160, height: 160, color: '#1f2937', strokeWidth: 1.5, nodes: [] },
      { id: createId(), type: 'energy_level', x: 400, y: 100, width: 100, height: 150, color: '#1f2937', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'arrow', x: 340, y: 180, width: 50, height: 0, color: '#F59E0B', strokeWidth: 1.5, label: 'photon',
        points: [{x: 340, y: 180}, {x: 390, y: 180}],
        nodes: [createNode(340, 180), createNode(390, 180)] },
    ],
  },
  {
    name: 'Heat Engine',
    description: 'Thermodynamic piston system',
    icon: '🌡',
    category: 'Thermodynamics',
    elements: [
      { id: createId(), type: 'piston', x: 180, y: 120, width: 100, height: 150, color: '#1f2937', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'flame', x: 200, y: 280, width: 40, height: 50, color: '#1f2937', strokeWidth: 1, nodes: [] },
      { id: createId(), type: 'arrow', x: 230, y: 120, width: 0, height: -40, color: '#EF4444', strokeWidth: 2, label: 'W',
        points: [{x: 230, y: 120}, {x: 230, y: 80}],
        nodes: [createNode(230, 120), createNode(230, 80)] },
      { id: createId(), type: 'arrow', x: 230, y: 280, width: 0, height: 30, color: '#F59E0B', strokeWidth: 2, label: 'Q',
        points: [{x: 230, y: 280}, {x: 230, y: 310}],
        nodes: [createNode(230, 280), createNode(230, 310)] },
      { id: createId(), type: 'text', x: 200, y: 180, width: 60, height: 20, text: 'Gas', color: '#6B7280', strokeWidth: 2, fontSize: 12, nodes: [] },
    ],
  },
  {
    name: 'Standing Wave',
    description: 'Standing wave with nodes and antinodes',
    icon: '⎍',
    category: 'Waves',
    elements: [
      { id: createId(), type: 'standing_wave', x: 100, y: 150, width: 300, height: 80, color: '#3B82F6', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'line', x: 100, y: 190, width: 300, height: 0, color: '#6B7280', strokeWidth: 1,
        points: [{x: 100, y: 190}, {x: 400, y: 190}],
        nodes: [createNode(100, 190), createNode(400, 190)] },
      { id: createId(), type: 'dimension', x: 100, y: 250, width: 300, height: 0, color: '#10B981', strokeWidth: 1, label: 'λ',
        points: [{x: 100, y: 250}, {x: 250, y: 250}],
        nodes: [createNode(100, 250), createNode(250, 250)] },
    ],
  },
  {
    name: 'Logic Circuit',
    description: 'Digital logic gates',
    icon: '&',
    category: 'Electronics',
    elements: [
      { id: createId(), type: 'logic_and', x: 150, y: 120, width: 50, height: 40, color: '#1f2937', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'logic_or', x: 150, y: 200, width: 50, height: 40, color: '#1f2937', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'logic_not', x: 280, y: 160, width: 50, height: 40, color: '#1f2937', strokeWidth: 2, nodes: [] },
      { id: createId(), type: 'wire', x: 200, y: 140, width: 80, height: 30, color: '#1f2937', strokeWidth: 2,
        points: [{x: 200, y: 140}, {x: 280, y: 170}],
        nodes: [createNode(200, 140), createNode(280, 170)] },
      { id: createId(), type: 'wire', x: 200, y: 220, width: 80, height: -30, color: '#1f2937', strokeWidth: 2,
        points: [{x: 200, y: 220}, {x: 280, y: 190}],
        nodes: [createNode(200, 220), createNode(280, 190)] },
    ],
  },
];

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose, onLoadTemplate }) => {
  if (!isOpen) return null;

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[850px] max-w-[95vw] max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">📋 Physics Diagram Templates</h2>
            <p className="text-xs text-gray-500 mt-0.5">Click any template to load it. All nodes are editable after loading.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {categories.map(category => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {templates.filter(t => t.category === category).map(template => (
                  <button
                    key={template.name}
                    onClick={() => {
                      onLoadTemplate(template.elements.map(e => ({ ...e, id: crypto.randomUUID() })));
                      onClose();
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group"
                  >
                    <span className="text-3xl">{template.icon}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{template.name}</span>
                    <span className="text-xs text-gray-400">{template.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-400 text-center">
            💡 All elements have editable nodes. Drag them to reshape, right-click to delete nodes, click + on edges to add nodes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
