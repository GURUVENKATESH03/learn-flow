import React, { useState, useRef } from 'react';
import { Brain, ZoomIn, ZoomOut, RotateCcw, Sparkles, X, Plus } from 'lucide-react';
import { Note } from '../../types';

interface GraphNode {
  id: string;
  label: string;
  category: 'core' | 'framework' | 'concept' | 'database';
  x: number;
  y: number;
  noteId?: string;
  connections: string[];
}

interface InteractiveKnowledgeGraphProps {
  notes?: Note[];
  onSelectNote?: (noteId: string) => void;
  height?: number;
}

export const InteractiveKnowledgeGraph: React.FC<InteractiveKnowledgeGraphProps> = ({
  notes = [],
  onSelectNote,
  height = 360,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate dynamic nodes strictly from the live notes collection
  const dynamicNodes: GraphNode[] = React.useMemo(() => {
    if (notes.length === 0) return [];

    const result: GraphNode[] = [];
    const width = 360;
    const h = height || 360;

    notes.forEach((note, nIdx) => {
      const angle = (nIdx / notes.length) * 2 * Math.PI;
      const radius = 100;
      const noteX = Math.round(width / 2 + radius * Math.cos(angle));
      const noteY = Math.round(h / 2 + radius * Math.sin(angle));

      const tagConnections: string[] = [];

      // Add child tag nodes
      note.tags.slice(0, 3).forEach((tag, tIdx) => {
        const tagId = `tag-${note.id}-${tIdx}`;
        tagConnections.push(tagId);
        const subAngle = angle + (tIdx - 1) * 0.4;
        result.push({
          id: tagId,
          label: tag,
          category: 'concept',
          x: Math.round(noteX + 45 * Math.cos(subAngle)),
          y: Math.round(noteY + 45 * Math.sin(subAngle)),
          noteId: note.id,
          connections: [note.id],
        });
      });

      result.push({
        id: note.id,
        label: note.title,
        category: 'core',
        x: noteX,
        y: noteY,
        noteId: note.id,
        connections: tagConnections,
      });
    });

    return result;
  }, [notes, height]);

  const [nodes, setNodes] = useState<GraphNode[]>(dynamicNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  React.useEffect(() => {
    setNodes(dynamicNodes);
    if (dynamicNodes.length > 0 && !selectedNodeId) {
      setSelectedNodeId(dynamicNodes[0].id);
    }
  }, [dynamicNodes]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (notes.length === 0) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center space-y-3"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Knowledge Graph Empty
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-0.5">
            Add notes with tags or mind maps to automatically generate your interactive visual concept network.
          </p>
        </div>
      </div>
    );
  }

  // Handle dragging node positions on SVG canvas
  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingNodeId(id);
    setSelectedNodeId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = (e.clientX - rect.left - pan.x) / zoom;
      const newY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  return (
    <div
      ref={containerRef}
      style={{ height }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full rounded-3xl bg-slate-900 overflow-hidden border border-slate-800 select-none shadow-inner"
    >
      {/* Floating Canvas Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-md">
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
          className="p-1 rounded-xl hover:bg-slate-700 text-slate-300"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
          className="p-1 rounded-xl hover:bg-slate-700 text-slate-300"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1 rounded-xl hover:bg-slate-700 text-slate-300"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Canvas Rendering */}
      <svg className="w-full h-full cursor-crosshair">
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Connection Lines */}
          {nodes.map((node) =>
            node.connections.map((targetId) => {
              const targetNode = nodes.find((n) => n.id === targetId);
              if (!targetNode) return null;

              const isHighlighted =
                selectedNodeId === node.id || selectedNodeId === targetId;

              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={node.x}
                  y1={node.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={isHighlighted ? '#6366f1' : '#334155'}
                  strokeWidth={isHighlighted ? 2.5 : 1.2}
                  strokeDasharray={isHighlighted ? 'none' : '4,4'}
                  className="transition-all duration-300"
                />
              );
            })
          )}

          {/* Graph Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isCore = node.category === 'core';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                className="cursor-pointer"
              >
                {/* Node Outer Glow */}
                {isSelected && (
                  <circle
                    r={isCore ? 26 : 20}
                    className="fill-indigo-500/20 stroke-indigo-400 stroke-1 animate-pulse"
                  />
                )}

                {/* Node Circle */}
                <circle
                  r={isCore ? 18 : 13}
                  className={`transition-all duration-200 ${
                    isSelected
                      ? 'fill-indigo-600 stroke-white stroke-2'
                      : isCore
                      ? 'fill-indigo-500 stroke-indigo-300 stroke-1'
                      : 'fill-slate-800 stroke-slate-600 stroke-1 hover:stroke-slate-400'
                  }`}
                />

                {/* Node Label */}
                <text
                  y={isCore ? 28 : 22}
                  textAnchor="middle"
                  className={`text-[10px] font-semibold pointer-events-none select-none ${
                    isSelected ? 'fill-white font-bold' : 'fill-slate-400'
                  }`}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Selected Node Bottom Bar */}
      {selectedNode && (
        <div className="absolute bottom-3 left-3 right-3 z-10 p-3 rounded-2xl bg-slate-800/90 backdrop-blur-md border border-slate-700/80 flex items-center justify-between gap-3 text-xs text-white">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-indigo-400 block">
              Node: {selectedNode.category}
            </span>
            <h4 className="font-bold truncate">{selectedNode.label}</h4>
          </div>

          {selectedNode.noteId && onSelectNote && (
            <button
              onClick={() => onSelectNote(selectedNode.noteId!)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[11px] font-bold text-white transition shrink-0"
            >
              Open Note
            </button>
          )}
        </div>
      )}
    </div>
  );
};
