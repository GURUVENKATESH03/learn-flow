/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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

// Starter data for Guest / Instant Demo mode
const initialGuestNotes: Note[] = [
  {
    id: 'n1',
    title: 'Clean Architecture in Spring Boot 3.3',
    content:
      'Domain-centric layers ensure decoupling of business logic from framework details. Core domain entities remain framework-agnostic while adapters interface with persistence and web delivery.',
    summary:
      'Core domain isolation, port/adapter patterns, and testability in modern microservices.',
    tags: ['Architecture', 'Spring Boot', 'Java'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeAgo: '2h ago',
    color: 'teal',
    mindMapNodes: [
      { id: '1', label: 'Domain Core', type: 'root' },
      { id: '2', label: 'Use Cases & Ports', type: 'concept' },
      { id: '3', label: 'Adapters & Infrastructure', type: 'practice' },
    ],
  },
  {
    id: 'n2',
    title: 'Java 21 Virtual Threads & Loom Concurrency',
    content:
      'Virtual threads are lightweight threads managed by the JVM rather than the OS kernel. They drastically reduce the memory footprint of high-throughput I/O bound web applications.',
    summary:
      'JVM-managed lightweight threads enabling 10k+ concurrent requests with standard imperative code.',
    tags: ['Java 21', 'Concurrency', 'Performance'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeAgo: '1d ago',
    color: 'indigo',
    mindMapNodes: [
      { id: '1', label: 'Virtual Threads', type: 'root' },
      { id: '2', label: 'Carrier Threads', type: 'concept' },
      { id: '3', label: 'Unpinned I/O', type: 'practice' },
    ],
  },
  {
    id: 'n3',
    title: 'Event-Driven Architectures with Kafka',
    content:
      'Partitioning strategies, consumer group offsets, idempotent producers, and dead-letter topics for mission-critical microservice events.',
    summary:
      'Reliable distributed event streaming, offset management, and at-least-once delivery guarantees.',
    tags: ['Kafka', 'Microservices', 'Distributed'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeAgo: '3d ago',
    color: 'amber',
  },
];

const initialGuestTasks: TaskItem[] = [
  { id: 't1', text: 'Benchmark Virtual Threads with 10k concurrent requests', completed: true },
  { id: 't2', text: 'Implement GitHub OAuth & Repo Webhook synchronization', completed: true },
  { id: 't3', text: 'Design resilient Circuit Breaker with Resilience4j', completed: false },
  { id: 't4', text: 'Review Spring Security 6.3 JWT Filter Chain', completed: false },
];

const initialGuestProjects: Project[] = [
  {
    id: 'p1',
    title: 'LearnFlow Web & Mobile Hub',
    description:
      'AI-assisted developer learning platform with GitHub sync, interactive concept mind-maps, and automated roadmaps.',
    progress: 85,
    tags: ['React', 'TypeScript', 'Tailwind', 'Express'],
    repoUrl: 'https://github.com/learnflow/core',
    iconBg: 'indigo',
    iconColor: 'indigo',
    visibility: 'public',
    stars: 28,
    forks: 7,
    isGitHubSynced: true,
    githubOwner: 'learnflow',
    githubRepo: 'core',
    defaultBranch: 'main',
    lastSyncedAt: new Date().toISOString(),
    commits: [
      {
        id: 'c1',
        hash: '2afb7fe',
        message: 'feat: complete LearnFlow smart learning app with GitHub sync, commits, and PRs',
        author: 'Developer',
        timeAgo: '10m ago',
        branch: 'main',
      },
      {
        id: 'c2',
        hash: '7c8a901',
        message: 'feat: add interactive concept mind-mapping and dynamic quizzes',
        author: 'Developer',
        timeAgo: '2h ago',
        branch: 'main',
      },
    ],
    pullRequests: [
      {
        id: 101,
        number: 14,
        title: 'Enhance desktop responsive layout & add instant guest access',
        state: 'open',
        author: 'developer',
        createdAt: new Date().toISOString(),
        timeAgo: '15m ago',
        htmlUrl: '#',
      },
    ],
    tasks: [
      { id: 'pt1', text: 'Responsive laptop & desktop viewport layout', done: true },
      { id: 'pt2', text: 'Deploy to Vercel with SPA routing rewrite', done: true },
      { id: 'pt3', text: 'Connect GitHub repository for live branch commits', done: true },
    ],
    status: 'Active',
  },
];

const initialGuestRoadmap: Roadmap = {
  id: 'rm-1',
  title: 'Full Stack & Distributed Systems Mastery',
  roleTrack: 'Software Engineer',
  currentWeek: 3,
  totalWeeks: 12,
  overallProgress: 45,
  milestones: [
    {
      phase: 'Phase 1',
      title: 'Spring Boot 3 & Core Microservices Architecture',
      weeks: 'Weeks 1-3',
      status: 'In Progress',
      progress: 75,
      tasks: [
        'Domain-Driven Design (DDD) & Clean Architecture',
        'Spring Security 6 with Stateless JWT Authentication',
        'Virtual Threads & High Throughput Benchmarking',
      ],
    },
    {
      phase: 'Phase 2',
      title: 'Distributed Messaging & Event Streaming',
      weeks: 'Weeks 4-6',
      status: 'Upcoming',
      progress: 20,
      tasks: [
        'Apache Kafka Producer Idempotence & Consumer Groups',
        'Saga Pattern for Distributed Transaction Consistency',
        'Dead-Letter Queues & Resilient Retry Strategies',
      ],
    },
    {
      phase: 'Phase 3',
      title: 'Cloud Native Deployment & Observability',
      weeks: 'Weeks 7-10',
      status: 'Upcoming',
      progress: 0,
      tasks: [
        'Docker Multi-Stage Builds & Kubernetes Pod Scheduling',
        'Distributed Tracing with OpenTelemetry & Grafana',
        'CI/CD Pipeline with Automated Smoke Testing',
      ],
    },
  ],
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('learnflow_guest_mode') === 'true';
  });
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('learnflow_theme') as 'light' | 'dark') || 'light';
  });

  // Live database states
  const [notes, setNotes] = useState<Note[]>(() => {
    return isGuestMode ? initialGuestNotes : [];
  });
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    return isGuestMode ? initialGuestTasks : [];
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    return isGuestMode ? initialGuestProjects : [];
  });
  const [roadmap, setRoadmap] = useState<Roadmap | null>(() => {
    return isGuestMode ? initialGuestRoadmap : null;
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
        }
        setIsAuthChecking(false);
      }
    });

    return () => unsubscribeAuth();
  }, [isGuestMode]);

  // Subscribe to live Firestore collections for the authenticated user
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

    if (notes.length === 0) setNotes(initialGuestNotes);
    if (tasks.length === 0) setTasks(initialGuestTasks);
    if (projects.length === 0) setProjects(initialGuestProjects);
    if (!roadmap) setRoadmap(initialGuestRoadmap);

    confetti({ particleCount: 50, spread: 60 });
  };

  // Sign out
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

  // Reset database / clear state
  const handleResetDatabase = async () => {
    if (currentUser) {
      try {
        await clearUserFirestoreData(currentUser.uid);
      } catch (err) {
        console.error('Reset database error:', err);
      }
    }
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
  };

  // Note Handlers
  const handleSaveNote = async (newNoteData: Partial<Note>) => {
    const defaultTags = ['Engineering', 'Architecture'];
    const now = new Date().toISOString();
    const noteId = newNoteData.id || `note-${Date.now()}`;
    const fullNote: Note = {
      id: noteId,
      title: newNoteData.title || 'Untitled Note',
      content: newNoteData.content || '',
      summary:
        (newNoteData.content || '').slice(0, 150) +
        ((newNoteData.content || '').length > 150 ? '...' : ''),
      imageUrl: newNoteData.imageUrl,
      tags: newNoteData.tags && newNoteData.tags.length > 0 ? newNoteData.tags : defaultTags,
      timeAgo: 'Just now',
      color: (newNoteData.color as any) || 'teal',
      mindMapNodes: newNoteData.mindMapNodes,
      createdAt: now,
      updatedAt: now,
    };

    if (currentUser) {
      try {
        await addFirestoreNote(currentUser.uid, fullNote);
      } catch (err) {
        console.error('Error adding firestore note:', err);
      }
    } else {
      setNotes((prev) => [fullNote, ...prev]);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (currentUser) {
      try {
        await deleteFirestoreNote(currentUser.uid, noteId);
      } catch (err) {
        console.error('Error deleting firestore note:', err);
      }
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  // Task Handlers
  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (currentUser) {
      try {
        await toggleFirestoreTask(currentUser.uid, taskId, task.completed);
      } catch (err) {
        console.error('Error toggling firestore task:', err);
      }
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      );
    }
  };

  const handleAddTask = async (text: string) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text,
      completed: false,
      category: 'General',
    };
    if (currentUser) {
      try {
        await addFirestoreTask(currentUser.uid, newTask);
      } catch (err) {
        console.error('Error adding firestore task:', err);
      }
    } else {
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (currentUser) {
      try {
        await deleteFirestoreTask(currentUser.uid, taskId);
      } catch (err) {
        console.error('Error deleting firestore task:', err);
      }
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  // Project Handlers
  const handleAddProject = async (newProj: Partial<Project>) => {
    const fullProject: Project = {
      id: newProj.id || `proj-${Date.now()}`,
      title: newProj.title || 'New Repository',
      description: newProj.description || 'Project managed in LearnFlow',
      progress: newProj.progress || 0,
      tags: newProj.tags || ['Java', 'Spring'],
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

    if (currentUser) {
      try {
        await addFirestoreProject(currentUser.uid, fullProject);
      } catch (err) {
        console.error('Error adding firestore project:', err);
      }
    } else {
      setProjects((prev) => [fullProject, ...prev]);
    }
  };

  const handleUpdateProject = async (projectId: string, data: Partial<Project>) => {
    if (currentUser) {
      try {
        await updateFirestoreProject(currentUser.uid, projectId, data);
      } catch (err) {
        console.error('Error updating firestore project:', err);
      }
    } else {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...data } : p))
      );
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (currentUser) {
      try {
        await deleteFirestoreProject(currentUser.uid, projectId);
      } catch (err) {
        console.error('Error deleting firestore project:', err);
      }
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
  };

  const handleBatchAddProjects = async (newProjects: Project[]) => {
    if (currentUser) {
      try {
        await batchSaveFirestoreProjects(currentUser.uid, newProjects);
      } catch (err) {
        console.error('Error batch adding firestore projects:', err);
      }
    } else {
      setProjects((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filteredNew = newProjects.filter((p) => !existingIds.has(p.id));
        return [...filteredNew, ...prev];
      });
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
    if (currentUser) {
      try {
        await updateUserProfile(currentUser.uid, updates);
      } catch (err) {
        console.error('Error updating user profile:', err);
      }
    }
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  // Roadmap Handler
  const handleUpdateRoadmap = async (newRoadmap: Roadmap) => {
    if (currentUser) {
      try {
        await saveFirestoreRoadmap(currentUser.uid, newRoadmap);
      } catch (err) {
        console.error('Error saving firestore roadmap:', err);
      }
    }
    setRoadmap(newRoadmap);
  };

  // Lesson & Quiz Handlers
  const handleCompleteLesson = () => {
    setShowLessonModal(false);
    confetti({ particleCount: 70, spread: 80 });
  };

  const handleStartQuiz = (topic: string, content?: string) => {
    const quizTitle = topic || 'Distributed Systems & Clean Architecture';
    const sampleQuestions = [
      {
        id: 'q1',
        question: `In Clean Architecture, which layer contains the enterprise business rules?`,
        options: [
          'The Web / Controller Adapter Layer',
          'The Domain Entities Core Layer',
          'The Database Infrastructure Layer',
          'The Third-Party API Gateway Layer',
        ],
        correctIndex: 1,
        explanation:
          'In Clean Architecture, Enterprise Business Rules are encapsulated inside the innermost Domain Entities core layer, which has zero dependencies on external frameworks.',
      },
      {
        id: 'q2',
        question: `How do Java 21 Virtual Threads differ from traditional platform threads?`,
        options: [
          'They bypass JVM memory limits by writing directly to disk',
          'They are mapped 1:1 directly to OS kernel threads',
          'They are scheduled by the JVM on a carrier pool, unpinning on blocking I/O',
          'They require reactive Mono/Flux abstractions to execute asynchronously',
        ],
        correctIndex: 2,
        explanation:
          'Virtual Threads are managed directly by the JVM runtime and multiplexed onto a small pool of carrier OS platform threads, suspending without blocking kernel threads.',
      },
    ];

    setActiveQuiz({
      topic: quizTitle,
      questions: sampleQuestions,
    });
  };

  const effectiveUser: UserProfile = userProfile || {
    name: currentUser?.displayName || 'Prakash (Developer)',
    role: 'Software Developer',
    email: currentUser?.email || 'prakashgvp.dev03@gmail.com',
    avatarUrl:
      currentUser?.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    streak: isGuestMode ? 5 : 0,
    totalNotes: notes.length,
    totalProjects: projects.length,
    weeklyGoals: {
      completed: tasks.filter((t) => t.completed).length,
      total: tasks.length,
    },
    googleId: currentUser?.uid,
    isGoogleConnected: Boolean(currentUser),
    githubUsername: 'prakash-dev',
    githubConnected: true,
  };

  const isAuthenticated = Boolean(currentUser || isGuestMode);

  return (
    <div
      className={`min-h-screen w-full flex flex-col transition-colors duration-200 ${
        theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
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

          {/* Main App Content Container (Responsive max-w-7xl on desktop, full-width on mobile) */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-12">
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
            />
          )}
        </div>
      )}
    </div>
  );
}
