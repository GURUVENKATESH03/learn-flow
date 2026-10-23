import React, { useState } from 'react';
import { Note } from '../../types';
import {
  Search,
  Plus,
  BookOpen,
  Brain,
  Sparkles,
  Tag,
  ArrowRight,
  MoreVertical,
  Filter,
  Network,
  List,
  Edit3,
  Trash2,
} from 'lucide-react';
import { InteractiveKnowledgeGraph } from '../charts/InteractiveKnowledgeGraph';
import { ConfirmModal } from '../modals/ConfirmModal';

interface NotesScreenProps {
  notes: Note[];
  onOpenNote: (note: Note) => void;
  onOpenNewNote: () => void;
  onStartQuiz: (topic: string, content: string) => void;
  onEditNote?: (note: Note) => void;
  onDeleteNote?: (noteId: string) => void;
}

export const NotesScreen: React.FC<NotesScreenProps> = ({
  notes,
  onOpenNote,
  onOpenNewNote,
  onStartQuiz,
  onEditNote,
  onDeleteNote,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  // Extract all unique tags
  const allTags = ['All', ...Array.from(new Set(notes.flatMap((n) => n.tags)))];

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === 'All' || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="w-full space-y-4 pb-6 animate-in fade-in duration-200">
      {/* Top Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Smart Notes</h1>
          <p className="text-xs text-slate-500">Living knowledge base with mind maps</p>
        </div>
        <div className="flex items-center gap-1.5">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'graph'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Knowledge Graph View"
            >
              <Network className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewNote}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> New Note
          </button>
        </div>
      </div>

      {viewMode === 'graph' ? (
        <div className="animate-in fade-in duration-200">
          <InteractiveKnowledgeGraph
            notes={notes}
            onSelectNote={(noteId) => {
              const target = notes.find((n) => n.id === noteId);
              if (target) onOpenNote(target);
            }}
            height={520}
          />
        </div>
      ) : (
        <>
          {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search notes, syntax, concepts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
        />
      </div>

      {/* Tag Filters (Horizontal scrolling pills) */}
      <div data-no-swipe="true" className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedTag === tag
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Notes List (Responsive Multi-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">No notes created yet</p>
            <p className="text-xs text-slate-400">Capture code snippets, dictate voice notes, and build mind maps.</p>
            <button
              onClick={onOpenNewNote}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Create First Note
            </button>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onOpenNote(note)}
              className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition shadow-2xs space-y-2.5 group"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug flex-1">
                  {note.title}
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-slate-400 mr-1">{note.timeAgo}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEditNote) {
                        onEditNote(note);
                      } else {
                        onOpenNote(note);
                      }
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    title="Edit Note"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {onDeleteNote && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingNote(note);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {note.imageUrl && (
                <div className="relative rounded-xl overflow-hidden h-24 bg-slate-950 border border-slate-200 dark:border-slate-700">
                  <img
                    src={note.imageUrl}
                    alt={note.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] text-white font-medium">
                    Diagram Attached
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {note.summary || note.content}
              </p>

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {note.mindMapNodes && (
                    <span className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-slate-50 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                      <Brain className="w-3 h-3" />
                      {note.mindMapNodes.length} nodes
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartQuiz(note.title, note.content);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    title="Take Quiz"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </>
      )}

      {/* Native-styled in-app Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingNote)}
        title="Delete Smart Note"
        message={deletingNote ? `Are you sure you want to delete "${deletingNote.title}"? This action cannot be undone.` : ''}
        confirmLabel="Delete Note"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deletingNote) {
            onDeleteNote?.(deletingNote.id);
            setDeletingNote(null);
          }
        }}
        onCancel={() => setDeletingNote(null)}
      />
    </div>
  );
};
