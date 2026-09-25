import React from 'react';
import { Point } from '../types';

interface SnapGuidesProps {
  guides: { type: 'x' | 'y'; position: number; length: number; start: number }[];
  zoom: number;
}

const SnapGuides: React.FC<SnapGuidesProps> = ({ guides, zoom }) => {
  if (guides.length === 0) return null;

  return (
    <g pointerEvents="none">
      {guides.map((guide, i) => {
        if (guide.type === 'x') {
          return (
            <g key={i}>
              <line
                x1={guide.position}
                y1={guide.start}
                x2={guide.position}
                y2={guide.start + guide.length}
                stroke="#ff4081"
                strokeWidth={1 / zoom}
                strokeDasharray={`${3 / zoom},${3 / zoom}`}
              />
              <circle
                cx={guide.position}
                cy={guide.start}
                r={3 / zoom}
                fill="#ff4081"
              />
              <circle
                cx={guide.position}
                cy={guide.start + guide.length}
                r={3 / zoom}
                fill="#ff4081"
              />
            </g>
          );
        } else {
          return (
            <g key={i}>
              <line
                x1={guide.start}
                y1={guide.position}
                x2={guide.start + guide.length}
                y2={guide.position}
                stroke="#ff4081"
                strokeWidth={1 / zoom}
                strokeDasharray={`${3 / zoom},${3 / zoom}`}
              />
              <circle
                cx={guide.start}
                cy={guide.position}
                r={3 / zoom}
                fill="#ff4081"
              />
              <circle
                cx={guide.start + guide.length}
                cy={guide.position}
                r={3 / zoom}
                fill="#ff4081"
              />
            </g>
          );
        }
      })}
    </g>
  );
};

export default SnapGuides;
