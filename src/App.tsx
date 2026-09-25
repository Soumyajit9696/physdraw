import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DiagramElement, Tool, Point, NodePoint } from './types';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import StyleEditor from './components/StyleEditor';
import ExportPanel from './components/ExportPanel';
import LatexPanel from './components/LatexPanel';
import TemplateGallery from './components/TemplateGallery';
import 'katex/dist/katex.min.css';

type AppMode = 'draw' | 'edit';

function App() {
  const [elements, setElements] = useState<DiagramElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const [showLatexPanel, setShowLatexPanel] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [history, setHistory] = useState<DiagramElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [appMode, setAppMode] = useState<AppMode>('draw');

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const pushHistory = useCallback((newElements: DiagramElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const addElement = useCallback((element: DiagramElement) => {
    const newElements = [...elements, element];
    setElements(newElements);
    pushHistory(newElements);
    setSelectedIds([element.id]);
  }, [elements, pushHistory]);

  const updateElement = useCallback((id: string, updates: Partial<DiagramElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

  const updateElementWithHistory = useCallback((id: string, updates: Partial<DiagramElement>) => {
    const newElements = elements.map(el => el.id === id ? { ...el, ...updates } : el);
    setElements(newElements);
    pushHistory(newElements);
  }, [elements, pushHistory]);

  // Batch update multiple elements (for style editor)
  const updateMultipleElements = useCallback((ids: string[], updates: Partial<DiagramElement>) => {
    const newElements = elements.map(el => ids.includes(el.id) ? { ...el, ...updates } : el);
    setElements(newElements);
    pushHistory(newElements);
  }, [elements, pushHistory]);

  const deleteElement = useCallback((id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    pushHistory(newElements);
    setSelectedIds(prev => prev.filter(sid => sid !== id));
  }, [elements, pushHistory]);

  // Node operations
  const updateNodes = useCallback((elementId: string, nodes: NodePoint[]) => {
    setElements(prev => prev.map(el => {
      if (el.id !== elementId) return el;
      const points = nodes.map(n => ({ x: n.x, y: n.y }));
      // Update element position based on first node
      const newX = nodes[0]?.x ?? el.x;
      const newY = nodes[0]?.y ?? el.y;
      return { ...el, nodes, points, x: newX, y: newY };
    }));
  }, []);

  const updatePoints = useCallback((elementId: string, points: Point[]) => {
    setElements(prev => prev.map(el => {
      if (el.id !== elementId) return el;
      const nodes = el.nodes?.map((n, i) => points[i] ? { ...n, x: points[i].x, y: points[i].y } : n) || [];
      return { ...el, points, nodes };
    }));
  }, []);

  const deleteNode = useCallback((elementId: string, nodeId: string) => {
    setElements(prev => {
      const newElements = prev.map(el => {
        if (el.id !== elementId) return el;
        const newNodes = (el.nodes || []).filter(n => n.id !== nodeId);
        const newPoints = newNodes.map(n => ({ x: n.x, y: n.y }));
        return { ...el, nodes: newNodes, points: newPoints };
      });
      pushHistory(newElements);
      return newElements;
    });
  }, [pushHistory]);

  const addNode = useCallback((elementId: string, point: Point, afterIndex?: number) => {
    setElements(prev => {
      const newElements = prev.map(el => {
        if (el.id !== elementId) return el;
        const newNode: NodePoint = { id: crypto.randomUUID(), x: point.x, y: point.y, type: 'vertex' };
        let newNodes = [...(el.nodes || [])];
        if (afterIndex !== undefined) {
          newNodes.splice(afterIndex + 1, 0, newNode);
        } else {
          newNodes.push(newNode);
        }
        const newPoints = newNodes.map(n => ({ x: n.x, y: n.y }));
        return { ...el, nodes: newNodes, points: newPoints };
      });
      pushHistory(newElements);
      return newElements;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  }, [historyIndex, history]);

  const clearCanvas = useCallback(() => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      const newElements: DiagramElement[] = [];
      setElements(newElements);
      pushHistory(newElements);
      setSelectedIds([]);
    }
  }, [pushHistory]);

  const duplicateSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const newElements: DiagramElement[] = [];
    selectedIds.forEach(id => {
      const el = elements.find(e => e.id === id);
      if (!el) return;
      const newEl: DiagramElement = {
        ...el,
        id: crypto.randomUUID(),
        x: el.x + 20,
        y: el.y + 20,
        nodes: el.nodes?.map(n => ({ ...n, id: crypto.randomUUID(), x: n.x + 20, y: n.y + 20 })),
        points: el.points?.map(p => ({ x: p.x + 20, y: p.y + 20 })),
      };
      newElements.push(newEl);
    });
    const allNew = [...elements, ...newElements];
    setElements(allNew);
    pushHistory(allNew);
    setSelectedIds(newElements.map(e => e.id));
  }, [selectedIds, elements, pushHistory]);

  const bringToFront = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const rest = elements.filter(el => !selectedIds.includes(el.id));
    const newElements = [...rest, ...selected];
    setElements(newElements);
  }, [selectedIds, elements]);

  const sendToBack = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const rest = elements.filter(el => !selectedIds.includes(el.id));
    const newElements = [...selected, ...rest];
    setElements(newElements);
  }, [selectedIds, elements]);

  const insertLatex = useCallback((latex: string) => {
    const id = crypto.randomUUID();
    const newElement: DiagramElement = {
      id, type: 'latex',
      x: 100 + Math.random() * 200, y: 100 + Math.random() * 200,
      latex, width: 200, height: 60,
      color: '#1f2937', strokeWidth: 0, nodes: [],
    };
    addElement(newElement);
    setShowLatexPanel(false);
  }, [addElement]);

  const loadTemplate = useCallback((templateElements: DiagramElement[]) => {
    const newElements = [...elements, ...templateElements];
    setElements(newElements);
    pushHistory(newElements);
  }, [elements, pushHistory]);

  // Save/Load
  const saveDiagram = useCallback(() => {
    localStorage.setItem('physicsdraw-diagram', JSON.stringify(elements));
    alert('Diagram saved!');
  }, [elements]);

  const loadDiagram = useCallback(() => {
    const saved = localStorage.getItem('physicsdraw-diagram');
    if (saved) {
      try {
        const loaded = JSON.parse(saved) as DiagramElement[];
        setElements(loaded);
        pushHistory(loaded);
        setSelectedIds([]);
      } catch { alert('Failed to load.'); }
    } else { alert('No saved diagram found.'); }
  }, [pushHistory]);

  // Auto-load
  useEffect(() => {
    const saved = localStorage.getItem('physicsdraw-diagram');
    if (saved) {
      try {
        const loaded = JSON.parse(saved) as DiagramElement[];
        if (loaded.length > 0) { setElements(loaded); setHistory([loaded]); }
      } catch { /* ignore */ }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
        if (e.key === 'd') { e.preventDefault(); duplicateSelected(); }
        if (e.key === 'e') { e.preventDefault(); setShowExport(true); }
        if (e.key === 'a') { e.preventDefault(); setSelectedIds(elements.map(el => el.id)); }
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
        case 'w': setCurrentTool('wire'); break;
        case 'p': setCurrentTool('polyline'); break;
        case 'escape': setSelectedIds([]); break;
        case '=': case '+': setZoom(z => Math.min(z + 0.1, 3)); break;
        case '-': setZoom(z => Math.max(z - 0.1, 0.3)); break;
        case '0': setZoom(1); break;
        case '[': sendToBack(); break;
        case ']': bringToFront(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, duplicateSelected, elements, sendToBack, bringToFront]);

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

  const selectedElement = selectedIds.length === 1 ? elements.find(el => el.id === selectedIds[0]) || null : null;

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
          {/* Mode Toggle */}
          <div className="flex items-center bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => { setAppMode('draw'); setCurrentTool('select'); }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                appMode === 'draw'
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ✏️ Draw
            </button>
            <button
              onClick={() => { setAppMode('edit'); setCurrentTool('select'); }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                appMode === 'edit'
                  ? 'bg-purple-500 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🎨 Edit Styles
            </button>
          </div>
        </div>

        {/* Center Actions */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button onClick={undo} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-xs" title="Undo (Ctrl+Z)">↩ Undo</button>
          <button onClick={redo} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-xs" title="Redo (Ctrl+Y)">↪ Redo</button>
          <div className="h-5 w-px bg-gray-600 mx-1" />
          <button onClick={duplicateSelected} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-xs" title="Duplicate (Ctrl+D)">⧉ Dup</button>
          <button onClick={bringToFront} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-xs" title="Bring to Front (])">⬆ Front</button>
          <button onClick={sendToBack} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-xs" title="Send to Back ([)">⬇ Back</button>
          <button onClick={clearCanvas} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-xs">🗑 Clear</button>
          <div className="h-5 w-px bg-gray-600 mx-1" />
          <button onClick={saveDiagram} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-xs">💾 Save</button>
          <button onClick={loadDiagram} className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-xs">📂 Load</button>
          <div className="h-5 w-px bg-gray-600 mx-1" />
          <button onClick={() => setShowGrid(!showGrid)} className={`px-2 py-1 rounded text-xs ${showGrid ? 'text-blue-300 bg-blue-500/20' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}>⊞ Grid</button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1">
            <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))} className="text-gray-300 hover:text-white px-1">−</button>
            <span className="text-gray-300 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(z + 0.1, 3))} className="text-gray-300 hover:text-white px-1">+</button>
          </div>
          <button onClick={() => setShowTemplates(true)} className="px-2 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg">📋 Templates</button>
          <button onClick={() => setShowLatexPanel(true)} className="px-2 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-lg">∑ Formulas</button>
          <button onClick={() => setShowExport(true)} className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg">📤 Export</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - only in draw mode */}
        {appMode === 'draw' && (
          <Toolbar currentTool={currentTool} onToolChange={setCurrentTool} />
        )}
        {/* Edit mode indicator */}
        {appMode === 'edit' && (
          <div className="w-14 bg-gradient-to-b from-purple-900 to-purple-800 flex flex-col items-center py-3 gap-2 border-r border-purple-700">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white text-lg shadow-lg">
              🎨
            </div>
            <span className="text-purple-200 text-[10px] font-medium text-center leading-tight">Edit<br/>Mode</span>
            <div className="flex-1" />
            <button
              onClick={() => setAppMode('draw')}
              className="w-10 h-9 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs flex items-center justify-center transition-colors"
              title="Switch to Draw mode"
            >
              ✏️
            </button>
          </div>
        )}

        <div ref={canvasContainerRef} className="flex-1 relative overflow-hidden">
          {/* Canvas info bar */}
          <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm px-3 py-1.5 text-xs text-gray-600 border border-gray-200">
              {appMode === 'draw' ? (
                <>Tool: <span className="font-semibold text-gray-800 capitalize">{currentTool}</span></>
              ) : (
                <span className="text-purple-600 font-semibold">🎨 Edit Mode</span>
              )}
              <span className="mx-2">|</span>
              Elements: <span className="font-semibold text-gray-800">{elements.length}</span>
              {selectedIds.length > 0 && <><span className="mx-2">|</span>Selected: <span className={`font-semibold ${appMode === 'edit' ? 'text-purple-600' : 'text-blue-600'}`}>{selectedIds.length}</span></>}
            </div>
            {appMode === 'edit' ? (
              <div className="bg-purple-50 rounded-lg shadow-sm px-3 py-1.5 text-xs text-purple-700 border border-purple-200">
                🎨 <b>Edit Mode:</b> Click elements to select • Shift+click for multi-select • Use the Style panel on the right to edit colors, strokes, and more
              </div>
            ) : selectedIds.length > 0 && (
              <div className="bg-blue-50 rounded-lg shadow-sm px-3 py-1.5 text-xs text-blue-700 border border-blue-200">
                💡 Drag nodes to reshape • Right-click node to delete • Click + on edge to add node • Double-click node to label
              </div>
            )}
          </div>

          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-20">⚛️</div>
                <h2 className="text-xl font-semibold text-gray-400 mb-2">Start Drawing Physics Diagrams</h2>
                <p className="text-sm text-gray-400 max-w-md">
                  Select a tool from the left toolbar and click on the canvas.
                  <br />Create circuits, force diagrams, EM fields, optics, and more!
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {['⚡ Circuit', '→ Force', '🧲 Magnet', '∑ LaTeX', '〰️ Wave', '⚛ Atom'].map(item => (
                    <span key={item} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Canvas
            elements={elements}
            selectedIds={selectedIds}
            tool={appMode === 'edit' ? 'select' : currentTool}
            onAddElement={addElement}
            onUpdateElement={updateElement}
            onSelectElements={setSelectedIds}
            onDeleteElement={deleteElement}
            zoom={zoom}
            showGrid={showGrid}
            svgRef={svgRef}
            onUpdateNodes={updateNodes}
            onUpdatePoints={updatePoints}
            onDeleteNode={deleteNode}
            onAddNode={addNode}
          />
        </div>

        {/* Right panel - StyleEditor in edit mode, PropertiesPanel in draw mode */}
        {appMode === 'edit' ? (
          <StyleEditor
            elements={elements}
            selectedIds={selectedIds}
            onUpdate={updateMultipleElements}
            onDelete={deleteElement}
            onSelectAll={() => setSelectedIds(elements.map(el => el.id))}
            onDeselectAll={() => setSelectedIds([])}
            onSelectById={(id) => {
              setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
            }}
          />
        ) : (
          <PropertiesPanel
            element={selectedElement}
            selectedIds={selectedIds}
            onUpdate={updateElementWithHistory}
            onDelete={deleteElement}
          />
        )}
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-7 bg-gray-800 flex items-center justify-between px-4 text-xs text-gray-400 border-t border-gray-700 shrink-0">
        <div className="flex items-center gap-4">
          <span>PhysicsDraw v2.0</span>
          <span>•</span>
          <span className={appMode === 'edit' ? 'text-purple-300' : 'text-blue-300'}>
            {appMode === 'draw' ? '✏️ Draw Mode' : '🎨 Edit Mode'}
          </span>
          <span>•</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>•</span>
          <span>Grid: {showGrid ? 'On' : 'Off'}</span>
        </div>
        <div className="flex items-center gap-4">
          {appMode === 'draw' ? (
            <>
              <span>V=Select L=Line A=Arrow R=Rect C=Circle T=Text X=LaTeX W=Wire P=Poly E=Eraser</span>
              <span>•</span>
              <span>Ctrl+Z=Undo Ctrl+A=SelectAll Ctrl+D=Dup</span>
            </>
          ) : (
            <>
              <span>Click to select • Shift+click for multi-select • Edit styles in the right panel</span>
              <span>•</span>
              <span>Ctrl+A=SelectAll Ctrl+Z=Undo</span>
            </>
          )}
        </div>
      </footer>

      <ExportPanel
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        canvasRef={canvasContainerRef as React.RefObject<HTMLDivElement>}
        svgRef={svgRef as React.RefObject<SVGSVGElement>}
      />
      <LatexPanel isOpen={showLatexPanel} onClose={() => setShowLatexPanel(false)} onInsert={insertLatex} />
      <TemplateGallery isOpen={showTemplates} onClose={() => setShowTemplates(false)} onLoadTemplate={loadTemplate} />
    </div>
  );
}

export default App;
