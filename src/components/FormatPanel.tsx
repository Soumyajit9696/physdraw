import React, { useState } from 'react';
import { DiagramElement } from '../types';
import katex from 'katex';

interface FormatPanelProps {
  element: DiagramElement | null;
  selectedIds: string[];
  elements: DiagramElement[];
  onUpdate: (id: string, updates: Partial<DiagramElement>) => void;
  onDelete: (id: string) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDuplicate: () => void;
}

const colorPalette = [
  '#000000', '#FFFFFF', '#E6E6E6', '#CCCCCC', '#999999', '#4D4D4D',
  '#FF0000', '#FF6600', '#FFCC00', '#FFFF00', '#CCFF00', '#66FF00',
  '#00FF00', '#00FF66', '#00FFCC', '#00FFFF', '#00CCFF', '#0066FF',
  '#0000FF', '#6600FF', '#CC00FF', '#FF00FF', '#FF00CC', '#FF0066',
  '#F8CECC', '#FFE6CC', '#FFF2CC', '#FFFFCC', '#E6F8CC', '#D9EAD3',
  '#D0E0E3', '#D9E1F2', '#CFE2F3', '#D9D2E9', '#EAD1DC', '#F4CCCC',
];

type Tab = 'style' | 'text' | 'arrange';

const FormatPanel: React.FC<FormatPanelProps> = ({
  element, selectedIds, elements, onUpdate, onDelete, onBringToFront, onSendToBack, onDuplicate
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('style');

  if (!element) {
    return (
      <div className="w-60 bg-white border-l border-gray-200 flex flex-col">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xs font-semibold text-gray-700">Format</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mb-1">No selection</p>
          <p className="text-[10px] text-gray-400">Select an element to format</p>
          {selectedIds.length > 1 && (
            <p className="text-[10px] text-blue-500 mt-2">{selectedIds.length} elements selected</p>
          )}
        </div>
        {/* Quick stats */}
        <div className="border-t border-gray-200 p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Diagram</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Elements</span>
              <span className="text-gray-700 font-medium">{elements.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'style', label: 'Style' },
    { key: 'text', label: 'Text' },
    { key: 'arrange', label: 'Arrange' },
  ];

  return (
    <div className="w-60 bg-white border-l border-gray-200 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-500 bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'style' && (
          <div className="p-3 space-y-4">
            {/* Fill */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Fill</label>
              <div className="grid grid-cols-8 gap-0.5">
                <button
                  onClick={() => onUpdate(element.id, { fillColor: undefined })}
                  className={`w-5 h-5 rounded-sm border transition-transform hover:scale-110 ${
                    !element.fillColor ? 'ring-2 ring-blue-400 ring-offset-1' : 'border-gray-200'
                  }`}
                  style={{ background: 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 50% / 6px 6px' }}
                  title="No fill"
                />
                {colorPalette.slice(0, 23).map(color => (
                  <button
                    key={`fill-${color}`}
                    onClick={() => onUpdate(element.id, { fillColor: color })}
                    className={`w-5 h-5 rounded-sm border border-gray-200 transition-transform hover:scale-110 ${
                      element.fillColor === color ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <input
                  type="color"
                  value={element.fillColor || '#ffffff'}
                  onChange={(e) => onUpdate(element.id, { fillColor: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={element.fillColor || ''}
                  onChange={(e) => onUpdate(element.id, { fillColor: e.target.value || undefined })}
                  className="flex-1 px-1.5 py-0.5 text-[10px] border border-gray-200 rounded font-mono"
                  placeholder="Hex"
                />
              </div>
            </div>

            {/* Stroke */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Stroke</label>
              <div className="grid grid-cols-8 gap-0.5">
                {colorPalette.slice(0, 24).map(color => (
                  <button
                    key={`stroke-${color}`}
                    onClick={() => onUpdate(element.id, { color })}
                    className={`w-5 h-5 rounded-sm border transition-transform hover:scale-110 ${
                      element.color === color ? 'ring-2 ring-blue-400 ring-offset-1' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <input
                  type="color"
                  value={element.color}
                  onChange={(e) => onUpdate(element.id, { color: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={element.color}
                  onChange={(e) => onUpdate(element.id, { color: e.target.value })}
                  className="flex-1 px-1.5 py-0.5 text-[10px] border border-gray-200 rounded font-mono"
                />
              </div>
            </div>

            {/* Line Width */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Line: {element.strokeWidth}px
              </label>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 6, 8].map(w => (
                  <button
                    key={w}
                    onClick={() => onUpdate(element.id, { strokeWidth: w })}
                    className={`flex-1 py-1 text-[10px] rounded border transition-colors ${
                      element.strokeWidth === w
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Style */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Line Style</label>
              <div className="flex gap-0.5">
                <button
                  onClick={() => onUpdate(element.id, { dashed: false, dashArray: undefined })}
                  className={`flex-1 py-1.5 text-[10px] rounded border transition-colors ${
                    !element.dashed ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  ──
                </button>
                <button
                  onClick={() => onUpdate(element.id, { dashed: true, dashArray: '6,3' })}
                  className={`flex-1 py-1.5 text-[10px] rounded border transition-colors ${
                    element.dashArray === '6,3' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  - -
                </button>
                <button
                  onClick={() => onUpdate(element.id, { dashed: true, dashArray: '2,2' })}
                  className={`flex-1 py-1.5 text-[10px] rounded border transition-colors ${
                    element.dashArray === '2,2' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  ···
                </button>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Opacity: {Math.round((element.opacity ?? 1) * 100)}%
              </label>
              <input
                type="range"
                min="0.1" max="1" step="0.05"
                value={element.opacity ?? 1}
                onChange={(e) => onUpdate(element.id, { opacity: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Position & Size */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Position & Size</label>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="text-[9px] text-gray-400">X</label>
                  <input type="number" value={Math.round(element.x)}
                    onChange={(e) => onUpdate(element.id, { x: Number(e.target.value) })}
                    className="w-full px-1.5 py-0.5 text-[10px] border border-gray-200 rounded" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-400">Y</label>
                  <input type="number" value={Math.round(element.y)}
                    onChange={(e) => onUpdate(element.id, { y: Number(e.target.value) })}
                    className="w-full px-1.5 py-0.5 text-[10px] border border-gray-200 rounded" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-400">W</label>
                  <input type="number" value={Math.round(element.width || 0)}
                    onChange={(e) => onUpdate(element.id, { width: Number(e.target.value) })}
                    className="w-full px-1.5 py-0.5 text-[10px] border border-gray-200 rounded" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-400">H</label>
                  <input type="number" value={Math.round(element.height || 0)}
                    onChange={(e) => onUpdate(element.id, { height: Number(e.target.value) })}
                    className="w-full px-1.5 py-0.5 text-[10px] border border-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="p-3 space-y-4">
            {element.type === 'text' && (
              <>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Text</label>
                  <textarea
                    value={element.text || ''}
                    onChange={(e) => onUpdate(element.id, { text: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Font Size: {element.fontSize || 16}px
                  </label>
                  <input
                    type="range" min="8" max="72"
                    value={element.fontSize || 16}
                    onChange={(e) => onUpdate(element.id, { fontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </>
            )}
            {element.type === 'latex' && (
              <>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">LaTeX</label>
                  <input
                    type="text"
                    value={element.latex || ''}
                    onChange={(e) => onUpdate(element.id, { latex: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded font-mono focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="E = mc^2"
                  />
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-200 flex items-center justify-center min-h-[40px]">
                  <div dangerouslySetInnerHTML={{
                    __html: katex.renderToString(element.latex || 'E=mc^2', { throwOnError: false })
                  }} />
                </div>
              </>
            )}
            {(element.type === 'arrow' || element.type === 'force' || element.type === 'ray') && (
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Label</label>
                <input
                  type="text"
                  value={element.label || ''}
                  onChange={(e) => onUpdate(element.id, { label: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="F₁"
                />
              </div>
            )}
            {element.type === 'charge' && (
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Charge</label>
                <div className="flex gap-1">
                  {(['+', '-', '0'] as const).map(sign => (
                    <button
                      key={sign}
                      onClick={() => onUpdate(element.id, { chargeSign: sign })}
                      className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                        element.chargeSign === sign ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {sign === '+' ? '+ Pos' : sign === '-' ? '− Neg' : '0 Neutral'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!['text', 'latex', 'arrow', 'force', 'ray', 'charge'].includes(element.type) && (
              <div className="text-center py-4">
                <p className="text-xs text-gray-400">No text properties for this element</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'arrange' && (
          <div className="p-3 space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Order</label>
              <div className="grid grid-cols-2 gap-1">
                <button onClick={onBringToFront} className="py-1.5 text-[10px] border border-gray-200 rounded hover:bg-gray-50">
                  ⬆ Front
                </button>
                <button onClick={onSendToBack} className="py-1.5 text-[10px] border border-gray-200 rounded hover:bg-gray-50">
                  ⬇ Back
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Actions</label>
              <div className="space-y-1">
                <button onClick={onDuplicate} className="w-full py-1.5 text-[10px] border border-gray-200 rounded hover:bg-gray-50 text-left px-2">
                  ⧉ Duplicate
                </button>
                <button onClick={() => onDelete(element.id)} className="w-full py-1.5 text-[10px] border border-red-200 rounded hover:bg-red-50 text-left px-2 text-red-600">
                  🗑 Delete
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Info</label>
              <div className="text-[10px] text-gray-500 space-y-0.5 bg-gray-50 rounded p-2">
                <div>Type: <span className="text-gray-700 capitalize">{element.type.replace(/_/g, ' ')}</span></div>
                <div>ID: <span className="text-gray-700 font-mono">{element.id.slice(0, 8)}</span></div>
                {element.nodes && <div>Nodes: <span className="text-gray-700">{element.nodes.length}</span></div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormatPanel;
