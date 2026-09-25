import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DiagramElement, Tool, Point, NodePoint } from '../types';
import katex from 'katex';
import ElementRenderer from './ElementRenderer';
import NodesOverlay from './NodesOverlay';

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

const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedIds,
  tool,
  onAddElement,
  onUpdateElement,
  onSelectElements,
  onDeleteElement,
  zoom,
  showGrid = true,
  svgRef: externalSvgRef,
  onUpdateNodes,
  onUpdatePoints,
  onDeleteNode,
  onAddNode,
}) => {
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalSvgRef || internalSvgRef;
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [dragOffset, setDragOffset] = useState<Map<string, Point>>(new Map());
  const [editingLatex, setEditingLatex] = useState<string | null>(null);
  const [latexInput, setLatexInput] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const getSVGPoint = useCallback((e: React.MouseEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  }, [zoom, svgRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const point = getSVGPoint(e);

    if (tool === 'select') {
      // Deselect if clicking on empty space
      if (!e.shiftKey) {
        onSelectElements([]);
      }
      return;
    }

    if (tool === 'eraser') {
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPoint(point);
  }, [tool, getSVGPoint, onSelectElements]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    const point = getSVGPoint(e);
    setCurrentPoint(point);
  }, [isDrawing, startPoint, getSVGPoint]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    const point = getSVGPoint(e);
    setIsDrawing(false);

    const id = crypto.randomUUID();
    const newElement: DiagramElement = {
      id,
      type: tool,
      x: startPoint.x,
      y: startPoint.y,
      width: Math.abs(point.x - startPoint.x),
      height: Math.abs(point.y - startPoint.y),
      color: '#1f2937',
      strokeWidth: 2,
      points: [startPoint, point],
      nodes: [],
    };

    // Generate nodes for line-based elements
    if (tool === 'line' || tool === 'arrow' || tool === 'wire' || tool === 'fieldline' || tool === 'force' || tool === 'ray' || tool === 'decay_arrow' || tool === 'dimension') {
      newElement.nodes = [
        { id: crypto.randomUUID(), x: startPoint.x, y: startPoint.y, type: 'vertex' },
        { id: crypto.randomUUID(), x: point.x, y: point.y, type: 'vertex' },
      ];
      newElement.points = [startPoint, point];
    } else if (tool === 'polyline' || tool === 'polygon') {
      newElement.nodes = [
        { id: crypto.randomUUID(), x: startPoint.x, y: startPoint.y, type: 'vertex' },
        { id: crypto.randomUUID(), x: point.x, y: point.y, type: 'vertex' },
      ];
      newElement.points = [startPoint, point];
    } else if (tool === 'text') {
      newElement.text = 'Text';
      newElement.fontSize = 16;
      newElement.width = 100;
      newElement.height = 30;
    } else if (tool === 'latex') {
      newElement.latex = 'E = mc^2';
      newElement.width = 150;
      newElement.height = 40;
    } else if (tool === 'rectangle' || tool === 'ellipse') {
      newElement.width = Math.abs(point.x - startPoint.x);
      newElement.height = Math.abs(point.y - startPoint.y);
      newElement.x = Math.min(startPoint.x, point.x);
      newElement.y = Math.min(startPoint.y, point.y);
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2));
      newElement.width = radius * 2;
      newElement.height = radius * 2;
    } else {
      // Default sizes for physics elements
      const defaultSizes: Record<string, { w: number; h: number }> = {
        resistor: { w: 60, h: 40 }, capacitor: { w: 60, h: 40 }, inductor: { w: 80, h: 40 },
        battery: { w: 60, h: 40 }, diode: { w: 60, h: 40 }, led: { w: 60, h: 40 },
        transistor: { w: 60, h: 60 }, ground: { w: 40, h: 40 }, mass: { w: 60, h: 60 },
        pulley: { w: 50, h: 50 }, spring: { w: 100, h: 30 }, magnet: { w: 80, h: 30 },
        coil: { w: 80, h: 40 }, solenoid: { w: 80, h: 40 }, charge: { w: 30, h: 30 },
        lens: { w: 20, h: 80 }, mirror: { w: 20, h: 80 }, prism: { w: 60, h: 60 },
        wave: { w: 120, h: 40 }, standing_wave: { w: 150, h: 60 }, pulse: { w: 80, h: 40 },
        axes: { w: 100, h: 100 }, incline: { w: 120, h: 80 }, pendulum: { w: 80, h: 100 },
        lever: { w: 150, h: 10 }, fulcrum: { w: 40, h: 40 }, wedge: { w: 40, h: 40 },
        ammeter: { w: 40, h: 40 }, voltmeter: { w: 40, h: 40 }, switch: { w: 60, h: 30 },
        bulb: { w: 40, h: 40 }, transformer: { w: 80, h: 60 }, opamp: { w: 70, h: 60 },
        logic_and: { w: 50, h: 40 }, logic_or: { w: 50, h: 40 }, logic_not: { w: 50, h: 40 },
        emwave: { w: 150, h: 80 }, current_loop: { w: 60, h: 60 },
        diffraction_grating: { w: 10, h: 80 }, ray: { w: 80, h: 0 },
        optical_axis: { w: 200, h: 0 }, piston: { w: 80, h: 100 }, cylinder: { w: 60, h: 80 },
        flame: { w: 30, h: 40 }, thermometer: { w: 20, h: 80 },
        atom: { w: 80, h: 80 }, nucleus: { w: 40, h: 40 },
        energy_level: { w: 100, h: 120 }, decay_arrow: { w: 80, h: 0 },
        protractor: { w: 80, h: 50 }, angle_arc: { w: 30, h: 30 },
        dimension: { w: 100, h: 0 }, label_box: { w: 100, h: 40 }, cloud: { w: 120, h: 80 },
      };
      const size = defaultSizes[tool] || { w: 60, h: 40 };
      newElement.width = size.w;
      newElement.height = size.h;
    }

    onAddElement(newElement);
    setStartPoint(null);
    setCurrentPoint(null);
  }, [isDrawing, startPoint, tool, getSVGPoint, onAddElement]);

  const handleElementClick = useCallback((e: React.MouseEvent, element: DiagramElement) => {
    e.stopPropagation();
    if (tool === 'select') {
      if (e.shiftKey) {
        // Multi-select
        if (selectedIds.includes(element.id)) {
          onSelectElements(selectedIds.filter(id => id !== element.id));
        } else {
          onSelectElements([...selectedIds, element.id]);
        }
      } else {
        onSelectElements([element.id]);
      }
    } else if (tool === 'eraser') {
      onDeleteElement(element.id);
    }
  }, [tool, onSelectElements, onDeleteElement, selectedIds]);

  const handleElementDragStart = useCallback((e: React.MouseEvent, element: DiagramElement) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    const point = getSVGPoint(e);
    
    // If this element isn't in the selection, select it
    let currentSelection = selectedIds;
    if (!selectedIds.includes(element.id)) {
      if (!e.shiftKey) {
        currentSelection = [element.id];
        onSelectElements([element.id]);
      } else {
        currentSelection = [...selectedIds, element.id];
        onSelectElements(currentSelection);
      }
    }

    const offsets = new Map<string, Point>();
    currentSelection.forEach(id => {
      const el = elements.find(e => e.id === id);
      if (el) {
        offsets.set(id, { x: point.x - el.x, y: point.y - el.y });
      }
    });
    setDragOffset(offsets);
  }, [tool, getSVGPoint, onSelectElements, selectedIds, elements]);

  const handleElementDrag = useCallback((e: React.MouseEvent) => {
    if (dragOffset.size === 0) return;
    const point = getSVGPoint(e);
    dragOffset.forEach((offset, id) => {
      onUpdateElement(id, {
        x: point.x - offset.x,
        y: point.y - offset.y,
      });
    });
  }, [dragOffset, getSVGPoint, onUpdateElement]);

  const handleElementDragEnd = useCallback(() => {
    setDragOffset(new Map());
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent, element: DiagramElement) => {
    e.stopPropagation();
    if (element.type === 'latex') {
      setEditingLatex(element.id);
      setLatexInput(element.latex || '');
    } else if (element.type === 'text') {
      const newText = prompt('Enter text:', element.text || '');
      if (newText !== null) {
        onUpdateElement(element.id, { text: newText });
      }
    } else if (element.type === 'mass' || element.type === 'charge' || element.type === 'label_box') {
      const newLabel = prompt('Enter label:', element.label || '');
      if (newLabel !== null) {
        onUpdateElement(element.id, { label: newLabel });
      }
    }
  }, [onUpdateElement]);

  const handleLatexSubmit = useCallback(() => {
    if (editingLatex) {
      onUpdateElement(editingLatex, { latex: latexInput });
      setEditingLatex(null);
      setLatexInput('');
    }
  }, [editingLatex, latexInput, onUpdateElement]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          // Delete selected node
          const selectedElement = elements.find(el => el.nodes?.some(n => n.id === selectedNodeId));
          if (selectedElement && selectedElement.nodes && selectedElement.nodes.length > 2) {
            onDeleteNode(selectedElement.id, selectedNodeId);
            setSelectedNodeId(null);
          }
        } else if (selectedIds.length > 0 && !(e.target instanceof HTMLInputElement)) {
          selectedIds.forEach(id => onDeleteElement(id));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, selectedNodeId, onDeleteElement, onDeleteNode, elements]);

  const renderPreview = () => {
    if (!isDrawing || !startPoint || !currentPoint) return null;

    switch (tool) {
      case 'line':
      case 'arrow':
      case 'wire':
      case 'force':
      case 'fieldline':
      case 'ray':
      case 'decay_arrow':
      case 'dimension':
      case 'optical_axis':
        return (
          <line
            x1={startPoint.x} y1={startPoint.y}
            x2={currentPoint.x} y2={currentPoint.y}
            stroke="#3B82F6" strokeWidth={2} strokeDasharray="5,5" opacity={0.7}
          />
        );
      case 'rectangle':
      case 'mass':
      case 'label_box':
      case 'cylinder':
        return (
          <rect
            x={Math.min(startPoint.x, currentPoint.x)} y={Math.min(startPoint.y, currentPoint.y)}
            width={Math.abs(currentPoint.x - startPoint.x)} height={Math.abs(currentPoint.y - startPoint.y)}
            stroke="#3B82F6" strokeWidth={2} strokeDasharray="5,5" fill="none" opacity={0.7}
          />
        );
      case 'circle':
      case 'pulley': {
        const r = Math.sqrt(Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2));
        return (
          <circle cx={startPoint.x} cy={startPoint.y} r={r}
            stroke="#3B82F6" strokeWidth={2} strokeDasharray="5,5" fill="none" opacity={0.7} />
        );
      }
      case 'ellipse': {
        const rx = Math.abs(currentPoint.x - startPoint.x) / 2;
        const ry = Math.abs(currentPoint.y - startPoint.y) / 2;
        const cx = Math.min(startPoint.x, currentPoint.x) + rx;
        const cy = Math.min(startPoint.y, currentPoint.y) + ry;
        return (
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
            stroke="#3B82F6" strokeWidth={2} strokeDasharray="5,5" fill="none" opacity={0.7} />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      {showGrid && (
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        }} />
      )}

      <svg
        ref={svgRef}
        className="w-full h-full relative z-10"
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => { handleMouseMove(e); handleElementDrag(e); }}
        onMouseUp={(e) => { handleMouseUp(e); handleElementDragEnd(); }}
        onMouseLeave={() => { setIsDrawing(false); handleElementDragEnd(); }}
        style={{ cursor: tool === 'select' ? 'default' : tool === 'eraser' ? 'crosshair' : 'crosshair' }}
      >
        <g transform={`scale(${zoom})`}>
          {/* Render all elements */}
          {elements.map(element => (
            <g key={element.id}>
              {element.type === 'latex' ? (
                <foreignObject
                  x={element.x} y={element.y}
                  width={element.width || 200} height={element.height || 60}
                  onMouseDown={(e) => handleElementDragStart(e, element)}
                  onClick={(e) => handleElementClick(e, element)}
                  onDoubleClick={(e) => handleDoubleClick(e, element)}
                  style={{ cursor: tool === 'select' ? 'move' : 'default', overflow: 'visible' }}
                >
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: katex.renderToString(element.latex || 'E=mc^2', { throwOnError: false, displayMode: false }),
                      }}
                    />
                  </div>
                </foreignObject>
              ) : (
                <ElementRenderer
                  element={element}
                  isSelected={selectedIds.includes(element.id)}
                  onMouseDown={(e) => handleElementDragStart(e, element)}
                  onClick={(e) => handleElementClick(e, element)}
                  onDoubleClick={(e) => handleDoubleClick(e, element)}
                  tool={tool}
                />
              )}
            </g>
          ))}

          {/* Render nodes overlay for selected elements */}
          {tool === 'select' && selectedIds.map(id => {
            const element = elements.find(el => el.id === id);
            if (!element) return null;
            return (
              <NodesOverlay
                key={`nodes-${id}`}
                element={element}
                zoom={zoom}
                onUpdateNodes={onUpdateNodes}
                onUpdatePoints={onUpdatePoints}
                onUpdateElement={onUpdateElement}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                onDeleteNode={onDeleteNode}
                onAddNode={onAddNode}
              />
            );
          })}

          {renderPreview()}
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
            onKeyDown={(e) => { if (e.key === 'Enter') handleLatexSubmit(); }}
          />
          <div className="mt-3 p-3 bg-gray-50 rounded-md min-h-[40px] flex items-center justify-center">
            <div dangerouslySetInnerHTML={{ __html: katex.renderToString(latexInput || 'E=mc^2', { throwOnError: false }) }} />
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button onClick={() => { setEditingLatex(null); setLatexInput(''); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
            <button onClick={handleLatexSubmit} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
