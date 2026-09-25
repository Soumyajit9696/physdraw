import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DiagramElement, Tool, Point, NodePoint } from './types';
import Canvas from './components/Canvas';
import ShapeLibrary from './components/ShapeLibrary';
import TopBar from './components/TopBar';
import FormatPanel from './components/FormatPanel';
import ExportPanel from './components/ExportPanel';
import LatexPanel from './components/LatexPanel';
import TemplateGallery from './components/TemplateGallery';
import ContextMenu from './components/ContextMenu';
import 'katex/dist/katex.min.css';

function App() {
  const [elements, setElements] = useState<DiagramElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [showExport, setShowExport] = useState(false);
  const [showLatexPanel, setShowLatexPanel] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [history, setHistory] = useState<DiagramElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [clipboard, setClipboard] = useState<DiagramElement[]>([]);

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

  const deleteElement = useCallback((id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    pushHistory(newElements);
    setSelectedIds(prev => prev.filter(sid => sid !== id));
  }, [elements, pushHistory]);

  const updateNodes = useCallback((elementId: string, nodes: NodePoint[]) => {
    setElements(prev => prev.map(el => {
      if (el.id !== elementId) return el;
      const points = nodes.map(n => ({ x: n.x, y: n.y }));
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
        if (afterIndex !== undefined) newNodes.splice(afterIndex + 1, 0, newNode);
        else newNodes.push(newNode);
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
    if (confirm('Clear the entire canvas?')) {
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
      newElements.push({
        ...el,
        id: crypto.randomUUID(),
        x: el.x + 20, y: el.y + 20,
        nodes: el.nodes?.map(n => ({ ...n, id: crypto.randomUUID(), x: n.x + 20, y: n.y + 20 })),
        points: el.points?.map(p => ({ x: p.x + 20, y: p.y + 20 })),
      });
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
    setElements([...rest, ...selected]);
  }, [selectedIds, elements]);

  const sendToBack = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const rest = elements.filter(el => !selectedIds.includes(el.id));
    setElements([...selected, ...rest]);
  }, [selectedIds, elements]);

  const copySelected = useCallback(() => {
    const copied = elements.filter(el => selectedIds.includes(el.id));
    setClipboard(copied);
  }, [elements, selectedIds]);

  const pasteFromClipboard = useCallback(() => {
    if (clipboard.length === 0) return;
    const newElements: DiagramElement[] = clipboard.map(el => ({
      ...el,
      id: crypto.randomUUID(),
      x: el.x + 30,
      y: el.y + 30,
      nodes: el.nodes?.map(n => ({ ...n, id: crypto.randomUUID(), x: n.x + 30, y: n.y + 30 })),
      points: el.points?.map(p => ({ x: p.x + 30, y: p.y + 30 })),
    }));
    const allNew = [...elements, ...newElements];
    setElements(allNew);
    pushHistory(allNew);
    setSelectedIds(newElements.map(e => e.id));
  }, [clipboard, elements, pushHistory]);

  // Alignment functions
  const alignLeft = useCallback(() => {
    if (selectedIds.length < 2) return;
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const minX = Math.min(...selected.map(el => el.x));
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, x: minX } : el);
    setElements(newElements);
    pushHistory(newElements);
  }, [selectedIds, elements, pushHistory]);

  const alignCenter = useCallback(() => {
    if (selectedIds.length < 2) return;
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const centers = selected.map(el => el.x + (el.width || 60) / 2);
    const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
    const newElements = elements.map(el => {
      if (!selectedIds.includes(el.id)) return el;
      const w = el.width || 60;
      return { ...el, x: avgCenter - w / 2 };
    });
    setElements(newElements);
    pushHistory(newElements);
  }, [selectedIds, elements, pushHistory]);

  const alignRight = useCallback(() => {
    if (selectedIds.length < 2) return;
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const maxX = Math.max(...selected.map(el => el.x + (el.width || 60)));
    const newElements = elements.map(el => {
      if (!selectedIds.includes(el.id)) return el;
      const w = el.width || 60;
      return { ...el, x: maxX - w };
    });
    setElements(newElements);
    pushHistory(newElements);
  }, [selectedIds, elements, pushHistory]);

  const alignTop = useCallback(() => {
    if (selectedIds.length < 2) return;
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const minY = Math.min(...selected.map(el => el.y));
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, y: minY } : el);
    setElements(newElements);
    pushHistory(newElements);
  }, [selectedIds, elements, pushHistory]);

  const alignMiddle = useCallback(() => {
    if (selectedIds.length < 2) return;
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const middles = selected.map(el => el.y + (el.height || 60) / 2);
    const avgMiddle = middles.reduce((a, b) => a + b, 0) / middles.length;
    const newElements = elements.map(el => {
      if (!selectedIds.includes(el.id)) return el;
      const h = el.height || 60;
      return { ...el, y: avgMiddle - h / 2 };
    });
    setElements(newElements);
    pushHistory(newElements);
  }, [selectedIds, elements, pushHistory]);

  const alignBottom = useCallback(() => {
    if (selectedIds.length < 2) return;
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const maxY = Math.max(...selected.map(el => el.y + (el.height || 60)));
    const newElements = elements.map(el => {
      if (!selectedIds.includes(el.id)) return el;
      const h = el.height || 60;
      return { ...el, y: maxY - h };
    });
    setElements(newElements);
    pushHistory(newElements);
  }, [selectedIds, elements, pushHistory]);

  // Group/Ungroup
  const groupSelected = useCallback(() => {
    if (selectedIds.length < 2) return;
    const groupId = crypto.randomUUID();
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, groupId } : el);
    setElements(newElements);
    pushHistory(newElements);
  }, [selectedIds, elements, pushHistory]);

  const ungroupSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, groupId: undefined } : el);
    setElements(newElements);
    pushHistory(newElements);
  }, [selectedIds, elements, pushHistory]);

  // Lock/Unlock
  const lockSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, locked: true } : el);
    setElements(newElements);
    pushHistory(newElements);
  }, [selectedIds, elements, pushHistory]);

  const unlockSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, locked: false } : el);
    setElements(newElements);
    pushHistory(newElements);
  }, [selectedIds, elements, pushHistory]);

  const insertLatex = useCallback((latex: string) => {
    const id = crypto.randomUUID();
    addElement({
      id, type: 'latex',
      x: 100 + Math.random() * 200, y: 100 + Math.random() * 200,
      latex, width: 200, height: 60,
      color: '#1f2937', strokeWidth: 0, nodes: [],
    });
    setShowLatexPanel(false);
  }, [addElement]);

  const loadTemplate = useCallback((templateElements: DiagramElement[]) => {
    const newElements = [...elements, ...templateElements];
    setElements(newElements);
    pushHistory(newElements);
  }, [elements, pushHistory]);

  const saveDiagram = useCallback(() => {
    localStorage.setItem('physicsdraw-diagram', JSON.stringify(elements));
    alert('Diagram saved to browser storage!');
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

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const tool = e.dataTransfer.getData('tool') as Tool;
    if (!tool) return;

    const container = canvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;

    const id = crypto.randomUUID();
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
      rectangle: { w: 100, h: 60 }, circle: { w: 60, h: 60 }, ellipse: { w: 80, h: 50 },
      text: { w: 100, h: 30 }, latex: { w: 200, h: 60 },
    };
    const size = defaultSizes[tool] || { w: 60, h: 40 };

    const newElement: DiagramElement = {
      id, type: tool,
      x: x - size.w / 2, y: y - size.h / 2,
      width: size.w, height: size.h,
      color: '#1f2937', strokeWidth: 2,
      nodes: [],
      points: tool === 'text' || tool === 'latex' ? undefined : [
        { x: x - size.w / 2, y: y },
        { x: x + size.w / 2, y: y + size.h },
      ],
    };
    if (tool === 'text') newElement.text = 'Text';
    if (tool === 'latex') newElement.latex = 'E = mc^2';

    addElement(newElement);
    setCurrentTool('select');
  }, [zoom, panOffset, addElement]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
        if (e.key === 'd') { e.preventDefault(); duplicateSelected(); }
        if (e.key === 'a') { e.preventDefault(); setSelectedIds(elements.map(el => el.id)); }
        if (e.key === 's') { e.preventDefault(); saveDiagram(); }
        if (e.key === 'e') { e.preventDefault(); setShowExport(true); }
        if (e.key === 'c') { e.preventDefault(); copySelected(); }
        if (e.key === 'v') { e.preventDefault(); pasteFromClipboard(); }
        if (e.key === 'x') { e.preventDefault(); copySelected(); selectedIds.forEach(id => deleteElement(id)); }
        if (e.key === 'g') { e.preventDefault(); groupSelected(); }
        if (e.key === 'u') { e.preventDefault(); ungroupSelected(); }
        if (e.key === 'l') { e.preventDefault(); lockSelected(); }
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case 'v': setCurrentTool('select'); break;
        case 'l': setCurrentTool('line'); break;
        case 'a': setCurrentTool('arrow'); break;
        case 'r': setCurrentTool('rectangle'); break;
        case 'c': setCurrentTool('circle'); break;
        case 't': setCurrentTool('text'); break;
        case 'w': setCurrentTool('wire'); break;
        case 'e': setCurrentTool('eraser'); break;
        case 'escape': setSelectedIds([]); setCurrentTool('select'); break;
        case 'delete': case 'backspace':
          if (selectedIds.length > 0) selectedIds.forEach(id => deleteElement(id));
          break;
        case '=': case '+': setZoom(z => Math.min(z + 0.1, 3)); break;
        case '-': setZoom(z => Math.max(z - 0.1, 0.3)); break;
        case '0': setZoom(1); setPanOffset({ x: 0, y: 0 }); break;
        case '[': sendToBack(); break;
        case ']': bringToFront(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, duplicateSelected, elements, sendToBack, bringToFront, selectedIds, deleteElement, saveDiagram, copySelected, pasteFromClipboard, groupSelected, ungroupSelected, lockSelected]);

  useEffect(() => {
    const saved = localStorage.getItem('physicsdraw-diagram');
    if (saved) {
      try {
        const loaded = JSON.parse(saved) as DiagramElement[];
        if (loaded.length > 0) { setElements(loaded); setHistory([loaded]); }
      } catch { /* ignore */ }
    }
  }, []);

  const selectedElement = selectedIds.length === 1 ? elements.find(el => el.id === selectedIds[0]) || null : null;

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 overflow-hidden">
      <TopBar
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        onUndo={undo}
        onRedo={redo}
        onClear={clearCanvas}
        onSave={saveDiagram}
        onLoad={loadDiagram}
        onExport={() => setShowExport(true)}
        onTemplates={() => setShowTemplates(true)}
        onFormulas={() => setShowLatexPanel(true)}
        onDelete={() => selectedIds.forEach(id => deleteElement(id))}
        onDuplicate={duplicateSelected}
        onCopy={copySelected}
        onPaste={pasteFromClipboard}
        onCut={() => { copySelected(); selectedIds.forEach(id => deleteElement(id)); }}
        onGroup={groupSelected}
        onUngroup={ungroupSelected}
        onLock={lockSelected}
        onUnlock={unlockSelected}
        onAlignLeft={alignLeft}
        onAlignCenter={alignCenter}
        onAlignRight={alignRight}
        onAlignTop={alignTop}
        onAlignMiddle={alignMiddle}
        onAlignBottom={alignBottom}
        zoom={zoom}
        onZoomIn={() => setZoom(z => Math.min(z + 0.1, 3))}
        onZoomOut={() => setZoom(z => Math.max(z - 0.1, 0.3))}
        onZoomReset={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showRulers={showRulers}
        onToggleRulers={() => setShowRulers(!showRulers)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        hasSelection={selectedIds.length > 0}
      />

      <div className="flex flex-1 overflow-hidden">
        <ShapeLibrary
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          onDragStart={() => {}}
        />

        <div
          ref={canvasContainerRef}
          className="flex-1 relative overflow-hidden bg-gray-50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onContextMenu={handleContextMenu}
        >
          <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
            <div className="bg-white/95 backdrop-blur-sm rounded shadow-sm px-2.5 py-1 text-[10px] text-gray-500 border border-gray-200">
              <span className="font-medium text-gray-700">{elements.length}</span> elements
              {selectedIds.length > 0 && <> · <span className="text-blue-600 font-medium">{selectedIds.length}</span> selected</>}
            </div>
          </div>

          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <span className="text-3xl">⚛️</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Start Creating Physics Diagrams</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Drag shapes from the left panel or select a tool from the toolbar above to begin.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {['⚡ Circuits', '→ Forces', '🧲 Fields', '🔬 Optics', '〰️ Waves', '⚛ Quantum'].map(item => (
                    <span key={item} className="px-2 py-1 bg-white rounded-full text-xs text-gray-500 border border-gray-200 shadow-sm">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Canvas
            elements={elements}
            selectedIds={selectedIds}
            tool={currentTool}
            onAddElement={addElement}
            onUpdateElement={updateElement}
            onSelectElements={setSelectedIds}
            onDeleteElement={deleteElement}
            zoom={zoom}
            panOffset={panOffset}
            onPan={setPanOffset}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            svgRef={svgRef}
            onUpdateNodes={updateNodes}
            onUpdatePoints={updatePoints}
            onDeleteNode={deleteNode}
            onAddNode={addNode}
          />
        </div>

        <FormatPanel
          element={selectedElement}
          selectedIds={selectedIds}
          elements={elements}
          onUpdate={updateElementWithHistory}
          onDelete={deleteElement}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onDuplicate={duplicateSelected}
        />
      </div>

      <footer className="h-6 bg-white border-t border-gray-200 flex items-center justify-between px-3 text-[10px] text-gray-500 shrink-0">
        <div className="flex items-center gap-3">
          <span>PhysicsDraw v3.0</span>
          <span className="text-gray-300">|</span>
          <span>{Math.round(zoom * 100)}%</span>
          <span className="text-gray-300">|</span>
          <span>{showGrid ? 'Grid On' : 'Grid Off'}</span>
          <span className="text-gray-300">|</span>
          <span>{snapToGrid ? 'Snap On' : 'Snap Off'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>V=Select · L=Line · A=Arrow · R=Rect · C=Circle · T=Text · W=Wire · E=Eraser</span>
          <span className="text-gray-300">|</span>
          <span>Ctrl+Z=Undo · Ctrl+Y=Redo · Del=Delete · Ctrl+D=Dup · Ctrl+G=Group · Ctrl+L=Lock</span>
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
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCut={() => { copySelected(); selectedIds.forEach(id => deleteElement(id)); }}
          onCopy={copySelected}
          onPaste={pasteFromClipboard}
          onDuplicate={duplicateSelected}
          onDelete={() => selectedIds.forEach(id => deleteElement(id))}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          hasSelection={selectedIds.length > 0}
        />
      )}
    </div>
  );
}

export default App;
