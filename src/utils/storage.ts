import { Task } from '../types';
import { INITIAL_TASKS } from '../data/initialTasks';

const STORAGE_KEY = 'ttdvth_tasks_data_v1';

export function getStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      if (localStorage.getItem('sample_data_cleared') === 'true') {
        return [];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (parsed.length === 0 && localStorage.getItem('sample_data_cleared') !== 'true') {
        return INITIAL_TASKS;
      }
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('Error reading tasks from localStorage:', error);
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error);
  }
}

export function clearStoredTasks(): Task[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem('sample_data_cleared', 'true');
    return [];
  } catch (error) {
    console.error('Error clearing tasks from localStorage:', error);
    return [];
  }
}

export function resetToInitialTasks(): Task[] {
  try {
    localStorage.removeItem('sample_data_cleared');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
    return INITIAL_TASKS;
  } catch (error) {
    console.error('Error resetting tasks:', error);
    return INITIAL_TASKS;
  }
}
