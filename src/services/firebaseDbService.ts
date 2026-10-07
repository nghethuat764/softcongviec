import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Task } from '../types';
import { INITIAL_TASKS } from '../data/initialTasks';
import { USER_ACCOUNTS } from '../data/userAccounts';

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const TASKS_COLLECTION = 'tasks';
const USERS_COLLECTION = 'users';

// Initialize and seed collections
export async function initializeDatabase(): Promise<Task[]> {
  const tasksRef = collection(db, TASKS_COLLECTION);
  try {
    const snapshot = await getDocs(tasksRef);
    if (snapshot.empty) {
      console.log('Database is empty. Seeding initial tasks from 28/9/2026 notice...');
      // Seed initial tasks
      for (const t of INITIAL_TASKS) {
        await setDoc(doc(db, TASKS_COLLECTION, t.id), t);
      }
      // Seed users
      for (const u of USER_ACCOUNTS) {
        await setDoc(doc(db, USERS_COLLECTION, u.id), u);
      }
      return INITIAL_TASKS;
    } else {
      const tasks: Task[] = [];
      snapshot.forEach((docSnap) => {
        tasks.push(docSnap.data() as Task);
      });
      return tasks;
    }
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, TASKS_COLLECTION);
    } catch {
      // Fallback to initial tasks if error occurs
    }
    return INITIAL_TASKS;
  }
}

// Subscribe to real-time updates for tasks
export function subscribeToTasks(onUpdate: (tasks: Task[]) => void, onError?: (err: any) => void) {
  const tasksRef = collection(db, TASKS_COLLECTION);
  return onSnapshot(
    tasksRef,
    (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((d) => {
        tasks.push(d.data() as Task);
      });
      onUpdate(tasks);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, TASKS_COLLECTION);
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

// Save or update a task
export async function saveTaskToDb(task: Task): Promise<void> {
  const docRef = doc(db, TASKS_COLLECTION, task.id);
  try {
    await setDoc(docRef, task, { merge: true });
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, `${TASKS_COLLECTION}/${task.id}`);
    } catch {
      // Allow fallback
    }
  }
}

// Delete a task (Leader only)
export async function deleteTaskFromDb(taskId: string): Promise<void> {
  const docRef = doc(db, TASKS_COLLECTION, taskId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.DELETE, `${TASKS_COLLECTION}/${taskId}`);
    } catch {
      // Allow fallback
    }
  }
}

// Reset database to initial meeting tasks
export async function resetDatabaseToOriginal(): Promise<Task[]> {
  try {
    const tasksRef = collection(db, TASKS_COLLECTION);
    const snapshot = await getDocs(tasksRef);
    for (const d of snapshot.docs) {
      await deleteDoc(doc(db, TASKS_COLLECTION, d.id));
    }
    for (const t of INITIAL_TASKS) {
      await setDoc(doc(db, TASKS_COLLECTION, t.id), t);
    }
    return INITIAL_TASKS;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, TASKS_COLLECTION);
    } catch {
      // Allow fallback
    }
    return INITIAL_TASKS;
  }
}
