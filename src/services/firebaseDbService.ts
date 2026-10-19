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
import { UserAccount, Department } from '../types/database';
import { INITIAL_TASKS } from '../data/initialTasks';
import { USER_ACCOUNTS } from '../data/userAccounts';
import { INITIAL_DEPARTMENTS } from '../data/departments';

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
const DEPARTMENTS_COLLECTION = 'departments';

// Initialize and seed collections
export async function initializeDatabase(): Promise<Task[]> {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const usersRef = collection(db, USERS_COLLECTION);
  try {
    const isCleared = localStorage.getItem('sample_data_cleared') === 'true';
    const snapshot = await getDocs(tasksRef);

    if (isCleared) {
      if (snapshot.empty) {
        return [];
      }
      const tasks: Task[] = [];
      snapshot.forEach((docSnap) => {
        tasks.push(docSnap.data() as Task);
      });
      return tasks;
    }

    if (snapshot.empty) {
      // Check if users collection already exists (meaning database was already seeded before)
      const userSnap = await getDocs(usersRef);
      if (!userSnap.empty) {
        // Users already exist, so empty tasks collection is intentional (sample data was deleted)
        return [];
      }

      console.log('Database is empty. Seeding initial tasks from 28/9/2026 notice...');
      // Seed initial tasks
      for (const t of INITIAL_TASKS) {
        await setDoc(doc(db, TASKS_COLLECTION, t.id), t);
      }
      // Seed users
      for (const u of USER_ACCOUNTS) {
        await setDoc(doc(db, USERS_COLLECTION, u.id), u);
      }
      // Seed departments
      for (const d of INITIAL_DEPARTMENTS) {
        await setDoc(doc(db, DEPARTMENTS_COLLECTION, d.id), d);
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
      // Fallback
    }
    return [];
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

// Helper to remove undefined fields recursively for Firestore compatibility
function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item));
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(data as Record<string, any>)) {
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned;
  }
  return data;
}

// Save or update a task
export async function saveTaskToDb(task: Task): Promise<void> {
  const docRef = doc(db, TASKS_COLLECTION, task.id);
  const sanitized = sanitizeForFirestore(task);
  try {
    await setDoc(docRef, sanitized, { merge: true });
    console.log(`Task ${task.code} (${task.id}) saved to Firestore successfully.`);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, `${TASKS_COLLECTION}/${task.id}`);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  }
}

// Delete a task (Leader only)
export async function deleteTaskFromDb(taskId: string): Promise<void> {
  const docRef = doc(db, TASKS_COLLECTION, taskId);
  try {
    await deleteDoc(docRef);
    console.log(`Task ${taskId} deleted from Firestore successfully.`);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.DELETE, `${TASKS_COLLECTION}/${taskId}`);
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  }
}

// Reset database by clearing all existing sample tasks (leaving system ready for real assignments)
export async function resetDatabaseToOriginal(): Promise<Task[]> {
  try {
    const tasksRef = collection(db, TASKS_COLLECTION);
    const snapshot = await getDocs(tasksRef);
    const deletePromises = snapshot.docs.map((d) => deleteDoc(doc(db, TASKS_COLLECTION, d.id)));
    await Promise.all(deletePromises);
    console.log(`Đã xóa sạch ${snapshot.docs.length} nhiệm vụ mẫu trong Firestore.`);
    localStorage.setItem('sample_data_cleared', 'true');
    return [];
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, TASKS_COLLECTION);
    } catch (e) {
      console.warn('Lỗi khi xóa nhiệm vụ Firestore:', e);
    }
    localStorage.setItem('sample_data_cleared', 'true');
    return [];
  }
}

// Fetch all users from Firestore
export async function fetchUsersFromDb(): Promise<UserAccount[]> {
  const usersRef = collection(db, USERS_COLLECTION);
  try {
    const snapshot = await getDocs(usersRef);
    if (snapshot.empty) {
      console.log('Users collection is empty. Seeding default accounts...');
      for (const u of USER_ACCOUNTS) {
        await setDoc(doc(db, USERS_COLLECTION, u.id), sanitizeForFirestore(u));
      }
      return USER_ACCOUNTS;
    }
    const users: UserAccount[] = [];
    snapshot.forEach((docSnap) => {
      users.push(docSnap.data() as UserAccount);
    });
    return users;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
    } catch (e) {
      console.warn('Firestore users fetch warning:', e);
    }
    return USER_ACCOUNTS;
  }
}

