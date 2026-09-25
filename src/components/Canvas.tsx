import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DiagramElement, Tool, Point, NodePoint } from '../types';
import katex from 'katex';
import ElementRenderer from './ElementRenderer';
import NodesOverlay from './NodesOverlay';
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
  showGrid?: boolean;
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
  onSelectElements, onDeleteElement, zoom, showGrid = true,
  svgRef: externalSvgRef, onUpdateNodes, onUpdatePoints, onDeleteNode, onAddNode,
}) => {
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalSvgRef || internalSvgRef;

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<Point | null>(null);

  // Selection/moving state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragOffsets, setDragOffsets] = useState<Map<string, Point>>(new Map());

  // Marquee selection
  const [isMarquee, setIsMarquee] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<Point | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<Point | null>(null);

  // Snap guides
  const [snapGuides, setSnapGuides] = useState<{ type: 'x' | 'y'; position: number; length: number; start: number }[]>([]);

  // LaTeX editing
  const [editingLatex, setEditingLatex] = useState<string | null>(null);
  const [latexInput, setLatexInput] = useState('');

  const getSVGPoint = useCallback((e: React.MouseEvent | MouseEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  }, [zoom, svgRef]);

  // Snap to grid
  const snapToGrid = useCallback((point: Point): { point: Point; guides: typeof snapGuides } => {
    const guides: typeof snapGuides = [];
    let snappedX = point.x;
    let snappedY = point.y;

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
      const elCenterX = el.x + (el.width || 0) / 2;
      const elCenterY = el.y + (el.height || 0) / 2;

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

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    const point = getSVGPoint(e);

    if (tool === 'select') {
      // Start marquee selection
      setIsMarquee(true);
      setMarqueeStart(point);
      setMarqueeEnd(point);
      if (!e.shiftKey) {
        onSelectElements([]);
      }
    } else if (tool === 'eraser') {
      // Eraser handled by element click
    } else {
      // Start drawing
      setIsDrawing(true);
      setDrawStart(point);
      setDrawCurrent(point);
    }
  }, [tool, getSVGPoint, onSelectElements]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const point = getSVGPoint(e);

    if (isDrawing && drawStart) {
      setDrawCurrent(point);
    } else if (isMarquee && marqueeStart) {
      setMarqueeEnd(point);
    } else if (isDragging && dragStart) {
      const dx = point.x - dragStart.x;
      const dy = point.y - dragStart.y;

      dragOffsets.forEach((offset, id) => {
        const newPos = { x: offset.x + dx, y: offset.y + dy };
        const snapped = snapToGrid(newPos);
        onUpdateElement(id, { x: snapped.point.x, y: snapped.point.y });
        setSnapGuides(snapped.guides);
      });
    }
  }, [isDrawing, drawStart, isMarquee, marqueeStart, isDragging, dragStart, dragOffsets, getSVGPoint, snapToGrid, onUpdateElement]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const point = getSVGPoint(e);

    if (isDrawing && drawStart) {
      // Create element with dragged bounds
      const x = Math.min(drawStart.x, point.x);
      const y = Math.min(drawStart.y, point.y);
      const w = Math.abs(point.x - drawStart.x);
      const h = Math.abs(point.y - drawStart.y);

      // Minimum size
      const minSize = 10;
      const width = Math.max(w, minSize);
      const height = Math.max(h, minSize);

      const id = crypto.randomUUID();
      const newElement: DiagramElement = {
        id, type: tool,
        x, y, width, height,
        color: '#1f2937', strokeWidth: 2,
        nodes: [],
      };

      // Set default content
      if (tool === 'text') newElement.text = 'Text';
      if (tool === 'latex') newElement.latex = 'E = mc^2';

      // Set points for line-based elements
      if (['line', 'arrow', 'wire', 'force', 'ray', 'decay_arrow', 'dimension', 'optical_axis', 'fieldline'].includes(tool)) {
        newElement.points = [drawStart, point];
        newElement.nodes = [
          { id: crypto.randomUUID(), x: drawStart.x, y: drawStart.y, type: 'vertex' },
          { id: crypto.randomUUID(), x: point.x, y: point.y, type: 'vertex' },
        ];
      }

      onAddElement(newElement);
      setIsDrawing(false);
      setDrawStart(null);
      setDrawCurrent(null);
    } else if (isMarquee && marqueeStart) {
      // Complete marquee selection
      const x1 = Math.min(marqueeStart.x, point.x);
      const y1 = Math.min(marqueeStart.y, point.y);
      const x2 = Math.max(marqueeStart.x, point.x);
      const y2 = Math.max(marqueeStart.y, point.y);

      // Find elements within marquee
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

      setIsMarquee(false);
      setMarqueeStart(null);
      setMarqueeEnd(null);
    } else if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setDragOffsets(new Map());
      setSnapGuides([]);
    }
  }, [isDrawing, drawStart, isMarquee, marqueeStart, isDragging, tool, getSVGPoint, elements, onAddElement, onSelectElements]);

  // Element interaction
  const handleElementMouseDown = useCallback((e: React.MouseEvent, element: DiagramElement) => {
    e.stopPropagation();

    if (tool === 'eraser') {
      onDeleteElement(element.id);
      return;
    }

    if (tool === 'select') {
      const point = getSVGPoint(e);

      // Select element
      if (e.shiftKey) {
        if (selectedIds.includes(element.id)) {
          onSelectElements(selectedIds.filter(id => id !== element.id));
        } else {
          onSelectElements([...selectedIds, element.id]);
        }
      } else if (!selectedIds.includes(element.id)) {
        onSelectElements([element.id]);
      }

      // Start dragging
      setIsDragging(true);
      setDragStart(point);
      const offsets = new Map<string, Point>();
      const idsToMove = selectedIds.includes(element.id) ? selectedIds : [element.id];
      idsToMove.forEach(id => {
        const el = elements.find(e => e.id === id);
        if (el) offsets.set(id, { x: el.x, y: el.y });
      });
      setDragOffsets(offsets);
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

    // Minimum size
    const minSize = 20;
    if (newW < minSize) { newW = minSize; if (handle.includes('w')) newX = x + w - minSize; }
    if (newH < minSize) { newH = minSize; if (handle.includes('n')) newY = y + h - minSize; }

    onUpdateElement(id, { x: newX, y: newY, width: newW, height: newH });
  }, [onUpdateElement]);

  const handleRotate = useCallback((id: string, angle: number) => {
    onUpdateElement(id, { rotation: angle });
  }, [onUpdateElement]);

  // Render preview while drawing
  const renderDrawPreview = () => {
    if (!isDrawing || !drawStart || !drawCurrent) return null;

    const isLine = ['line', 'arrow', 'wire', 'force', 'ray', 'decay_arrow', 'dimension', 'optical_axis', 'fieldline'].includes(tool);

    if (isLine) {
      return (
        <line
          x1={drawStart.x} y1={drawStart.y}
          x2={drawCurrent.x} y2={drawCurrent.y}
          stroke="#1a73e8" strokeWidth={2 / zoom}
          strokeDasharray={`${5 / zoom},${5 / zoom}`}
          opacity={0.7}
        />
      );
    }

    const x = Math.min(drawStart.x, drawCurrent.x);
    const y = Math.min(drawStart.y, drawCurrent.y);
    const w = Math.abs(drawCurrent.x - drawStart.x);
    const h = Math.abs(drawCurrent.y - drawStart.y);

    if (tool === 'circle') {
      const r = Math.sqrt(w * w + h * h) / 2;
      return (
        <circle
          cx={drawStart.x + (drawCurrent.x - drawStart.x) / 2}
          cy={drawStart.y + (drawCurrent.y - drawStart.y) / 2}
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

  // Render marquee
  const renderMarquee = () => {
    if (!isMarquee || !marqueeStart || !marqueeEnd) return null;
    const x = Math.min(marqueeStart.x, marqueeEnd.x);
    const y = Math.min(marqueeStart.y, marqueeEnd.y);
    const w = Math.abs(marqueeEnd.x - marqueeStart.x);
    const h = Math.abs(marqueeEnd.y - marqueeStart.y);

    return (
      <rect
        x={x} y={y} width={w} height={h}
        stroke="#1a73e8" strokeWidth={1 / zoom}
        strokeDasharray={`${4 / zoom},${4 / zoom}`}
        fill="rgba(26, 115, 232, 0.05)"
      />
    );
  };

  // Get cursor
  const getCursor = () => {
    if (tool === 'select') return isDragging ? 'grabbing' : 'default';
    if (tool === 'eraser') return 'crosshair';
    return 'crosshair';
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      {/* Grid */}
      {showGrid && (
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
          backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
        }} />
      )}

      <svg
        ref={svgRef}
        className="w-full h-full relative z-10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDrawing) { setIsDrawing(false); setDrawStart(null); setDrawCurrent(null); }
          if (isMarquee) { setIsMarquee(false); setMarqueeStart(null); setMarqueeEnd(null); }
          if (isDragging) { setIsDragging(false); setDragStart(null); setDragOffsets(new Map()); setSnapGuides([]); }
        }}
        style={{ cursor: getCursor() }}
      >
        <g transform={`scale(${zoom})`}>
          {/* Render elements */}
          {elements.map(element => (
            <g key={element.id}>
              {element.type === 'latex' ? (
                <foreignObject
                  x={element.x} y={element.y}
                  width={element.width || 200} height={element.height || 60}
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  onDoubleClick={(e) => handleElementDoubleClick(e, element)}
                  style={{ cursor: tool === 'select' ? (isDragging ? 'grabbing' : 'grab') : 'crosshair', overflow: 'visible' }}
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
          {renderMarquee()}
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
