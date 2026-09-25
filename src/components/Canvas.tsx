import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DiagramElement, Tool, Point, NodePoint } from '../types';
import katex from 'katex';
import ElementRenderer from './ElementRenderer';
import SelectionHandles from './SelectionHandles';
import SnapGuides from './SnapGuides';

interface CanvasProps {
  elements: DiagramElement[];
  selectedIds: string[];
  tool: Tool;
  onAddElement: (element: DiagramElement) => void;
  onUpdateElement: (id: string, updates: Partial<DiagramElement>) => void;
  onSelectElements: (ids: string[]) => void;
  onDeleteElement: (id: string) => void;
  zoom: number;
  panOffset: Point;
  onPan: (offset: Point) => void;
  showGrid?: boolean;
  snapToGrid?: boolean;
  svgRef?: React.RefObject<SVGSVGElement>;
  onUpdateNodes: (id: string, nodes: NodePoint[]) => void;
  onUpdatePoints: (id: string, points: Point[]) => void;
  onDeleteNode: (elementId: string, nodeId: string) => void;
  onAddNode: (elementId: string, point: Point, afterIndex?: number) => void;
}

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 5;

const Canvas: React.FC<CanvasProps> = ({
  elements, selectedIds, tool, onAddElement, onUpdateElement,
  onSelectElements, onDeleteElement, zoom, panOffset, onPan, showGrid = true,
  snapToGrid = true, svgRef: externalSvgRef, onUpdateNodes, onUpdatePoints, onDeleteNode, onAddNode,
}) => {
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalSvgRef || internalSvgRef;

  // Use refs for interaction state to avoid stale closures
  const interactionRef = useRef<{
    mode: 'idle' | 'drawing' | 'dragging' | 'marquee';
    startPoint: Point | null;
    currentPoint: Point | null;
    dragOffsets: Map<string, Point>;
  }>({
    mode: 'idle',
    startPoint: null,
    currentPoint: null,
    dragOffsets: new Map(),
  });

  // Visual state for rendering
  const [drawPreview, setDrawPreview] = useState<{ start: Point; current: Point } | null>(null);
  const [marqueeBox, setMarqueeBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [snapGuides, setSnapGuides] = useState<{ type: 'x' | 'y'; position: number; length: number; start: number }[]>([]);
  const [editingLatex, setEditingLatex] = useState<string | null>(null);
  const [latexInput, setLatexInput] = useState('');

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);

  const getSVGPoint = useCallback((e: React.MouseEvent | MouseEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom,
    };
  }, [zoom, panOffset, svgRef]);

  // Snap to grid and other elements
  const snapPoint = useCallback((point: Point): { point: Point; guides: typeof snapGuides } => {
    const guides: typeof snapGuides = [];
    let snappedX = point.x;
    let snappedY = point.y;

    if (!snapToGrid) {
      return { point: { x: snappedX, y: snappedY }, guides: [] };
    }

    // Snap to grid
    const gridX = Math.round(point.x / GRID_SIZE) * GRID_SIZE;
    const gridY = Math.round(point.y / GRID_SIZE) * GRID_SIZE;

    if (Math.abs(point.x - gridX) < SNAP_THRESHOLD) {
      snappedX = gridX;
      guides.push({ type: 'x', position: gridX, length: 1000, start: -500 });
    }
    if (Math.abs(point.y - gridY) < SNAP_THRESHOLD) {
      snappedY = gridY;
      guides.push({ type: 'y', position: gridY, length: 1000, start: -500 });
    }

    // Snap to other elements
    elements.forEach(el => {
      if (selectedIds.includes(el.id)) return;
      const elCenterX = el.x + (el.width || 60) / 2;
      const elCenterY = el.y + (el.height || 60) / 2;

      if (Math.abs(point.x - elCenterX) < SNAP_THRESHOLD) {
        snappedX = elCenterX;
        guides.push({ type: 'x', position: elCenterX, length: el.height || 60, start: el.y });
      }
      if (Math.abs(point.x - el.x) < SNAP_THRESHOLD) {
        snappedX = el.x;
        guides.push({ type: 'x', position: el.x, length: el.height || 60, start: el.y });
      }
      if (Math.abs(point.y - elCenterY) < SNAP_THRESHOLD) {
        snappedY = elCenterY;
        guides.push({ type: 'y', position: elCenterY, length: el.width || 60, start: el.x });
      }
      if (Math.abs(point.y - el.y) < SNAP_THRESHOLD) {
        snappedY = el.y;
        guides.push({ type: 'y', position: el.y, length: el.width || 60, start: el.x });
      }
    });

    return { point: { x: snappedX, y: snappedY }, guides };
  }, [elements, selectedIds]);

  // Canvas background mouse handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle mouse button or Space+click for panning
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }
    
    if (e.button !== 0) return;
    const point = getSVGPoint(e);

    if (tool === 'select') {
      // Start marquee selection
      interactionRef.current = {
        mode: 'marquee',
        startPoint: point,
        currentPoint: point,
        dragOffsets: new Map(),
      };
      setMarqueeBox({ x: point.x, y: point.y, w: 0, h: 0 });
      if (!e.shiftKey) {
        onSelectElements([]);
      }
    } else if (tool !== 'eraser') {
      // Start drawing
      interactionRef.current = {
        mode: 'drawing',
        startPoint: point,
        currentPoint: point,
        dragOffsets: new Map(),
      };
      setDrawPreview({ start: point, current: point });
    }
  }, [tool, getSVGPoint, onSelectElements, panOffset]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    // Handle panning
    if (isPanning && panStart) {
      onPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    const point = getSVGPoint(e);
    const interaction = interactionRef.current;

    if (interaction.mode === 'drawing' && interaction.startPoint) {
      interaction.currentPoint = point;
      setDrawPreview({ start: interaction.startPoint, current: point });
    } else if (interaction.mode === 'marquee' && interaction.startPoint) {
      interaction.currentPoint = point;
      const x = Math.min(interaction.startPoint.x, point.x);
      const y = Math.min(interaction.startPoint.y, point.y);
      const w = Math.abs(point.x - interaction.startPoint.x);
      const h = Math.abs(point.y - interaction.startPoint.y);
      setMarqueeBox({ x, y, w, h });
    } else if (interaction.mode === 'dragging' && interaction.startPoint) {
      const dx = point.x - interaction.startPoint.x;
      const dy = point.y - interaction.startPoint.y;

      interaction.dragOffsets.forEach((offset, id) => {
        const newPos = { x: offset.x + dx, y: offset.y + dy };
        const snapped = snapPoint(newPos);
        onUpdateElement(id, { x: snapped.point.x, y: snapped.point.y });
        setSnapGuides(snapped.guides);
      });
    }
  }, [getSVGPoint, snapPoint, onUpdateElement]);

  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    // Stop panning
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    const point = getSVGPoint(e);
    const interaction = interactionRef.current;

    if (interaction.mode === 'drawing' && interaction.startPoint) {
      // Create element
      const start = interaction.startPoint;
      const x = Math.min(start.x, point.x);
      const y = Math.min(start.y, point.y);
      const w = Math.max(Math.abs(point.x - start.x), 20);
      const h = Math.max(Math.abs(point.y - start.y), 20);

      const id = crypto.randomUUID();
      const newElement: DiagramElement = {
        id, type: tool,
        x, y, width: w, height: h,
        color: '#1f2937', strokeWidth: 2,
        nodes: [],
      };

      if (tool === 'text') newElement.text = 'Text';
      if (tool === 'latex') newElement.latex = 'E = mc^2';

      if (['line', 'arrow', 'wire', 'force', 'ray', 'decay_arrow', 'dimension', 'optical_axis', 'fieldline'].includes(tool)) {
        newElement.points = [start, point];
        newElement.nodes = [
          { id: crypto.randomUUID(), x: start.x, y: start.y, type: 'vertex' },
          { id: crypto.randomUUID(), x: point.x, y: point.y, type: 'vertex' },
        ];
      }

      onAddElement(newElement);
      setDrawPreview(null);
    } else if (interaction.mode === 'marquee' && interaction.startPoint) {
      // Complete marquee selection
      const x1 = Math.min(interaction.startPoint.x, point.x);
      const y1 = Math.min(interaction.startPoint.y, point.y);
      const x2 = Math.max(interaction.startPoint.x, point.x);
      const y2 = Math.max(interaction.startPoint.y, point.y);

      const selected = elements.filter(el => {
        const elX = el.x;
        const elY = el.y;
        const elW = el.width || 60;
        const elH = el.height || 60;
        return elX >= x1 && elY >= y1 && elX + elW <= x2 && elY + elH <= y2;
      }).map(el => el.id);

      if (selected.length > 0) {
        onSelectElements(selected);
      }

      setMarqueeBox(null);
    } else if (interaction.mode === 'dragging') {
      setSnapGuides([]);
    }

    interactionRef.current = {
      mode: 'idle',
      startPoint: null,
      currentPoint: null,
      dragOffsets: new Map(),
    };
  }, [tool, getSVGPoint, elements, onAddElement, onSelectElements]);

  // Element mouse handlers
  const handleElementMouseDown = useCallback((e: React.MouseEvent, element: DiagramElement) => {
    e.stopPropagation();
    e.preventDefault();

    if (tool === 'eraser') {
      onDeleteElement(element.id);
      return;
    }

    if (tool === 'select') {
      const point = getSVGPoint(e);

      // Select element
      let newSelection = selectedIds;
      if (e.shiftKey) {
        if (selectedIds.includes(element.id)) {
          newSelection = selectedIds.filter(id => id !== element.id);
        } else {
          newSelection = [...selectedIds, element.id];
        }
      } else {
        newSelection = [element.id];
      }
      onSelectElements(newSelection);

      // Start dragging
      const offsets = new Map<string, Point>();
      newSelection.forEach(id => {
        const el = elements.find(e => e.id === id);
        if (el) offsets.set(id, { x: el.x, y: el.y });
      });

      interactionRef.current = {
        mode: 'dragging',
        startPoint: point,
        currentPoint: point,
        dragOffsets: offsets,
      };
    }
  }, [tool, getSVGPoint, selectedIds, elements, onSelectElements, onDeleteElement]);

  const handleElementDoubleClick = useCallback((e: React.MouseEvent, element: DiagramElement) => {
    e.stopPropagation();
    if (element.type === 'latex') {
      setEditingLatex(element.id);
      setLatexInput(element.latex || '');
    } else if (element.type === 'text') {
      const newText = prompt('Enter text:', element.text || '');
      if (newText !== null) onUpdateElement(element.id, { text: newText });
    }
  }, [onUpdateElement]);

  // Resize handler
  const handleResize = useCallback((id: string, handle: string, point: Point, original: DiagramElement) => {
    const x = original.x;
    const y = original.y;
    const w = original.width || 60;
    const h = original.height || 60;

    let newX = x, newY = y, newW = w, newH = h;

    switch (handle) {
      case 'nw': newX = point.x; newY = point.y; newW = x + w - point.x; newH = y + h - point.y; break;
      case 'n': newY = point.y; newH = y + h - point.y; break;
      case 'ne': newY = point.y; newW = point.x - x; newH = y + h - point.y; break;
      case 'e': newW = point.x - x; break;
      case 'se': newW = point.x - x; newH = point.y - y; break;
      case 's': newH = point.y - y; break;
      case 'sw': newX = point.x; newW = x + w - point.x; newH = point.y - y; break;
      case 'w': newX = point.x; newW = x + w - point.x; break;
    }

    const minSize = 20;
    if (newW < minSize) { newW = minSize; if (handle.includes('w')) newX = x + w - minSize; }
    if (newH < minSize) { newH = minSize; if (handle.includes('n')) newY = y + h - minSize; }

    onUpdateElement(id, { x: newX, y: newY, width: newW, height: newH });
  }, [onUpdateElement]);

  const handleRotate = useCallback((id: string, angle: number) => {
    onUpdateElement(id, { rotation: angle });
  }, [onUpdateElement]);

  // Render draw preview
  const renderDrawPreview = () => {
    if (!drawPreview) return null;
    const { start, current } = drawPreview;
    const isLine = ['line', 'arrow', 'wire', 'force', 'ray', 'decay_arrow', 'dimension', 'optical_axis', 'fieldline'].includes(tool);

    if (isLine) {
      return (
        <line
          x1={start.x} y1={start.y}
          x2={current.x} y2={current.y}
          stroke="#1a73e8" strokeWidth={2 / zoom}
          strokeDasharray={`${5 / zoom},${5 / zoom}`}
          opacity={0.7}
        />
      );
    }

    const x = Math.min(start.x, current.x);
    const y = Math.min(start.y, current.y);
    const w = Math.abs(current.x - start.x);
    const h = Math.abs(current.y - start.y);

    if (tool === 'circle') {
      const r = Math.sqrt(w * w + h * h) / 2;
      return (
        <circle
          cx={start.x + (current.x - start.x) / 2}
          cy={start.y + (current.y - start.y) / 2}
          r={r}
          stroke="#1a73e8" strokeWidth={2 / zoom}
          strokeDasharray={`${5 / zoom},${5 / zoom}`}
          fill="rgba(26, 115, 232, 0.1)"
        />
      );
    }

    return (
      <rect
        x={x} y={y} width={w} height={h}
        stroke="#1a73e8" strokeWidth={2 / zoom}
        strokeDasharray={`${5 / zoom},${5 / zoom}`}
        fill="rgba(26, 115, 232, 0.1)"
      />
    );
  };

  const getCursor = () => {
    if (isPanning) return 'grabbing';
    if (tool === 'select') return interactionRef.current.mode === 'dragging' ? 'grabbing' : 'default';
    if (tool === 'eraser') return 'crosshair';
    return 'crosshair';
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      {showGrid && (
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
          backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
        }} />
      )}

      <svg
        ref={svgRef}
        className="w-full h-full relative z-10"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={() => {
          interactionRef.current = { mode: 'idle', startPoint: null, currentPoint: null, dragOffsets: new Map() };
          setDrawPreview(null);
          setMarqueeBox(null);
          setSnapGuides([]);
        }}
        style={{ cursor: getCursor() }}
      >
        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
          {/* Render elements */}
          {elements.map(element => (
            <g key={element.id}>
              {element.type === 'latex' ? (
                <foreignObject
                  x={element.x} y={element.y}
                  width={element.width || 200} height={element.height || 60}
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  onDoubleClick={(e) => handleElementDoubleClick(e, element)}
                  style={{ cursor: tool === 'select' ? 'move' : 'crosshair', overflow: 'visible' }}
                >
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div dangerouslySetInnerHTML={{
                      __html: katex.renderToString(element.latex || 'E=mc^2', { throwOnError: false, displayMode: false }),
                    }} />
                  </div>
                </foreignObject>
              ) : (
                <ElementRenderer
                  element={element}
                  isSelected={selectedIds.includes(element.id)}
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => handleElementDoubleClick(e, element)}
                  tool={tool}
                />
              )}
            </g>
          ))}

          {/* Selection handles */}
          {tool === 'select' && selectedIds.length === 1 && (() => {
            const el = elements.find(e => e.id === selectedIds[0]);
            if (!el) return null;
            return (
              <SelectionHandles
                element={el}
                zoom={zoom}
                onResize={handleResize}
                onRotate={handleRotate}
                selectedNodeId={null}
              />
            );
          })()}

          {/* Snap guides */}
          <SnapGuides guides={snapGuides} zoom={zoom} />

          {/* Draw preview */}
          {renderDrawPreview()}

          {/* Marquee */}
          {marqueeBox && (
            <rect
              x={marqueeBox.x} y={marqueeBox.y}
              width={marqueeBox.w} height={marqueeBox.h}
              stroke="#1a73e8" strokeWidth={1 / zoom}
              strokeDasharray={`${4 / zoom},${4 / zoom}`}
              fill="rgba(26, 115, 232, 0.05)"
            />
          )}
        </g>
      </svg>

      {/* LaTeX Editor Modal */}
      {editingLatex && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 z-50 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Edit LaTeX Expression</h3>
          <input
            type="text" value={latexInput}
            onChange={(e) => setLatexInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="E = mc^2" autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') { onUpdateElement(editingLatex, { latex: latexInput }); setEditingLatex(null); } }}
          />
          <div className="mt-3 p-3 bg-gray-50 rounded-md min-h-[40px] flex items-center justify-center">
            <div dangerouslySetInnerHTML={{ __html: katex.renderToString(latexInput || 'E=mc^2', { throwOnError: false }) }} />
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button onClick={() => { setEditingLatex(null); setLatexInput(''); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
            <button onClick={() => { onUpdateElement(editingLatex, { latex: latexInput }); setEditingLatex(null); }} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
