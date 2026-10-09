import React, { useState, useRef, useEffect } from 'react';
import { Brain, ZoomIn, ZoomOut, RotateCcw, Sparkles, Move, Info, X } from 'lucide-react';
import { Note } from '../../types';

interface GraphNode {
  id: string;
  label: string;
  category: 'core' | 'framework' | 'concept' | 'database';
  x: number;
  y: number;
  vx?: number;
  vy?: number;
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

  // Initial nodes network representing Guru's learning ecosystem
  const initialNodes: GraphNode[] = [
    { id: 'spring-sec', label: 'Spring Security', category: 'core', x: 190, y: 150, connections: ['jwt', 'oauth', 'filters'], noteId: 'n1' },
    { id: 'jwt', label: 'JWT Tokens', category: 'framework', x: 280, y: 100, connections: ['spring-sec', 'stateless'], noteId: 'n1' },
    { id: 'filters', label: 'OncePerRequestFilter', category: 'concept', x: 290, y: 220, connections: ['spring-sec'] },
    { id: 'oauth', label: 'OAuth 2.0', category: 'concept', x: 100, y: 120, connections: ['spring-sec'] },
    { id: 'stateless', label: 'Stateless Sessions', category: 'concept', x: 330, y: 40, connections: ['jwt'] },
    
    { id: 'kafka', label: 'Apache Kafka', category: 'core', x: 120, y: 250, connections: ['partitions', 'consumers', 'dist-sys'], noteId: 'n2' },
    { id: 'partitions', label: 'Partitions & Offsets', category: 'concept', x: 50, y: 310, connections: ['kafka'] },
    { id: 'consumers', label: 'Consumer Groups', category: 'concept', x: 190, y: 320, connections: ['kafka'] },
    { id: 'dist-sys', label: 'Distributed Systems', category: 'framework', x: 60, y: 190, connections: ['kafka', 'postgres'] },

    { id: 'postgres', label: 'PostgreSQL', category: 'database', x: 100, y: 40, connections: ['indexing', 'dist-sys'], noteId: 'n5' },
    { id: 'indexing', label: 'B-Tree & GIN Indexes', category: 'concept', x: 200, y: 40, connections: ['postgres'] },
  ];

  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('spring-sec');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Handle dragging node positions on SVG canvas
  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingNodeId(id);
    setSelectedNodeId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((node) => (node.id === draggingNodeId ? { ...node, x: mouseX, y: mouseY } : node))
      );
    } else if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const handleStartPan = (e: React.MouseEvent) => {
    setIsPanning(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleReset = () => {
    setNodes(initialNodes);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Build edges list without duplicates
  const edges: { source: GraphNode; target: GraphNode }[] = [];
  const processedPairs = new Set<string>();

  nodes.forEach((source) => {
    source.connections.forEach((targetId) => {
      const target = nodes.find((n) => n.id === targetId);
      if (target) {
        const pairKey = [source.id, target.id].sort().join('--');
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);
          edges.push({ source, target });
        }
      }
    });
  });

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Knowledge Network Graph</h3>
            <p className="text-[11px] text-slate-400">Interactive concept clusters & dependencies</p>
          </div>
        </div>

        {/* Viewport Zoom & Reset Controls */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
          <button
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition"
            title="Reset Graph"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleStartPan}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ height: `${height}px` }}
        className="relative w-full rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/90 overflow-hidden cursor-grab active:cursor-grabbing border border-slate-800 select-none shadow-inner"
      >
        {/* Background Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
          <defs>
            <pattern id="graph-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#6366f1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-grid)" />
        </svg>

        {/* Dynamic Nodes & Edges Render */}
        <svg className="w-full h-full">
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {edges.map(({ source, target }, idx) => {
              const isHighlighted =
                selectedNodeId === source.id || selectedNodeId === target.id;

              return (
                <g key={idx}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isHighlighted ? '#818cf8' : '#334155'}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    strokeDasharray={isHighlighted ? 'none' : '3 3'}
                    className="transition-all duration-300"
                  />
                  {/* Energy dot on highlighted edges */}
                  {isHighlighted && (
                    <circle
                      cx={(source.x + target.x) / 2}
                      cy={(source.y + target.y) / 2}
                      r="2.5"
                      fill="#a5b4fc"
                      className="animate-ping"
                    />
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isConnected =
                selectedNode &&
                (selectedNode.connections.includes(node.id) || node.connections.includes(selectedNode.id));

              // Colors based on category
              let nodeColor = '#6366f1'; // indigo
              let ringColor = 'rgba(99, 102, 241, 0.4)';
              if (node.category === 'core') {
                nodeColor = '#ec4899'; // rose/pink
                ringColor = 'rgba(236, 72, 153, 0.4)';
              } else if (node.category === 'framework') {
                nodeColor = '#06b6d4'; // cyan
                ringColor = 'rgba(6, 182, 212, 0.4)';
              } else if (node.category === 'database') {
                nodeColor = '#10b981'; // emerald
                ringColor = 'rgba(16, 185, 129, 0.4)';
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                  className="cursor-pointer group"
                >
                  {/* Pulsing ring for selected node */}
                  {isSelected && (
                    <circle
                      r="22"
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth="2"
                      strokeOpacity="0.8"
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={isSelected ? 16 : isConnected ? 13 : 11}
                    fill={nodeColor}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    className="transition-all duration-200 filter drop-shadow-md"
                  />

                  {/* Label Text */}
                  <text
                    y={isSelected ? 26 : 22}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize={isSelected ? '11px' : '9.5px'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="select-none pointer-events-none drop-shadow-sm font-sans"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend Overlay at bottom left */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" /> Core</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Framework</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Database</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Concept</span>
        </div>
      </div>

      {/* Selected Node Details Footer */}
      {selectedNode && (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {selectedNode.label}
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {selectedNode.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Connected to: {selectedNode.connections.map((c) => nodes.find((n) => n.id === c)?.label || c).join(', ')}
            </p>
          </div>

          {selectedNode.noteId && onSelectNote && (
            <button
              onClick={() => onSelectNote(selectedNode.noteId!)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold whitespace-nowrap shadow-xs"
            >
              Open Note
            </button>
          )}
        </div>
      )}
    </div>
  );
};
