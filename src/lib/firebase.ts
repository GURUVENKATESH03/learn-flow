import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Note, TaskItem, Project, Roadmap, UserProfile } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error types according to firebase-integration guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mandatory testConnection function
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is waiting.');
    }
    return false;
  }
}

// Authentication Helpers - Starts completely fresh with 0 notes, 0 projects, 0 goals, 0 streak
export async function signInWithGoogle(): Promise<UserProfile | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (!user) return null;

    const userRef = doc(db, 'users', user.uid);
    let userSnap;
    try {
      userSnap = await getDoc(userRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    }

    let profile: UserProfile;

    if (userSnap && userSnap.exists()) {
      profile = userSnap.data() as UserProfile;
    } else {
      // First time sign-in: Clean fresh user profile document in Firestore (0 items)
      profile = {
        name: user.displayName || 'Learner',
        email: user.email || '',
        role: 'Software Developer',
        avatarUrl:
          user.photoURL ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        streak: 0,
        totalNotes: 0,
        totalProjects: 0,
        weeklyGoals: {
          completed: 0,
          total: 0,
        },
        googleId: user.uid,
        isGoogleConnected: true,
      };

      try {
        await setDoc(userRef, {
          ...profile,
          id: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
    }

    return profile;
  } catch (error) {
    console.error('Sign in with Google error:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

// Reset and wipe all data in Firestore for the user to start 100% fresh
export async function clearUserFirestoreData(userId: string): Promise<void> {
  try {
    // Delete all notes
    const notesSnap = await getDocs(collection(db, 'users', userId, 'notes'));
    for (const d of notesSnap.docs) {
      await deleteDoc(d.ref);
    }

    // Delete all tasks
    const tasksSnap = await getDocs(collection(db, 'users', userId, 'tasks'));
    for (const d of tasksSnap.docs) {
      await deleteDoc(d.ref);
    }

    // Delete all projects
    const projSnap = await getDocs(collection(db, 'users', userId, 'projects'));
    for (const d of projSnap.docs) {
      await deleteDoc(d.ref);
    }

    // Delete all roadmaps
    const roadmapsSnap = await getDocs(collection(db, 'users', userId, 'roadmaps'));
    for (const d of roadmapsSnap.docs) {
      await deleteDoc(d.ref);
    }

    // Reset user profile stats to 0
    await setDoc(
      doc(db, 'users', userId),
      {
        streak: 0,
        totalNotes: 0,
        totalProjects: 0,
        weeklyGoals: {
          completed: 0,
          total: 0,
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error clearing user Firestore data:', error);
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
  }
}

// Real-Time Subscriptions for Firestore

export function subscribeToUserProfile(
  userId: string,
  onUpdate: (user: UserProfile) => void
) {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as UserProfile);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    }
  );
}

export function subscribeToNotes(
  userId: string,
  onUpdate: (notes: Note[]) => void
) {
  const notesRef = collection(db, 'users', userId, 'notes');
  return onSnapshot(
    notesRef,
    (snapshot) => {
      const items: Note[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Note);
      });
      // Sort newest first
      items.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/notes`);
    }
  );
}

export function subscribeToTasks(
  userId: string,
  onUpdate: (tasks: TaskItem[]) => void
) {
  const tasksRef = collection(db, 'users', userId, 'tasks');
  return onSnapshot(
    tasksRef,
    (snapshot) => {
      const items: TaskItem[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as TaskItem);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/tasks`);
    }
  );
}

export function subscribeToProjects(
  userId: string,
  onUpdate: (projects: Project[]) => void
) {
  const projectsRef = collection(db, 'users', userId, 'projects');
  return onSnapshot(
    projectsRef,
    (snapshot) => {
      const items: Project[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Project);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/projects`);
    }
  );
}

export function subscribeToRoadmaps(
  userId: string,
  onUpdate: (roadmaps: Roadmap[]) => void
) {
  const roadmapsRef = collection(db, 'users', userId, 'roadmaps');
  return onSnapshot(
    roadmapsRef,
    (snapshot) => {
      const items: Roadmap[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Roadmap);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/roadmaps`);
    }
  );
}

// Database Mutation Operations (Live Firestore Writes)

// Helper to strip undefined values so Firestore does not throw Unsupported field value: undefined
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export async function addFirestoreNote(userId: string, note: Note) {
  const path = `users/${userId}/notes/${note.id}`;
  try {
    const cleanNote = sanitizeForFirestore(note);
    await setDoc(doc(db, 'users', userId, 'notes', note.id), {
      ...cleanNote,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteFirestoreNote(userId: string, noteId: string) {
  const path = `users/${userId}/notes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'notes', noteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function addFirestoreTask(userId: string, task: TaskItem) {
  const path = `users/${userId}/tasks/${task.id}`;
  try {
    const cleanTask = sanitizeForFirestore(task);
    await setDoc(doc(db, 'users', userId, 'tasks', task.id), {
      ...cleanTask,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function toggleFirestoreTask(
  userId: string,
  taskId: string,
  completed: boolean
) {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
      completed,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreTask(userId: string, taskId: string) {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function addFirestoreProject(userId: string, project: Project) {
  const path = `users/${userId}/projects/${project.id}`;
  try {
    const cleanProject = sanitizeForFirestore(project);
    await setDoc(doc(db, 'users', userId, 'projects', project.id), {
      ...cleanProject,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function updateFirestoreProject(
  userId: string,
  projectId: string,
  data: Partial<Project>
) {
  const path = `users/${userId}/projects/${projectId}`;
  try {
    const cleanData = sanitizeForFirestore(data);
    await updateDoc(doc(db, 'users', userId, 'projects', projectId), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreProject(userId: string, projectId: string) {
  const path = `users/${userId}/projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
) {
  const path = `users/${userId}`;
  try {
    const cleanProfile = sanitizeForFirestore(data);
    await setDoc(doc(db, 'users', userId), cleanProfile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function batchSaveFirestoreProjects(
  userId: string,
  projectsList: Project[]
) {
  try {
    for (const proj of projectsList) {
      const cleanProject = sanitizeForFirestore(proj);
      await setDoc(doc(db, 'users', userId, 'projects', proj.id), {
        ...cleanProject,
        userId,
      });
    }
    // Also update totalProjects on user profile
    await updateUserProfile(userId, {
      totalProjects: projectsList.length,
    });
  } catch (error) {
    console.error('Error saving projects batch:', error);
  }
}

export async function saveFirestoreRoadmap(userId: string, roadmap: Roadmap) {
  const path = `users/${userId}/roadmaps/${roadmap.id}`;
  try {
    const cleanRoadmap = sanitizeForFirestore(roadmap);
    await setDoc(doc(db, 'users', userId, 'roadmaps', roadmap.id), {
      ...cleanRoadmap,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}
