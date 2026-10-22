/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { HomeScreen } from './components/screens/HomeScreen';
import { NotesScreen } from './components/screens/NotesScreen';
import { ProjectsScreen } from './components/screens/ProjectsScreen';
import { RoadmapScreen } from './components/screens/RoadmapScreen';
import { AIScreen } from './components/screens/AIScreen';
import { LoginScreen } from './components/screens/LoginScreen';

import { NoteDetailModal } from './components/modals/NoteDetailModal';
import { LessonModal } from './components/modals/LessonModal';
import { QuizModal } from './components/modals/QuizModal';
import { NewNoteModal } from './components/modals/NewNoteModal';

import {
  auth,
  testConnection,
  logOut,
  clearUserFirestoreData,
  subscribeToUserProfile,
  subscribeToNotes,
  subscribeToTasks,
  subscribeToProjects,
  subscribeToRoadmaps,
  addFirestoreNote,
  deleteFirestoreNote,
  addFirestoreTask,
  toggleFirestoreTask,
  deleteFirestoreTask,
  addFirestoreProject,
  updateFirestoreProject,
  deleteFirestoreProject,
  batchSaveFirestoreProjects,
  updateUserProfile,
  saveFirestoreRoadmap,
} from './lib/firebase';

import { Note, TaskItem, Project, Roadmap, Quiz, UserProfile } from './types';
import confetti from 'canvas-confetti';
import { BookOpen, Loader2 } from 'lucide-react';
import { Toast, ToastMessage } from './components/common/Toast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('learnflow_guest_mode') === 'true';
  });
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
    title?: string
  ) => {
    setToast({
      id: `toast-${Date.now()}`,
      type,
      message,
      title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Notice' : 'Information'),
    });
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('learnflow_theme') as 'light' | 'dark') || 'light';
  });

  // Zero-hardcoding live states with local backup for guest mode
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const cached = localStorage.getItem('learnflow_cached_notes');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  // Sync theme with document element and localStorage
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('learnflow_theme', nextTheme);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Verify connection to Firestore on initial boot
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (!firebaseUser) {
        if (!isGuestMode) {
          setUserProfile(null);
          setNotes([]);
          setTasks([]);
          setProjects([]);
          setRoadmap(null);
        }
        setIsAuthChecking(false);
      }
    });

    return () => unsubscribeAuth();
  }, [isGuestMode]);

  // Subscribe to live Firestore collections strictly scoped to authenticated user ID
  useEffect(() => {
    if (!currentUser) return;

    const userId = currentUser.uid;

    const unsubProfile = subscribeToUserProfile(userId, async (profile) => {
      setUserProfile(profile);
      setIsAuthChecking(false);
    });

    const unsubNotes = subscribeToNotes(userId, (liveNotes) => {
      setNotes(liveNotes);
    });

    const unsubTasks = subscribeToTasks(userId, (liveTasks) => {
      setTasks(liveTasks);
    });

    const unsubProjects = subscribeToProjects(userId, (liveProjects) => {
      setProjects(liveProjects);
    });

    const unsubRoadmaps = subscribeToRoadmaps(userId, (liveRoadmaps) => {
      if (liveRoadmaps.length > 0) {
        setRoadmap(liveRoadmaps[0]);
      } else {
        setRoadmap(null);
      }
    });

    return () => {
      unsubProfile();
      unsubNotes();
      unsubTasks();
      unsubProjects();
      unsubRoadmaps();
    };
  }, [currentUser]);

  // Handle Login success (Google or Guest)
  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsGuestMode(true);
    localStorage.setItem('learnflow_guest_mode', 'true');
    setIsAuthChecking(false);
    confetti({ particleCount: 40, spread: 50 });
  };

  // Sign out cleanly - clear in-memory state so nothing leaks between sessions
  const handleLogout = async () => {
    try {
      if (currentUser) {
        await logOut();
      }
      setIsGuestMode(false);
      localStorage.removeItem('learnflow_guest_mode');
      setUserProfile(null);
      setCurrentUser(null);
      setNotes([]);
      setTasks([]);
      setProjects([]);
      setRoadmap(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Reset database / clear all state
  const handleResetDatabase = async () => {
    if (currentUser) {
      try {
        await clearUserFirestoreData(currentUser.uid);
      } catch (err) {
        console.error('Reset database error:', err);
      }
    }
    try {
      localStorage.removeItem('learnflow_cached_notes');
    } catch (e) {}
    setNotes([]);
    setTasks([]);
    setProjects([]);
    setRoadmap(null);
    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            streak: 0,
            totalNotes: 0,
            totalProjects: 0,
            weeklyGoals: { completed: 0, total: 0 },
          }
        : null
    );
    showToast('Workspace reset to fresh clean start (0 notes, 0 projects).', 'info', 'Workspace Reset');
  };

  // Note Handlers
  const handleSaveNote = async (newNoteData: Partial<Note>) => {
    const rawTitle = newNoteData.title?.trim() || '';
    const rawContent = newNoteData.content?.trim() || '';

    if (!rawTitle && !rawContent) {
      showToast('Please enter a note title or note content before saving.', 'error', 'Note Empty');
      return;
    }

    const defaultTags = ['General'];
    const now = new Date().toISOString();
    const noteId = newNoteData.id || `note-${Date.now()}`;
    const fullNote: Note = {
      id: noteId,
      title: rawTitle || 'Untitled Note',
      content: rawContent,
      summary:
        rawContent.slice(0, 150) +
        (rawContent.length > 150 ? '...' : ''),
      imageUrl: newNoteData.imageUrl || undefined,
      tags: newNoteData.tags && newNoteData.tags.length > 0 ? newNoteData.tags : defaultTags,
      timeAgo: 'Just now',
      color: (newNoteData.color as any) || 'teal',
      mindMapNodes:
        newNoteData.mindMapNodes && newNoteData.mindMapNodes.length > 0
          ? newNoteData.mindMapNodes
          : [
              { id: '1', label: rawTitle || 'Note', type: 'root' },
              { id: '2', label: 'Key Insights', type: 'concept' },
            ],
      createdAt: now,
      updatedAt: now,
    };

    // 1. Update state immediately so the new note is visible right away
    setNotes((prev) => {
      const updated = [fullNote, ...prev.filter((n) => n.id !== noteId)];
      try {
        localStorage.setItem('learnflow_cached_notes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Close the modal
    setShowNewNoteModal(false);

    // 3. Persist to Firestore if user is authenticated with Firebase
    let firestoreError = false;
    if (currentUser) {
      try {
        await addFirestoreNote(currentUser.uid, fullNote);
      } catch (err) {
        console.error('Error adding note to Firestore:', err);
        firestoreError = true;
      }
    }

    if (firestoreError) {
      showToast(`Note "${fullNote.title}" saved locally. Cloud sync pending.`, 'info', 'Saved Locally');
    } else {
      showToast(`Smart note "${fullNote.title}" saved successfully!`, 'success', 'Saved to Notes');
    }

    confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
  };

  const handleDeleteNote = async (noteId: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== noteId);
      try {
        localStorage.setItem('learnflow_cached_notes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (currentUser) {
      try {
        await deleteFirestoreNote(currentUser.uid, noteId);
      } catch (err) {
        console.error('Error deleting firestore note:', err);
      }
    }
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
    showToast('Note deleted.', 'info', 'Removed');
  };

  // Task Handlers
  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );

    if (currentUser) {
      try {
        await toggleFirestoreTask(currentUser.uid, taskId, task.completed);
      } catch (err) {
        console.error('Error toggling firestore task:', err);
      }
    }
  };

  const handleAddTask = async (text: string) => {
    if (!text.trim()) {
      showToast('Please type a task or goal description.', 'error', 'Empty Goal');
      return;
    }
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text: text.trim(),
      completed: false,
      category: 'General',
    };
    setTasks((prev) => [newTask, ...prev]);

    if (currentUser) {
      try {
        await addFirestoreTask(currentUser.uid, newTask);
      } catch (err) {
        console.error('Error adding firestore task:', err);
      }
    }
    showToast(`Added goal: "${text.trim()}"`, 'success', 'Goal Added');
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (currentUser) {
      try {
        await deleteFirestoreTask(currentUser.uid, taskId);
      } catch (err) {
        console.error('Error deleting firestore task:', err);
      }
    }
  };

  // Project Handlers
  const handleAddProject = async (newProj: Partial<Project>) => {
    const fullProject: Project = {
      id: newProj.id || `proj-${Date.now()}`,
      title: newProj.title || 'New Repository',
      description: newProj.description || 'Project managed in LearnFlow',
      progress: newProj.progress || 0,
      tags: newProj.tags || ['General'],
      repoUrl: newProj.repoUrl || '#',
      iconBg: newProj.iconBg || 'indigo',
      iconColor: newProj.iconColor || 'indigo',
      visibility: newProj.visibility || 'public',
      stars: newProj.stars ?? 0,
      forks: newProj.forks ?? 0,
      isGitHubSynced: newProj.isGitHubSynced || false,
      githubOwner: newProj.githubOwner,
      githubRepo: newProj.githubRepo,
      defaultBranch: newProj.defaultBranch || 'main',
      lastSyncedAt: newProj.lastSyncedAt || new Date().toISOString(),
      commits: newProj.commits || [],
      pullRequests: newProj.pullRequests || [],
      tasks: newProj.tasks || [],
      status: newProj.status || 'Active',
    };

    setProjects((prev) => [fullProject, ...prev]);

    if (currentUser) {
      try {
        await addFirestoreProject(currentUser.uid, fullProject);
      } catch (err) {
        console.error('Error adding firestore project:', err);
      }
    }
  };

  const handleUpdateProject = async (projectId: string, data: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...data } : p))
    );

    if (currentUser) {
      try {
        await updateFirestoreProject(currentUser.uid, projectId, data);
      } catch (err) {
        console.error('Error updating firestore project:', err);
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (currentUser) {
      try {
        await deleteFirestoreProject(currentUser.uid, projectId);
      } catch (err) {
        console.error('Error deleting firestore project:', err);
      }
    }
  };

  const handleBatchAddProjects = async (newProjects: Project[]) => {
    setProjects((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const filteredNew = newProjects.filter((p) => !existingIds.has(p.id));
      return [...filteredNew, ...prev];
    });

    if (currentUser) {
      try {
        await batchSaveFirestoreProjects(currentUser.uid, newProjects);
      } catch (err) {
        console.error('Error batch adding firestore projects:', err);
      }
    }
  };

  const handleToggleProjectTask = async (projectId: string, taskId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const updatedTasks = project.tasks.map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    const completedCount = updatedTasks.filter((t) => t.done).length;
    const progress =
      updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;

    await handleUpdateProject(projectId, { tasks: updatedTasks, progress });
  };

  const handleUpdateUserProfile = async (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    if (currentUser) {
      try {
        await updateUserProfile(currentUser.uid, updates);
      } catch (err) {
        console.error('Error updating user profile:', err);
      }
    }
  };

  // Roadmap Handler
  const handleUpdateRoadmap = async (newRoadmap: Roadmap) => {
    setRoadmap(newRoadmap);
    if (currentUser) {
      try {
        await saveFirestoreRoadmap(currentUser.uid, newRoadmap);
      } catch (err) {
        console.error('Error saving firestore roadmap:', err);
      }
    }
    showToast(`Roadmap "${newRoadmap.title}" active and tracked!`, 'success', 'Roadmap Saved');
  };

  // Lesson & Quiz Handlers
  const handleCompleteLesson = () => {
    setShowLessonModal(false);
    confetti({ particleCount: 70, spread: 80 });
  };

  const handleStartQuiz = (topic: string, content?: string) => {
    const quizTitle = topic || 'General Engineering Knowledge';
    const sampleQuestions = [
      {
        id: 'q1',
        question: `In Clean Architecture, which layer contains the core enterprise business logic?`,
        options: [
          'The Web / Controller Adapter Layer',
          'The Domain Entities Core Layer',
          'The Database Infrastructure Layer',
          'The Third-Party API Gateway Layer',
        ],
        correctIndex: 1,
        explanation:
          'In Clean Architecture, Enterprise Business Rules are encapsulated inside the innermost Domain Entities layer with zero dependencies on frameworks.',
      },
      {
        id: 'q2',
        question: `What is the primary benefit of decoupling business logic from databases?`,
        options: [
          'Allows business rules to be tested independently of persistence details',
          'Eliminates the need for indexing tables',
          'Increases memory usage on the backend server',
          'Disables transactions across tables',
        ],
        correctIndex: 0,
        explanation:
          'Decoupling allows business logic to be tested thoroughly with unit tests without needing mock databases or live connections.',
      },
    ];

    setActiveQuiz({
      topic: quizTitle,
      questions: sampleQuestions,
    });
  };

  // Compute streak cleanly based on actual completed tasks
  const completedGoalsCount = tasks.filter((t) => t.completed).length;
  const computedStreak = completedGoalsCount > 0 ? Math.min(completedGoalsCount, 7) : 0;

  const effectiveUser: UserProfile = userProfile || {
    name: currentUser?.displayName || 'Learner',
    role: 'Software Developer',
    email: currentUser?.email || 'learner@learnflow.app',
    avatarUrl:
      currentUser?.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    streak: computedStreak,
    totalNotes: notes.length,
    totalProjects: projects.length,
    weeklyGoals: {
      completed: completedGoalsCount,
      total: tasks.length,
    },
    googleId: currentUser?.uid,
    isGoogleConnected: Boolean(currentUser),
    githubConnected: false,
  };

  const isAuthenticated = Boolean(currentUser || isGuestMode);

  // Mobile Gesture Navigation:
  // Swiping right advances forward (e.g. Dashboard/Home -> Notes),
  // Swiping left returns backward (e.g. Notes -> Dashboard/Home)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;

    // Do not trigger swipe navigation when modals are active
    if (selectedNote || showLessonModal || showNewNoteModal || activeQuiz) {
      touchStartRef.current = null;
      return;
    }

    // Ignore touches on interactive form elements or canvases
    const target = e.target as HTMLElement;
    if (
      target.closest('input, textarea, select, canvas, button, [data-no-swipe="true"]')
    ) {
      touchStartRef.current = null;
      return;
    }

    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - touchStartRef.current.x;
    const deltaY = touchEnd.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    touchStartRef.current = null;

    // Minimum swipe threshold: 45px with horizontal dominance over vertical scroll, under 700ms
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25 && deltaTime < 700) {
      const tabOrder: TabType[] = ['home', 'notes', 'projects', 'roadmap', 'ai'];
      const currentIndex = tabOrder.indexOf(activeTab);

      if (deltaX > 0) {
        // SWIPE RIGHT: (e.g., from Dashboard -> Notes)
        if (activeTab === 'home') {
          setActiveTab('notes');
        } else if (currentIndex < tabOrder.length - 1) {
          setActiveTab(tabOrder[currentIndex + 1]);
        }
      } else {
        // SWIPE LEFT: (e.g., from Notes -> Dashboard)
        if (activeTab === 'notes') {
          setActiveTab('home');
        } else if (activeTab === 'home') {
          setActiveTab('notes');
        } else if (currentIndex > 0) {
          setActiveTab(tabOrder[currentIndex - 1]);
        }
      }
    }
  };

  // Keyboard arrow navigation fallback (Left / Right arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedNote || showLessonModal || showNewNoteModal || activeQuiz) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select')) return;

      const tabOrder: TabType[] = ['home', 'notes', 'projects', 'roadmap', 'ai'];
      const currentIndex = tabOrder.indexOf(activeTab);

      if (e.key === 'ArrowRight') {
        if (activeTab === 'home') setActiveTab('notes');
        else if (currentIndex < tabOrder.length - 1) setActiveTab(tabOrder[currentIndex + 1]);
      } else if (e.key === 'ArrowLeft') {
        if (activeTab === 'notes') setActiveTab('home');
        else if (currentIndex > 0) setActiveTab(tabOrder[currentIndex - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedNote, showLessonModal, showNewNoteModal, activeQuiz]);

  return (
    <div
      className={`min-h-screen w-full flex flex-col transition-colors duration-200 ${
        theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Global floating Toast notification container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {isAuthChecking ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-4 animate-bounce">
            <BookOpen className="w-8 h-8" />
          </div>
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
          <p className="text-xs font-semibold text-slate-500">Starting LearnFlow Hub...</p>
        </div>
      ) : !isAuthenticated ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          {/* Responsive Header (Top Bar with Desktop Navigation & Mobile Branding) */}
          <Header
            user={effectiveUser}
            theme={theme}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
            onResetData={handleResetDatabase}
            activeTab={activeTab}
            onChangeTab={(tab) => setActiveTab(tab)}
          />

          {/* Main App Content Container with Mobile Horizontal Swipe Gesture Detection */}
          <main
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-12 touch-pan-y"
          >
            {activeTab === 'home' && (
              <HomeScreen
                user={effectiveUser}
                notes={notes}
                tasks={tasks}
                projects={projects}
                roadmap={roadmap}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onOpenNote={(note) => setSelectedNote(note)}
                onOpenLesson={() => setShowLessonModal(true)}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onOpenNewNote={() => setShowNewNoteModal(true)}
              />
            )}

            {activeTab === 'notes' && (
              <NotesScreen
                notes={notes}
                onOpenNote={(note) => setSelectedNote(note)}
                onOpenNewNote={() => setShowNewNoteModal(true)}
                onStartQuiz={handleStartQuiz}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsScreen
                projects={projects}
                currentUser={currentUser}
                userProfile={effectiveUser}
                onToggleProjectTask={handleToggleProjectTask}
                onAddProject={handleAddProject}
                onDeleteProject={handleDeleteProject}
                onBatchAddProjects={handleBatchAddProjects}
                onUpdateProject={handleUpdateProject}
                onUpdateUserProfile={handleUpdateUserProfile}
              />
            )}

            {activeTab === 'roadmap' && (
              <RoadmapScreen
                roadmap={roadmap as Roadmap}
                onUpdateRoadmap={handleUpdateRoadmap}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'ai' && (
              <AIScreen
                notes={notes}
                onStartQuiz={handleStartQuiz}
                onSaveAsNote={(title, content) => handleSaveNote({ title, content })}
              />
            )}
          </main>

          {/* Mobile Bottom Navigation Bar (Hidden on desktop md:) */}
          <Navigation activeTab={activeTab} onChangeTab={(tab) => setActiveTab(tab)} />

          {/* Modals & Dialogs */}
          {selectedNote && (
            <NoteDetailModal
              note={selectedNote}
              onClose={() => setSelectedNote(null)}
              onStartQuiz={handleStartQuiz}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {showLessonModal && (
            <LessonModal
              onClose={() => setShowLessonModal(false)}
              onCompleteLesson={handleCompleteLesson}
            />
          )}

          {activeQuiz && (
            <QuizModal
              quiz={activeQuiz}
              onClose={() => setActiveQuiz(null)}
              onFinish={(score, total) => {
                if (score >= total / 2) {
                  setUserProfile((prev) =>
                    prev ? { ...prev, streak: prev.streak + 1 } : null
                  );
                }
              }}
            />
          )}

          {showNewNoteModal && (
            <NewNoteModal
              onClose={() => setShowNewNoteModal(false)}
              onSave={handleSaveNote}
              onError={(msg) => showToast(msg, 'error', 'Validation Notice')}
            />
          )}
        </div>
      )}
    </div>
  );
}
