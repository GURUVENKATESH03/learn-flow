import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { db, auth } from './firebaseConfig';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'notes' | 'projects' | 'roadmap'>('home');
  const [loading, setLoading] = useState(true);

  // Live Firestore database states (no hardcoded data)
  const [notes, setNotes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // Modal states
  const [newNoteModal, setNewNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [newTaskText, setNewTaskText] = useState('');
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  // Listen to Firestore real-time collections for user
  useEffect(() => {
    if (!currentUser) {
      setNotes([]);
      setTasks([]);
      setProjects([]);
      return;
    }

    const userId = currentUser.uid;

    const unsubNotes = onSnapshot(collection(db, 'users', userId, 'notes'), (snap) => {
      const items: any[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setNotes(items);
    });

    const unsubTasks = onSnapshot(collection(db, 'users', userId, 'tasks'), (snap) => {
      const items: any[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setTasks(items);
    });

    const unsubProjects = onSnapshot(collection(db, 'users', userId, 'projects'), (snap) => {
      const items: any[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setProjects(items);
    });

    return () => {
      unsubNotes();
      unsubTasks();
      unsubProjects();
    };
  }, [currentUser]);

  // Firestore operations
  const handleAddNote = async () => {
    if (!currentUser || !noteTitle.trim()) return;
    try {
      const id = `note-${Date.now()}`;
      await setDoc(doc(db, 'users', currentUser.uid, 'notes', id), {
        id,
        title: noteTitle,
        content: noteContent,
        createdAt: new Date().toISOString(),
      });
      setNoteTitle('');
      setNoteContent('');
      setNewNoteModal(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'notes', id));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleAddTask = async () => {
    if (!currentUser || !newTaskText.trim()) return;
    try {
      const id = `task-${Date.now()}`;
      await setDoc(doc(db, 'users', currentUser.uid, 'tasks', id), {
        id,
        text: newTaskText.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      });
      setNewTaskText('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleToggleTask = async (id: string, currentDone: boolean) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'tasks', id), {
        completed: !currentDone,
      });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleAddProject = async () => {
    if (!currentUser || !projectTitle.trim()) return;
    try {
      const id = `proj-${Date.now()}`;
      await setDoc(doc(db, 'users', currentUser.uid, 'projects', id), {
        id,
        title: projectTitle,
        description: projectDesc,
        visibility: 'public',
        progress: 0,
        createdAt: new Date().toISOString(),
      });
      setProjectTitle('');
      setProjectDesc('');
      setNewProjectModal(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Connecting to LearnFlow...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* App Mobile Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>LEARNFLOW MOBILE</Text>
          <Text style={styles.headerTitle}>
            {currentUser?.displayName ? `Hello, ${currentUser.displayName}` : 'Welcome, Learner'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (currentUser) signOut(auth);
          }}
          style={styles.avatarButton}
        >
          <Text style={styles.avatarText}>
            {currentUser?.displayName?.charAt(0) || 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen Views */}
      <View style={styles.body}>
        {activeTab === 'home' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#f3e8ff' }]}>
                <Text style={styles.statNumber}>{notes.length}</Text>
                <Text style={styles.statLabel}>Notes</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#e0f2fe' }]}>
                <Text style={styles.statNumber}>{projects.length}</Text>
                <Text style={styles.statLabel}>Projects</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
                <Text style={styles.statNumber}>{tasks.length}</Text>
                <Text style={styles.statLabel}>Goals</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#ffe4e6' }]}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>

            {/* Today's Focus Goals */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Focus Goals</Text>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.taskInput}
                placeholder="Add a new daily goal..."
                value={newTaskText}
                onChangeText={setNewTaskText}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {tasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No goals added yet</Text>
                <Text style={styles.emptySubtitle}>Everything is live from your Firestore database.</Text>
              </View>
            ) : (
              tasks.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.taskCard}
                  onPress={() => handleToggleTask(t.id, t.completed)}
                >
                  <View style={[styles.checkbox, t.completed && styles.checkboxChecked]} />
                  <Text style={[styles.taskText, t.completed && styles.taskDone]}>
                    {t.text}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}

        {activeTab === 'notes' && (
          <View style={styles.tabContainer}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Smart Notes ({notes.length})</Text>
              <TouchableOpacity
                style={styles.primaryPillButton}
                onPress={() => setNewNoteModal(true)}
              >
                <Text style={styles.primaryPillText}>+ New Note</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={notes}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 80 }}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No notes created yet</Text>
                  <Text style={styles.emptySubtitle}>Tap + New Note to add your first note to Firestore.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.noteCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noteTitle}>{item.title}</Text>
                    {item.content ? <Text style={styles.noteContent}>{item.content}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
                    <Text style={styles.deleteAction}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {activeTab === 'projects' && (
          <View style={styles.tabContainer}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Projects ({projects.length})</Text>
              <TouchableOpacity
                style={styles.primaryPillButton}
                onPress={() => setNewProjectModal(true)}
              >
                <Text style={styles.primaryPillText}>+ New Project</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={projects}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 80 }}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No projects tracked yet</Text>
                  <Text style={styles.emptySubtitle}>Track repos, code bases, and learning projects.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.projectCard}>
                  <Text style={styles.projectTitle}>{item.title}</Text>
                  <Text style={styles.projectDesc}>{item.description || 'No description'}</Text>
                </View>
              )}
            />
          </View>
        )}

        {activeTab === 'roadmap' && (
          <View style={styles.tabContainer}>
            <Text style={styles.sectionTitle}>Learning Roadmap</Text>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Roadmap Synchronized</Text>
              <Text style={styles.emptySubtitle}>All roadmaps sync with Google Cloud Firestore.</Text>
            </View>
          </View>
        )}
      </View>

      {/* Flutter/Mobile Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {(['home', 'notes', 'projects', 'roadmap'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.navItem, isActive && styles.navItemActive]}
            >
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* New Note Modal */}
      <Modal visible={newNoteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Note</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Note title"
              value={noteTitle}
              onChangeText={setNoteTitle}
            />
            <TextInput
              style={[styles.modalInput, { height: 100 }]}
              placeholder="Write markdown note..."
              multiline
              value={noteContent}
              onChangeText={setNoteContent}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setNewNoteModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={handleAddNote}
              >
                <Text style={styles.submitText}>Save to Firestore</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Project Modal */}
      <Modal visible={newProjectModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Project</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Project or Repository Title"
              value={projectTitle}
              onChangeText={setProjectTitle}
            />
            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              placeholder="Project description..."
              multiline
              value={projectDesc}
              onChangeText={setProjectDesc}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setNewProjectModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={handleAddProject}
              >
                <Text style={styles.submitText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  tabContainer: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  taskInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  addButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  taskText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
    flex: 1,
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  emptyCard: {
    padding: 24,
    backgroundColor: '#f1f5f9',
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  primaryPillButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  primaryPillText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  noteCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 12,
    color: '#64748b',
  },
  deleteAction: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 12,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  projectTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  projectDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
  },
  navItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  navItemActive: {
    backgroundColor: '#e0e7ff',
  },
  navText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  navTextActive: {
    color: '#4f46e5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  cancelText: {
    color: '#64748b',
    fontWeight: '600',
  },
  modalSubmit: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
