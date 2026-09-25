import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DiagramElement, Tool, Point } from '../types';
import katex from 'katex';

interface CanvasProps {
  elements: DiagramElement[];
  selectedId: string | null;
  tool: Tool;
  onAddElement: (element: DiagramElement) => void;
  onUpdateElement: (id: string, updates: Partial<DiagramElement>) => void;
  onSelectElement: (id: string | null) => void;
  onDeleteElement: (id: string) => void;
  zoom: number;
  showGrid?: boolean;
  svgRef?: React.RefObject<SVGSVGElement>;
}

const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedId,
  tool,
  onAddElement,
  onUpdateElement,
  onSelectElement,
  onDeleteElement,
  zoom,
  showGrid = true,
  svgRef: externalSvgRef,
}) => {
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalSvgRef || internalSvgRef;
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [dragOffset, setDragOffset] = useState<Point | null>(null);
  const [editingLatex, setEditingLatex] = useState<string | null>(null);
  const [latexInput, setLatexInput] = useState('');

  const getSVGPoint = useCallback((e: React.MouseEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  }, [zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const point = getSVGPoint(e);
    
    if (tool === 'select') {
      return;
    }

    if (tool === 'eraser') {
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPoint(point);
  }, [tool, getSVGPoint]);

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
    };

    if (tool === 'line' || tool === 'arrow' || tool === 'wire' || tool === 'fieldline') {
      newElement.points = [startPoint, point];
    } else if (tool === 'force') {
      newElement.points = [startPoint, point];
      newElement.direction = getDirection(startPoint, point);
      newElement.magnitude = Math.sqrt(
        Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2)
      );
    } else if (tool === 'text') {
      newElement.text = 'Text';
      newElement.fontSize = 16;
      newElement.width = 100;
      newElement.height = 30;
    } else if (tool === 'latex') {
      newElement.latex = 'E = mc^2';
      newElement.width = 150;
      newElement.height = 40;
    } else if (tool === 'resistor' || tool === 'capacitor' || tool === 'inductor' || tool === 'battery' || tool === 'diode' || tool === 'transistor' || tool === 'ground') {
      newElement.width = 60;
      newElement.height = 40;
    } else if (tool === 'mass') {
      newElement.width = 60;
      newElement.height = 60;
    } else if (tool === 'pulley') {
      newElement.width = 50;
      newElement.height = 50;
    } else if (tool === 'spring') {
      newElement.width = 100;
      newElement.height = 30;
    } else if (tool === 'magnet') {
      newElement.width = 80;
      newElement.height = 30;
    } else if (tool === 'coil') {
      newElement.width = 80;
      newElement.height = 40;
    } else if (tool === 'charge') {
      newElement.width = 30;
      newElement.height = 30;
    } else if (tool === 'lens' || tool === 'mirror') {
      newElement.width = 20;
      newElement.height = 80;
    } else if (tool === 'prism') {
      newElement.width = 60;
      newElement.height = 60;
    } else if (tool === 'wave') {
      newElement.width = 120;
      newElement.height = 40;
    } else if (tool === 'axes') {
      newElement.width = 100;
      newElement.height = 100;
    } else if (tool === 'incline') {
      newElement.width = 120;
      newElement.height = 80;
    } else if (tool === 'pendulum') {
      newElement.width = 80;
      newElement.height = 100;
    } else if (tool === 'ammeter' || tool === 'voltmeter') {
      newElement.width = 40;
      newElement.height = 40;
    } else if (tool === 'switch') {
      newElement.width = 60;
      newElement.height = 30;
    } else if (tool === 'bulb') {
      newElement.width = 40;
      newElement.height = 40;
    } else if (tool === 'rectangle') {
      newElement.width = Math.abs(point.x - startPoint.x);
      newElement.height = Math.abs(point.y - startPoint.y);
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2));
      newElement.width = radius * 2;
      newElement.height = radius * 2;
    }

    onAddElement(newElement);
    setStartPoint(null);
    setCurrentPoint(null);
  }, [isDrawing, startPoint, tool, getSVGPoint, onAddElement]);

  const handleElementClick = useCallback((e: React.MouseEvent, element: DiagramElement) => {
    e.stopPropagation();
    if (tool === 'select') {
      onSelectElement(element.id);
    } else if (tool === 'eraser') {
      onDeleteElement(element.id);
    }
  }, [tool, onSelectElement, onDeleteElement]);

  const handleElementDragStart = useCallback((e: React.MouseEvent, element: DiagramElement) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    const point = getSVGPoint(e);
    setDragOffset({
      x: point.x - element.x,
      y: point.y - element.y,
    });
    onSelectElement(element.id);
  }, [tool, getSVGPoint, onSelectElement]);

  const handleElementDrag = useCallback((e: React.MouseEvent) => {
    if (!dragOffset || !selectedId) return;
    const point = getSVGPoint(e);
    onUpdateElement(selectedId, {
      x: point.x - dragOffset.x,
      y: point.y - dragOffset.y,
    });
  }, [dragOffset, selectedId, getSVGPoint, onUpdateElement]);

  const handleElementDragEnd = useCallback(() => {
    setDragOffset(null);
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
    }
  }, [onUpdateElement]);

  const handleLatexSubmit = useCallback(() => {
    if (editingLatex) {
      onUpdateElement(editingLatex, { latex: latexInput });
      setEditingLatex(null);
      setLatexInput('');
    }
  }, [editingLatex, latexInput, onUpdateElement]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) {
        onDeleteElement(selectedId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, onDeleteElement]);

  const renderElement = (element: DiagramElement) => {
    const isSelected = element.id === selectedId;
    const commonProps = {
      stroke: isSelected ? '#3B82F6' : element.color,
      strokeWidth: element.strokeWidth,
      fill: element.fillColor || 'none',
      onMouseDown: (e: React.MouseEvent) => handleElementDragStart(e, element),
      onClick: (e: React.MouseEvent) => handleElementClick(e, element),
      onDoubleClick: (e: React.MouseEvent) => handleDoubleClick(e, element),
      style: { cursor: tool === 'select' ? 'move' : tool === 'eraser' ? 'crosshair' : 'default' } as React.CSSProperties,
    };

    switch (element.type) {
      case 'line':
      case 'wire':
        return (
          <line
            key={element.id}
            x1={element.points?.[0]?.x || element.x}
            y1={element.points?.[0]?.y || element.y}
            x2={element.points?.[1]?.x || (element.x + (element.width || 0))}
            y2={element.points?.[1]?.y || (element.y + (element.height || 0))}
            {...commonProps}
          />
        );

      case 'arrow':
      case 'force': {
        const x1 = element.points?.[0]?.x || element.x;
        const y1 = element.points?.[0]?.y || element.y;
        const x2 = element.points?.[1]?.x || (element.x + (element.width || 0));
        const y2 = element.points?.[1]?.y || (element.y + (element.height || 0));
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 12;
        return (
          <g key={element.id} {...commonProps}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            <polygon
              points={`${x2},${y2} ${x2 - headLen * Math.cos(angle - Math.PI / 6)},${y2 - headLen * Math.sin(angle - Math.PI / 6)} ${x2 - headLen * Math.cos(angle + Math.PI / 6)},${y2 - headLen * Math.sin(angle + Math.PI / 6)}`}
              fill={isSelected ? '#3B82F6' : element.color}
            />
            {element.label && (
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 10} textAnchor="middle" fill={element.color} fontSize="12">
                {element.label}
              </text>
            )}
          </g>
        );
      }

      case 'rectangle':
      case 'mass':
        return (
          <rect
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width || 60}
            height={element.height || 60}
            {...commonProps}
          />
        );

      case 'circle':
      case 'pulley': {
        const cx = element.x + (element.width || 50) / 2;
        const cy = element.y + (element.height || 50) / 2;
        const r = (element.width || 50) / 2;
        return (
          <g key={element.id} {...commonProps}>
            <circle cx={cx} cy={cy} r={r} />
            {element.type === 'pulley' && <circle cx={cx} cy={cy} r={5} fill={element.color} />}
          </g>
        );
      }

      case 'resistor': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 60;
        const h = element.height || 40;
        const segments = 6;
        const segW = w / segments;
        let path = `M ${x} ${y + h / 2} L ${x + segW} ${y + h / 2}`;
        for (let i = 0; i < segments; i++) {
          const sx = x + segW + i * segW;
          path += ` L ${sx + segW * 0.25} ${y + (i % 2 === 0 ? h * 0.2 : h * 0.8)} L ${sx + segW * 0.75} ${y + (i % 2 === 0 ? h * 0.8 : h * 0.2)}`;
        }
        path += ` L ${x + w} ${y + h / 2}`;
        return (
          <g key={element.id} {...commonProps}>
            <path d={path} fill="none" />
            <line x1={x} y1={y + h / 2} x2={x + segW} y2={y + h / 2} />
            <line x1={x + w - segW} y1={y + h / 2} x2={x + w} y2={y + h / 2} />
          </g>
        );
      }

      case 'capacitor': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 60;
        const h = element.height || 40;
        const gap = 8;
        return (
          <g key={element.id} {...commonProps}>
            <line x1={x} y1={y + h / 2} x2={x + w / 2 - gap} y2={y + h / 2} />
            <line x1={x + w / 2 - gap} y1={y + h * 0.15} x2={x + w / 2 - gap} y2={y + h * 0.85} strokeWidth={3} />
            <line x1={x + w / 2 + gap} y1={y + h * 0.15} x2={x + w / 2 + gap} y2={y + h * 0.85} strokeWidth={3} />
            <line x1={x + w / 2 + gap} y1={y + h / 2} x2={x + w} y2={y + h / 2} />
          </g>
        );
      }

      case 'inductor': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 80;
        const h = element.height || 40;
        const coils = 4;
        const coilW = w / coils;
        let path = `M ${x} ${y + h / 2} `;
        for (let i = 0; i < coils; i++) {
          const cx = x + coilW * i + coilW / 2;
          path += `A ${coilW / 2} ${h * 0.35} 0 0 1 ${x + coilW * (i + 1)} ${y + h / 2} `;
        }
        return (
          <g key={element.id} {...commonProps}>
            <path d={path} fill="none" />
          </g>
        );
      }

      case 'battery': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 60;
        const h = element.height || 40;
        return (
          <g key={element.id} {...commonProps}>
            <line x1={x} y1={y + h / 2} x2={x + w * 0.35} y2={y + h / 2} />
            <line x1={x + w * 0.35} y1={y + h * 0.15} x2={x + w * 0.35} y2={y + h * 0.85} strokeWidth={3} />
            <line x1={x + w * 0.5} y1={y + h * 0.3} x2={x + w * 0.5} y2={y + h * 0.7} strokeWidth={1.5} />
            <line x1={x + w * 0.65} y1={y + h * 0.15} x2={x + w * 0.65} y2={y + h * 0.85} strokeWidth={3} />
            <line x1={x + w * 0.65} y1={y + h / 2} x2={x + w} y2={y + h / 2} />
            <text x={x + w * 0.3} y={y + h * 0.1} fontSize="10" fill={element.color}>+</text>
            <text x={x + w * 0.6} y={y + h * 0.1} fontSize="10" fill={element.color}>−</text>
          </g>
        );
      }

      case 'diode': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 60;
        const h = element.height || 40;
        return (
          <g key={element.id} {...commonProps}>
            <line x1={x} y1={y + h / 2} x2={x + w * 0.35} y2={y + h / 2} />
            <polygon
              points={`${x + w * 0.35},${y + h * 0.2} ${x + w * 0.65},${y + h / 2} ${x + w * 0.35},${y + h * 0.8}`}
              fill="none"
            />
            <line x1={x + w * 0.65} y1={y + h * 0.2} x2={x + w * 0.65} y2={y + h * 0.8} strokeWidth={2} />
            <line x1={x + w * 0.65} y1={y + h / 2} x2={x + w} y2={y + h / 2} />
          </g>
        );
      }

      case 'transistor': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 60;
        const h = element.height || 60;
        return (
          <g key={element.id} {...commonProps}>
            <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) / 2} fill="none" />
            <line x1={x} y1={y + h / 2} x2={x + w * 0.35} y2={y + h / 2} />
            <line x1={x + w * 0.35} y1={y + h * 0.25} x2={x + w * 0.35} y2={y + h * 0.75} strokeWidth={2} />
            <line x1={x + w * 0.35} y1={y + h * 0.35} x2={x + w * 0.75} y2={y + h * 0.15} />
            <line x1={x + w * 0.35} y1={y + h * 0.65} x2={x + w * 0.75} y2={y + h * 0.85} />
            <line x1={x + w * 0.75} y1={y} x2={x + w * 0.75} y2={y + h * 0.15} />
            <line x1={x + w * 0.75} y1={y + h * 0.85} x2={x + w * 0.75} y2={y + h} />
          </g>
        );
      }

      case 'ground': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 40;
        const h = element.height || 40;
        return (
          <g key={element.id} {...commonProps}>
            <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h * 0.4} />
            <line x1={x + w * 0.15} y1={y + h * 0.4} x2={x + w * 0.85} y2={y + h * 0.4} strokeWidth={2} />
            <line x1={x + w * 0.25} y1={y + h * 0.55} x2={x + w * 0.75} y2={y + h * 0.55} strokeWidth={2} />
            <line x1={x + w * 0.35} y1={y + h * 0.7} x2={x + w * 0.65} y2={y + h * 0.7} strokeWidth={2} />
          </g>
        );
      }

      case 'spring': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 100;
        const h = element.height || 30;
        const coils = 8;
        const segW = w / (coils + 2);
        let path = `M ${x} ${y + h / 2} L ${x + segW} ${y + h / 2}`;
        for (let i = 0; i < coils; i++) {
          const sx = x + segW + i * segW;
          path += ` L ${sx + segW * 0.25} ${y + (i % 2 === 0 ? 0 : h)} L ${sx + segW * 0.75} ${y + (i % 2 === 0 ? h : 0)}`;
        }
        path += ` L ${x + w - segW} ${y + h / 2} L ${x + w} ${y + h / 2}`;
        return (
          <g key={element.id} {...commonProps}>
            <path d={path} fill="none" />
          </g>
        );
      }

      case 'magnet': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 80;
        const h = element.height || 30;
        return (
          <g key={element.id} onMouseDown={(e) => handleElementDragStart(e, element)} onClick={(e) => handleElementClick(e, element)} style={{ cursor: tool === 'select' ? 'move' : tool === 'eraser' ? 'crosshair' : 'default' }}>
            <rect x={x} y={y} width={w / 2} height={h} fill="#EF4444" stroke={isSelected ? '#3B82F6' : element.color} strokeWidth={element.strokeWidth} />
            <rect x={x + w / 2} y={y} width={w / 2} height={h} fill="#3B82F6" stroke={isSelected ? '#3B82F6' : element.color} strokeWidth={element.strokeWidth} />
            <text x={x + w * 0.25} y={y + h / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">N</text>
            <text x={x + w * 0.75} y={y + h / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">S</text>
          </g>
        );
      }

      case 'coil': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 80;
        const h = element.height || 40;
        const turns = 5;
        const turnW = w / turns;
        let path = '';
        for (let i = 0; i < turns; i++) {
          const cx = x + turnW * i + turnW / 2;
          path += `M ${cx - turnW * 0.4} ${y} A ${turnW * 0.4} ${h / 2} 0 0 1 ${cx + turnW * 0.4} ${y} `;
          path += `M ${cx - turnW * 0.4} ${y + h} A ${turnW * 0.4} ${h / 2} 0 0 0 ${cx + turnW * 0.4} ${y + h} `;
        }
        return (
          <g key={element.id} {...commonProps}>
            <path d={path} fill="none" />
            <line x1={x} y1={y} x2={x} y2={y + h} />
            <line x1={x + w} y1={y} x2={x + w} y2={y + h} />
          </g>
        );
      }

      case 'charge': {
        const cx = element.x + (element.width || 30) / 2;
        const cy = element.y + (element.height || 30) / 2;
        const r = (element.width || 30) / 2;
        return (
          <g key={element.id} {...commonProps}>
            <circle cx={cx} cy={cy} r={r} fill={element.fillColor || '#FEE2E2'} />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="16" fontWeight="bold" fill={element.color}>
              {element.label || '+'}
            </text>
          </g>
        );
      }

      case 'fieldline': {
        const x1 = element.points?.[0]?.x || element.x;
        const y1 = element.points?.[0]?.y || element.y;
        const x2 = element.points?.[1]?.x || (element.x + 100);
        const y2 = element.points?.[1]?.y || element.y;
        const lines = 5;
        const spacing = 8;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const perpAngle = angle + Math.PI / 2;
        return (
          <g key={element.id} {...commonProps}>
            {Array.from({ length: lines }).map((_, i) => {
              const offset = (i - (lines - 1) / 2) * spacing;
              const ox = Math.cos(perpAngle) * offset;
              const oy = Math.sin(perpAngle) * offset;
              return (
                <line
                  key={i}
                  x1={x1 + ox}
                  y1={y1 + oy}
                  x2={x2 + ox}
                  y2={y2 + oy}
                  strokeDasharray="4,4"
                />
              );
            })}
          </g>
        );
      }

      case 'lens': {
        const x = element.x;
        const y = element.y;
        const h = element.height || 80;
        return (
          <g key={element.id} {...commonProps}>
            <ellipse cx={x + 10} cy={y + h / 2} rx={10} ry={h / 2} fill="none" />
            <line x1={x} y1={y} x2={x} y2={y + h} strokeDasharray="3,3" />
          </g>
        );
      }

      case 'mirror': {
        const x = element.x;
        const y = element.y;
        const h = element.height || 80;
        return (
          <g key={element.id} {...commonProps}>
            <line x1={x} y1={y} x2={x} y2={y + h} strokeWidth={3} />
            <line x1={x - 5} y1={y} x2={x - 5} y2={y + h} strokeDasharray="4,4" />
          </g>
        );
      }

      case 'prism': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 60;
        const h = element.height || 60;
        return (
          <g key={element.id} {...commonProps}>
            <polygon
              points={`${x + w / 2},${y} ${x},${y + h} ${x + w},${y + h}`}
              fill="none"
            />
          </g>
        );
      }

      case 'wave': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 120;
        const h = element.height || 40;
        const cycles = 3;
        let path = `M ${x} ${y + h / 2}`;
        for (let i = 0; i <= cycles * 20; i++) {
          const px = x + (i / (cycles * 20)) * w;
          const py = y + h / 2 + Math.sin((i / 20) * Math.PI) * (h / 2 - 5);
          path += ` L ${px} ${py}`;
        }
        return (
          <g key={element.id} {...commonProps}>
            <path d={path} fill="none" />
          </g>
        );
      }

      case 'axes': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 100;
        const h = element.height || 100;
        return (
          <g key={element.id} {...commonProps}>
            {/* X axis */}
            <line x1={x} y1={y + h} x2={x + w} y2={y + h} />
            <polygon
              points={`${x + w},${y + h} ${x + w - 8},${y + h - 4} ${x + w - 8},${y + h + 4}`}
              fill={element.color}
            />
            {/* Y axis */}
            <line x1={x} y1={y + h} x2={x} y2={y} />
            <polygon
              points={`${x},${y} ${x - 4},${y + 8} ${x + 4},${y + 8}`}
              fill={element.color}
            />
            {/* Labels */}
            <text x={x + w + 5} y={y + h + 5} fontSize="12" fill={element.color}>x</text>
            <text x={x - 5} y={y - 5} fontSize="12" fill={element.color}>y</text>
            <text x={x - 10} y={y + h + 15} fontSize="10" fill={element.color}>O</text>
          </g>
        );
      }

      case 'incline': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 120;
        const h = element.height || 80;
        return (
          <g key={element.id} {...commonProps}>
            <polygon
              points={`${x},${y + h} ${x + w},${y + h} ${x + w},${y}`}
              fill="none"
            />
            {/* Angle arc */}
            <path
              d={`M ${x + 25} ${y + h} A 25 25 0 0 0 ${x + w - 15} ${y + h - 15}`}
              fill="none"
              strokeDasharray="3,2"
            />
            <text x={x + 30} y={y + h - 8} fontSize="10" fill={element.color}>θ</text>
          </g>
        );
      }

      case 'pendulum': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 80;
        const h = element.height || 100;
        const pivotX = x + w / 2;
        const pivotY = y;
        const bobX = x + w / 2 + 20;
        const bobY = y + h - 20;
        return (
          <g key={element.id} {...commonProps}>
            {/* Support */}
            <line x1={x} y1={y} x2={x + w} y2={y} strokeWidth={3} />
            {/* String */}
            <line x1={pivotX} y1={pivotY} x2={bobX} y2={bobY} />
            {/* Bob */}
            <circle cx={bobX} cy={bobY} r={12} fill={element.fillColor || '#e2e8f0'} />
            {/* Angle */}
            <path
              d={`M ${pivotX} ${pivotY + 30} A 30 30 0 0 1 ${bobX - 5} ${bobY - 15}`}
              fill="none"
              strokeDasharray="3,2"
            />
            <text x={pivotX + 5} y={pivotY + 35} fontSize="10" fill={element.color}>θ</text>
          </g>
        );
      }

      case 'ammeter': {
        const cx = element.x + (element.width || 40) / 2;
        const cy = element.y + (element.height || 40) / 2;
        const r = (element.width || 40) / 2;
        return (
          <g key={element.id} {...commonProps}>
            <circle cx={cx} cy={cy} r={r} fill={element.fillColor || 'white'} />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill={element.color}>A</text>
          </g>
        );
      }

      case 'voltmeter': {
        const cx = element.x + (element.width || 40) / 2;
        const cy = element.y + (element.height || 40) / 2;
        const r = (element.width || 40) / 2;
        return (
          <g key={element.id} {...commonProps}>
            <circle cx={cx} cy={cy} r={r} fill={element.fillColor || 'white'} />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill={element.color}>V</text>
          </g>
        );
      }

      case 'switch': {
        const x = element.x;
        const y = element.y;
        const w = element.width || 60;
        const h = element.height || 30;
        return (
          <g key={element.id} {...commonProps}>
            <circle cx={x} cy={y + h / 2} r={3} fill={element.color} />
            <circle cx={x + w} cy={y + h / 2} r={3} fill={element.color} />
            <line x1={x} y1={y + h / 2} x2={x + w * 0.7} y2={y + h * 0.2} strokeWidth={2} />
            <line x1={x} y1={y + h / 2} x2={x - 10} y2={y + h / 2} />
            <line x1={x + w} y1={y + h / 2} x2={x + w + 10} y2={y + h / 2} />
          </g>
        );
      }

      case 'bulb': {
        const cx = element.x + (element.width || 40) / 2;
        const cy = element.y + (element.height || 40) / 2;
        const r = (element.width || 40) / 2;
        return (
          <g key={element.id} {...commonProps}>
            <circle cx={cx} cy={cy} r={r} fill={element.fillColor || '#FEF3C7'} />
            {/* X inside */}
            <line x1={cx - r * 0.5} y1={cy - r * 0.5} x2={cx + r * 0.5} y2={cy + r * 0.5} />
            <line x1={cx + r * 0.5} y1={cy - r * 0.5} x2={cx - r * 0.5} y2={cy + r * 0.5} />
            {/* Connection lines */}
            <line x1={cx - r} y1={cy} x2={cx - r - 10} y2={cy} />
            <line x1={cx + r} y1={cy} x2={cx + r + 10} y2={cy} />
          </g>
        );
      }

      case 'text':
        return (
          <text
            key={element.id}
            x={element.x}
            y={element.y + (element.fontSize || 16)}
            fontSize={element.fontSize || 16}
            {...commonProps}
            fill={element.color}
          >
            {element.text}
          </text>
        );

      case 'latex':
        return (
          <foreignObject
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width || 200}
            height={element.height || 60}
            {...commonProps}
          >
            <div
              style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(element.latex || 'E=mc^2', { throwOnError: false, displayMode: false }),
              }}
            />
          </foreignObject>
        );

      default:
        return null;
    }
  };

  const renderPreview = () => {
    if (!isDrawing || !startPoint || !currentPoint) return null;

    switch (tool) {
      case 'line':
      case 'arrow':
      case 'wire':
      case 'force':
      case 'fieldline':
        return (
          <line
            x1={startPoint.x}
            y1={startPoint.y}
            x2={currentPoint.x}
            y2={currentPoint.y}
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="5,5"
            opacity={0.7}
          />
        );
      case 'rectangle':
      case 'mass':
        return (
          <rect
            x={Math.min(startPoint.x, currentPoint.x)}
            y={Math.min(startPoint.y, currentPoint.y)}
            width={Math.abs(currentPoint.x - startPoint.x)}
            height={Math.abs(currentPoint.y - startPoint.y)}
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="5,5"
            fill="none"
            opacity={0.7}
          />
        );
      case 'circle':
      case 'pulley': {
        const r = Math.sqrt(Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2));
        return (
          <circle
            cx={startPoint.x}
            cy={startPoint.y}
            r={r}
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="5,5"
            fill="none"
            opacity={0.7}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      {/* Grid background */}
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
          {elements.map(renderElement)}
          {renderPreview()}
        </g>
      </svg>

      {/* LaTeX Editor Modal */}
      {editingLatex && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 z-50 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Edit LaTeX Expression</h3>
          <input
            type="text"
            value={latexInput}
            onChange={(e) => setLatexInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="E = mc^2"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleLatexSubmit(); }}
          />
          <div className="mt-3 p-3 bg-gray-50 rounded-md min-h-[40px] flex items-center justify-center">
            <div
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(latexInput || 'E=mc^2', { throwOnError: false }),
              }}
            />
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={() => { setEditingLatex(null); setLatexInput(''); }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleLatexSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function getDirection(start: Point, end: Point): 'up' | 'down' | 'left' | 'right' {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}

export default Canvas;
