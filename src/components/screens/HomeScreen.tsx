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
  ArrowRight,
  Sparkles,
  Laptop,
  Trash2,
  Compass,
  GitPullRequest,
  GitCommit,
  Check,
  Zap,
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

  const activeMilestone = roadmap?.milestones?.find(
    (m) => m.status === 'In Progress'
  ) || roadmap?.milestones?.[0];

  return (
    <div className="space-y-5 pb-6 animate-in fade-in duration-300">
      {/* 1. Greeting Section */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Hello, {user.name || 'Learner'}! <span>👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {notes.length === 0 && tasks.length === 0
              ? 'Fresh workspace ready. Start building your knowledge.'
              : 'Keep learning, keep building.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('ai')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" /> Ask LearnFlow AI
          </button>
        </div>
      </section>

      {/* 2. Top Stats Grid */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Notes Stat */}
          <div
            onClick={() => onNavigateToTab('notes')}
            className="cursor-pointer p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-100/80 dark:border-purple-900/40 flex items-center gap-3 transition hover:scale-101 hover:shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none block">
                {notes.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block">
                Smart Notes
              </span>
            </div>
          </div>

          {/* Projects Stat */}
          <div
            onClick={() => onNavigateToTab('projects')}
            className="cursor-pointer p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-100/80 dark:border-sky-900/40 flex items-center gap-3 transition hover:scale-101 hover:shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none block">
                {projects.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block">
                Git Projects
              </span>
            </div>
          </div>

          {/* Goals Stat */}
          <div
            onClick={() => onNavigateToTab('roadmap')}
            className="cursor-pointer p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100/80 dark:border-amber-900/40 flex items-center gap-3 transition hover:scale-101 hover:shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none block">
                {tasks.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block">
                Active Goals
              </span>
            </div>
          </div>

          {/* Streak Stat */}
          <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-100/80 dark:border-rose-900/40 flex items-center gap-3 transition hover:scale-101 hover:shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
              <Flame className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none block">
                {user.streak || 0}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block">
                Day Streak 🔥
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Responsive Multi-Column Layout (Desktop: 8 cols left, 4 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Primary Column (8 Columns on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Continue Learning / Milestone Card */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Continue Learning
              </h2>
              {roadmap && (
                <button
                  onClick={() => onNavigateToTab('roadmap')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  Full Roadmap <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {roadmap && activeMilestone ? (
              <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-slate-50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border border-indigo-100/80 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {activeMilestone.phase} • {activeMilestone.status}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                      {activeMilestone.title}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
                    <Laptop className="w-6 h-6 opacity-90" />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Milestone Progress</span>
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
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      Next Step:{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {activeMilestone.tasks[0]}
                      </span>
                    </p>
                  )}
                </div>

                <button
                  onClick={onOpenLesson}
                  className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/20"
                >
                  <Play className="w-4 h-4 fill-white" /> Continue Interactive Lesson
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    No Active Roadmap Yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-0.5">
                    Generate a personalized learning curriculum with Gemini 3.8 Flash to start tracking milestones.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab('roadmap')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate AI Roadmap
                </button>
              </div>
            )}
          </section>

          {/* Git Projects & Synced Repositories Snapshot */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-indigo-600" />
                Git Projects & Synced Repositories
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
                className="cursor-pointer p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between gap-3 shadow-2xs hover:opacity-95 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <FolderGit2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Link Your GitHub Account</h4>
                    <p className="text-xs text-slate-300">Auto-sync repositories, live commits & open pull requests</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-white shrink-0">
                  Sync Repos
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects.slice(0, 4).map((proj) => {
                  const openPRs = proj.pullRequests?.length ?? 0;
                  const commitsCount = proj.commits?.length ?? 0;
                  const latestCommit = proj.commits?.[0];

                  return (
                    <div
                      key={proj.id}
                      onClick={() => onNavigateToTab('projects')}
                      className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-2xs group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {proj.visibility}
                            </span>
                            {openPRs > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                                <GitPullRequest className="w-2.5 h-2.5" /> {openPRs} PR{openPRs > 1 ? 's' : ''}
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5">
                              <GitCommit className="w-2.5 h-2.5" /> {commitsCount} commits
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {proj.title}
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                          {proj.progress}%
                        </span>
                      </div>

                      {latestCommit && (
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          <span className="truncate max-w-[200px] font-sans">
                            {latestCommit.message}
                          </span>
                          <span className="shrink-0 text-slate-400 font-sans ml-1 text-[10px]">
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

          {/* Interactive Learning Activity Graph */}
          <section>
            <LearningActivityChart notes={notes} tasks={tasks} />
          </section>

          {/* Recent Notes */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Smart Notes
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
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-500">No notes created yet.</p>
                {onOpenNewNote && (
                  <button
                    onClick={onOpenNewNote}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create First Note
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {notes.slice(0, 4).map((note) => (
                  <div
                    key={note.id}
                    onClick={() => onOpenNote(note)}
                    className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-2xs space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug">
                        {note.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{note.timeAgo}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {note.summary || note.content}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Sidebar Column (4 Columns on desktop) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Today's Focus Goals */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-500" />
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

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.length === 0 && !showInput ? (
                <div className="py-5 text-center space-y-2">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    No focus goals for today yet.
                  </p>
                  <button
                    onClick={() => setShowInput(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Goal
                  </button>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="py-2.5 flex items-center justify-between gap-3 group transition"
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

              {showInput ? (
                <form onSubmit={handleAddNewTask} className="pt-3 flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Enter daily goal..."
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full pt-3 pb-1 flex items-center justify-start gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add a new goal
                  </button>
                )
              )}
            </div>
          </section>

          {/* Quick Quiz Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-tr from-purple-900 to-indigo-900 text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-300" />
              <h3 className="text-sm font-bold">Daily Knowledge Quiz</h3>
            </div>
            <p className="text-xs text-purple-200 leading-relaxed">
              Test your knowledge on Spring Boot, Java virtual threads, and clean architecture with instant AI quizzes.
            </p>
            <button
              onClick={() => onNavigateToTab('ai')}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Start Technical Quiz
            </button>
          </div>

          {/* Knowledge Mind Map Preview Link */}
          <div
            onClick={() => onNavigateToTab('notes')}
            className="cursor-pointer p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition shadow-xs flex items-center justify-between"
          >
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Concept Mind Map
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Visualize connected concepts & notes
              </p>
            </div>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
