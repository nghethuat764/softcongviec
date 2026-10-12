import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAccount, UserRole } from '../types/database';
import { USER_ACCOUNTS } from '../data/userAccounts';

interface AuthContextType {
  currentUser: UserAccount | null;
  role: UserRole | null;
  isLeader: boolean;
  isStaff: boolean;
  login: (username: string, password?: string) => boolean;
  switchUser: (userId: string) => void;
  logout: () => void;
  canAssignTasks: boolean;
  canSendDirectives: boolean;
  canDeleteTasks: boolean;
  canEditTaskMetadata: boolean;
  canEditTasks: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ttdvth_auth_session_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const matched = USER_ACCOUNTS.find((u) => u.id === parsed.id);
        if (matched) return matched;
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }
    // Default to leader account (Phạm Thanh Phong) to enter main dashboard directly
    return USER_ACCOUNTS[0];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = (username: string, password?: string): boolean => {
    if (!username.trim()) return false;
    
    const user = USER_ACCOUNTS.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() || u.id === username.trim()
    );
    if (!user) return false;

    // Validate password: must match account password or standard '123456'
    const expectedPassword = user.password || '123456';
    if (!password || password.trim() !== expectedPassword) {
      return false;
    }

    setCurrentUser(user);
    return true;
  };

  const switchUser = (userId: string) => {
    const user = USER_ACCOUNTS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(USER_ACCOUNTS[0]);
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
        role,
        isLeader,
        isStaff,
        login,
        switchUser,
        logout,
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
