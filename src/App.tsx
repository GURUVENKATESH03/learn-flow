/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { HomeScreen } from './components/screens/HomeScreen';
import { NotesScreen } from './components/screens/NotesScreen';
import { ProjectsScreen } from './components/screens/ProjectsScreen';
import { RoadmapScreen } from './components/screens/RoadmapScreen';
import { AIScreen } from './components/screens/AIScreen';

import { NoteDetailModal } from './components/modals/NoteDetailModal';
import { LessonModal } from './components/modals/LessonModal';
import { QuizModal } from './components/modals/QuizModal';
import { NewNoteModal } from './components/modals/NewNoteModal';

import {
  initialUser,
  initialNotes,
  initialTasks,
  initialProjects,
  initialRoadmap,
} from './data/mockData';
import { Note, TaskItem, Project, Roadmap, Quiz } from './types';
import confetti from 'canvas-confetti';

export default function App() {
  const [user, setUser] = useState(initialUser);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [roadmap, setRoadmap] = useState<Roadmap>(initialRoadmap);

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  // Toggle tasks in Today's Focus
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          return { ...t, completed: nextState };
        }
        return t;
      })
    );

    // Update user stats
    const doneCount = tasks.filter((t) => (t.id === id ? !t.completed : t.completed)).length;
    setUser((prev) => ({
      ...prev,
      weeklyGoals: {
        ...prev.weeklyGoals,
        completed: Math.min(prev.weeklyGoals.total, doneCount),
      },
    }));
  };

  const handleAddTask = (text: string) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text,
      completed: false,
      category: 'Focus',
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Add / Save note
  const handleSaveNote = (noteData: Partial<Note>) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      summary: noteData.summary || noteData.content?.slice(0, 100),
      tags: noteData.tags || ['General'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeAgo: 'Just now',
      color: 'teal',
      mindMapNodes: noteData.mindMapNodes || [
        { id: '1', label: noteData.title || 'Note', type: 'root' },
      ],
    };

    setNotes((prev) => [newNote, ...prev]);
    setUser((prev) => ({ ...prev, totalNotes: prev.totalNotes + 1 }));
    setShowNewNoteModal(false);
    confetti({ particleCount: 40, spread: 45 });
  };

  // Toggle project tasks
  const handleToggleProjectTask = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedTasks = p.tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t
          );
          const completedCount = updatedTasks.filter((t) => t.done).length;
          const newProgress = Math.round((completedCount / updatedTasks.length) * 100);
          return { ...p, tasks: updatedTasks, progress: newProgress };
        }
        return p;
      })
    );
  };

  const handleAddProject = (newProj: Partial<Project>) => {
    const project: Project = {
      id: `proj-${Date.now()}`,
      title: newProj.title || 'New Project',
      description: newProj.description || '',
      progress: newProj.progress || 0,
      tags: newProj.tags || ['Java'],
      repoUrl: newProj.repoUrl || '#',
      iconBg: newProj.iconBg || 'bg-indigo-100 text-indigo-600',
      iconColor: 'indigo',
      status: 'Active',
      commits: newProj.commits || [],
      tasks: newProj.tasks || [],
    };
    setProjects((prev) => [project, ...prev]);
    setUser((prev) => ({ ...prev, totalProjects: prev.totalProjects + 1 }));
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
      // Fallback local quiz
      setActiveQuiz({
        topic: topic || 'Kafka Basics',
        questions: [
          {
            id: 'q1',
            question: 'What is the primary role of a Partition in Apache Kafka?',
            options: [
              'To store client authentication tokens',
              'To allow horizontal parallelism and topic scaling',
              'To automatically translate JSON to XML',
              'To encrypt messages at rest',
            ],
            correctIndex: 1,
            explanation:
              'Partitions divide topics into independent ordered logs, enabling multiple consumers to read in parallel.',
          },
        ],
      });
    }
  };

  const handleCompleteLesson = () => {
    setShowLessonModal(false);
    // Advance progress
    setRoadmap((prev) => ({
      ...prev,
      overallProgress: Math.min(100, prev.overallProgress + 5),
    }));
  };

  return (
    <MobileFrame onQuickQuizTrigger={() => handleStartQuiz('Kafka Basics')}>
      <div className="flex flex-col min-h-full">
        {/* App Top Bar */}
        <Header user={user} />

        {/* Tab Screens */}
        <div className="flex-1">
          {activeTab === 'home' && (
            <HomeScreen
              user={user}
              notes={notes}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onOpenNote={(note) => setSelectedNote(note)}
              onOpenLesson={() => setShowLessonModal(true)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
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
              onToggleProjectTask={handleToggleProjectTask}
              onAddProject={handleAddProject}
            />
          )}

          {activeTab === 'roadmap' && (
            <RoadmapScreen
              roadmap={roadmap}
              onUpdateRoadmap={(updated) => setRoadmap(updated)}
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

        {/* Bottom Tab Bar */}
        <Navigation activeTab={activeTab} onChangeTab={(tab) => setActiveTab(tab)} />

        {/* Modals */}
        {selectedNote && (
          <NoteDetailModal
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onStartQuiz={handleStartQuiz}
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
                setUser((prev) => ({ ...prev, streak: prev.streak + 1 }));
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
    </MobileFrame>
  );
}
