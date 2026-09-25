import React, { useState } from 'react';
import { DiagramElement, NodePoint } from '../types';
import katex from 'katex';

interface PropertiesPanelProps {
  element: DiagramElement | null;
  selectedIds: string[];
  onUpdate: (id: string, updates: Partial<DiagramElement>) => void;
  onDelete: (id: string) => void;
}

const colorOptions = [
  '#1f2937', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#000000', '#FFFFFF',
];

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, selectedIds, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'nodes'>('properties');

  if (selectedIds.length === 0) {
    return (
      <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 flex flex-col">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Properties</h3>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm text-center">Select an element to edit its properties</p>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Tips</h4>
          <ul className="text-xs text-gray-400 space-y-1.5">
            <li>• <b>Click</b> element to select</li>
            <li>• <b>Shift+Click</b> to multi-select</li>
            <li>• <b>Drag nodes</b> to reshape</li>
            <li>• <b>Right-click node</b> to delete it</li>
            <li>• <b>Click +</b> on edge to add node</li>
            <li>• <b>Double-click node</b> to label</li>
            <li>• <b>Double-click</b> text/LaTeX to edit</li>
            <li>• <b>Delete</b> removes selected</li>
            <li>• <b>Ctrl+A</b> select all</li>
            <li>• <b>[ / ]</b> send to back/front</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!element) {
    return (
      <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Selection</h3>
        <p className="text-sm text-gray-600">{selectedIds.length} elements selected</p>
        <button
          onClick={() => selectedIds.forEach(id => onDelete(id))}
          className="mt-4 w-full px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm font-medium"
        >
          Delete All Selected
        </button>
      </div>
    );
  }

  const hasNodes = element.nodes && element.nodes.length > 0;

  return (
    <div className="w-72 bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${activeTab === 'properties' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Properties
        </button>
        {hasNodes && (
          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${activeTab === 'nodes' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Nodes ({element.nodes?.length})
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Properties</h3>
              <button onClick={() => onDelete(element.id)} className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50">
                Delete
              </button>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
              <p className="text-sm text-gray-700 capitalize mt-1 bg-white px-2 py-1 rounded border border-gray-200">
                {element.type.replace(/_/g, ' ')}
              </p>
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-500">X</label>
                <input type="number" value={Math.round(element.x)}
                  onChange={(e) => onUpdate(element.id, { x: Number(e.target.value) })}
                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Y</label>
                <input type="number" value={Math.round(element.y)}
                  onChange={(e) => onUpdate(element.id, { y: Number(e.target.value) })}
                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
            </div>

            {/* Size */}
            {(element.width !== undefined || element.height !== undefined) && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Width</label>
                  <input type="number" value={Math.round(element.width || 0)}
                    onChange={(e) => onUpdate(element.id, { width: Number(e.target.value) })}
                    className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Height</label>
                  <input type="number" value={Math.round(element.height || 0)}
                    onChange={(e) => onUpdate(element.id, { height: Number(e.target.value) })}
                    className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
              </div>
            )}

            {/* Stroke Color */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stroke Color</label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {colorOptions.map(color => (
                  <button key={color} onClick={() => onUpdate(element.id, { color })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${element.color === color ? 'border-blue-500 scale-110' : 'border-gray-300 hover:scale-110'}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>

            {/* Fill Color */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fill Color</label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <button onClick={() => onUpdate(element.id, { fillColor: undefined })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${!element.fillColor ? 'border-blue-500 scale-110' : 'border-gray-300 hover:scale-110'}`}
                  style={{ background: 'repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 8px 8px' }} title="No fill" />
                {colorOptions.map(color => (
                  <button key={color} onClick={() => onUpdate(element.id, { fillColor: color })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${element.fillColor === color ? 'border-blue-500 scale-110' : 'border-gray-300 hover:scale-110'}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stroke Width</label>
              <input type="range" min="1" max="8" value={element.strokeWidth}
                onChange={(e) => onUpdate(element.id, { strokeWidth: Number(e.target.value) })}
                className="w-full mt-2" />
              <span className="text-xs text-gray-500">{element.strokeWidth}px</span>
            </div>

            {/* Opacity */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Opacity</label>
              <input type="range" min="0.1" max="1" step="0.1" value={element.opacity ?? 1}
                onChange={(e) => onUpdate(element.id, { opacity: Number(e.target.value) })}
                className="w-full mt-2" />
              <span className="text-xs text-gray-500">{Math.round((element.opacity ?? 1) * 100)}%</span>
            </div>

            {/* Text */}
            {element.type === 'text' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Text Content</label>
                  <input type="text" value={element.text || ''}
                    onChange={(e) => onUpdate(element.id, { text: e.target.value })}
                    className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Font Size</label>
                  <input type="number" value={element.fontSize || 16}
                    onChange={(e) => onUpdate(element.id, { fontSize: Number(e.target.value) })}
                    className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
              </>
            )}

            {/* LaTeX */}
            {element.type === 'latex' && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">LaTeX Expression</label>
                <input type="text" value={element.latex || ''}
                  onChange={(e) => onUpdate(element.id, { latex: e.target.value })}
                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono"
                  placeholder="E = mc^2" />
                <div className="mt-2 p-2 bg-white rounded border border-gray-200 flex items-center justify-center">
                  <div dangerouslySetInnerHTML={{ __html: katex.renderToString(element.latex || '', { throwOnError: false }) }} />
                </div>
              </div>
            )}

            {/* Label for arrows/forces */}
            {(element.type === 'arrow' || element.type === 'force' || element.type === 'ray' || element.type === 'decay_arrow' || element.type === 'dimension') && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Label</label>
                <input type="text" value={element.label || ''}
                  onChange={(e) => onUpdate(element.id, { label: e.target.value })}
                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="F₁" />
              </div>
            )}

            {/* Charge sign */}
            {element.type === 'charge' && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Charge</label>
                <select value={element.chargeSign || '+'}
                  onChange={(e) => onUpdate(element.id, { chargeSign: e.target.value as '+' | '-' | '0' })}
                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="+">Positive (+)</option>
                  <option value="-">Negative (−)</option>
                  <option value="0">Neutral (0)</option>
                </select>
              </div>
            )}

            {/* Lens type */}
            {element.type === 'lens' && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lens Type</label>
                <select value={element.lensType || 'convex'}
                  onChange={(e) => onUpdate(element.id, { lensType: e.target.value as 'convex' | 'concave' })}
                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="convex">Convex (Converging)</option>
                  <option value="concave">Concave (Diverging)</option>
                </select>
              </div>
            )}

            {/* Spring coils */}
            {element.type === 'spring' && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Number of Coils</label>
                <input type="number" min="3" max="20" value={element.springCoils || 8}
                  onChange={(e) => onUpdate(element.id, { springCoils: Number(e.target.value) })}
                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
            )}

            {/* Name/ID */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
              <input type="text" value={element.name || ''}
                onChange={(e) => onUpdate(element.id, { name: e.target.value })}
                className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Optional name" />
            </div>
          </div>
        ) : (
          /* Nodes Tab */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Nodes</h3>
              <span className="text-xs text-gray-400">{element.nodes?.length || 0} nodes</span>
            </div>
            <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
              💡 Drag nodes on canvas to reshape. Right-click to delete. Double-click to label.
            </p>
            <div className="space-y-1">
              {element.nodes?.map((node, i) => (
                <div key={node.id} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 hover:border-blue-300">
                  <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-xs text-blue-600 font-medium">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">
                      ({Math.round(node.x)}, {Math.round(node.y)})
                    </div>
                    {node.label && <div className="text-xs text-gray-700 font-medium">{node.label}</div>}
                  </div>
                  <input
                    type="text"
                    value={node.label || ''}
                    onChange={(e) => {
                      const newNodes = element.nodes!.map((n, idx) => idx === i ? { ...n, label: e.target.value } : n);
                      onUpdate(element.id, { nodes: newNodes });
                    }}
                    className="w-16 px-1 py-0.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="Label"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
