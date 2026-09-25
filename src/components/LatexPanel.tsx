import React, { useState } from 'react';
import katex from 'katex';

interface LatexPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (latex: string) => void;
}

const formulaCategories = [
  {
    name: 'Mechanics',
    icon: '⚙️',
    formulas: [
      { label: "Newton's 2nd Law", latex: 'F = ma' },
      { label: 'Kinetic Energy', latex: 'KE = \\frac{1}{2}mv^2' },
      { label: 'Potential Energy', latex: 'PE = mgh' },
      { label: 'Momentum', latex: 'p = mv' },
      { label: 'Work', latex: 'W = F \\cdot d' },
      { label: 'Power', latex: 'P = \\frac{W}{t}' },
      { label: 'Gravitational Force', latex: 'F = G\\frac{m_1 m_2}{r^2}' },
      { label: 'Centripetal Force', latex: 'F_c = \\frac{mv^2}{r}' },
      { label: 'Torque', latex: '\\tau = r \\times F' },
      { label: 'Moment of Inertia', latex: 'I = \\sum m_i r_i^2' },
      { label: 'Angular Momentum', latex: 'L = I\\omega' },
      { label: 'Impulse', latex: 'J = F\\Delta t' },
    ],
  },
  {
    name: 'Electromagnetism',
    icon: '⚡',
    formulas: [
      { label: "Coulomb's Law", latex: 'F = k\\frac{q_1 q_2}{r^2}' },
      { label: "Ohm's Law", latex: 'V = IR' },
      { label: 'Electric Field', latex: 'E = \\frac{F}{q}' },
      { label: "Gauss's Law", latex: '\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q}{\\varepsilon_0}' },
      { label: "Faraday's Law", latex: '\\mathcal{E} = -\\frac{d\\Phi_B}{dt}' },
      { label: "Ampere's Law", latex: '\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I' },
      { label: 'Capacitance', latex: 'C = \\frac{Q}{V}' },
      { label: 'Inductance Energy', latex: 'U = \\frac{1}{2}LI^2' },
      { label: 'Magnetic Force', latex: 'F = qv \\times B' },
      { label: 'Biot-Savart Law', latex: 'd\\vec{B} = \\frac{\\mu_0}{4\\pi}\\frac{Id\\vec{l} \\times \\hat{r}}{r^2}' },
      { label: 'RC Time Constant', latex: '\\tau = RC' },
      { label: 'LC Frequency', latex: '\\omega = \\frac{1}{\\sqrt{LC}}' },
    ],
  },
  {
    name: 'Optics',
    icon: '🔬',
    formulas: [
      { label: "Snell's Law", latex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2' },
      { label: 'Thin Lens Equation', latex: '\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}' },
      { label: 'Magnification', latex: 'M = -\\frac{d_i}{d_o}' },
      { label: 'Critical Angle', latex: '\\sin\\theta_c = \\frac{n_2}{n_1}' },
      { label: 'Diffraction', latex: 'd\\sin\\theta = m\\lambda' },
      { label: 'Interference', latex: '\\Delta\\phi = \\frac{2\\pi}{\\lambda}\\Delta x' },
      { label: 'Speed of Light', latex: 'c = \\frac{1}{\\sqrt{\\mu_0 \\varepsilon_0}}' },
    ],
  },
  {
    name: 'Thermodynamics',
    icon: '🌡️',
    formulas: [
      { label: 'Ideal Gas Law', latex: 'PV = nRT' },
      { label: 'First Law', latex: '\\Delta U = Q - W' },
      { label: 'Entropy', latex: '\\Delta S = \\frac{Q}{T}' },
      { label: 'Carnot Efficiency', latex: '\\eta = 1 - \\frac{T_c}{T_h}' },
      { label: 'Heat Capacity', latex: 'Q = mc\\Delta T' },
      { label: 'Stefan-Boltzmann', latex: 'P = \\sigma A T^4' },
    ],
  },
  {
    name: 'Quantum/Modern',
    icon: '⚛️',
    formulas: [
      { label: 'Mass-Energy', latex: 'E = mc^2' },
      { label: 'Photon Energy', latex: 'E = hf' },
      { label: 'De Broglie', latex: '\\lambda = \\frac{h}{p}' },
      { label: 'Heisenberg', latex: '\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}' },
      { label: 'Schrödinger', latex: 'i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi' },
      { label: 'Planck Relation', latex: 'E = h\\nu' },
      { label: 'Radioactive Decay', latex: 'N(t) = N_0 e^{-\\lambda t}' },
    ],
  },
  {
    name: 'Waves',
    icon: '〰️',
    formulas: [
      { label: 'Wave Equation', latex: 'y = A\\sin(kx - \\omega t)' },
      { label: 'Wave Speed', latex: 'v = f\\lambda' },
      { label: 'Doppler Effect', latex: "f' = f\\frac{v \\pm v_o}{v \\mp v_s}" },
      { label: 'Beat Frequency', latex: 'f_{beat} = |f_1 - f_2|' },
      { label: 'Standing Wave', latex: 'f_n = \\frac{nv}{2L}' },
    ],
  },
];

const LatexPanel: React.FC<LatexPanelProps> = ({ isOpen, onClose, onInsert }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [customLatex, setCustomLatex] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[700px] max-w-[95vw] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">📐 Physics Formulas & LaTeX</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Custom LaTeX Input */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Custom LaTeX</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customLatex}
              onChange={(e) => setCustomLatex(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Enter LaTeX expression (e.g., E = mc^2)"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customLatex.trim()) {
                  onInsert(customLatex);
                  setCustomLatex('');
                }
              }}
            />
            <button
              onClick={() => {
                if (customLatex.trim()) {
                  onInsert(customLatex);
                  setCustomLatex('');
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
            >
              Insert
            </button>
          </div>
          {customLatex && (
            <div className="mt-2 p-2 bg-white rounded border border-gray-200 flex items-center justify-center min-h-[36px]">
              <div
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(customLatex, { throwOnError: false }),
                }}
              />
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {formulaCategories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                activeCategory === i
                  ? 'text-blue-600 border-b-2 border-blue-500 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Formula Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2">
            {formulaCategories[activeCategory].formulas.map((formula) => (
              <button
                key={formula.latex}
                onClick={() => {
                  onInsert(formula.latex);
                }}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">{formula.label}</div>
                  <div className="overflow-hidden">
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: katex.renderToString(formula.latex, { throwOnError: false }),
                      }}
                    />
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-blue-500 text-lg">+</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-400 text-center">
            Click any formula to insert it as a LaTeX element on the canvas. Double-click elements to edit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LatexPanel;
