import React, { useState } from 'react';
import { Tool, PhysicsCategory } from '../types';
import { shapeTemplates, categoryColors } from '../utils/shapes';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const basicTools: { tool: Tool; icon: string; label: string }[] = [
  { tool: 'select', icon: '⬚', label: 'Select (V)' },
  { tool: 'line', icon: '╱', label: 'Line (L)' },
  { tool: 'arrow', icon: '→', label: 'Arrow (A)' },
  { tool: 'rectangle', icon: '□', label: 'Rectangle (R)' },
  { tool: 'circle', icon: '○', label: 'Circle (C)' },
  { tool: 'ellipse', icon: '⬭', label: 'Ellipse' },
  { tool: 'polyline', icon: '⌇', label: 'Polyline (P)' },
  { tool: 'polygon', icon: '⬡', label: 'Polygon' },
  { tool: 'text', icon: 'T', label: 'Text (T)' },
  { tool: 'latex', icon: '∑', label: 'LaTeX (X)' },
  { tool: 'eraser', icon: '⌫', label: 'Eraser (E)' },
];

const categories: { key: PhysicsCategory; label: string; icon: string }[] = [
  { key: 'electronics', label: 'Electronics', icon: '⚡' },
  { key: 'mechanics', label: 'Mechanics', icon: '⚙️' },
  { key: 'electromagnetism', label: 'EMT', icon: '🧲' },
  { key: 'optics', label: 'Optics', icon: '🔬' },
  { key: 'waves', label: 'Waves', icon: '〰️' },
  { key: 'thermodynamics', label: 'Thermo', icon: '🌡' },
  { key: 'quantum', label: 'Quantum', icon: '⚛' },
  { key: 'nuclear', label: 'Nuclear', icon: '☢' },
  { key: 'misc', label: 'Misc', icon: '✦' },
];

const Toolbar: React.FC<ToolbarProps> = ({ currentTool, onToolChange }) => {
  const [expandedCategory, setExpandedCategory] = useState<PhysicsCategory | null>(null);

  const getCategoryShapes = (category: PhysicsCategory) => {
    return shapeTemplates.filter(s => s.category === category);
  };

  return (
    <div className="w-14 bg-gray-900 flex flex-col items-center py-2 gap-0.5 overflow-y-auto border-r border-gray-700">
      {/* Basic Tools */}
      <div className="flex flex-col gap-0.5 mb-2 pb-2 border-b border-gray-700">
        {basicTools.map(({ tool, icon, label }) => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            className={`w-10 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-150 ${
              currentTool === tool
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            title={label}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Physics Categories */}
      <div className="flex flex-col gap-0.5">
        {categories.map(({ key, label, icon }) => (
          <div key={key} className="relative group">
            <button
              onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
              className={`w-10 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-150 ${
                expandedCategory === key
                  ? 'bg-gray-700 text-white ring-2 ring-blue-400'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={label}
              style={{ borderLeft: `3px solid ${categoryColors[key]}` }}
            >
              {icon}
            </button>

            {/* Expanded submenu */}
            {expandedCategory === key && (
              <div className="absolute left-12 top-0 bg-gray-800 rounded-lg shadow-xl border border-gray-600 p-2 z-50 min-w-[180px] max-h-[80vh] overflow-y-auto">
                <div className="text-xs text-gray-400 px-2 py-1 font-semibold uppercase tracking-wide sticky top-0 bg-gray-800">
                  {label}
                </div>
                {getCategoryShapes(key).map(shape => (
                  <button
                    key={shape.type}
                    onClick={() => {
                      onToolChange(shape.type);
                      setExpandedCategory(null);
                    }}
                    className={`w-full px-3 py-1.5 rounded-md flex items-center gap-2 text-xs transition-colors ${
                      currentTool === shape.type
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="text-base w-5 text-center">{shape.icon}</span>
                    <span className="flex-1 text-left">{shape.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
