import React, { useState } from 'react';
import { UserProfile, Note, TaskItem, Roadmap, Project } from '../../types';
import {
  BookOpen,
  FolderGit2,
  Target,
  Flame,
  Play,
  CheckCircle2,
  Circle,
  Plus,
  MoreVertical,
  ArrowRight,
  Sparkles,
  FileText,
  Laptop,
  Trash2,
  Compass,
  GitPullRequest,
  GitCommit,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LearningActivityChart } from '../charts/LearningActivityChart';

interface HomeScreenProps {
  user: UserProfile;
  notes: Note[];
  tasks: TaskItem[];
  projects?: Project[];
  roadmap?: Roadmap | null;
  onToggleTask: (id: string) => void;
  onAddTask: (text: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenNote: (note: Note) => void;
  onOpenLesson: () => void;
  onNavigateToTab: (tab: 'notes' | 'projects' | 'roadmap' | 'ai') => void;
  onOpenNewNote?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  notes,
  tasks,
  projects = [],
  roadmap,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onOpenNote,
  onOpenLesson,
  onNavigateToTab,
  onOpenNewNote,
}) => {
  const [isEditingTasks, setIsEditingTasks] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskInput.trim()) {
      onAddTask(newTaskInput.trim());
      setNewTaskInput('');
      setShowInput(false);
    }
  };

  const handleTaskCheck = (id: string, currentlyCompleted: boolean) => {
    onToggleTask(id);
    if (!currentlyCompleted) {
      confetti({
        particleCount: 25,
        spread: 35,
        origin: { y: 0.7 },
      });
    }
  };

  // Find active milestone from live roadmap if one exists
  const activeMilestone = roadmap?.milestones?.find(
    (m) => m.status === 'In Progress'
  ) || roadmap?.milestones?.[0];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* 1. Greeting Section */}
      <section className="px-5 pt-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          Hello, {user.name || 'Learner'}! <span>👋</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {notes.length === 0 && tasks.length === 0
            ? 'Fresh workspace ready. Start building your knowledge.'
            : 'Keep learning, keep building.'}
        </p>
      </section>

      {/* 2. Top Stats Grid (100% Dynamic from live Firestore data) */}
      <section className="px-5">
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {/* Notes Stat */}
          <div
            onClick={() => onNavigateToTab('notes')}
            className="cursor-pointer p-2.5 sm:p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-100/80 dark:border-purple-900/40 flex flex-col items-center text-center transition hover:scale-102"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1.5">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-none">
              {notes.length}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Notes
            </span>
          </div>

          {/* Projects Stat */}
          <div
            onClick={() => onNavigateToTab('projects')}
            className="cursor-pointer p-2.5 sm:p-3 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-100/80 dark:border-sky-900/40 flex flex-col items-center text-center transition hover:scale-102"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-1.5">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-none">
              {projects.length}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Projects
            </span>
          </div>

          {/* Goals Stat */}
          <div
            onClick={() => onNavigateToTab('roadmap')}
            className="cursor-pointer p-2.5 sm:p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100/80 dark:border-amber-900/40 flex flex-col items-center text-center transition hover:scale-102"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-1.5">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-none">
              {tasks.length}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Goals
            </span>
          </div>

          {/* Streak Stat */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-100/80 dark:border-rose-900/40 flex flex-col items-center text-center transition hover:scale-102">
            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-500 dark:text-rose-400 mb-1.5">
              <Flame className="w-4 h-4 fill-rose-500" />
            </div>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-none">
              {user.streak || 0}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Streak
            </span>
          </div>
        </div>
      </section>

      {/* 3. Continue Learning Card (Dynamic from Roadmap or Clean Fresh State) */}
      <section className="px-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
          Continue Learning
        </h2>
        {roadmap && activeMilestone ? (
          <div className="relative p-4 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-slate-50 dark:from-slate-800/80 dark:via-indigo-950/20 dark:to-slate-900 border border-indigo-100/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {activeMilestone.phase} • {activeMilestone.status}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                  {activeMilestone.title}
                </h3>
              </div>
              <div className="w-14 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
                <Laptop className="w-6 h-6 opacity-90" />
              </div>
            </div>

            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 text-[11px]">Milestone Progress</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {activeMilestone.progress}%
                </span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${activeMilestone.progress}%` }}
                />
              </div>
              {activeMilestone.tasks && activeMilestone.tasks.length > 0 && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                  Next:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {activeMilestone.tasks[0]}
                  </span>
                </p>
              )}
            </div>

            <button
              onClick={onOpenLesson}
              className="w-full mt-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Continue
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No Active Roadmap Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-0.5">
                Generate a personalized curriculum with Gemini 3.8 Flash to start tracking milestones.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('roadmap')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Generate AI Roadmap
            </button>
          </div>
        )}
      </section>

      {/* 4. Today's Focus (Live Tasks or Fresh State) */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            Today's Focus
          </h2>
          {tasks.length > 0 && (
            <button
              onClick={() => setIsEditingTasks(!isEditingTasks)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {isEditingTasks ? 'Done' : 'Edit'}
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 p-2 sm:p-3 divide-y divide-slate-100 dark:divide-slate-700/50 shadow-2xs">
          {tasks.length === 0 && !showInput ? (
            <div className="py-4 text-center space-y-2">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                No focus goals for today yet.
              </p>
              <button
                onClick={() => setShowInput(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100"
              >
                <Plus className="w-3.5 h-3.5" /> Add Your First Goal
              </button>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="py-2 px-1.5 flex items-center justify-between gap-3 group transition"
              >
                <button
                  onClick={() => handleTaskCheck(task.id, task.completed)}
                  className="flex items-center gap-2.5 text-left flex-1"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 fill-emerald-50 dark:fill-emerald-950/40" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-indigo-500 shrink-0" />
                  )}
                  <span
                    className={`text-xs sm:text-sm transition ${
                      task.completed
                        ? 'text-slate-400 dark:text-slate-500 line-through'
                        : 'text-slate-700 dark:text-slate-200 font-medium'
                    }`}
                  >
                    {task.text}
                  </span>
                </button>

                {isEditingTasks && (
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}

          {/* Add a new task inline form */}
          {showInput ? (
            <form onSubmit={handleAddNewTask} className="pt-2.5 flex items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Enter daily goal..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowInput(false)}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </form>
          ) : (
            tasks.length > 0 && (
              <button
                onClick={() => setShowInput(true)}
                className="w-full pt-2.5 pb-1 flex items-center justify-start gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-4 h-4" /> Add a new goal
              </button>
            )
          )}
        </div>
      </section>

      {/* Interactive Learning Activity Graph */}
      <section className="px-5">
        <LearningActivityChart notes={notes} tasks={tasks} />
      </section>

      {/* Git Projects & Synced Repositories Snapshot */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
            Git Projects & Repositories
          </h2>
          <button
            onClick={() => onNavigateToTab('projects')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
          >
            {projects.length > 0 ? `View All (${projects.length})` : 'Sync Repos'}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {projects.length === 0 ? (
          <div
            onClick={() => onNavigateToTab('projects')}
            className="cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between gap-3 shadow-2xs hover:opacity-95 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <FolderGit2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Link Your GitHub Account</h4>
                <p className="text-[11px] text-slate-300">Auto-sync repos, live commits & open pull requests</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-white/10 text-xs font-bold text-white shrink-0">
              Link
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.slice(0, 2).map((proj) => {
              const openPRs = proj.pullRequests?.length ?? 0;
              const commitsCount = proj.commits?.length ?? 0;
              const latestCommit = proj.commits?.[0];

              return (
                <div
                  key={proj.id}
                  onClick={() => onNavigateToTab('projects')}
                  className="cursor-pointer p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-2xs group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {proj.visibility}
                        </span>
                        {openPRs > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                            <GitPullRequest className="w-2.5 h-2.5" /> {openPRs} Open PR{openPRs > 1 ? 's' : ''}
                          </span>
                        )}
                        <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-0.5">
                          <GitCommit className="w-2.5 h-2.5" /> {commitsCount} commits
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {proj.title}
                      </h4>
                    </div>

                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      {proj.progress}%
                    </span>
                  </div>

                  {latestCommit && (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span className="truncate max-w-[200px] font-sans">
                        {latestCommit.message}
                      </span>
                      <span className="shrink-0 text-slate-400 font-sans ml-1">
                        {latestCommit.timeAgo}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Recent Notes (Dynamic from live Firestore) */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Notes
          </h2>
          {notes.length > 0 && (
            <button
              onClick={() => onNavigateToTab('notes')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All ({notes.length})
            </button>
          )}
        </div>

        {notes.length === 0 ? (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              No notes created yet.
            </p>
            <button
              onClick={() => {
                if (onOpenNewNote) onOpenNewNote();
                else onNavigateToTab('notes');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Create Your First Note
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.slice(0, 3).map((note) => {
              const iconBg =
                note.color === 'teal'
                  ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400'
                  : note.color === 'amber'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400';

              return (
                <div
                  key={note.id}
                  onClick={() => onOpenNote(note)}
                  className="cursor-pointer p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-800 transition shadow-2xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
                    >
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {note.tags.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400">{note.timeAgo}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNote(note);
                      }}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
