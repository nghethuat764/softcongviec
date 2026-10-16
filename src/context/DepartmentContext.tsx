import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Department } from '../types/database';
import { INITIAL_DEPARTMENTS } from '../data/departments';
import { 
  fetchDepartmentsFromDb, 
  subscribeToDepartments, 
  saveDepartmentToDb, 
  deleteDepartmentFromDb 
} from '../services/firebaseDbService';
import { useAuth } from './AuthContext';

interface DepartmentContextType {
  departments: Department[];
  loading: boolean;
  addDepartment: (dept: Department) => Promise<void>;
  updateDepartment: (dept: Department) => Promise<void>;
  deleteDepartment: (deptId: string) => Promise<void>;
  getDepartmentById: (id: string) => Department | undefined;
  getStaffCountForDepartment: (deptName: string, deptCode?: string) => number;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [loading, setLoading] = useState<boolean>(true);
  const { users } = useAuth();

  // Load and subscribe to real-time departments from Firestore
  useEffect(() => {
    let isMounted = true;

    fetchDepartmentsFromDb()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setDepartments(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Initial department fetch error:', err);
        setLoading(false);
      });

    const unsubscribe = subscribeToDepartments(
      (liveDepts) => {
        if (isMounted && liveDepts && liveDepts.length > 0) {
          setDepartments(liveDepts);
          setLoading(false);
        }
      },
      (err) => {
        console.warn('Real-time departments subscription error:', err);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const addDepartment = async (newDept: Department) => {
    // Optimistic update
    setDepartments((prev) => {
      const next = [...prev.filter((d) => d.id !== newDept.id), newDept];
      return next.sort((a, b) => (a.order || 99) - (b.order || 99));
    });
    // Persist to Cloud Firestore
    await saveDepartmentToDb(newDept);
  };

  const updateDepartment = async (updatedDept: Department) => {
    // Optimistic update
    setDepartments((prev) => {
      const next = prev.map((d) => (d.id === updatedDept.id ? updatedDept : d));
      return next.sort((a, b) => (a.order || 99) - (b.order || 99));
    });
    // Persist to Cloud Firestore
    await saveDepartmentToDb(updatedDept);
  };

  const deleteDepartment = async (deptId: string) => {
    // Optimistic update
    setDepartments((prev) => prev.filter((d) => d.id !== deptId));
    // Remove from Cloud Firestore
    await deleteDepartmentFromDb(deptId);
  };

  const getDepartmentById = (id: string) => {
    return departments.find((d) => d.id === id);
  };

  // Calculate actual staff count assigned to this department
  const getStaffCountForDepartment = (deptName: string, deptCode?: string): number => {
    if (!users || users.length === 0) return 0;
    const cleanName = deptName.toLowerCase().trim();
    const cleanCode = (deptCode || '').toLowerCase().trim();

    return users.filter((u) => {
      const unit = (u.unit || '').toLowerCase().trim();
      return (
        unit === cleanName ||
        (cleanCode && unit.includes(cleanCode)) ||
        cleanName.includes(unit) ||
        unit.includes(cleanName)
      );
    }).length;
  };

  return (
    <DepartmentContext.Provider
      value={{
        departments,
        loading,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        getDepartmentById,
        getStaffCountForDepartment,
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartments = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartments must be used within a DepartmentProvider');
  }
  return context;
};
