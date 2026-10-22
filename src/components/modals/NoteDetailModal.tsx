import React, { useState } from 'react';
import { Note } from '../../types';
import { X, Sparkles, Brain, Code2, Tag, Copy, Check, BookOpen, Share2 } from 'lucide-react';
import { FormattedMarkdown } from '../common/FormattedMarkdown';

interface NoteDetailModalProps {
  note: Note;
  onClose: () => void;
  onStartQuiz: (topic: string, content: string) => void;
  onDeleteNote?: (id: string) => void;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({ note, onClose, onStartQuiz, onDeleteNote }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'mindmap' | 'ai'>('content');
  const [copied, setCopied] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    summary?: string;
    relatedTopics?: string[];
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchAiAnalysis = async () => {
    if (aiAnalysis || loadingAi) return;
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/explore-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: note.title, content: note.content }),
      });
      const data = await res.json();
      setAiAnalysis(data);
    } catch (err) {
      setAiAnalysis({
        summary: `Key takeaways for ${note.title}: focused on production hardening, modular abstractions, and clean interface boundaries.`,
        relatedTopics: ['Security Filter Chain', 'Token Expiration & Refresh', 'Asynchronous Request Handlers'],
      });
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {note.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900"
                >
                  {t}
                </span>
              ))}
              <span className="text-[11px] text-slate-400">• {note.timeAgo}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {note.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'content'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Note
          </button>
          <button
            onClick={() => setActiveTab('mindmap')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'mindmap'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            Mind Map
          </button>
          <button
            onClick={() => {
              setActiveTab('ai');
              fetchAiAnalysis();
            }}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'ai'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Insights
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'content' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400">NOTE CONTENT</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              {note.imageUrl && (
                <div className="mb-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 shadow-xs">
                  <div className="relative group">
                    <img
                      src={note.imageUrl}
                      alt={note.title}
                      className="w-full max-h-56 object-cover object-center"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] text-white font-semibold">
                      Attached Image / Architecture Diagram
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <FormattedMarkdown content={note.content} />
              </div>

              {note.summary && (
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/50 mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                    Quick Key Takeaway
                  </span>
                  <p className="text-xs text-amber-900/90 dark:text-amber-200 mt-0.5 leading-snug">
                    {note.summary}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mindmap' && (
            <div className="space-y-3">
              {/* Interactive Radial Mind Map SVG */}
              <div className="relative w-full h-72 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950 p-2 overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                {/* Background Grid Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                  <pattern id="modal-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1" fill="#818cf8" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#modal-grid)" />
                </svg>

                <svg className="w-full h-full">
                  {/* Central Node */}
                  <g transform="translate(170, 130)">
                    {/* Connecting branches */}
                    {(note.mindMapNodes && note.mindMapNodes.length > 1
                      ? note.mindMapNodes.filter((n) => n.type !== 'root')
                      : [
                          { id: '1', label: 'Architecture', type: 'concept' },
                          { id: '2', label: 'Implementation', type: 'concept' },
                          { id: '3', label: 'Best Practices', type: 'practice' },
                          { id: '4', label: 'Testing & Mocking', type: 'practice' },
                        ]
                    ).map((node, i, arr) => {
                      const angle = (i * 2 * Math.PI) / arr.length - Math.PI / 2;
                      const radius = 95;
                      const targetX = Math.cos(angle) * radius;
                      const targetY = Math.sin(angle) * radius;

                      return (
                        <g key={node.id}>
                          {/* Curved bezier connecting link */}
                          <path
                            d={`M 0 0 Q ${targetX * 0.4} ${targetY * 0.8} ${targetX} ${targetY}`}
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                            className="opacity-70"
                          />
                          {/* Dynamic particle on branch */}
                          <circle
                            cx={targetX * 0.6}
                            cy={targetY * 0.6}
                            r="2"
                            fill="#a5b4fc"
                            className="animate-ping"
                          />

                          {/* Node circle & label */}
                          <g transform={`translate(${targetX}, ${targetY})`} className="cursor-pointer">
                            <circle
                              r="14"
                              fill={node.type === 'practice' ? '#10b981' : '#6366f1'}
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="filter drop-shadow-md hover:scale-110 transition-transform"
                            />
                            <text
                              y="24"
                              textAnchor="middle"
                              fill="#f8fafc"
                              fontSize="10px"
                              fontWeight="bold"
                              className="select-none pointer-events-none drop-shadow-sm font-sans"
                            >
                              {node.label}
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Central Root Concept Bubble */}
                    <circle
                      r="26"
                      fill="#ec4899"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="filter drop-shadow-lg"
                    />
                    <text
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9.5px"
                      fontWeight="bold"
                      className="select-none pointer-events-none font-sans"
                    >
                      {note.title.slice(0, 10)}...
                    </text>
                  </g>
                </svg>

                {/* Floating Guide */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-slate-900/80 border border-slate-700 text-[9px] text-slate-300">
                  Interactive Node Cluster
                </div>
              </div>

              {/* Node Breakdown List */}
              <div className="grid grid-cols-2 gap-2">
                {(note.mindMapNodes && note.mindMapNodes.length > 1
                  ? note.mindMapNodes.filter((n) => n.type !== 'root')
                  : [
                      { id: '1', label: 'Architecture', type: 'concept' },
                      { id: '2', label: 'Implementation', type: 'concept' },
                      { id: '3', label: 'Best Practices', type: 'practice' },
                      { id: '4', label: 'Testing & Mocking', type: 'practice' },
                    ]
                ).map((node) => (
                  <div
                    key={node.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left shadow-2xs hover:border-indigo-400 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase">
                        {node.type}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">
                      {node.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              {loadingAi ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Gemini analyzing note concepts & connections...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      AI Executive Summary
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      {aiAnalysis?.summary || note.summary || 'Clear modular note explaining production patterns.'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Related Recommended Topics
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(aiAnalysis?.relatedTopics || ['API Security', 'Distributed Cache', 'Database Indexing']).map(
                        (topic, idx) => (
                          <button
                            key={idx}
                            onClick={() => onStartQuiz(topic, note.content)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 text-xs font-medium text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700"
                          >
                            + Explore {topic}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          {onDeleteNote && (
            <button
              onClick={() => {
                if (confirm(`Delete note "${note.title}"?`)) {
                  onDeleteNote(note.id);
                  onClose();
                }
              }}
              className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
              title="Delete Note"
            >
              Delete Note
            </button>
          )}
          <button
            onClick={() => onStartQuiz(note.title, note.content)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Generate Quiz on Note
          </button>
        </div>
      </div>
    </div>
  );
};
