import React, { useState } from 'react';
import { Project } from '../../types';
import {
  FolderGit2,
  GitCommit,
  GitBranch,
  ExternalLink,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProjectsScreenProps {
  projects: Project[];
  onToggleProjectTask: (projectId: string, taskId: string) => void;
  onAddProject: (newProj: Partial<Project>) => void;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  projects,
  onToggleProjectTask,
  onAddProject,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'commits'>('overview');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('Java, Spring Boot');

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddProject({
      title: newTitle.trim(),
      description: newDesc.trim() || 'A modern engineering project.',
      tags: newTags.split(',').map((t) => t.trim()),
      progress: 10,
      repoUrl: `https://github.com/guruvenkatesh/${newTitle.toLowerCase().replace(/\s+/g, '-')}`,
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600',
      iconColor: 'indigo',
      status: 'Active',
      commits: [
        {
          id: 'c-init',
          hash: 'a1b2c3d',
          message: 'chore: initial project repository bootstrap',
          author: 'Guru',
          timeAgo: 'Just now',
          branch: 'main',
        },
      ],
      tasks: [
        { id: 't1', text: 'Initialize project structure & build tools', done: true },
        { id: 't2', text: 'Configure database connection & ORM', done: false },
        { id: 't3', text: 'Write core domain services & business logic', done: false },
      ],
    });

    setNewTitle('');
    setNewDesc('');
    setShowNewProjectModal(false);
    confetti({ particleCount: 30, spread: 40 });
  };

  return (
    <div className="space-y-4 px-5 pt-2 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Git Projects</h1>
          <p className="text-xs text-slate-500">Track repository milestones & commits</p>
        </div>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Project Selector Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {projects.map((proj) => {
          const isSelected = proj.id === selectedProjectId;
          return (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`p-3 rounded-2xl border text-left shrink-0 w-44 transition ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  {proj.progress}% Done
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {proj.title}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {proj.tags.join(', ')}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Project Card & Details */}
      {activeProject && (
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
          {/* Project Title & Progress */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeProject.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {activeProject.description}
                </p>
              </div>
              <a
                href={activeProject.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition shrink-0"
                title="View GitHub Repository"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {activeProject.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-3.5 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Milestone Completion</span>
                <span className="text-indigo-600 dark:text-indigo-400">{activeProject.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${activeProject.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sub-tab switcher: Tasks vs Git Commits */}
          <div className="flex border-b border-slate-100 dark:border-slate-700 pt-1">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`py-2 px-3 text-xs font-bold border-b-2 transition ${
                activeSubTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Tasks ({activeProject.tasks.filter((t) => t.done).length}/{activeProject.tasks.length})
            </button>
            <button
              onClick={() => setActiveSubTab('commits')}
              className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                activeSubTab === 'commits'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              Git History ({activeProject.commits.length})
            </button>
          </div>

          {/* Content: Tasks List */}
          {activeSubTab === 'overview' && (
            <div className="space-y-2">
              {activeProject.tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onToggleProjectTask(activeProject.id, task.id)}
                  className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/30 flex items-center gap-2.5 text-left transition"
                >
                  {task.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      task.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200 font-medium'
                    }`}
                  >
                    {task.text}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Content: Git Commits */}
          {activeSubTab === 'commits' && (
            <div className="space-y-2">
              {activeProject.commits.map((commit) => (
                <div
                  key={commit.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1 font-mono text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                    <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                      <GitBranch className="w-3 h-3" />
                      {commit.branch}
                    </span>
                    <span>{commit.timeAgo}</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium font-sans">
                    {commit.message}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>by {commit.author}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                      {commit.hash}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Track New Git Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cache Node"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of the architecture"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Java, Concurrency, Redis"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
