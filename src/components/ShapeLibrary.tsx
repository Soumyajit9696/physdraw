import React, { useState, useRef } from 'react';
import { Tool, PhysicsCategory } from '../types';
import { shapeTemplates, categoryColors } from '../utils/shapes';

interface ShapeLibraryProps {
  onToolChange: (tool: Tool) => void;
  onDragStart: (tool: Tool) => void;
  currentTool: Tool;
}

const categories: { key: PhysicsCategory; label: string; icon: string }[] = [
  { key: 'electronics', label: 'Electrical', icon: '⚡' },
  { key: 'mechanics', label: 'Mechanics', icon: '⚙' },
  { key: 'electromagnetism', label: 'Electro-Magnetic', icon: '🧲' },
  { key: 'optics', label: 'Optics', icon: '🔬' },
  { key: 'waves', label: 'Waves & Sound', icon: '〰' },
  { key: 'thermodynamics', label: 'Thermodynamics', icon: '🌡' },
  { key: 'quantum', label: 'Quantum', icon: '⚛' },
  { key: 'nuclear', label: 'Nuclear', icon: '☢' },
  { key: 'misc', label: 'General', icon: '✦' },
];

const ShapeLibrary: React.FC<ShapeLibraryProps> = ({ onToolChange, onDragStart, currentTool }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<PhysicsCategory>>(
    new Set(['electronics', 'mechanics'])
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (key: PhysicsCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const getCategoryShapes = (category: PhysicsCategory) => {
    return shapeTemplates.filter(s => s.category === category);
  };

  const filteredShapes = searchQuery
    ? shapeTemplates.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const handleShapeDragStart = (e: React.DragEvent, tool: Tool) => {
    e.dataTransfer.setData('tool', tool);
    onDragStart(tool);
  };

  return (
    <div className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Shapes</h3>
          <button
            onClick={() => setExpandedCategories(new Set(categories.map(c => c.key)))}
            className="text-xs text-blue-600 hover:text-blue-700"
            title="Expand all"
          >
            ▼ All
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shapes..."
            className="w-full px-2 py-1 pl-7 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
          />
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Shape List */}
      <div className="flex-1 overflow-y-auto">
        {filteredShapes ? (
          /* Search results */
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2 px-1">
              {filteredShapes.length} result{filteredShapes.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-3 gap-1">
              {filteredShapes.map(shape => (
                <button
                  key={shape.type}
                  draggable
                  onDragStart={(e) => handleShapeDragStart(e, shape.type)}
                  onClick={() => onToolChange(shape.type)}
                  className={`group relative flex flex-col items-center justify-center p-2 rounded border transition-all ${
                    currentTool === shape.type
                      ? 'bg-blue-50 border-blue-300'
                      : 'border-transparent hover:bg-gray-100 hover:border-gray-200'
                  }`}
                  title={shape.name}
                >
                  <div className="text-lg mb-0.5">{shape.icon}</div>
                  <span className="text-[9px] text-gray-600 text-center leading-tight truncate w-full">
                    {shape.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Category list */
          categories.map(({ key, label, icon }) => {
            const shapes = getCategoryShapes(key);
            const isExpanded = expandedCategories.has(key);
            return (
              <div key={key} className="border-b border-gray-100">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(key)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-base">{icon}</span>
                  <span className="text-xs font-medium text-gray-700 flex-1 text-left">{label}</span>
                  <span className="text-[10px] text-gray-400">{shapes.length}</span>
                </button>

                {/* Shapes Grid */}
                {isExpanded && (
                  <div className="px-2 pb-2">
                    <div className="grid grid-cols-3 gap-1">
                      {shapes.map(shape => (
                        <button
                          key={shape.type}
                          draggable
                          onDragStart={(e) => handleShapeDragStart(e, shape.type)}
                          onClick={() => onToolChange(shape.type)}
                          className={`group relative flex flex-col items-center justify-center p-1.5 rounded border transition-all ${
                            currentTool === shape.type
                              ? 'bg-blue-50 border-blue-300 shadow-sm'
                              : 'border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                          }`}
                          title={`${shape.name} - ${shape.description}`}
                        >
                          <div className="text-base mb-0.5 group-hover:scale-110 transition-transform">{shape.icon}</div>
                          <span className="text-[8px] text-gray-500 text-center leading-tight truncate w-full">
                            {shape.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
        <p className="text-[10px] text-gray-500 text-center">
          Click or drag shapes onto canvas
        </p>
      </div>
    </div>
  );
};

export default ShapeLibrary;
