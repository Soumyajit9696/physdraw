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
];

const Toolbar: React.FC<ToolbarProps> = ({ currentTool, onToolChange }) => {
  const [expandedCategory, setExpandedCategory] = useState<PhysicsCategory | null>(null);

  const getCategoryShapes = (category: PhysicsCategory) => {
    return shapeTemplates.filter(s => s.category === category);
  };

  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-3 gap-1 overflow-y-auto border-r border-gray-700">
      {/* Basic Tools */}
      <div className="flex flex-col gap-1 mb-3 pb-3 border-b border-gray-700">
        {basicTools.map(({ tool, icon, label }) => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg transition-all duration-150 ${
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
      <div className="flex flex-col gap-1">
        {categories.map(({ key, label, icon }) => (
          <div key={key} className="relative group">
            <button
              onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
              className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg transition-all duration-150 ${
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
              <div className="absolute left-14 top-0 bg-gray-800 rounded-lg shadow-xl border border-gray-600 p-2 z-50 min-w-[160px]">
                <div className="text-xs text-gray-400 px-2 py-1 font-semibold uppercase tracking-wide">
                  {label}
                </div>
                {getCategoryShapes(key).map(shape => (
                  <button
                    key={shape.type}
                    onClick={() => {
                      onToolChange(shape.type);
                      setExpandedCategory(null);
                    }}
                    className={`w-full px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors ${
                      currentTool === shape.type
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{shape.icon}</span>
                    <span>{shape.name}</span>
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
