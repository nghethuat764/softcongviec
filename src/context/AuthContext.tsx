import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAccount, UserRole } from '../types/database';
import { USER_ACCOUNTS } from '../data/userAccounts';
import { 
  subscribeToUsers, 
  saveUserToDb, 
  deleteUserFromDb,
  fetchUsersFromDb 
} from '../services/firebaseDbService';

interface AuthContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  role: UserRole | null;
  isLeader: boolean;
  isStaff: boolean;
  login: (username: string, password?: string) => boolean;
  switchUser: (userId: string) => void;
  logout: () => void;
  addUser: (user: UserAccount) => Promise<void>;
  updateUser: (user: UserAccount) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  canAssignTasks: boolean;
  canSendDirectives: boolean;
  canDeleteTasks: boolean;
  canEditTaskMetadata: boolean;
  canEditTasks: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ttdvth_auth_session_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(USER_ACCOUNTS);
  // Do NOT auto-login on refresh (F5). User MUST authenticate with username and password.
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Clear any legacy persistent session to strictly require manual login on every reload / F5
  useEffect(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Subscribe to real-time users from Firestore
  useEffect(() => {
    let isMounted = true;

    // Initial fetch
    fetchUsersFromDb().then((initialUsers) => {
      if (isMounted && initialUsers && initialUsers.length > 0) {
        setUsers(initialUsers);
      }
    });

    const unsubscribe = subscribeToUsers(
      (latestUsers) => {
        if (isMounted && latestUsers && latestUsers.length > 0) {
          setUsers(latestUsers);
          // If current user info changed in DB, sync currentUser
          setCurrentUser((prev) => {
            if (!prev) return null;
            const updated = latestUsers.find((u) => u.id === prev.id);
            return updated || prev;
          });
        }
      },
      (err) => {
        console.warn('Realtime users listener error:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = (username: string, password?: string): boolean => {
    if (!username || !username.trim()) return false;
    
    const cleanUser = username.trim().toLowerCase();
    // Prioritize latest real-time users from Firestore, then combine with USER_ACCOUNTS
    const candidateMap = new Map<string, UserAccount>();
    for (const u of USER_ACCOUNTS) {
      candidateMap.set(u.id, u);
    }
    for (const u of users) {
      candidateMap.set(u.id, u);
    }
    const candidateList = Array.from(candidateMap.values());

    const user = candidateList.find(
      (u) =>
        u.username.toLowerCase() === cleanUser ||
        u.id.toLowerCase() === cleanUser ||
        u.id.replace('usr-', '').toLowerCase() === cleanUser ||
        u.fullName.toLowerCase() === cleanUser ||
        (u.shortName && u.shortName.toLowerCase() === cleanUser) ||
        (u.email && u.email.toLowerCase() === cleanUser)
    );
    if (!user) return false;

    // Validate password: must match account password in database or default '123456'
    const expectedPassword = user.password || '123456';
    const inputPassword = password ? password.trim() : '';
    if (!inputPassword || (inputPassword !== expectedPassword && password !== expectedPassword)) {
      return false;
    }

    setCurrentUser(user);
    return true;
  };

  const switchUser = (userId: string) => {
    const candidateMap = new Map<string, UserAccount>();
    for (const u of USER_ACCOUNTS) {
      candidateMap.set(u.id, u);
    }
    for (const u of users) {
      candidateMap.set(u.id, u);
    }
    const candidateList = Array.from(candidateMap.values());
    const user = candidateList.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove auth key:', e);
    }
    setCurrentUser(null);
  };

  // Add new user to Firestore
  const addUser = async (newUser: UserAccount) => {
    // Optimistic update
    setUsers((prev) => [...prev.filter((u) => u.id !== newUser.id), newUser]);
    // Save to Firestore
    await saveUserToDb(newUser);
  };

  // Update existing user in Firestore
  const updateUser = async (updatedUser: UserAccount) => {
    // Optimistic update
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    // Save to Firestore
    await saveUserToDb(updatedUser);
  };

  // Delete user from Firestore
  const deleteUser = async (userId: string) => {
    // Optimistic update
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      logout();
    }
    // Delete from Firestore
    await deleteUserFromDb(userId);
  };

  const role = currentUser ? currentUser.role : null;
  const isLeader = role === 'LEADER';
  const isStaff = role === 'STAFF';

  // Role permissions
  const canAssignTasks = isLeader;
  const canSendDirectives = isLeader;
  const canDeleteTasks = isLeader;
  const canEditTaskMetadata = isLeader;
  const canEditTasks = isLeader;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        role,
        isLeader,
        isStaff,
        login,
        switchUser,
        logout,
        addUser,
        updateUser,
        deleteUser,
        canAssignTasks,
        canSendDirectives,
        canDeleteTasks,
        canEditTaskMetadata,
        canEditTasks,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
