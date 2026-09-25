import React from 'react';
import { DiagramElement } from '../types';

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (elements: DiagramElement[]) => void;
}

interface Template {
  name: string;
  description: string;
  icon: string;
  category: string;
  elements: DiagramElement[];
}

const createId = () => crypto.randomUUID();

const templates: Template[] = [
  {
    name: 'Simple Circuit (RC)',
    description: 'Resistor-Capacitor series circuit',
    icon: '⚡',
    category: 'Electronics',
    elements: [
      { id: createId(), type: 'battery', x: 100, y: 150, width: 60, height: 40, color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'wire', x: 160, y: 170, width: 80, height: 0, points: [{x: 160, y: 170}, {x: 240, y: 170}], color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'resistor', x: 240, y: 150, width: 60, height: 40, color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'wire', x: 300, y: 170, width: 80, height: 0, points: [{x: 300, y: 170}, {x: 380, y: 170}], color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'capacitor', x: 380, y: 150, width: 60, height: 40, color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'wire', x: 440, y: 170, width: 60, height: 0, points: [{x: 440, y: 170}, {x: 500, y: 170}], color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'wire', x: 500, y: 170, width: 0, height: 80, points: [{x: 500, y: 170}, {x: 500, y: 250}], color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'wire', x: 100, y: 250, width: 400, height: 0, points: [{x: 100, y: 250}, {x: 500, y: 250}], color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'wire', x: 100, y: 170, width: 0, height: 80, points: [{x: 100, y: 170}, {x: 100, y: 250}], color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'text', x: 250, y: 130, width: 50, height: 20, text: 'R', color: '#1f2937', strokeWidth: 2, fontSize: 14 },
      { id: createId(), type: 'text', x: 390, y: 130, width: 50, height: 20, text: 'C', color: '#1f2937', strokeWidth: 2, fontSize: 14 },
      { id: createId(), type: 'text', x: 105, y: 130, width: 50, height: 20, text: 'V', color: '#1f2937', strokeWidth: 2, fontSize: 14 },
    ],
  },
  {
    name: 'Free Body Diagram',
    description: 'Block on surface with forces',
    icon: '→',
    category: 'Mechanics',
    elements: [
      { id: createId(), type: 'mass', x: 200, y: 200, width: 80, height: 80, color: '#1f2937', strokeWidth: 2, fillColor: '#DBEAFE' },
      { id: createId(), type: 'force', x: 240, y: 200, width: 0, height: -80, points: [{x: 240, y: 200}, {x: 240, y: 120}], color: '#EF4444', strokeWidth: 2, label: 'N' },
      { id: createId(), type: 'force', x: 240, y: 280, width: 0, height: 80, points: [{x: 240, y: 280}, {x: 240, y: 360}], color: '#3B82F6', strokeWidth: 2, label: 'mg' },
      { id: createId(), type: 'force', x: 280, y: 240, width: 80, height: 0, points: [{x: 280, y: 240}, {x: 360, y: 240}], color: '#10B981', strokeWidth: 2, label: 'F' },
      { id: createId(), type: 'force', x: 200, y: 240, width: -60, height: 0, points: [{x: 200, y: 240}, {x: 140, y: 240}], color: '#F59E0B', strokeWidth: 2, label: 'f' },
      { id: createId(), type: 'line', x: 100, y: 280, width: 300, height: 0, points: [{x: 100, y: 280}, {x: 400, y: 280}], color: '#6B7280', strokeWidth: 2 },
      { id: createId(), type: 'text', x: 215, y: 225, width: 50, height: 20, text: 'm', color: '#1f2937', strokeWidth: 2, fontSize: 16 },
    ],
  },
  {
    name: 'Inclined Plane',
    description: 'Block on inclined plane with forces',
    icon: '⟋',
    category: 'Mechanics',
    elements: [
      { id: createId(), type: 'incline', x: 100, y: 100, width: 250, height: 150, color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'mass', x: 180, y: 130, width: 50, height: 50, color: '#1f2937', strokeWidth: 2, fillColor: '#DBEAFE' },
      { id: createId(), type: 'force', x: 205, y: 130, width: 0, height: -60, points: [{x: 205, y: 130}, {x: 205, y: 70}], color: '#EF4444', strokeWidth: 2, label: 'N' },
      { id: createId(), type: 'force', x: 205, y: 180, width: 0, height: 60, points: [{x: 205, y: 180}, {x: 205, y: 240}], color: '#3B82F6', strokeWidth: 2, label: 'mg' },
      { id: createId(), type: 'text', x: 185, y: 145, width: 30, height: 20, text: 'm', color: '#1f2937', strokeWidth: 2, fontSize: 14 },
    ],
  },
  {
    name: 'Bar Magnet Field',
    description: 'Magnetic field lines around bar magnet',
    icon: '🧲',
    category: 'EMT',
    elements: [
      { id: createId(), type: 'magnet', x: 200, y: 180, width: 120, height: 40, color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'fieldline', x: 150, y: 160, width: 220, height: 0, points: [{x: 150, y: 160}, {x: 370, y: 160}], color: '#8B5CF6', strokeWidth: 1 },
      { id: createId(), type: 'fieldline', x: 150, y: 200, width: 220, height: 0, points: [{x: 150, y: 200}, {x: 370, y: 200}], color: '#8B5CF6', strokeWidth: 1 },
      { id: createId(), type: 'fieldline', x: 150, y: 240, width: 220, height: 0, points: [{x: 150, y: 240}, {x: 370, y: 240}], color: '#8B5CF6', strokeWidth: 1 },
      { id: createId(), type: 'text', x: 220, y: 155, width: 30, height: 20, text: 'B', color: '#8B5CF6', strokeWidth: 2, fontSize: 14 },
    ],
  },
  {
    name: 'Convex Lens',
    description: 'Ray diagram for convex lens',
    icon: '🔬',
    category: 'Optics',
    elements: [
      { id: createId(), type: 'lens', x: 250, y: 120, width: 20, height: 160, color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'line', x: 100, y: 200, width: 300, height: 0, points: [{x: 100, y: 200}, {x: 400, y: 200}], color: '#6B7280', strokeWidth: 1 },
      { id: createId(), type: 'arrow', x: 150, y: 200, width: 0, height: -50, points: [{x: 150, y: 200}, {x: 150, y: 150}], color: '#EF4444', strokeWidth: 2 },
      { id: createId(), type: 'arrow', x: 350, y: 200, width: 0, height: 40, points: [{x: 350, y: 200}, {x: 350, y: 240}], color: '#3B82F6', strokeWidth: 2 },
      { id: createId(), type: 'line', x: 150, y: 150, width: 100, height: 50, points: [{x: 150, y: 150}, {x: 250, y: 200}], color: '#10B981', strokeWidth: 1 },
      { id: createId(), type: 'line', x: 250, y: 200, width: 100, height: 40, points: [{x: 250, y: 200}, {x: 350, y: 240}], color: '#10B981', strokeWidth: 1 },
      { id: createId(), type: 'text', x: 145, y: 135, width: 30, height: 20, text: 'Object', color: '#EF4444', strokeWidth: 2, fontSize: 10 },
      { id: createId(), type: 'text', x: 340, y: 255, width: 30, height: 20, text: 'Image', color: '#3B82F6', strokeWidth: 2, fontSize: 10 },
    ],
  },
  {
    name: 'Pendulum',
    description: 'Simple pendulum diagram',
    icon: '🔔',
    category: 'Mechanics',
    elements: [
      { id: createId(), type: 'pendulum', x: 180, y: 80, width: 100, height: 150, color: '#1f2937', strokeWidth: 2 },
      { id: createId(), type: 'force', x: 250, y: 200, width: 0, height: 50, points: [{x: 250, y: 200}, {x: 250, y: 250}], color: '#3B82F6', strokeWidth: 2, label: 'mg' },
      { id: createId(), type: 'force', x: 250, y: 200, width: -40, height: -30, points: [{x: 250, y: 200}, {x: 210, y: 170}], color: '#EF4444', strokeWidth: 2, label: 'T' },
    ],
  },
  {
    name: 'Sine Wave',
    description: 'Transverse wave diagram',
    icon: '〰️',
    category: 'Waves',
    elements: [
      { id: createId(), type: 'wave', x: 100, y: 150, width: 300, height: 80, color: '#3B82F6', strokeWidth: 2 },
      { id: createId(), type: 'line', x: 100, y: 190, width: 300, height: 0, points: [{x: 100, y: 190}, {x: 400, y: 190}], color: '#6B7280', strokeWidth: 1 },
      { id: createId(), type: 'arrow', x: 100, y: 190, width: 0, height: -40, points: [{x: 100, y: 190}, {x: 100, y: 150}], color: '#EF4444', strokeWidth: 1.5, label: 'A' },
      { id: createId(), type: 'arrow', x: 100, y: 190, width: 100, height: 0, points: [{x: 100, y: 190}, {x: 200, y: 190}], color: '#10B981', strokeWidth: 1.5, label: 'λ' },
      { id: createId(), type: 'text', x: 380, y: 185, width: 30, height: 20, text: 'x', color: '#6B7280', strokeWidth: 2, fontSize: 12 },
    ],
  },
  {
    name: 'Point Charges',
    description: 'Electric field between charges',
    icon: '⊕',
    category: 'EMT',
    elements: [
      { id: createId(), type: 'charge', x: 150, y: 180, width: 40, height: 40, color: '#EF4444', strokeWidth: 2, fillColor: '#FEE2E2', label: '+' },
      { id: createId(), type: 'charge', x: 350, y: 180, width: 40, height: 40, color: '#3B82F6', strokeWidth: 2, fillColor: '#DBEAFE', label: '−' },
      { id: createId(), type: 'fieldline', x: 190, y: 200, width: 160, height: 0, points: [{x: 190, y: 200}, {x: 350, y: 200}], color: '#8B5CF6', strokeWidth: 1.5 },
      { id: createId(), type: 'fieldline', x: 190, y: 185, width: 160, height: 0, points: [{x: 190, y: 185}, {x: 350, y: 185}], color: '#8B5CF6', strokeWidth: 1 },
      { id: createId(), type: 'fieldline', x: 190, y: 215, width: 160, height: 0, points: [{x: 190, y: 215}, {x: 350, y: 215}], color: '#8B5CF6', strokeWidth: 1 },
      { id: createId(), type: 'text', x: 155, y: 170, width: 30, height: 20, text: 'q₁', color: '#EF4444', strokeWidth: 2, fontSize: 12 },
      { id: createId(), type: 'text', x: 355, y: 170, width: 30, height: 20, text: 'q₂', color: '#3B82F6', strokeWidth: 2, fontSize: 12 },
      { id: createId(), type: 'text', x: 250, y: 165, width: 30, height: 20, text: 'E', color: '#8B5CF6', strokeWidth: 2, fontSize: 12 },
    ],
  },
];

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose, onLoadTemplate }) => {
  if (!isOpen) return null;

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[800px] max-w-[95vw] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">📋 Diagram Templates</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {categories.map(category => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-400 text-center">
            Click a template to load it onto the canvas. You can then modify all elements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
