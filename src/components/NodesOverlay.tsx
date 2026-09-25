import React, { useState } from 'react';
import { DiagramElement, NodePoint, Point } from '../types';

interface NodesOverlayProps {
  element: DiagramElement;
  zoom: number;
  onUpdateNodes: (id: string, nodes: NodePoint[]) => void;
  onUpdatePoints: (id: string, points: Point[]) => void;
  onUpdateElement: (id: string, updates: Partial<DiagramElement>) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onDeleteNode: (elementId: string, nodeId: string) => void;
  onAddNode: (elementId: string, point: Point, afterIndex?: number) => void;
}

const NodesOverlay: React.FC<NodesOverlayProps> = ({
  element,
  zoom,
  onUpdateNodes,
  onUpdatePoints,
  onUpdateElement,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onAddNode,
}) => {
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [hoverEdge, setHoverEdge] = useState<{ index: number; midpoint: Point } | null>(null);

  // Get all editable points for this element
  const getEditablePoints = (): { points: Point[]; source: 'points' | 'nodes' | 'bounds' } => {
    if (element.nodes && element.nodes.length > 0) {
      return {
        points: element.nodes.map(n => ({ x: n.x, y: n.y })),
        source: 'nodes',
      };
    }
    if (element.points && element.points.length > 0) {
      return { points: element.points, source: 'points' };
    }
    // For shapes, return corner points
    const w = element.width || 0;
    const h = element.height || 0;
    return {
      points: [
        { x: element.x, y: element.y },
        { x: element.x + w, y: element.y },
        { x: element.x + w, y: element.y + h },
        { x: element.x, y: element.y + h },
      ],
      source: 'bounds',
    };
  };

  const { points, source } = getEditablePoints();
  const nodeSize = 8 / zoom;

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingNodeId(nodeId);
    onSelectNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId) return;
    const svg = (e.currentTarget as SVGElement).closest('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (source === 'nodes' && element.nodes) {
      const newNodes = element.nodes.map(n =>
        n.id === draggingNodeId ? { ...n, x, y } : n
      );
      onUpdateNodes(element.id, newNodes);
    } else if (source === 'points' && element.points) {
      const idx = element.nodes?.findIndex(n => n.id === draggingNodeId) ??
                  points.findIndex(p => `${p.x},${p.y}` === `${element.points?.find((_, i) => element.nodes?.[i]?.id === draggingNodeId)?.x},${element.points?.find((_, i) => element.nodes?.[i]?.id === draggingNodeId)?.y}`);
      // Find the index of the point being dragged
      const pointIdx = points.findIndex((p, i) => {
        const nodeId = element.nodes?.[i]?.id;
        return nodeId === draggingNodeId;
      });
      if (pointIdx >= 0) {
        const newPoints = [...element.points];
        newPoints[pointIdx] = { x, y };
        onUpdatePoints(element.id, newPoints);
      }
    } else if (source === 'bounds') {
      // Resize the element
      handleBoundsResize(draggingNodeId, x, y);
    }
  };

  const handleBoundsResize = (nodeId: string, x: number, y: number) => {
    const corners = [
      { x: element.x, y: element.y },
      { x: element.x + (element.width || 0), y: element.y },
      { x: element.x + (element.width || 0), y: element.y + (element.height || 0) },
      { x: element.x, y: element.y + (element.height || 0) },
    ];
    const idx = corners.findIndex(c => c.x === points[0]?.x && c.y === points[0]?.y ? nodeId === 'tl' : false);
    
    // Determine which corner based on nodeId
    let newX = element.x;
    let newY = element.y;
    let newW = element.width || 0;
    let newH = element.height || 0;

    if (nodeId === 'tl') {
      newW = (element.x + (element.width || 0)) - x;
      newH = (element.y + (element.height || 0)) - y;
      newX = x;
      newY = y;
    } else if (nodeId === 'tr') {
      newW = x - element.x;
      newH = (element.y + (element.height || 0)) - y;
      newY = y;
    } else if (nodeId === 'br') {
      newW = x - element.x;
      newH = y - element.y;
    } else if (nodeId === 'bl') {
      newW = (element.x + (element.width || 0)) - x;
      newH = y - element.y;
      newX = x;
    }

    onUpdateElement(element.id, { x: newX, y: newY, width: Math.max(10, newW), height: Math.max(10, newH) });
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleEdgeClick = (e: React.MouseEvent, index: number, midpoint: Point) => {
    e.stopPropagation();
    onAddNode(element.id, midpoint, index);
  };

  // Generate node IDs
  const getNodeIds = (): string[] => {
    if (element.nodes && element.nodes.length > 0) {
      return element.nodes.map(n => n.id);
    }
    if (source === 'bounds') {
      return ['tl', 'tr', 'br', 'bl'];
    }
    return points.map((_, i) => `p${i}`);
  };

  const nodeIds = getNodeIds();

  return (
    <g
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ pointerEvents: 'all' }}
    >
      {/* Selection bounding box */}
      {source === 'bounds' && (
        <rect
          x={element.x}
          y={element.y}
          width={element.width || 0}
          height={element.height || 0}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={1 / zoom}
          strokeDasharray={`${4 / zoom},${4 / zoom}`}
          pointerEvents="none"
        />
      )}

      {/* Edge midpoints (for adding nodes) */}
      {(source === 'points' || source === 'nodes') && points.length > 1 && (
        <>
          {points.slice(0, -1).map((p, i) => {
            const next = points[i + 1];
            const mid = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
            const isHovered = hoverEdge?.index === i;
            return (
              <g key={`edge-${i}`}>
                <circle
                  cx={mid.x}
                  cy={mid.y}
                  r={nodeSize * (isHovered ? 1.3 : 0.8)}
                  fill={isHovered ? '#10B981' : 'white'}
                  stroke="#10B981"
                  strokeWidth={1.5 / zoom}
                  style={{ cursor: 'copy' }}
                  onMouseEnter={() => setHoverEdge({ index: i, midpoint: mid })}
                  onMouseLeave={() => setHoverEdge(null)}
                  onClick={(e) => handleEdgeClick(e, i, mid)}
                />
                {isHovered && (
                  <text
                    x={mid.x}
                    y={mid.y - nodeSize * 2}
                    textAnchor="middle"
                    fontSize={10 / zoom}
                    fill="#10B981"
                    style={{ pointerEvents: 'none' }}
                  >
                    + add node
                  </text>
                )}
              </g>
            );
          })}
        </>
      )}

      {/* Node handles */}
      {points.map((p, i) => {
        const nodeId = nodeIds[i];
        const isSelected = selectedNodeId === nodeId;
        return (
          <g key={nodeId}>
            {/* Outer ring when selected */}
            {isSelected && (
              <circle
                cx={p.x}
                cy={p.y}
                r={nodeSize * 1.8}
                fill="none"
                stroke="#3B82F6"
                strokeWidth={1 / zoom}
                strokeDasharray={`${2 / zoom},${2 / zoom}`}
                pointerEvents="none"
              />
            )}
            {/* Node circle */}
            <circle
              cx={p.x}
              cy={p.y}
              r={nodeSize}
              fill={isSelected ? '#3B82F6' : 'white'}
              stroke="#3B82F6"
              strokeWidth={1.5 / zoom}
              style={{ cursor: 'move' }}
              onMouseDown={(e) => handleNodeMouseDown(e, nodeId, i)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                const label = prompt('Node label:', element.nodes?.[i]?.label || '');
                if (label !== null && element.nodes) {
                  const newNodes = element.nodes.map((n, idx) =>
                    idx === i ? { ...n, label } : n
                  );
                  onUpdateNodes(element.id, newNodes);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (points.length > 2 && confirm('Remove this node?')) {
                  onDeleteNode(element.id, nodeId);
                }
              }}
            />
            {/* Node label */}
            {element.nodes?.[i]?.label && (
              <text
                x={p.x}
                y={p.y - nodeSize * 2}
                textAnchor="middle"
                fontSize={10 / zoom}
                fill="#3B82F6"
                style={{ pointerEvents: 'none' }}
              >
                {element.nodes[i].label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

export default NodesOverlay;
