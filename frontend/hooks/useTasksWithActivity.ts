'use client';

import { useCallback } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTaskActivity } from '@/components/providers/TaskActivityProvider';
import type { CreateTaskInput, UpdateTaskInput } from '@/types';

/**
 * Extended useTasks hook that includes activity tracking
 */
export function useTasksWithActivity() {
  const tasksHook = useTasks();
  const { addActivity } = useTaskActivity();

  // Wrap addTask to track creation
  const addTask = useCallback(
    async (input: CreateTaskInput): Promise<boolean> => {
      const result = await tasksHook.addTask(input);
      if (result) {
        addActivity('new-task', input.title, 'created');
      }
      return result;
    },
    [tasksHook, addActivity]
  );

  // Wrap editTask to track edits
  const editTask = useCallback(
    async (id: string, input: UpdateTaskInput): Promise<boolean> => {
      const task = tasksHook.tasks.find((t) => t.id === id);
      const result = await tasksHook.editTask(id, input);
      if (result && task) {
        addActivity(id, task.title, 'edited', `Updated: ${Object.keys(input).join(', ')}`);
      }
      return result;
    },
    [tasksHook, addActivity]
  );

  // Wrap removeTask to track deletion
  const removeTask = useCallback(
    async (id: string): Promise<boolean> => {
      const task = tasksHook.tasks.find((t) => t.id === id);
      const result = await tasksHook.removeTask(id);
      if (result && task) {
        addActivity(id, task.title, 'deleted');
      }
      return result;
    },
    [tasksHook, addActivity]
  );

  // Wrap toggleTaskStatus to track completion/reopening
  const toggleTaskStatus = useCallback(
    async (id: string): Promise<boolean> => {
      const task = tasksHook.tasks.find((t) => t.id === id);
      const result = await tasksHook.toggleTaskStatus(id);
      if (result && task) {
        const newType = task.completed ? 'reopened' : 'completed';
        addActivity(id, task.title, newType);
      }
      return result;
    },
    [tasksHook, addActivity]
  );

  // Function to track when a task is viewed
  const trackTaskView = useCallback(
    (id: string) => {
      const task = tasksHook.tasks.find((t) => t.id === id);
      if (task) {
        addActivity(id, task.title, 'viewed');
      }
    },
    [tasksHook.tasks, addActivity]
  );

  return {
    ...tasksHook,
    addTask,
    editTask,
    removeTask,
    toggleTaskStatus,
    trackTaskView,
  };
}
