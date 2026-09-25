import React from 'react';
import { DiagramElement, Point } from '../types';

interface ElementRendererProps {
  element: DiagramElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  tool: string;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onMouseDown,
  onClick,
  onDoubleClick,
  tool,
}) => {
  const strokeColor = isSelected ? '#3B82F6' : element.color;
  const commonProps = {
    stroke: strokeColor,
    strokeWidth: element.strokeWidth,
    fill: element.fillColor || 'none',
    onMouseDown,
    onClick,
    onDoubleClick,
    style: {
      cursor: tool === 'select' ? 'move' : tool === 'eraser' ? 'crosshair' : 'default',
      opacity: element.opacity ?? 1,
    } as React.CSSProperties,
  };

  const renderByType = () => {
    switch (element.type) {
      // ===== BASIC SHAPES =====
      case 'line':
      case 'wire':
      case 'optical_axis': {
        const p = element.points || [{ x: element.x, y: element.y }, { x: element.x + (element.width || 100), y: element.y }];
        return (
          <line x1={p[0].x} y1={p[0].y} x2={p[1].x} y2={p[1].y} {...commonProps} />
        );
      }

      case 'arrow':
      case 'force':
      case 'ray':
      case 'decay_arrow': {
        const p = element.points || [{ x: element.x, y: element.y }, { x: element.x + 80, y: element.y }];
        const x1 = p[0].x, y1 = p[0].y, x2 = p[1].x, y2 = p[1].y;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 12;
        const dashed = element.type === 'decay_arrow' ? '5,3' : undefined;
        return (
          <g {...commonProps}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={dashed} />
            <polygon
              points={`${x2},${y2} ${x2 - headLen * Math.cos(angle - Math.PI / 6)},${y2 - headLen * Math.sin(angle - Math.PI / 6)} ${x2 - headLen * Math.cos(angle + Math.PI / 6)},${y2 - headLen * Math.sin(angle + Math.PI / 6)}`}
              fill={strokeColor}
            />
            {element.label && (
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 10} textAnchor="middle" fill={strokeColor} fontSize="12" stroke="none">
                {element.label}
              </text>
            )}
          </g>
        );
      }

      case 'rectangle':
      case 'mass':
      case 'label_box':
      case 'cylinder':
        return (
          <rect x={element.x} y={element.y} width={element.width || 60} height={element.height || 60} {...commonProps} />
        );

      case 'circle':
      case 'pulley':
      case 'nucleus': {
        const cx = element.x + (element.width || 50) / 2;
        const cy = element.y + (element.height || 50) / 2;
        const r = (element.width || 50) / 2;
        return (
          <g {...commonProps}>
            <circle cx={cx} cy={cy} r={r} />
            {element.type === 'pulley' && <circle cx={cx} cy={cy} r={5} fill={element.color} stroke="none" />}
            {element.type === 'nucleus' && (
              <>
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill={element.color} stroke="none">p⁺n⁰</text>
              </>
            )}
          </g>
        );
      }

      case 'ellipse': {
        const cx = element.x + (element.width || 80) / 2;
        const cy = element.y + (element.height || 50) / 2;
        const rx = (element.width || 80) / 2;
        const ry = (element.height || 50) / 2;
        return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} {...commonProps} />;
      }

      case 'polyline':
      case 'polygon': {
        const pts = element.points || [];
        if (pts.length < 2) return null;
        const pathData = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + (element.type === 'polygon' ? ' Z' : '');
        return <path d={pathData} {...commonProps} />;
      }

      // ===== ELECTRONICS =====
      case 'resistor': {
        const x = element.x, y = element.y;
        const w = element.width || 60, h = element.height || 40;
        const segW = w / 8;
        let path = `M ${x} ${y + h / 2} L ${x + segW} ${y + h / 2}`;
        for (let i = 0; i < 6; i++) {
          const sx = x + segW + i * segW;
          path += ` L ${sx + segW * 0.25} ${y + (i % 2 === 0 ? h * 0.2 : h * 0.8)} L ${sx + segW * 0.75} ${y + (i % 2 === 0 ? h * 0.8 : h * 0.2)}`;
        }
        path += ` L ${x + w} ${y + h / 2}`;
        return <path d={path} {...commonProps} />;
      }

      case 'capacitor': {
        const x = element.x, y = element.y;
        const w = element.width || 60, h = element.height || 40;
        const gap = 8;
        return (
          <g {...commonProps}>
            <line x1={x} y1={y + h / 2} x2={x + w / 2 - gap} y2={y + h / 2} />
            <line x1={x + w / 2 - gap} y1={y + h * 0.15} x2={x + w / 2 - gap} y2={y + h * 0.85} strokeWidth={3} />
            <line x1={x + w / 2 + gap} y1={y + h * 0.15} x2={x + w / 2 + gap} y2={y + h * 0.85} strokeWidth={3} />
            <line x1={x + w / 2 + gap} y1={y + h / 2} x2={x + w} y2={y + h / 2} />
          </g>
        );
      }

      case 'inductor': {
        const x = element.x, y = element.y;
        const w = element.width || 80, h = element.height || 40;
        const coils = 4;
        const coilW = w / coils;
        let path = `M ${x} ${y + h / 2} `;
        for (let i = 0; i < coils; i++) {
          path += `A ${coilW / 2} ${h * 0.35} 0 0 1 ${x + coilW * (i + 1)} ${y + h / 2} `;
        }
        return <path d={path} {...commonProps} />;
      }

      case 'battery': {
        const x = element.x, y = element.y;
        const w = element.width || 60, h = element.height || 40;
        return (
          <g {...commonProps}>
            <line x1={x} y1={y + h / 2} x2={x + w * 0.35} y2={y + h / 2} />
            <line x1={x + w * 0.35} y1={y + h * 0.15} x2={x + w * 0.35} y2={y + h * 0.85} strokeWidth={3} />
            <line x1={x + w * 0.5} y1={y + h * 0.3} x2={x + w * 0.5} y2={y + h * 0.7} strokeWidth={1.5} />
            <line x1={x + w * 0.65} y1={y + h * 0.15} x2={x + w * 0.65} y2={y + h * 0.85} strokeWidth={3} />
            <line x1={x + w * 0.65} y1={y + h / 2} x2={x + w} y2={y + h / 2} />
            <text x={x + w * 0.3} y={y - 2} fontSize="10" fill={element.color} stroke="none">+</text>
            <text x={x + w * 0.6} y={y - 2} fontSize="10" fill={element.color} stroke="none">−</text>
          </g>
        );
      }

      case 'diode':
      case 'led': {
        const x = element.x, y = element.y;
        const w = element.width || 60, h = element.height || 40;
        return (
          <g {...commonProps}>
            <line x1={x} y1={y + h / 2} x2={x + w * 0.35} y2={y + h / 2} />
            <polygon points={`${x + w * 0.35},${y + h * 0.2} ${x + w * 0.65},${y + h / 2} ${x + w * 0.35},${y + h * 0.8}`} fill="none" />
            <line x1={x + w * 0.65} y1={y + h * 0.2} x2={x + w * 0.65} y2={y + h * 0.8} strokeWidth={2} />
            <line x1={x + w * 0.65} y1={y + h / 2} x2={x + w} y2={y + h / 2} />
            {element.type === 'led' && (
              <>
                <line x1={x + w * 0.55} y1={y} x2={x + w * 0.7} y2={y - 10} strokeWidth={1} />
                <polygon points={`${x + w * 0.7},${y - 10} ${x + w * 0.65},${y - 6} ${x + w * 0.72},${y - 7}`} fill={strokeColor} stroke="none" />
                <line x1={x + w * 0.65} y1={y + 2} x2={x + w * 0.8} y2={y - 8} strokeWidth={1} />
                <polygon points={`${x + w * 0.8},${y - 8} ${x + w * 0.75},${y - 4} ${x + w * 0.82},${y - 5}`} fill={strokeColor} stroke="none" />
              </>
            )}
          </g>
        );
      }

      case 'transistor': {
        const x = element.x, y = element.y;
        const w = element.width || 60, h = element.height || 60;
        return (
          <g {...commonProps}>
            <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) / 2} fill="none" />
            <line x1={x} y1={y + h / 2} x2={x + w * 0.35} y2={y + h / 2} />
            <line x1={x + w * 0.35} y1={y + h * 0.25} x2={x + w * 0.35} y2={y + h * 0.75} strokeWidth={2} />
            <line x1={x + w * 0.35} y1={y + h * 0.35} x2={x + w * 0.75} y2={y + h * 0.15} />
            <line x1={x + w * 0.35} y1={y + h * 0.65} x2={x + w * 0.75} y2={y + h * 0.85} />
            <line x1={x + w * 0.75} y1={y} x2={x + w * 0.75} y2={y + h * 0.15} />
            <line x1={x + w * 0.75} y1={y + h * 0.85} x2={x + w * 0.75} y2={y + h} />
            <text x={x - 5} y={y + h / 2 + 3} fontSize="8" fill={element.color} stroke="none">B</text>
            <text x={x + w * 0.78} y={y - 2} fontSize="8" fill={element.color} stroke="none">C</text>
            <text x={x + w * 0.78} y={y + h + 8} fontSize="8" fill={element.color} stroke="none">E</text>
          </g>
        );
      }

      case 'ground': {
        const x = element.x, y = element.y;
        const w = element.width || 40, h = element.height || 40;
        return (
          <g {...commonProps}>
            <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h * 0.4} />
            <line x1={x + w * 0.15} y1={y + h * 0.4} x2={x + w * 0.85} y2={y + h * 0.4} strokeWidth={2} />
            <line x1={x + w * 0.25} y1={y + h * 0.55} x2={x + w * 0.75} y2={y + h * 0.55} strokeWidth={2} />
            <line x1={x + w * 0.35} y1={y + h * 0.7} x2={x + w * 0.65} y2={y + h * 0.7} strokeWidth={2} />
          </g>
        );
      }

      case 'ammeter':
      case 'voltmeter': {
        const cx = element.x + (element.width || 40) / 2;
        const cy = element.y + (element.height || 40) / 2;
        const r = (element.width || 40) / 2;
        return (
          <g {...commonProps}>
            <circle cx={cx} cy={cy} r={r} fill={element.fillColor || 'white'} />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill={element.color} stroke="none">
              {element.type === 'ammeter' ? 'A' : 'V'}
            </text>
          </g>
        );
      }

      case 'switch': {
        const x = element.x, y = element.y;
        const w = element.width || 60, h = element.height || 30;
        return (
          <g {...commonProps}>
            <circle cx={x} cy={y + h / 2} r={3} fill={element.color} stroke="none" />
            <circle cx={x + w} cy={y + h / 2} r={3} fill={element.color} stroke="none" />
            <line x1={x} y1={y + h / 2} x2={x + w * 0.7} y2={y + h * 0.2} strokeWidth={2} />
          </g>
        );
      }

      case 'bulb': {
        const cx = element.x + (element.width || 40) / 2;
        const cy = element.y + (element.height || 40) / 2;
        const r = (element.width || 40) / 2;
        return (
          <g {...commonProps}>
            <circle cx={cx} cy={cy} r={r} fill={element.fillColor || '#FEF3C7'} />
            <line x1={cx - r * 0.5} y1={cy - r * 0.5} x2={cx + r * 0.5} y2={cy + r * 0.5} />
            <line x1={cx + r * 0.5} y1={cy - r * 0.5} x2={cx - r * 0.5} y2={cy + r * 0.5} />
          </g>
        );
      }

      case 'transformer': {
        const x = element.x, y = element.y;
        const w = element.width || 80, h = element.height || 60;
        return (
          <g {...commonProps}>
            {/* Primary coil */}
            {[0, 1, 2].map(i => (
              <circle key={`p${i}`} cx={x + 15} cy={y + 15 + i * 15} r={8} fill="none" />
            ))}
            {/* Core */}
            <line x1={x + w / 2 - 5} y1={y} x2={x + w / 2 - 5} y2={y + h} strokeWidth={2} />
            <line x1={x + w / 2 + 5} y1={y} x2={x + w / 2 + 5} y2={y + h} strokeWidth={2} />
            {/* Secondary coil */}
            {[0, 1, 2].map(i => (
              <circle key={`s${i}`} cx={x + w - 15} cy={y + 15 + i * 15} r={8} fill="none" />
            ))}
          </g>
        );
      }

      case 'opamp': {
        const x = element.x, y = element.y;
        const w = element.width || 70, h = element.height || 60;
        return (
          <g {...commonProps}>
            <polygon points={`${x},${y} ${x},${y + h} ${x + w},${y + h / 2}`} fill="none" />
            <text x={x + 5} y={y + h * 0.3} fontSize="10" fill={element.color} stroke="none">+</text>
            <text x={x + 5} y={y + h * 0.75} fontSize="10" fill={element.color} stroke="none">−</text>
          </g>
        );
      }

      case 'logic_and': {
        const x = element.x, y = element.y;
        const w = element.width || 50, h = element.height || 40;
        return (
          <g {...commonProps}>
            <path d={`M ${x} ${y} L ${x + w * 0.5} ${y} A ${w / 2} ${h / 2} 0 0 1 ${x + w * 0.5} ${y + h} L ${x} ${y + h} Z`} fill="none" />
            <text x={x + w * 0.35} y={y + h / 2 + 4} textAnchor="middle" fontSize="10" fill={element.color} stroke="none">AND</text>
          </g>
        );
      }

      case 'logic_or': {
        const x = element.x, y = element.y;
        const w = element.width || 50, h = element.height || 40;
        return (
          <g {...commonProps}>
            <path d={`M ${x} ${y} Q ${x + w * 0.3} ${y + h / 2} ${x} ${y + h} Q ${x + w * 0.6} ${y + h} ${x + w} ${y + h / 2} Q ${x + w * 0.6} ${y} ${x} ${y}`} fill="none" />
            <text x={x + w * 0.4} y={y + h / 2 + 4} textAnchor="middle" fontSize="10" fill={element.color} stroke="none">OR</text>
          </g>
        );
      }

      case 'logic_not': {
        const x = element.x, y = element.y;
        const w = element.width || 50, h = element.height || 40;
        return (
          <g {...commonProps}>
            <polygon points={`${x},${y} ${x},${y + h} ${x + w - 8},${y + h / 2}`} fill="none" />
            <circle cx={x + w - 4} cy={y + h / 2} r={4} fill="none" />
          </g>
        );
      }

      // ===== MECHANICS =====
      case 'spring': {
        const x = element.x, y = element.y;
        const w = element.width || 100, h = element.height || 30;
        const coils = element.springCoils || 8;
        const segW = w / (coils + 2);
        let path = `M ${x} ${y + h / 2} L ${x + segW} ${y + h / 2}`;
        for (let i = 0; i < coils; i++) {
          const sx = x + segW + i * segW;
          path += ` L ${sx + segW * 0.25} ${y + (i % 2 === 0 ? 0 : h)} L ${sx + segW * 0.75} ${y + (i % 2 === 0 ? h : 0)}`;
        }
        path += ` L ${x + w - segW} ${y + h / 2} L ${x + w} ${y + h / 2}`;
        return <path d={path} {...commonProps} />;
      }

      case 'axes': {
        const x = element.x, y = element.y;
        const w = element.width || 100, h = element.height || 100;
        return (
          <g {...commonProps}>
            <line x1={x} y1={y + h} x2={x + w} y2={y + h} />
            <polygon points={`${x + w},${y + h} ${x + w - 8},${y + h - 4} ${x + w - 8},${y + h + 4}`} fill={strokeColor} stroke="none" />
            <line x1={x} y1={y + h} x2={x} y2={y} />
            <polygon points={`${x},${y} ${x - 4},${y + 8} ${x + 4},${y + 8}`} fill={strokeColor} stroke="none" />
            <text x={x + w + 5} y={y + h + 5} fontSize="12" fill={element.color} stroke="none">x</text>
            <text x={x - 5} y={y - 5} fontSize="12" fill={element.color} stroke="none">y</text>
            <text x={x - 10} y={y + h + 15} fontSize="10" fill={element.color} stroke="none">O</text>
          </g>
        );
      }

      case 'incline': {
        const x = element.x, y = element.y;
        const w = element.width || 120, h = element.height || 80;
        return (
          <g {...commonProps}>
            <polygon points={`${x},${y + h} ${x + w},${y + h} ${x + w},${y}`} fill="none" />
            <path d={`M ${x + 25} ${y + h} A 25 25 0 0 0 ${x + w - 15} ${y + h - 15}`} fill="none" strokeDasharray="3,2" />
            <text x={x + 30} y={y + h - 8} fontSize="10" fill={element.color} stroke="none">θ</text>
          </g>
        );
      }

      case 'pendulum': {
        const x = element.x, y = element.y;
        const w = element.width || 80, h = element.height || 100;
        const pivotX = x + w / 2, pivotY = y;
        const bobX = x + w / 2 + 20, bobY = y + h - 20;
        return (
          <g {...commonProps}>
            <line x1={x} y1={y} x2={x + w} y2={y} strokeWidth={3} />
            <line x1={pivotX} y1={pivotY} x2={bobX} y2={bobY} />
            <circle cx={bobX} cy={bobY} r={12} fill={element.fillColor || '#e2e8f0'} />
          </g>
        );
      }

      case 'lever': {
        const x = element.x, y = element.y;
        const w = element.width || 150, h = element.height || 10;
        return (
          <g {...commonProps}>
            <rect x={x} y={y} width={w} height={h} fill={element.fillColor || '#D1D5DB'} />
          </g>
        );
      }

      case 'fulcrum':
      case 'wedge': {
        const x = element.x, y = element.y;
        const w = element.width || 40, h = element.height || 40;
        return (
          <g {...commonProps}>
            <polygon points={`${x + w / 2},${y} ${x},${y + h} ${x + w},${y + h}`} fill={element.fillColor || 'none'} />
          </g>
        );
      }

      // ===== ELECTROMAGNETISM =====
      case 'magnet': {
        const x = element.x, y = element.y;
        const w = element.width || 80, h = element.height || 30;
        return (
          <g {...commonProps}>
            <rect x={x} y={y} width={w / 2} height={h} fill="#EF4444" stroke={strokeColor} />
            <rect x={x + w / 2} y={y} width={w / 2} height={h} fill="#3B82F6" stroke={strokeColor} />
            <text x={x + w * 0.25} y={y + h / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" stroke="none">N</text>
            <text x={x + w * 0.75} y={y + h / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" stroke="none">S</text>
          </g>
        );
      }

      case 'coil':
      case 'solenoid': {
        const x = element.x, y = element.y;
        const w = element.width || 80, h = element.height || 40;
        const turns = 5;
        const turnW = w / turns;
        let path = '';
        for (let i = 0; i < turns; i++) {
          const cx = x + turnW * i + turnW / 2;
          path += `M ${cx - turnW * 0.4} ${y} A ${turnW * 0.4} ${h / 2} 0 0 1 ${cx + turnW * 0.4} ${y} `;
          path += `M ${cx - turnW * 0.4} ${y + h} A ${turnW * 0.4} ${h / 2} 0 0 0 ${cx + turnW * 0.4} ${y + h} `;
        }
        return (
          <g {...commonProps}>
            <path d={path} fill="none" />
            <line x1={x} y1={y} x2={x} y2={y + h} />
            <line x1={x + w} y1={y} x2={x + w} y2={y + h} />
          </g>
        );
      }

      case 'current_loop': {
        const cx = element.x + (element.width || 60) / 2;
        const cy = element.y + (element.height || 60) / 2;
        const rx = (element.width || 60) / 2;
        const ry = (element.height || 60) / 2;
        return (
          <g {...commonProps}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" />
            {/* Current arrows */}
            <polygon points={`${cx},${cy - ry} ${cx - 5},${cy - ry - 8} ${cx + 5},${cy - ry - 8}`} fill={strokeColor} stroke="none" />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill={element.color} stroke="none">I</text>
          </g>
        );
      }

      case 'charge': {
        const cx = element.x + (element.width || 30) / 2;
        const cy = element.y + (element.height || 30) / 2;
        const r = (element.width || 30) / 2;
        const sign = element.chargeSign || '+';
        const fillColor = sign === '+' ? '#FEE2E2' : sign === '-' ? '#DBEAFE' : '#F3F4F6';
        return (
          <g {...commonProps}>
            <circle cx={cx} cy={cy} r={r} fill={element.fillColor || fillColor} />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="16" fontWeight="bold" fill={element.color} stroke="none">{sign}</text>
          </g>
        );
      }

      case 'fieldline': {
        const p = element.points || [{ x: element.x, y: element.y }, { x: element.x + 100, y: element.y }];
        const x1 = p[0].x, y1 = p[0].y, x2 = p[1].x, y2 = p[1].y;
        const lines = 5;
        const spacing = 8;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const perpAngle = angle + Math.PI / 2;
        return (
          <g {...commonProps}>
            {Array.from({ length: lines }).map((_, i) => {
              const offset = (i - (lines - 1) / 2) * spacing;
              const ox = Math.cos(perpAngle) * offset;
              const oy = Math.sin(perpAngle) * offset;
              return <line key={i} x1={x1 + ox} y1={y1 + oy} x2={x2 + ox} y2={y2 + oy} strokeDasharray="4,4" />;
            })}
          </g>
        );
      }

      case 'emwave': {
        const x = element.x, y = element.y;
        const w = element.width || 150, h = element.height || 80;
        const cycles = 3;
        let pathE = `M ${x} ${y + h / 2}`;
        let pathB = `M ${x} ${y + h / 2}`;
        for (let i = 0; i <= cycles * 20; i++) {
          const px = x + (i / (cycles * 20)) * w;
          const pyE = y + h / 2 + Math.sin((i / 20) * Math.PI) * (h / 2 - 5);
          const pyB = y + h / 2 + Math.cos((i / 20) * Math.PI) * (h / 2 - 5);
          pathE += ` L ${px} ${pyE}`;
          pathB += ` L ${px} ${pyB}`;
        }
        return (
          <g {...commonProps}>
            <path d={pathE} fill="none" stroke="#EF4444" />
            <path d={pathB} fill="none" stroke="#3B82F6" />
            <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} strokeDasharray="2,2" stroke="#6B7280" />
            <text x={x + w + 5} y={y + h / 2 + 4} fontSize="10" fill="#EF4444" stroke="none">E</text>
            <text x={x + w + 5} y={y + h / 2 - 4} fontSize="10" fill="#3B82F6" stroke="none">B</text>
          </g>
        );
      }

      // ===== OPTICS =====
      case 'lens': {
        const x = element.x, y = element.y;
        const h = element.height || 80;
        const isConvex = element.lensType !== 'concave';
        return (
          <g {...commonProps}>
            {isConvex ? (
              <>
                <path d={`M ${x + 10} ${y} Q ${x + 20} ${y + h / 2} ${x + 10} ${y + h}`} fill="none" />
                <path d={`M ${x + 10} ${y} Q ${x} ${y + h / 2} ${x + 10} ${y + h}`} fill="none" />
              </>
            ) : (
              <>
                <path d={`M ${x} ${y} Q ${x + 10} ${y + h / 2} ${x} ${y + h}`} fill="none" />
                <path d={`M ${x + 20} ${y} Q ${x + 10} ${y + h / 2} ${x + 20} ${y + h}`} fill="none" />
              </>
            )}
            <line x1={x - 5} y1={y} x2={x - 5} y2={y + h} strokeDasharray="3,3" stroke="#6B7280" />
          </g>
        );
      }

      case 'mirror': {
        const x = element.x, y = element.y;
        const h = element.height || 80;
        return (
          <g {...commonProps}>
            <line x1={x} y1={y} x2={x} y2={y + h} strokeWidth={3} />
            <line x1={x - 5} y1={y} x2={x - 5} y2={y + h} strokeDasharray="4,4" />
          </g>
        );
      }

      case 'prism': {
        const x = element.x, y = element.y;
        const w = element.width || 60, h = element.height || 60;
        return (
          <g {...commonProps}>
            <polygon points={`${x + w / 2},${y} ${x},${y + h} ${x + w},${y + h}`} fill={element.fillColor || 'none'} />
          </g>
        );
      }

      case 'diffraction_grating': {
        const x = element.x, y = element.y;
        const w = element.width || 10, h = element.height || 80;
        const lines = 8;
        return (
          <g {...commonProps}>
            <rect x={x} y={y} width={w} height={h} fill="none" />
            {Array.from({ length: lines }).map((_, i) => (
              <line key={i} x1={x} y1={y + (i + 1) * (h / (lines + 1))} x2={x + w} y2={y + (i + 1) * (h / (lines + 1))} strokeWidth={1} />
            ))}
          </g>
        );
      }

      // ===== WAVES =====
      case 'wave': {
        const x = element.x, y = element.y;
        const w = element.width || 120, h = element.height || 40;
        const cycles = 3;
        let path = `M ${x} ${y + h / 2}`;
        for (let i = 0; i <= cycles * 20; i++) {
          const px = x + (i / (cycles * 20)) * w;
          const py = y + h / 2 + Math.sin((i / 20) * Math.PI) * (h / 2 - 5);
          path += ` L ${px} ${py}`;
        }
        return <path d={path} {...commonProps} />;
      }

      case 'standing_wave': {
        const x = element.x, y = element.y;
        const w = element.width || 150, h = element.height || 60;
        const nodes = 4;
        let path = `M ${x} ${y + h / 2}`;
        for (let i = 0; i < nodes; i++) {
          const segW = w / nodes;
          const sx = x + i * segW;
          const dir = i % 2 === 0 ? -1 : 1;
          path += ` Q ${sx + segW / 2} ${y + h / 2 + dir * (h / 2 - 5)} ${sx + segW} ${y + h / 2}`;
        }
        return (
          <g {...commonProps}>
            <path d={path} fill="none" />
            <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} strokeDasharray="2,2" stroke="#6B7280" />
          </g>
        );
      }

      case 'pulse': {
        const x = element.x, y = element.y;
        const w = element.width || 80, h = element.height || 40;
        return (
          <g {...commonProps}>
            <path d={`M ${x} ${y + h} Q ${x + w / 2} ${y} ${x + w} ${y + h}`} fill="none" />
            <line x1={x} y1={y + h} x2={x + w} y2={y + h} />
          </g>
        );
      }

      // ===== THERMODYNAMICS =====
      case 'piston': {
        const x = element.x, y = element.y;
        const w = element.width || 80, h = element.height || 100;
        return (
          <g {...commonProps}>
            <rect x={x} y={y} width={w} height={h} fill="none" />
            <rect x={x + 5} y={y + h * 0.3} width={w - 10} height={10} fill={element.fillColor || '#9CA3AF'} />
            <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h * 0.3} strokeWidth={3} />
          </g>
        );
      }

      case 'flame': {
        const cx = element.x + (element.width || 30) / 2;
        const cy = element.y + (element.height || 40) / 2;
        const w = element.width || 30, h = element.height || 40;
        return (
          <g {...commonProps}>
            <path d={`M ${cx} ${cy - h / 2} Q ${cx - w / 2} ${cy} ${cx} ${cy + h / 2} Q ${cx + w / 2} ${cy} ${cx} ${cy - h / 2}`} fill="#FCD34D" stroke="#EF4444" />
            <path d={`M ${cx} ${cy - h / 4} Q ${cx - w / 4} ${cy} ${cx} ${cy + h / 4} Q ${cx + w / 4} ${cy} ${cx} ${cy - h / 4}`} fill="#F97316" stroke="none" />
          </g>
        );
      }

      case 'thermometer': {
        const x = element.x, y = element.y;
        const w = element.width || 20, h = element.height || 80;
        return (
          <g {...commonProps}>
            <rect x={x + w * 0.3} y={y} width={w * 0.4} height={h * 0.8} rx={w * 0.2} fill="none" />
            <circle cx={x + w / 2} cy={y + h * 0.9} r={w * 0.4} fill="#EF4444" />
            <rect x={x + w * 0.4} y={y + h * 0.3} width={w * 0.2} height={h * 0.5} fill="#EF4444" stroke="none" />
          </g>
        );
      }

      // ===== QUANTUM/NUCLEAR =====
      case 'atom': {
        const cx = element.x + (element.width || 80) / 2;
        const cy = element.y + (element.height || 80) / 2;
        const r = (element.width || 80) / 2;
        return (
          <g {...commonProps}>
            <circle cx={cx} cy={cy} r={r * 0.15} fill="#EF4444" stroke="none" />
            <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.3} fill="none" />
            <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.3} fill="none" transform={`rotate(60 ${cx} ${cy})`} />
            <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.3} fill="none" transform={`rotate(-60 ${cx} ${cy})`} />
            <circle cx={cx + r} cy={cy} r={3} fill="#3B82F6" stroke="none" />
            <circle cx={cx - r / 2} cy={cy - r * 0.25} r={3} fill="#3B82F6" stroke="none" />
            <circle cx={cx - r / 2} cy={cy + r * 0.25} r={3} fill="#3B82F6" stroke="none" />
          </g>
        );
      }

      case 'energy_level': {
        const x = element.x, y = element.y;
        const w = element.width || 100, h = element.height || 120;
        const levels = 4;
        return (
          <g {...commonProps}>
            {Array.from({ length: levels }).map((_, i) => {
              const ly = y + (i + 1) * (h / (levels + 1));
              return (
                <g key={i}>
                  <line x1={x} y1={ly} x2={x + w} y2={ly} strokeWidth={2} />
                  <text x={x - 20} y={ly + 4} fontSize="10" fill={element.color} stroke="none">n={levels - i}</text>
                </g>
              );
            })}
          </g>
        );
      }

      // ===== MISC =====
      case 'protractor': {
        const cx = element.x + (element.width || 80) / 2;
        const cy = element.y + (element.height || 50);
        const r = (element.width || 80) / 2;
        return (
          <g {...commonProps}>
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" />
            <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
            {[0, 30, 45, 60, 90, 120, 135, 150, 180].map(angle => {
              const rad = (angle * Math.PI) / 180;
              const x1 = cx + Math.cos(Math.PI - rad) * r;
              const y1 = cy - Math.sin(Math.PI - rad) * r;
              const x2 = cx + Math.cos(Math.PI - rad) * (r - 5);
              const y2 = cy - Math.sin(Math.PI - rad) * (r - 5);
              return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1} />;
            })}
          </g>
        );
      }

      case 'angle_arc': {
        const x = element.x, y = element.y;
        const r = element.width || 30;
        return (
          <g {...commonProps}>
            <path d={`M ${x + r} ${y} A ${r} ${r} 0 0 1 ${x} ${y + r}`} fill="none" />
            <line x1={x} y1={y} x2={x + r} y2={y} />
            <line x1={x} y1={y} x2={x} y2={y + r} />
            <text x={x + r * 0.5} y={y + r * 0.5} fontSize="10" fill={element.color} stroke="none">θ</text>
          </g>
        );
      }

      case 'dimension': {
        const p = element.points || [{ x: element.x, y: element.y }, { x: element.x + 100, y: element.y }];
        const x1 = p[0].x, y1 = p[0].y, x2 = p[1].x, y2 = p[1].y;
        return (
          <g {...commonProps}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            <line x1={x1} y1={y1 - 5} x2={x1} y2={y1 + 5} />
            <line x1={x2} y1={y2 - 5} x2={x2} y2={y2 + 5} />
            {element.label && (
              <text x={(x1 + x2) / 2} y={y1 - 8} textAnchor="middle" fontSize="10" fill={element.color} stroke="none">
                {element.label}
              </text>
            )}
          </g>
        );
      }

      case 'cloud': {
        const x = element.x, y = element.y;
        const w = element.width || 120, h = element.height || 80;
        return (
          <g {...commonProps}>
            <path
              d={`M ${x + w * 0.2} ${y + h} Q ${x} ${y + h} ${x} ${y + h * 0.6} Q ${x} ${y + h * 0.3} ${x + w * 0.25} ${y + h * 0.3} Q ${x + w * 0.3} ${y} ${x + w * 0.5} ${y} Q ${x + w * 0.7} ${y} ${x + w * 0.75} ${y + h * 0.3} Q ${x + w} ${y + h * 0.3} ${x + w} ${y + h * 0.6} Q ${x + w} ${y + h} ${x + w * 0.8} ${y + h} Z`}
              fill={element.fillColor || 'none'}
              strokeDasharray="5,3"
            />
          </g>
        );
      }

      case 'text':
        return (
          <text
            x={element.x}
            y={element.y + (element.fontSize || 16)}
            fontSize={element.fontSize || 16}
            fontFamily={element.fontFamily || 'sans-serif'}
            {...commonProps}
            fill={element.color}
            stroke="none"
          >
            {element.text || 'Text'}
          </text>
        );

      case 'latex':
        return null; // Handled separately via foreignObject

      default:
        return null;
    }
  };

  return <g key={element.id}>{renderByType()}</g>;
};

export default ElementRenderer;
