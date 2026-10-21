/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { MobileFrame } from './components/MobileFrame';
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

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('learnflow_theme') as 'light' | 'dark') || 'light';
  });

  // Live Firestore database states - starts clean
  const [notes, setNotes] = useState<Note[]>([]);
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
        setUserProfile(null);
        setNotes([]);
        setTasks([]);
        setProjects([]);
        setRoadmap(null);
        setIsAuthChecking(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Subscribe to live Firestore collections for the authenticated user
  useEffect(() => {
    if (!currentUser) return;

    const userId = currentUser.uid;

    const unsubProfile = subscribeToUserProfile(userId, async (profile) => {
      // If profile contains old leftover mock data from previous seeds, wipe it clean
      if (
        profile &&
        (profile.streak === 14 ||
          profile.totalNotes === 4 ||
          profile.totalProjects === 3 ||
          (profile.weeklyGoals && profile.weeklyGoals.total === 10))
      ) {
        await clearUserFirestoreData(userId);
        return;
      }
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

  // Handle Google Login success
  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsAuthChecking(false);
    confetti({ particleCount: 50, spread: 60 });
  };

  // Sign out from Firebase
  const handleLogout = async () => {
    try {
      await logOut();
      setUserProfile(null);
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Reset database to completely fresh state (0 notes, 0 projects, 0 goals, 0 streak)
  const handleResetDatabase = async () => {
    if (!currentUser) return;
    try {
      await clearUserFirestoreData(currentUser.uid);
      setNotes([]);
      setTasks([]);
      setProjects([]);
      setRoadmap(null);
      setUserProfile({
        name: currentUser.displayName || 'Learner',
        email: currentUser.email || '',
        role: 'Software Developer',
        avatarUrl:
          currentUser.photoURL ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        streak: 0,
        totalNotes: 0,
        totalProjects: 0,
        weeklyGoals: { completed: 0, total: 0 },
        googleId: currentUser.uid,
        isGoogleConnected: true,
      });
    } catch (err) {
      console.error('Reset database error:', err);
    }
  };

  // Toggle tasks in Today's Focus - updates directly in Firebase
  const handleToggleTask = async (id: string) => {
    if (!currentUser) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextCompleted = !task.completed;
    await toggleFirestoreTask(currentUser.uid, id, nextCompleted);
  };

  // Add new task - writes directly to Firestore
  const handleAddTask = async (text: string) => {
    if (!currentUser) return;
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text,
      completed: false,
      category: 'Focus',
    };
    await addFirestoreTask(currentUser.uid, newTask);
  };

  // Delete task - removes directly from Firestore
  const handleDeleteTask = async (id: string) => {
    if (!currentUser) return;
    await deleteFirestoreTask(currentUser.uid, id);
  };

  // Save new note - writes directly to Firestore with image attachment and mind map support
  const handleSaveNote = async (noteData: Partial<Note>) => {
    if (!currentUser) return;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      imageUrl: noteData.imageUrl,
      summary: noteData.summary || noteData.content?.slice(0, 100),
      tags: noteData.tags || ['General'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeAgo: 'Just now',
      color: noteData.color || 'teal',
      mindMapNodes: noteData.mindMapNodes || [
        { id: '1', label: noteData.title || 'Note', type: 'root' },
      ],
    };

    await addFirestoreNote(currentUser.uid, newNote);
    setShowNewNoteModal(false);
    confetti({ particleCount: 40, spread: 45 });
  };

  // Delete note from Firestore
  const handleDeleteNote = async (id: string) => {
    if (!currentUser) return;
    await deleteFirestoreNote(currentUser.uid, id);
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  // Toggle project tasks in Firestore
  const handleToggleProjectTask = async (projectId: string, taskId: string) => {
    if (!currentUser) return;
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    const updatedTasks = proj.tasks.map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    const completedCount = updatedTasks.filter((t) => t.done).length;
    const newProgress = Math.round((completedCount / updatedTasks.length) * 100);

    await updateFirestoreProject(currentUser.uid, projectId, {
      tasks: updatedTasks,
      progress: newProgress,
    });
  };

  // Add project to Firestore
  const handleAddProject = async (newProj: Partial<Project>) => {
    if (!currentUser) return;
    const project: Project = {
      id: newProj.id || `proj-${Date.now()}`,
      title: newProj.title || 'New Project',
      description: newProj.description || '',
      progress: newProj.progress || 0,
      tags: newProj.tags || ['Code'],
      repoUrl: newProj.repoUrl || '#',
      iconBg: newProj.iconBg || 'bg-indigo-100 text-indigo-600',
      iconColor: newProj.iconColor || 'indigo',
      visibility: newProj.visibility || 'public',
      stars: newProj.stars || 0,
      forks: newProj.forks || 0,
      isGitHubSynced: newProj.isGitHubSynced ?? true,
      githubOwner: newProj.githubOwner,
      githubRepo: newProj.githubRepo,
      defaultBranch: newProj.defaultBranch,
      lastSyncedAt: newProj.lastSyncedAt || new Date().toISOString(),
      status: 'Active',
      commits: newProj.commits || [],
      pullRequests: newProj.pullRequests || [],
      tasks: newProj.tasks || [],
    };

    await addFirestoreProject(currentUser.uid, project);
  };

  // Delete project from Firestore
  const handleDeleteProject = async (projectId: string) => {
    if (!currentUser) return;
    await deleteFirestoreProject(currentUser.uid, projectId);
  };

  // Batch save multiple projects from GitHub auto-sync
  const handleBatchAddProjects = async (newProjects: Project[]) => {
    if (!currentUser) return;
    await batchSaveFirestoreProjects(currentUser.uid, newProjects);
  };

  // Update existing project details
  const handleUpdateProject = async (projectId: string, data: Partial<Project>) => {
    if (!currentUser) return;
    await updateFirestoreProject(currentUser.uid, projectId, data);
  };

  // Update user profile fields (e.g. GitHub connection)
  const handleUpdateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    await updateUserProfile(currentUser.uid, updates);
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  // Save updated roadmap to Firestore
  const handleUpdateRoadmap = async (updated: Roadmap) => {
    if (!currentUser) return;
    await saveFirestoreRoadmap(currentUser.uid, updated);
  };

  // Launch Quiz from note or topic
  const handleStartQuiz = async (topic: string, content?: string) => {
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, noteContent: content }),
      });
      const data = await res.json();
      if (data && data.questions) {
        setActiveQuiz(data);
      }
    } catch (err) {
      console.error(err);
      setActiveQuiz({
        topic: topic || 'Learning Quiz',
        questions: [
          {
            id: 'q1',
            question: `What is the primary focus of ${topic}?`,
            options: [
              'Architecture and core fundamentals',
              'Static configuration only',
              'Unused dependencies',
              'None of the above',
            ],
            correctIndex: 0,
            explanation: `${topic} builds the foundation for scalable, clean code implementations.`,
          },
        ],
      });
    }
  };

  const handleCompleteLesson = async () => {
    setShowLessonModal(false);
    if (!currentUser || !roadmap) return;
    const updatedRoadmap: Roadmap = {
      ...roadmap,
      overallProgress: Math.min(100, roadmap.overallProgress + 5),
    };
    await saveFirestoreRoadmap(currentUser.uid, updatedRoadmap);
  };

  // Dynamic user profile: 100% data-driven, starts at 0 streak, 0 notes, 0 projects
  const effectiveUser: UserProfile = userProfile || {
    name: currentUser?.displayName || 'Learner',
    role: 'Software Developer',
    email: currentUser?.email || '',
    avatarUrl:
      currentUser?.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    streak: 0,
    totalNotes: notes.length,
    totalProjects: projects.length,
    weeklyGoals: {
      completed: tasks.filter((t) => t.completed).length,
      total: tasks.length,
    },
    googleId: currentUser?.uid,
    isGoogleConnected: true,
  };

  return (
    <MobileFrame
      theme={theme}
      onToggleTheme={toggleTheme}
      onQuickQuizTrigger={() => handleStartQuiz('Clean Architecture')}
    >
      {isAuthChecking ? (
        <div className="min-h-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-4 animate-bounce">
            <BookOpen className="w-8 h-8" />
          </div>
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
          <p className="text-xs font-semibold text-slate-500">Connecting to Firebase...</p>
        </div>
      ) : !currentUser ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="flex flex-col min-h-full">
          {/* Flutter Mobile Top App Bar */}
          <Header
            user={effectiveUser}
            theme={theme}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
            onResetData={handleResetDatabase}
          />

          {/* Flutter Mobile Tab Views */}
          <div className="flex-1">
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
              />
            )}

            {activeTab === 'ai' && (
              <AIScreen
                notes={notes}
                onStartQuiz={handleStartQuiz}
                onSaveAsNote={(title, content) => handleSaveNote({ title, content })}
              />
            )}
          </div>

          {/* Flutter-style Bottom Navigation Bar */}
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
            />
          )}
        </div>
      )}
    </MobileFrame>
  );
}