// Subscribe to real-time updates for users
export function subscribeToUsers(onUpdate: (users: UserAccount[]) => void, onError?: (err: any) => void) {
  const usersRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    usersRef,
    (snapshot) => {
      if (snapshot.empty) {
        fetchUsersFromDb().then(onUpdate);
        return;
      }
      const users: UserAccount[] = [];
      snapshot.forEach((d) => {
        users.push(d.data() as UserAccount);
      });
      onUpdate(users);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, USERS_COLLECTION);
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

// Save or update user account
export async function saveUserToDb(user: UserAccount): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, user.id);
  const sanitized = sanitizeForFirestore(user);
  try {
    await setDoc(docRef, sanitized, { merge: true });
    console.log(`User ${user.username} (${user.id}) saved to Firestore successfully.`);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${user.id}`);
    } catch (e) {
      console.warn('Firestore user write warning:', e);
      throw e;
    }
  }
}

// Delete user account
export async function deleteUserFromDb(userId: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId);
  try {
    await deleteDoc(docRef);
    console.log(`User ${userId} deleted from Firestore successfully.`);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.DELETE, `${USERS_COLLECTION}/${userId}`);
    } catch (e) {
      console.warn('Firestore user delete warning:', e);
      throw e;
    }
  }
}

// Fetch all departments from Firestore
export async function fetchDepartmentsFromDb(): Promise<Department[]> {
  const deptsRef = collection(db, DEPARTMENTS_COLLECTION);
  try {
    const snapshot = await getDocs(deptsRef);
    if (snapshot.empty) {
      console.log('Departments collection is empty. Seeding initial departments...');
      for (const d of INITIAL_DEPARTMENTS) {
        await setDoc(doc(db, DEPARTMENTS_COLLECTION, d.id), sanitizeForFirestore(d));
      }
      return INITIAL_DEPARTMENTS;
    }
    const departments: Department[] = [];
    snapshot.forEach((docSnap) => {
      departments.push(docSnap.data() as Department);
    });
    // Sort by order or name
    departments.sort((a, b) => (a.order || 99) - (b.order || 99));
    return departments;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.LIST, DEPARTMENTS_COLLECTION);
    } catch (e) {
      console.warn('Firestore departments fetch warning:', e);
    }
    return INITIAL_DEPARTMENTS;
  }
}

// Subscribe to real-time updates for departments
export function subscribeToDepartments(onUpdate: (departments: Department[]) => void, onError?: (err: any) => void) {
  const deptsRef = collection(db, DEPARTMENTS_COLLECTION);
  return onSnapshot(
    deptsRef,
    (snapshot) => {
      if (snapshot.empty) {
        fetchDepartmentsFromDb().then(onUpdate);
        return;
      }
      const departments: Department[] = [];
      snapshot.forEach((d) => {
        departments.push(d.data() as Department);
      });
      departments.sort((a, b) => (a.order || 99) - (b.order || 99));
      onUpdate(departments);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, DEPARTMENTS_COLLECTION);
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

// Save or update department in Firestore
export async function saveDepartmentToDb(department: Department): Promise<void> {
  const docRef = doc(db, DEPARTMENTS_COLLECTION, department.id);
  const sanitized = sanitizeForFirestore(department);
  try {
    await setDoc(docRef, sanitized, { merge: true });
    console.log(`Department ${department.name} (${department.id}) saved to Firestore.`);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, `${DEPARTMENTS_COLLECTION}/${department.id}`);
    } catch (e) {
      console.warn('Firestore department write warning:', e);
      throw e;
    }
  }
}

// Delete department from Firestore
export async function deleteDepartmentFromDb(departmentId: string): Promise<void> {
  const docRef = doc(db, DEPARTMENTS_COLLECTION, departmentId);
  try {
    await deleteDoc(docRef);
    console.log(`Department ${departmentId} deleted from Firestore.`);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.DELETE, `${DEPARTMENTS_COLLECTION}/${departmentId}`);
    } catch (e) {
      console.warn('Firestore department delete warning:', e);
      throw e;
    }
  }
}

