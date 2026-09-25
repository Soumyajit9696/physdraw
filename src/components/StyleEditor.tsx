import React from 'react';
import { DiagramElement } from '../types';
import katex from 'katex';

interface StyleEditorProps {
  elements: DiagramElement[];
  selectedIds: string[];
  onUpdate: (ids: string[], updates: Partial<DiagramElement>) => void;
  onDelete: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectById: (id: string) => void;
}

const colorPalette = [
  '#000000', '#1f2937', '#374151', '#6B7280', '#9CA3AF', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#FB7185',
];

const StyleEditor: React.FC<StyleEditorProps> = ({
  elements,
  selectedIds,
  onUpdate,
  onDelete,
  onSelectAll,
  onDeselectAll,
  onSelectById,
}) => {
  const selectedElements = elements.filter(el => selectedIds.includes(el.id));
  const hasSelection = selectedIds.length > 0;
  const isSingleSelect = selectedIds.length === 1;
  const singleElement = isSingleSelect ? selectedElements[0] : null;

  // Get common values for multi-select
  const getCommonValue = <T,>(getter: (el: DiagramElement) => T): T | null => {
    if (selectedElements.length === 0) return null;
    const first = getter(selectedElements[0]);
    return selectedElements.every(el => getter(el) === first) ? first : null;
  };

  const applyStyle = (updates: Partial<DiagramElement>) => {
    onUpdate(selectedIds, updates);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="text-lg">🎨</span> Style Editor
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Select elements and edit their styles</p>
      </div>

      {/* Selection Controls */}
      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">
            {hasSelection ? (
              <span className="text-blue-600">{selectedIds.length} selected</span>
            ) : (
              'No selection'
            )}
          </span>
          <div className="flex gap-1">
            <button
              onClick={onSelectAll}
              className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              Select All
            </button>
            {hasSelection && (
              <button
                onClick={onDeselectAll}
                className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Element List */}
      <div className="border-b border-gray-100 max-h-40 overflow-y-auto">
        <div className="px-2 py-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
            Elements ({elements.length})
          </div>
          {elements.map(el => (
            <button
              key={el.id}
              onClick={() => onSelectById(el.id)}
              className={`w-full px-2 py-1.5 rounded text-xs flex items-center gap-2 transition-colors ${
                selectedIds.includes(el.id)
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <div
                className="w-3 h-3 rounded-sm border"
                style={{ backgroundColor: el.fillColor || '#fff', borderColor: el.color }}
              />
              <span className="flex-1 text-left truncate capitalize">
                {el.name || el.type.replace(/_/g, ' ')}
              </span>
              {selectedIds.includes(el.id) && <span className="text-blue-500">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Style Controls */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {!hasSelection ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-3 opacity-30">🖱️</div>
            <p className="text-sm text-gray-400">Click on canvas elements to select them</p>
            <p className="text-xs text-gray-400 mt-1">Shift+click to multi-select</p>
          </div>
        ) : (
          <>
            {/* Stroke Color */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                Stroke Color
              </label>
              <div className="grid grid-cols-8 gap-1">
                {colorPalette.map(color => (
                  <button
                    key={`stroke-${color}`}
                    onClick={() => applyStyle({ color })}
                    className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 ${
                      getCommonValue(el => el.color) === color
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={getCommonValue(el => el.color) || '#000000'}
                  onChange={(e) => applyStyle({ color: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={getCommonValue(el => el.color) || ''}
                  onChange={(e) => applyStyle({ color: e.target.value })}
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Fill Color */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                Fill Color
              </label>
              <div className="grid grid-cols-8 gap-1">
                {/* No fill option */}
                <button
                  onClick={() => applyStyle({ fillColor: undefined })}
                  className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 ${
                    getCommonValue(el => el.fillColor) === undefined
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200'
                  }`}
                  style={{
                    background: 'repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 8px 8px'
                  }}
                  title="No fill"
                />
                {colorPalette.map(color => (
                  <button
                    key={`fill-${color}`}
                    onClick={() => applyStyle({ fillColor: color })}
                    className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 ${
                      getCommonValue(el => el.fillColor) === color
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={getCommonValue(el => el.fillColor) || '#ffffff'}
                  onChange={(e) => applyStyle({ fillColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                />
                <button
                  onClick={() => applyStyle({ fillColor: undefined })}
                  className="text-xs px-2 py-1 text-gray-500 hover:bg-gray-100 rounded border border-gray-200"
                >
                  Remove Fill
                </button>
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                Stroke Width: {getCommonValue(el => el.strokeWidth) ?? '—'}px
              </label>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={getCommonValue(el => el.strokeWidth) ?? 2}
                onChange={(e) => applyStyle({ strokeWidth: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 6, 8].map(w => (
                  <button
                    key={w}
                    onClick={() => applyStyle({ strokeWidth: w })}
                    className={`flex-1 py-1 text-xs rounded border transition-colors ${
                      getCommonValue(el => el.strokeWidth) === w
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                Opacity: {Math.round((getCommonValue(el => el.opacity) ?? 1) * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={getCommonValue(el => el.opacity) ?? 1}
                onChange={(e) => applyStyle({ opacity: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Dashed Stroke */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                Stroke Style
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => applyStyle({ dashed: false, dashArray: undefined })}
                  className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                    !getCommonValue(el => el.dashed)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ─── Solid
                </button>
                <button
                  onClick={() => applyStyle({ dashed: true, dashArray: '5,5' })}
                  className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                    getCommonValue(el => el.dashed)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  - - Dashed
                </button>
                <button
                  onClick={() => applyStyle({ dashed: true, dashArray: '2,2' })}
                  className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                    getCommonValue(el => el.dashArray) === '2,2'
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ··· Dotted
                </button>
              </div>
            </div>

            {/* Text-specific */}
            {isSingleSelect && singleElement?.type === 'text' && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Text Content
                </label>
                <input
                  type="text"
                  value={singleElement.text || ''}
                  onChange={(e) => onUpdate([singleElement.id], { text: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="mt-2">
                  <label className="text-xs text-gray-500 mb-1 block">Font Size: {singleElement.fontSize || 16}px</label>
                  <input
                    type="range"
                    min="8"
                    max="48"
                    value={singleElement.fontSize || 16}
                    onChange={(e) => onUpdate([singleElement.id], { fontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* LaTeX-specific */}
            {isSingleSelect && singleElement?.type === 'latex' && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  LaTeX Expression
                </label>
                <input
                  type="text"
                  value={singleElement.latex || ''}
                  onChange={(e) => onUpdate([singleElement.id], { latex: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                  placeholder="E = mc^2"
                />
                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 flex items-center justify-center min-h-[40px]">
                  <div dangerouslySetInnerHTML={{
                    __html: katex.renderToString(singleElement.latex || 'E=mc^2', { throwOnError: false })
                  }} />
                </div>
              </div>
            )}

            {/* Label */}
            {isSingleSelect && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Label / Name
                </label>
                <input
                  type="text"
                  value={singleElement!.label || ''}
                  onChange={(e) => onUpdate([singleElement!.id], { label: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Optional label"
                />
              </div>
            )}

            {/* Position & Size for single select */}
            {isSingleSelect && singleElement && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Position & Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">X</label>
                    <input
                      type="number"
                      value={Math.round(singleElement!.x)}
                      onChange={(e) => onUpdate([singleElement!.id], { x: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Y</label>
                    <input
                      type="number"
                      value={Math.round(singleElement!.y)}
                      onChange={(e) => onUpdate([singleElement!.id], { y: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Width</label>
                    <input
                      type="number"
                      value={Math.round(singleElement!.width || 0)}
                      onChange={(e) => onUpdate([singleElement!.id], { width: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Height</label>
                    <input
                      type="number"
                      value={Math.round(singleElement!.height || 0)}
                      onChange={(e) => onUpdate([singleElement!.id], { height: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              {isSingleSelect && singleElement && (
                <button
                  onClick={() => onDelete(singleElement.id)}
                  className="w-full py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  🗑 Delete Element
                </button>
              )}
              {selectedIds.length > 1 && (
                <button
                  onClick={() => selectedIds.forEach(id => onDelete(id))}
                  className="w-full py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  🗑 Delete All Selected ({selectedIds.length})
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StyleEditor;
