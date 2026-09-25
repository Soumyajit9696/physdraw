import React from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  hasSelection: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x, y, onClose, onCut, onCopy, onPaste, onDuplicate, onDelete,
  onBringToFront, onSendToBack, hasSelection
}) => {
  const menuItems = [
    { label: 'Cut', shortcut: 'Ctrl+X', action: onCut, disabled: !hasSelection },
    { label: 'Copy', shortcut: 'Ctrl+C', action: onCopy, disabled: !hasSelection },
    { label: 'Paste', shortcut: 'Ctrl+V', action: onPaste },
    { type: 'separator' as const },
    { label: 'Duplicate', shortcut: 'Ctrl+D', action: onDuplicate, disabled: !hasSelection },
    { label: 'Delete', shortcut: 'Del', action: onDelete, disabled: !hasSelection, danger: true },
    { type: 'separator' as const },
    { label: 'Bring to Front', shortcut: ']', action: onBringToFront, disabled: !hasSelection },
    { label: 'Send to Back', shortcut: '[', action: onSendToBack, disabled: !hasSelection },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      
      {/* Menu */}
      <div
        className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] z-50"
        style={{ left: x, top: y }}
      >
        {menuItems.map((item, i) => {
          if ('type' in item && item.type === 'separator') {
            return <div key={i} className="my-1 border-t border-gray-100" />;
          }
          const menuItem = item as { label: string; shortcut?: string; action: () => void; disabled?: boolean; danger?: boolean };
          return (
            <button
              key={i}
              onClick={() => {
                menuItem.action();
                onClose();
              }}
              disabled={menuItem.disabled}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors ${
                menuItem.danger
                  ? 'text-red-600 hover:bg-red-50 disabled:opacity-40'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-700'
              }`}
            >
              <span>{menuItem.label}</span>
              {menuItem.shortcut && <span className="text-gray-400 text-[10px] ml-4">{menuItem.shortcut}</span>}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default ContextMenu;
