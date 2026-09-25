import React from 'react';
import { DiagramElement, Point } from '../types';

interface SelectionHandlesProps {
  element: DiagramElement;
  zoom: number;
  onResize: (id: string, handle: string, point: Point, original: DiagramElement) => void;
  onRotate: (id: string, angle: number) => void;
  selectedNodeId: string | null;
}

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate';

const handleCursors: Record<HandlePosition, string> = {
  nw: 'nwse-resize', n: 'ns-resize', ne: 'nesw-resize', e: 'ew-resize',
  se: 'nwse-resize', s: 'ns-resize', sw: 'nesw-resize', w: 'ew-resize',
  rotate: 'grab',
};

const SelectionHandles: React.FC<SelectionHandlesProps> = ({
  element, zoom, onResize, onRotate, selectedNodeId
}) => {
  const handleSize = 8 / zoom;
  const x = element.x;
  const y = element.y;
  const w = element.width || 60;
  const h = element.height || 60;
  const rotation = element.rotation || 0;

  // Handle positions relative to element bounds
  const handles: { pos: HandlePosition; x: number; y: number }[] = [
    { pos: 'nw', x: x, y: y },
    { pos: 'n', x: x + w / 2, y: y },
    { pos: 'ne', x: x + w, y: y },
    { pos: 'e', x: x + w, y: y + h / 2 },
    { pos: 'se', x: x + w, y: y + h },
    { pos: 's', x: x + w / 2, y: y + h },
    { pos: 'sw', x: x, y: y + h },
    { pos: 'w', x: x, y: y + h / 2 },
  ];

  const handleMouseDown = (e: React.MouseEvent, pos: HandlePosition) => {
    e.stopPropagation();
    e.preventDefault();

    if (pos === 'rotate') {
      const startX = e.clientX;
      const startY = e.clientY;
      const centerX = x + w / 2;
      const centerY = y + h / 2;
      const svg = (e.currentTarget as SVGElement).closest('svg');
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const startAngle = Math.atan2(
        (startY - rect.top) / zoom - centerY,
        (startX - rect.left) / zoom - centerX
      ) * 180 / Math.PI;
      const initialRotation = element.rotation || 0;

      const handleMove = (moveEvent: MouseEvent) => {
        const currentAngle = Math.atan2(
          (moveEvent.clientY - rect.top) / zoom - centerY,
          (moveEvent.clientX - rect.left) / zoom - centerX
        ) * 180 / Math.PI;
        const delta = currentAngle - startAngle;
        let newRotation = initialRotation + delta;
        // Snap to 15 degree increments when shift is held
        if (moveEvent.shiftKey) {
          newRotation = Math.round(newRotation / 15) * 15;
        }
        onRotate(element.id, newRotation);
      };

      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      return;
    }

    // Resize handle
    const svg = (e.currentTarget as SVGElement).closest('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const original = { ...element };

    const handleMove = (moveEvent: MouseEvent) => {
      const point: Point = {
        x: (moveEvent.clientX - rect.left) / zoom,
        y: (moveEvent.clientY - rect.top) / zoom,
      };
      onResize(element.id, pos, point, original);
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  const cx = x + w / 2;
  const cy = y + h / 2;

  return (
    <g
      transform={rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined}
      style={{ pointerEvents: 'all' }}
    >
      {/* Selection outline */}
      <rect
        x={x} y={y} width={w} height={h}
        fill="none"
        stroke="#1a73e8"
        strokeWidth={1.5 / zoom}
        strokeDasharray="none"
        pointerEvents="none"
      />

      {/* Rotation handle */}
      <line
        x1={x + w / 2} y1={y}
        x2={x + w / 2} y2={y - 25 / zoom}
        stroke="#1a73e8"
        strokeWidth={1 / zoom}
        pointerEvents="none"
      />
      <circle
        cx={x + w / 2}
        cy={y - 25 / zoom}
        r={handleSize * 0.7}
        fill="white"
        stroke="#1a73e8"
        strokeWidth={1.5 / zoom}
        style={{ cursor: 'grab' }}
        onMouseDown={(e) => handleMouseDown(e, 'rotate')}
      />

      {/* Resize handles */}
      {handles.map(({ pos, x: hx, y: hy }) => (
        <rect
          key={pos}
          x={hx - handleSize / 2}
          y={hy - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="white"
          stroke="#1a73e8"
          strokeWidth={1.5 / zoom}
          style={{ cursor: handleCursors[pos] }}
          onMouseDown={(e) => handleMouseDown(e, pos)}
        />
      ))}

      {/* Dimension labels */}
      <g pointerEvents="none">
        <rect
          x={x + w / 2 - 20 / zoom}
          y={y + h + 4 / zoom}
          width={40 / zoom}
          height={14 / zoom}
          fill="#1a73e8"
          rx={2 / zoom}
          opacity={0.9}
        />
        <text
          x={x + w / 2}
          y={y + h + 13 / zoom}
          textAnchor="middle"
          fontSize={9 / zoom}
          fill="white"
          fontWeight="500"
        >
          {Math.round(w)} × {Math.round(h)}
        </text>
      </g>
    </g>
  );
};

export default SelectionHandles;
