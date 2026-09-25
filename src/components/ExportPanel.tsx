import React, { useState } from 'react';
import { exportToPNG, exportToSVG, exportToPDF } from '../utils/export';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  svgRef: React.RefObject<SVGSVGElement>;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ isOpen, onClose, canvasRef, svgRef }) => {
  const [filename, setFilename] = useState('physics-diagram');
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    setExporting(true);
    try {
      if (format === 'png' && canvasRef.current) {
        await exportToPNG(canvasRef.current, filename);
      } else if (format === 'svg' && svgRef.current) {
        exportToSVG(svgRef.current, filename);
      } else if (format === 'pdf' && canvasRef.current) {
        await exportToPDF(canvasRef.current, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
    setExporting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Export Diagram</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Filename */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-600 mb-1 block">Filename</label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="my-diagram"
          />
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleExport('png')}
            disabled={exporting}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
              🖼️
            </div>
            <span className="text-sm font-medium text-gray-700">PNG</span>
            <span className="text-xs text-gray-400">Raster Image</span>
          </button>

          <button
            onClick={() => handleExport('svg')}
            disabled={exporting}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              📐
            </div>
            <span className="text-sm font-medium text-gray-700">SVG</span>
            <span className="text-xs text-gray-400">Vector Graphic</span>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 transition-all disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
              📄
            </div>
            <span className="text-sm font-medium text-gray-700">PDF</span>
            <span className="text-xs text-gray-400">Document</span>
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">
            <strong>PNG:</strong> Best for presentations and web use. High resolution export.<br />
            <strong>SVG:</strong> Best for editing in vector tools like Illustrator or Inkscape.<br />
            <strong>PDF:</strong> Best for printing and academic papers.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ExportPanel;
