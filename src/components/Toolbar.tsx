import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [submenuPosition, setSubmenuPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRefs = useRef<Map<PhysicsCategory, HTMLButtonElement>>(new Map());

  const getCategoryShapes = (category: PhysicsCategory) => {
    return shapeTemplates.filter(s => s.category === category);
  };

  const handleCategoryClick = (key: PhysicsCategory, e: React.MouseEvent) => {
    if (expandedCategory === key) {
      setExpandedCategory(null);
      setSubmenuPosition(null);
    } else {
      const button = buttonRefs.current.get(key);
      if (button) {
        const rect = button.getBoundingClientRect();
        const shapes = getCategoryShapes(key);
        const estimatedHeight = Math.min(shapes.length * 36 + 40, window.innerHeight * 0.7);
        let top = rect.top;
        // Prevent submenu from going off the bottom of the screen
        if (top + estimatedHeight > window.innerHeight - 20) {
          top = Math.max(10, window.innerHeight - estimatedHeight - 20);
        }
        setSubmenuPosition({
          top,
          left: rect.right + 8,
        });
      }
      setExpandedCategory(key);
    }
  };

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (expandedCategory && !(e.target as Element).closest('.category-submenu') && !(e.target as Element).closest('.category-button')) {
        setExpandedCategory(null);
        setSubmenuPosition(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedCategory]);

  return (
    <>
      <div className="w-14 bg-gray-900 flex flex-col items-center py-2 gap-0.5 border-r border-gray-700 overflow-visible">
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
            <button
              key={key}
              ref={(el) => { if (el) buttonRefs.current.set(key, el); }}
              onClick={(e) => handleCategoryClick(key, e)}
              className={`category-button w-10 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-150 ${
                expandedCategory === key
                  ? 'bg-gray-700 text-white ring-2 ring-blue-400'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={label}
              style={{ borderLeft: `3px solid ${categoryColors[key]}` }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Submenu Portal - Rendered directly into document body to avoid any parent clipping */}
      {expandedCategory && submenuPosition && createPortal(
        <div
          className="category-submenu fixed bg-gray-800 rounded-lg shadow-2xl border border-gray-600 p-2 z-[9999] min-w-[200px] max-h-[70vh] overflow-y-auto"
          style={{
            top: submenuPosition.top,
            left: submenuPosition.left,
          }}
        >
          <div className="text-xs text-gray-400 px-2 py-1 font-semibold uppercase tracking-wide sticky top-0 bg-gray-800 rounded-t border-b border-gray-700 mb-1">
            {categories.find(c => c.key === expandedCategory)?.label}
          </div>
          {getCategoryShapes(expandedCategory).map(shape => (
            <button
              key={shape.type}
              onClick={() => {
                onToolChange(shape.type);
                setExpandedCategory(null);
                setSubmenuPosition(null);
              }}
              className={`w-full px-3 py-2 rounded-md flex items-center gap-2 text-xs transition-colors ${
                currentTool === shape.type
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center">{shape.icon}</span>
              <span className="flex-1 text-left">{shape.name}</span>
              {currentTool === shape.type && <span className="text-blue-400">✓</span>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

export default Toolbar;
