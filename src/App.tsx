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
  updateFirestoreNote,
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
  deleteFirestoreRoadmap,
} from './lib/firebase';

import { Note, TaskItem, Project, Roadmap, Quiz, UserProfile } from './types';
import confetti from 'canvas-confetti';
import { BookOpen, Loader2, ArrowLeft, ArrowRight, FolderGit2, Compass, Bot, Home } from 'lucide-react';
import { Toast, ToastMessage } from './components/common/Toast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('learnflow_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('learnflow_guest_mode') === 'true' ||
      Boolean(localStorage.getItem('learnflow_user_profile')) ||
      Boolean(localStorage.getItem('learnflow_cached_notes'))
    );
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

  // Zero-hardcoding live states with local backup for guest mode and offline persistence
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const cached = localStorage.getItem('learnflow_notes') || localStorage.getItem('learnflow_cached_notes');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const cached = localStorage.getItem('learnflow_tasks');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const cached = localStorage.getItem('learnflow_projects');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [roadmap, setRoadmap] = useState<Roadmap | null>(() => {
    try {
      const cached = localStorage.getItem('learnflow_roadmap');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

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

  // Continuous persistence to localStorage so no data is ever lost across reloads/deployments
  useEffect(() => {
    try {
      localStorage.setItem('learnflow_cached_notes', JSON.stringify(notes));
      localStorage.setItem('learnflow_notes', JSON.stringify(notes));
    } catch (e) {}
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('learnflow_tasks', JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('learnflow_projects', JSON.stringify(projects));
    } catch (e) {}
  }, [projects]);

  useEffect(() => {
    try {
      if (roadmap) {
        localStorage.setItem('learnflow_roadmap', JSON.stringify(roadmap));
      } else {
        localStorage.removeItem('learnflow_roadmap');
      }
    } catch (e) {}
  }, [roadmap]);

  useEffect(() => {
    try {
      if (userProfile) {
        localStorage.setItem('learnflow_user_profile', JSON.stringify(userProfile));
      }
    } catch (e) {}
  }, [userProfile]);

  // Verify connection to Firestore on initial boot
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Firebase Auth state - never wipe data on initial load or deployment
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);
      setIsAuthChecking(false);
    });

    return () => unsubscribeAuth();
  }, []);

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
      localStorage.removeItem('learnflow_notes');
      localStorage.removeItem('learnflow_tasks');
      localStorage.removeItem('learnflow_projects');
      localStorage.removeItem('learnflow_roadmap');
      localStorage.removeItem('learnflow_user_profile');
      localStorage.removeItem('learnflow_guest_mode');
    } catch (e) {}
    setNotes([]);
    setTasks([]);
    setProjects([]);
    setRoadmap(null);
    setUserProfile(null);
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

  const handleUpdateNote = async (updatedNote: Note) => {
    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === updatedNote.id ? updatedNote : n));
      try {
        localStorage.setItem('learnflow_notes', JSON.stringify(updated));
        localStorage.setItem('learnflow_cached_notes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (selectedNote?.id === updatedNote.id) {
      setSelectedNote(updatedNote);
    }
    if (currentUser) {
      try {
        await updateFirestoreNote(currentUser.uid, updatedNote.id, updatedNote);
      } catch (err) {
        console.error('Error updating firestore note:', err);
      }
    }
    showToast(`Note "${updatedNote.title}" updated successfully!`, 'success', 'Note Updated');
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

  const handleUpdateAvatar = async (newAvatarUrl: string) => {
    const updated: UserProfile = {
      ...(userProfile || effectiveUser),
      avatarUrl: newAvatarUrl,
    };
    setUserProfile(updated);
    try {
      localStorage.setItem('learnflow_user_profile', JSON.stringify(updated));
    } catch (e) {}

    if (currentUser) {
      try {
        await updateUserProfile(currentUser.uid, { avatarUrl: newAvatarUrl });
      } catch (err) {
        console.error('Error updating avatar in Firestore:', err);
      }
    }

    showToast('Profile avatar updated successfully!', 'success', 'Avatar Updated');
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

  const handleDeleteRoadmap = async () => {
    const roadmapId = roadmap?.id;
    setRoadmap(null);
    try {
      localStorage.removeItem('learnflow_roadmap');
    } catch (e) {}
    if (currentUser && roadmapId) {
      try {
        await deleteFirestoreRoadmap(currentUser.uid, roadmapId);
      } catch (err) {
        console.error('Error deleting firestore roadmap:', err);
      }
    }
    showToast('Active learning roadmap deleted.', 'info', 'Roadmap Removed');
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
  // Tab order: Home (Dashboard) -> Notes -> Projects -> Roadmap -> AI
  // Standard carousel gesture mapping:
  // - Swipe Left (finger moves right-to-left <-): advances to next tab (Home -> Notes -> Projects -> Roadmap -> AI)
  // - Swipe Right (finger moves left-to-right ->): returns to previous tab (AI -> Roadmap -> Projects -> Notes -> Home)
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    isVerticalScroll: boolean;
    isHorizontalSwipe: boolean;
  } | null>(null);

  const [swipeFeedback, setSwipeFeedback] = useState<{
    tabName: string;
    direction: 'left' | 'right';
  } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) {
      touchStateRef.current = null;
      return;
    }

    // Do not trigger swipe navigation when modals are active
    if (selectedNote || showLessonModal || showNewNoteModal || activeQuiz) {
      touchStateRef.current = null;
      return;
    }

    // Ignore touches on interactive form elements, buttons, code blocks, or custom no-swipe targets
    const target = e.target as HTMLElement;
    if (
      target.closest(
        'input, textarea, select, canvas, button, a, pre, code, [data-no-swipe="true"], .overflow-x-auto, [role="button"], [role="slider"], [contenteditable="true"]'
      )
    ) {
      touchStateRef.current = null;
      return;
    }

    // Prevent swipe trigger if any parent container has horizontal scroll
    let el: HTMLElement | null = target;
    while (el && el !== e.currentTarget) {
      const style = window.getComputedStyle(el);
      if ((style.overflowX === 'auto' || style.overflowX === 'scroll') && el.scrollWidth > el.clientWidth) {
        touchStateRef.current = null;
        return;
      }
      el = el.parentElement;
    }

    touchStateRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      startTime: Date.now(),
      isVerticalScroll: false,
      isHorizontalSwipe: false,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStateRef.current || e.touches.length !== 1) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStateRef.current.startX;
    const deltaY = currentY - touchStateRef.current.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Prioritize horizontal gestures:
    // If horizontal motion is established early (absX > 12 and absX >= absY),
    // prioritize horizontal swipe navigation.
    // Only lock out as vertical scroll if vertical movement strongly dominates (> 22px and > absX * 1.5).
    if (!touchStateRef.current.isVerticalScroll && !touchStateRef.current.isHorizontalSwipe) {
      if (absX > 12 && absX >= absY) {
        touchStateRef.current.isHorizontalSwipe = true;
      } else if (absY > 22 && absY > absX * 1.5) {
        touchStateRef.current.isVerticalScroll = true;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const state = touchStateRef.current;
    touchStateRef.current = null; // Always clear state immediately

    if (!state || e.changedTouches.length !== 1) return;

    // If marked as vertical scroll, do not trigger swipe
    if (state.isVerticalScroll) return;

    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - state.startX;
    const deltaY = touchEnd.clientY - state.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const deltaTime = Date.now() - state.startTime;

    // Swipe validation criteria:
    // 1. Min 50px horizontal travel
    // 2. Horizontal intent: absX > absY * 1.25 or established as horizontal swipe early
    // 3. Fluid swipe completed within 650ms
    if (absX >= 50 && (state.isHorizontalSwipe || absX > absY * 1.25) && deltaTime < 650) {
      const tabOrder: TabType[] = ['home', 'notes', 'projects', 'roadmap', 'ai'];
      const tabLabels: Record<TabType, string> = {
        home: 'Dashboard',
        notes: 'Notes',
        projects: 'Projects',
        roadmap: 'Roadmap',
        ai: 'AI Assistant',
      };
      const currentIndex = tabOrder.indexOf(activeTab);

      if (deltaX < 0) {
        // SWIPE LEFT (finger drags right-to-left <-):
        // Pulls next screen into view: Home (Dashboard) -> Notes -> Projects -> Roadmap -> AI
        if (currentIndex < tabOrder.length - 1) {
          const nextTab = tabOrder[currentIndex + 1];
          setActiveTab(nextTab);
          setSwipeFeedback({
            tabName: tabLabels[nextTab],
            direction: 'left',
          });
        }
      } else if (deltaX > 0) {
        // SWIPE RIGHT (finger drags left-to-right ->):
        // Pulls previous screen into view: AI -> Roadmap -> Projects -> Notes -> Home (Dashboard)
        if (currentIndex > 0) {
          const prevTab = tabOrder[currentIndex - 1];
          setActiveTab(prevTab);
          setSwipeFeedback({
            tabName: tabLabels[prevTab],
            direction: 'right',
          });
        }
      }
    }
  };

  const handleTouchCancel = () => {
    touchStateRef.current = null;
  };

  // Auto-dismiss swipe feedback pill
  useEffect(() => {
    if (!swipeFeedback) return;
    const timer = setTimeout(() => {
      setSwipeFeedback(null);
    }, 1400);
    return () => clearTimeout(timer);
  }, [swipeFeedback]);

  // Keyboard arrow navigation fallback (Left / Right arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedNote || showLessonModal || showNewNoteModal || activeQuiz) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select')) return;

      const tabOrder: TabType[] = ['home', 'notes', 'projects', 'roadmap', 'ai'];
      const currentIndex = tabOrder.indexOf(activeTab);

      if (e.key === 'ArrowRight') {
        // Arrow Right advances forward
        if (currentIndex < tabOrder.length - 1) setActiveTab(tabOrder[currentIndex + 1]);
      } else if (e.key === 'ArrowLeft') {
        // Arrow Left returns backward
        if (currentIndex > 0) setActiveTab(tabOrder[currentIndex - 1]);
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
            onUpdateAvatar={handleUpdateAvatar}
            activeTab={activeTab}
            onChangeTab={(tab) => setActiveTab(tab)}
          />

          {/* Floating swipe feedback indicator */}
          {swipeFeedback && (
            <div className="md:hidden fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-100/95 text-white dark:text-slate-900 shadow-xl text-xs font-bold backdrop-blur-md border border-slate-700/50 dark:border-slate-300">
                {swipeFeedback.direction === 'right' ? (
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600 animate-pulse" />
                ) : (
                  <ArrowLeft className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600 animate-pulse" />
                )}
                <span>Switched to {swipeFeedback.tabName}</span>
              </div>
            </div>
          )}

          {/* Simple Mobile Navigation Bar (Quick Top Segmented Control) */}
          <div className="md:hidden w-full max-w-7xl mx-auto px-3 pt-2 pb-1">
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-300/60 dark:border-slate-800 shadow-2xs">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex-1 py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'home'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Home className="w-3 h-3" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'notes'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Notes</span>
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex-1 py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'projects'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FolderGit2 className="w-3 h-3" />
                <span>Projects</span>
              </button>
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`flex-1 py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'roadmap'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Compass className="w-3 h-3" />
                <span>Roadmap</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'ai'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Bot className="w-3 h-3" />
                <span>AI</span>
              </button>
            </div>
          </div>

          {/* Main App Content Container with Mobile Horizontal Swipe Gesture Detection */}
          <main
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-2.5 sm:py-4 pb-20 md:pb-8 touch-pan-y"
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
                onEditNote={(note) => setSelectedNote(note)}
                onDeleteNote={handleDeleteNote}
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
                roadmap={roadmap}
                onUpdateRoadmap={handleUpdateRoadmap}
                onDeleteRoadmap={handleDeleteRoadmap}
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
              onUpdateNote={handleUpdateNote}
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
