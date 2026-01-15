'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { generateId } from '@/lib/utils';
import type { TaskActivity, TaskActivityType } from '@/types';

const STORAGE_KEY = 'todo-app-task-activities';
const MAX_ACTIVITIES = 100;

interface TaskActivityContextValue {
  activities: TaskActivity[];
  addActivity: (
    taskId: string,
    taskTitle: string,
    type: TaskActivityType,
    details?: string
  ) => void;
  clearActivities: () => void;
  getActivitiesByType: (type: TaskActivityType) => TaskActivity[];
  getActivityCounts: () => Record<TaskActivityType, number>;
}

const TaskActivityContext = createContext<TaskActivityContextValue | null>(null);

interface TaskActivityProviderProps {
  children: ReactNode;
}

export function TaskActivityProvider({ children }: TaskActivityProviderProps) {
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load activities from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setActivities(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
    setIsHydrated(true);
  }, []);

  // Persist activities to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
      } catch {
        // Ignore storage errors
      }
    }
  }, [activities, isHydrated]);

  const addActivity = useCallback(
    (
      taskId: string,
      taskTitle: string,
      type: TaskActivityType,
      details?: string
    ) => {
      const newActivity: TaskActivity = {
        id: generateId(),
        taskId,
        taskTitle,
        type,
        timestamp: new Date().toISOString(),
        details,
      };

      setActivities((prev) => {
        const updated = [newActivity, ...prev];
        // Keep only the most recent activities
        return updated.slice(0, MAX_ACTIVITIES);
      });
    },
    []
  );

  const clearActivities = useCallback(() => {
    setActivities([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const getActivitiesByType = useCallback(
    (type: TaskActivityType) => {
      return activities.filter((a) => a.type === type);
    },
    [activities]
  );

  const getActivityCounts = useCallback(() => {
    const counts: Record<TaskActivityType, number> = {
      created: 0,
      viewed: 0,
      edited: 0,
      deleted: 0,
      completed: 0,
      reopened: 0,
    };

    activities.forEach((activity) => {
      counts[activity.type]++;
    });

    return counts;
  }, [activities]);

  const contextValue: TaskActivityContextValue = {
    activities,
    addActivity,
    clearActivities,
    getActivitiesByType,
    getActivityCounts,
  };

  return (
    <TaskActivityContext.Provider value={contextValue}>
      {children}
    </TaskActivityContext.Provider>
  );
}

export function useTaskActivity() {
  const context = useContext(TaskActivityContext);

  if (!context) {
    throw new Error('useTaskActivity must be used within a TaskActivityProvider');
  }

  return context;
}
