import React from 'react';
import { DiagramElement } from '../types';

interface PropertiesPanelProps {
  element: DiagramElement | null;
  onUpdate: (id: string, updates: Partial<DiagramElement>) => void;
  onDelete: (id: string) => void;
}

const colorOptions = [
  '#1f2937', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280',
];

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, onUpdate, onDelete }) => {
  if (!element) {
    return (
      <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 flex flex-col">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Properties</h3>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm text-center">Select an element to edit its properties</p>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Tips</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Click & drag to draw shapes</li>
            <li>• Double-click text/LaTeX to edit</li>
            <li>• Delete key removes selected</li>
            <li>• Use V for select tool</li>
            <li>• Use E for eraser tool</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Properties</h3>
        <button
          onClick={() => onDelete(element.id)}
          className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
          <p className="text-sm text-gray-700 capitalize mt-1 bg-white px-2 py-1 rounded border border-gray-200">
            {element.type}
          </p>
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-gray-500">X</label>
            <input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => onUpdate(element.id, { x: Number(e.target.value) })}
              className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Y</label>
            <input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => onUpdate(element.id, { y: Number(e.target.value) })}
              className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Size */}
        {(element.width !== undefined || element.height !== undefined) && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500">Width</label>
              <input
                type="number"
                value={Math.round(element.width || 0)}
                onChange={(e) => onUpdate(element.id, { width: Number(e.target.value) })}
                className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Height</label>
              <input
                type="number"
                value={Math.round(element.height || 0)}
                onChange={(e) => onUpdate(element.id, { height: Number(e.target.value) })}
                className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        )}

        {/* Color */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stroke Color</label>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {colorOptions.map(color => (
              <button
                key={color}
                onClick={() => onUpdate(element.id, { color })}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  element.color === color ? 'border-blue-500 scale-110' : 'border-gray-300 hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Fill Color */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fill Color</label>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <button
              onClick={() => onUpdate(element.id, { fillColor: undefined })}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                !element.fillColor ? 'border-blue-500 scale-110' : 'border-gray-300 hover:scale-110'
              }`}
              style={{ background: 'repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 8px 8px' }}
              title="No fill"
            />
            {colorOptions.map(color => (
              <button
                key={color}
                onClick={() => onUpdate(element.id, { fillColor: color })}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  element.fillColor === color ? 'border-blue-500 scale-110' : 'border-gray-300 hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Stroke Width */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stroke Width</label>
          <input
            type="range"
            min="1"
            max="8"
            value={element.strokeWidth}
            onChange={(e) => onUpdate(element.id, { strokeWidth: Number(e.target.value) })}
            className="w-full mt-2"
          />
          <span className="text-xs text-gray-500">{element.strokeWidth}px</span>
        </div>

        {/* Text */}
        {element.type === 'text' && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Text Content</label>
            <input
              type="text"
              value={element.text || ''}
              onChange={(e) => onUpdate(element.id, { text: e.target.value })}
              className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        )}

        {/* Font Size */}
        {element.type === 'text' && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Font Size</label>
            <input
              type="number"
              value={element.fontSize || 16}
              onChange={(e) => onUpdate(element.id, { fontSize: Number(e.target.value) })}
              className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        )}

        {/* LaTeX */}
        {element.type === 'latex' && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">LaTeX Expression</label>
            <input
              type="text"
              value={element.latex || ''}
              onChange={(e) => onUpdate(element.id, { latex: e.target.value })}
              className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono"
              placeholder="E = mc^2"
            />
          </div>
        )}

        {/* Label for arrows/forces */}
        {(element.type === 'arrow' || element.type === 'force') && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Label</label>
            <input
              type="text"
              value={element.label || ''}
              onChange={(e) => onUpdate(element.id, { label: e.target.value })}
              className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="F₁"
            />
          </div>
        )}

        {/* Charge label */}
        {element.type === 'charge' && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Charge</label>
            <select
              value={element.label || '+'}
              onChange={(e) => onUpdate(element.id, { label: e.target.value })}
              className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="+">Positive (+)</option>
              <option value="-">Negative (−)</option>
              <option value="q">Charge (q)</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
