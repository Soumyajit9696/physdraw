import React, { useState, useRef, useEffect } from 'react';
import { Tool } from '../types';

interface TopBarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onTemplates: () => void;
  onFormulas: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onCut: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onLock: () => void;
  onUnlock: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignTop: () => void;
  onAlignMiddle: () => void;
  onAlignBottom: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showRulers: boolean;
  onToggleRulers: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  currentTool, onToolChange, onUndo, onRedo, onClear, onSave, onLoad,
  onExport, onTemplates, onFormulas, onDelete, onDuplicate, onCopy, onPaste, onCut,
  onGroup, onUngroup, onLock, onUnlock, onAlignLeft, onAlignCenter, onAlignRight,
  onAlignTop, onAlignMiddle, onAlignBottom, zoom, onZoomIn, onZoomOut, onZoomReset,
  showGrid, onToggleGrid, showRulers, onToggleRulers, snapToGrid, onToggleSnap,
  canUndo, canRedo, hasSelection
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tools = [
    { tool: 'select' as Tool, icon: '⬚', label: 'Select', shortcut: 'V' },
    { tool: 'line' as Tool, icon: '╱', label: 'Line', shortcut: 'L' },
    { tool: 'arrow' as Tool, icon: '→', label: 'Arrow', shortcut: 'A' },
    { tool: 'rectangle' as Tool, icon: '□', label: 'Rectangle', shortcut: 'R' },
    { tool: 'circle' as Tool, icon: '○', label: 'Circle', shortcut: 'C' },
    { tool: 'text' as Tool, icon: 'T', label: 'Text', shortcut: 'T' },
    { tool: 'wire' as Tool, icon: '—', label: 'Wire', shortcut: 'W' },
    { tool: 'eraser' as Tool, icon: '⌫', label: 'Eraser', shortcut: 'E' },
  ];

  const menus = {
    file: [
      { label: 'New', action: onClear, shortcut: 'Ctrl+N' },
      { label: 'Save', action: onSave, shortcut: 'Ctrl+S' },
      { label: 'Open', action: onLoad, shortcut: 'Ctrl+O' },
      { type: 'separator' as const },
      { label: 'Export...', action: onExport, shortcut: 'Ctrl+E' },
    ],
    edit: [
      { label: 'Undo', action: onUndo, shortcut: 'Ctrl+Z', disabled: !canUndo },
      { label: 'Redo', action: onRedo, shortcut: 'Ctrl+Y', disabled: !canRedo },
      { type: 'separator' as const },
      { label: 'Cut', action: onCut, shortcut: 'Ctrl+X', disabled: !hasSelection },
      { label: 'Copy', action: onCopy, shortcut: 'Ctrl+C', disabled: !hasSelection },
      { label: 'Paste', action: onPaste, shortcut: 'Ctrl+V' },
      { type: 'separator' as const },
      { label: 'Duplicate', action: onDuplicate, shortcut: 'Ctrl+D', disabled: !hasSelection },
      { label: 'Delete', action: onDelete, shortcut: 'Del', disabled: !hasSelection },
      { type: 'separator' as const },
      { label: 'Select All', action: () => {}, shortcut: 'Ctrl+A' },
      { label: 'Group', action: onGroup, shortcut: 'Ctrl+G', disabled: !hasSelection },
      { label: 'Ungroup', action: onUngroup, shortcut: 'Ctrl+U', disabled: !hasSelection },
      { type: 'separator' as const },
      { label: 'Lock', action: onLock, shortcut: 'Ctrl+L', disabled: !hasSelection },
      { label: 'Unlock', action: onUnlock, disabled: !hasSelection },
    ],
    view: [
      { label: showGrid ? '✓ Grid' : 'Grid', action: onToggleGrid },
      { label: showRulers ? '✓ Rulers' : 'Rulers', action: onToggleRulers },
      { label: snapToGrid ? '✓ Snap to Grid' : 'Snap to Grid', action: onToggleSnap },
      { type: 'separator' as const },
      { label: 'Zoom In', action: onZoomIn, shortcut: 'Ctrl+=' },
      { label: 'Zoom Out', action: onZoomOut, shortcut: 'Ctrl+-' },
      { label: 'Zoom 100%', action: onZoomReset, shortcut: 'Ctrl+0' },
    ],
    arrange: [
      { label: 'Bring to Front', action: () => {}, shortcut: ']', disabled: !hasSelection },
      { label: 'Send to Back', action: () => {}, shortcut: '[', disabled: !hasSelection },
      { type: 'separator' as const },
      { label: 'Align Left', action: onAlignLeft, disabled: !hasSelection },
      { label: 'Align Center', action: onAlignCenter, disabled: !hasSelection },
      { label: 'Align Right', action: onAlignRight, disabled: !hasSelection },
      { type: 'separator' as const },
      { label: 'Align Top', action: onAlignTop, disabled: !hasSelection },
      { label: 'Align Middle', action: onAlignMiddle, disabled: !hasSelection },
      { label: 'Align Bottom', action: onAlignBottom, disabled: !hasSelection },
    ],
    insert: [
      { label: 'Templates...', action: onTemplates },
      { label: 'Physics Formulas...', action: onFormulas },
    ],
  };

  return (
    <div className="bg-white border-b border-gray-200 select-none" ref={menuRef}>
      {/* Menu Bar */}
      <div className="flex items-center h-8 px-2 border-b border-gray-100">
        {/* Logo */}
        <div className="flex items-center gap-1.5 mr-4">
          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">φ</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">PhysicsDraw</span>
        </div>

        {/* Menus */}
        {Object.entries(menus).map(([key, items]) => (
          <div key={key} className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === key ? null : key)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                openMenu === key ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
            {openMenu === key && (
              <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[180px] z-50">
                {items.map((item, i) => {
                  if ('type' in item && item.type === 'separator') {
                    return <div key={i} className="my-1 border-t border-gray-100" />;
                  }
                  const menuItem = item as { label: string; action: () => void; shortcut?: string; disabled?: boolean };
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        menuItem.action();
                        setOpenMenu(null);
                      }}
                      disabled={menuItem.disabled}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                    >
                      <span>{menuItem.label}</span>
                      {menuItem.shortcut && <span className="text-gray-400 text-[10px] ml-4">{menuItem.shortcut}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <div className="flex-1" />

        {/* Quick actions */}
        <div className="flex items-center gap-1">
          <button onClick={onTemplates} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded" title="Templates">
            📋 Templates
          </button>
          <button onClick={onFormulas} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded" title="Physics Formulas">
            ∑ Formulas
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button onClick={onExport} className="px-2.5 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded font-medium">
            📤 Export
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center h-10 px-2 gap-0.5">
        {/* Undo/Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Tools */}
        {tools.map(({ tool, icon, label, shortcut }) => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-all ${
              currentTool === tool
                ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={`${label} (${shortcut})`}
          >
            {icon}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Delete & Duplicate */}
        <button
          onClick={onDuplicate}
          disabled={!hasSelection}
          className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          title="Duplicate (Ctrl+D)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          disabled={!hasSelection}
          className="w-8 h-8 flex items-center justify-center rounded text-red-500 hover:bg-red-50 disabled:opacity-30"
          title="Delete (Del)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Grid toggle */}
        <button
          onClick={onToggleGrid}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-all ${
            showGrid ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:bg-gray-100'
          }`}
          title="Toggle Grid"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>

        <div className="flex-1" />

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5 bg-gray-50 rounded px-1">
          <button onClick={onZoomOut} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded text-xs">−</button>
          <button onClick={onZoomReset} className="px-1.5 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded text-[10px] min-w-[40px]">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={onZoomIn} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded text-xs">+</button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
