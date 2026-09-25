import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DiagramElement, Tool } from './types';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import ExportPanel from './components/ExportPanel';
import LatexPanel from './components/LatexPanel';
import TemplateGallery from './components/TemplateGallery';
import 'katex/dist/katex.min.css';

function App() {
  const [elements, setElements] = useState<DiagramElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const [showLatexPanel, setShowLatexPanel] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [history, setHistory] = useState<DiagramElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const pushHistory = useCallback((newElements: DiagramElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const addElement = useCallback((element: DiagramElement) => {
    const newElements = [...elements, element];
    setElements(newElements);
    pushHistory(newElements);
    setSelectedId(element.id);
  }, [elements, pushHistory]);

  const updateElement = useCallback((id: string, updates: Partial<DiagramElement>) => {
    const newElements = elements.map(el => el.id === id ? { ...el, ...updates } : el);
    setElements(newElements);
  }, [elements]);

  const deleteElement = useCallback((id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    pushHistory(newElements);
    if (selectedId === id) setSelectedId(null);
  }, [elements, selectedId, pushHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  const clearCanvas = useCallback(() => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      const newElements: DiagramElement[] = [];
      setElements(newElements);
      pushHistory(newElements);
      setSelectedId(null);
    }
  }, [pushHistory]);

  const insertLatex = useCallback((latex: string) => {
    const id = crypto.randomUUID();
    const newElement: DiagramElement = {
      id,
      type: 'latex',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      latex,
      width: 200,
      height: 60,
      color: '#1f2937',
      strokeWidth: 0,
    };
    addElement(newElement);
    setShowLatexPanel(false);
  }, [addElement]);

  // Save to localStorage
  const saveDiagram = useCallback(() => {
    localStorage.setItem('physicsdraw-diagram', JSON.stringify(elements));
    alert('Diagram saved! It will be restored when you reopen the app.');
  }, [elements]);

  // Load from localStorage
  const loadDiagram = useCallback(() => {
    const saved = localStorage.getItem('physicsdraw-diagram');
    if (saved) {
      try {
        const loaded = JSON.parse(saved) as DiagramElement[];
        setElements(loaded);
        pushHistory(loaded);
        setSelectedId(null);
      } catch {
        alert('Failed to load saved diagram.');
      }
    } else {
      alert('No saved diagram found.');
    }
  }, [pushHistory]);

  // Auto-load on mount
  useEffect(() => {
    const saved = localStorage.getItem('physicsdraw-diagram');
    if (saved) {
      try {
        const loaded = JSON.parse(saved) as DiagramElement[];
        if (loaded.length > 0) {
          setElements(loaded);
          setHistory([loaded]);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const loadTemplate = useCallback((templateElements: DiagramElement[]) => {
    const newElements = [...elements, ...templateElements];
    setElements(newElements);
    pushHistory(newElements);
  }, [elements, pushHistory]);

  const duplicateSelected = useCallback(() => {
    if (!selectedId) return;
    const el = elements.find(e => e.id === selectedId);
    if (!el) return;
    const newEl: DiagramElement = {
      ...el,
      id: crypto.randomUUID(),
      x: el.x + 20,
      y: el.y + 20,
      selected: false,
    };
    addElement(newEl);
  }, [selectedId, elements, addElement]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
        if (e.key === 'd') { e.preventDefault(); duplicateSelected(); }
        if (e.key === 'e') { e.preventDefault(); setShowExport(true); }
        if (e.key === 's') { e.preventDefault(); setShowExport(true); }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v': setCurrentTool('select'); break;
        case 'l': setCurrentTool('line'); break;
        case 'a': setCurrentTool('arrow'); break;
        case 'r': setCurrentTool('rectangle'); break;
        case 'c': setCurrentTool('circle'); break;
        case 't': setCurrentTool('text'); break;
        case 'x': setCurrentTool('latex'); break;
        case 'e': setCurrentTool('eraser'); break;
        case 'escape': setSelectedId(null); break;
        case '=': case '+': setZoom(z => Math.min(z + 0.1, 3)); break;
        case '-': setZoom(z => Math.max(z - 0.1, 0.3)); break;
        case '0': setZoom(1); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, duplicateSelected]);

  // Zoom with mouse wheel
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(z => Math.min(Math.max(z + delta, 0.3), 3));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const selectedElement = elements.find(el => el.id === selectedId) || null;

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-12 bg-gray-900 flex items-center justify-between px-4 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">φ</span>
            </div>
            <h1 className="text-white font-bold text-sm tracking-wide">PhysicsDraw</h1>
          </div>
          <div className="h-5 w-px bg-gray-600" />
          <span className="text-gray-400 text-xs">Online Physics Diagram Editor</span>
        </div>

        {/* Center Actions */}
        <div className="flex items-center gap-1">
          <button onClick={undo} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm" title="Undo (Ctrl+Z)">
            ↩ Undo
          </button>
          <button onClick={redo} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm" title="Redo (Ctrl+Y)">
            ↪ Redo
          </button>
          <div className="h-5 w-px bg-gray-600 mx-1" />
          <button onClick={duplicateSelected} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm" title="Duplicate (Ctrl+D)">
            ⧉ Duplicate
          </button>
          <button onClick={clearCanvas} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm">
            🗑 Clear
          </button>
          <div className="h-5 w-px bg-gray-600 mx-1" />
          <button onClick={saveDiagram} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm" title="Save diagram to browser">
            💾 Save
          </button>
          <button onClick={loadDiagram} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm" title="Load saved diagram">
            📂 Load
          </button>
          <div className="h-5 w-px bg-gray-600 mx-1" />
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded text-sm ${showGrid ? 'text-blue-300 bg-blue-500/20' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
          >
            ⊞ Grid
          </button>
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-2 py-1 rounded text-sm ${snapToGrid ? 'text-blue-300 bg-blue-500/20' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
          >
            ⊡ Snap
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1">
            <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))} className="text-gray-300 hover:text-white px-1">−</button>
            <span className="text-gray-300 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(z + 0.1, 3))} className="text-gray-300 hover:text-white px-1">+</button>
            <button onClick={() => setZoom(1)} className="text-gray-400 hover:text-white text-xs ml-1">Reset</button>
          </div>
          <button
            onClick={() => setShowTemplates(true)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
          >
            📋 Templates
          </button>
          <button
            onClick={() => setShowLatexPanel(true)}
            className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
          >
            ∑ Formulas
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
          >
            📤 Export
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <Toolbar currentTool={currentTool} onToolChange={setCurrentTool} />

        {/* Canvas Area */}
        <div ref={canvasContainerRef} className="flex-1 relative overflow-hidden">
          {/* Canvas info bar */}
          <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm px-3 py-1.5 text-xs text-gray-600 border border-gray-200">
              Tool: <span className="font-semibold text-gray-800 capitalize">{currentTool}</span>
              <span className="mx-2">|</span>
              Elements: <span className="font-semibold text-gray-800">{elements.length}</span>
              {selectedId && <><span className="mx-2">|</span>Selected: <span className="font-semibold text-blue-600">1</span></>}
            </div>
          </div>

          {/* Template hints */}
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-20">⚛️</div>
                <h2 className="text-xl font-semibold text-gray-400 mb-2">Start Drawing</h2>
                <p className="text-sm text-gray-400 max-w-md">
                  Select a tool from the left toolbar and click on the canvas to start creating physics diagrams.
                  <br />Try electronics circuits, force diagrams, electromagnetic fields, and more!
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {['⚡ Circuit', '→ Force', '🧲 Magnet', '∑ LaTeX', '〰️ Wave'].map(item => (
                    <span key={item} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Canvas
            elements={elements}
            selectedId={selectedId}
            tool={currentTool}
            onAddElement={addElement}
            onUpdateElement={updateElement}
            onSelectElement={setSelectedId}
            onDeleteElement={deleteElement}
            zoom={zoom}
            showGrid={showGrid}
            svgRef={svgRef}
          />
        </div>

        {/* Right Properties Panel */}
        <PropertiesPanel
          element={selectedElement}
          onUpdate={updateElement}
          onDelete={deleteElement}
        />
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-7 bg-gray-800 flex items-center justify-between px-4 text-xs text-gray-400 border-t border-gray-700 shrink-0">
        <div className="flex items-center gap-4">
          <span>PhysicsDraw v1.0</span>
          <span>•</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>•</span>
          <span>Grid: {showGrid ? 'On' : 'Off'}</span>
          <span>•</span>
          <span>Snap: {snapToGrid ? 'On' : 'Off'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Shortcuts: V=Select, L=Line, A=Arrow, R=Rect, C=Circle, T=Text, X=LaTeX, E=Eraser</span>
          <span>•</span>
          <span>Ctrl+Z=Undo, Ctrl+Y=Redo, Ctrl+D=Duplicate, Ctrl+E=Export</span>
        </div>
      </footer>

      {/* Export Modal */}
      <ExportPanel
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        canvasRef={canvasContainerRef as React.RefObject<HTMLDivElement>}
        svgRef={svgRef as React.RefObject<SVGSVGElement>}
      />

      {/* LaTeX Formulas Panel */}
      <LatexPanel
        isOpen={showLatexPanel}
        onClose={() => setShowLatexPanel(false)}
        onInsert={insertLatex}
      />

      {/* Template Gallery */}
      <TemplateGallery
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onLoadTemplate={loadTemplate}
      />
    </div>
  );
}

export default App;
