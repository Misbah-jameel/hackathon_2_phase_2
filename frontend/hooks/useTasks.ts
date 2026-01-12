'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  isApiError,
} from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from '@/lib/constants';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilter,
  TasksState,
} from '@/types';
import { generateId } from '@/lib/utils';

interface UseTasksReturn extends TasksState {
  /** Fetch all tasks */
  fetchTasks: () => Promise<void>;
  /** Create a new task */
  addTask: (input: CreateTaskInput) => Promise<boolean>;
  /** Update an existing task */
  editTask: (id: string, input: UpdateTaskInput) => Promise<boolean>;
  /** Delete a task */
  removeTask: (id: string) => Promise<boolean>;
  /** Toggle task completion status */
  toggleTaskStatus: (id: string) => Promise<boolean>;
  /** Set the current filter */
  setFilter: (filter: TaskFilter) => void;
  /** Get filtered tasks */
  filteredTasks: Task[];
  /** Task counts */
  counts: {
    total: number;
    pending: number;
    completed: number;
  };
}

// Valid filter values
const VALID_FILTERS: TaskFilter[] = ['all', 'pending', 'completed'];

function isValidFilter(value: string | null): value is TaskFilter {
  return value !== null && VALID_FILTERS.includes(value as TaskFilter);
}

export function useTasks(): UseTasksReturn {
  const { success, error: showError } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get initial filter from URL or default to 'all'
  const urlFilter = searchParams.get('filter');
  const initialFilter: TaskFilter = isValidFilter(urlFilter) ? urlFilter : 'all';

  const [state, setState] = useState<TasksState>({
    tasks: [],
    filter: initialFilter,
    isLoading: true,
    error: null,
  });

  // Sync filter from URL when it changes externally (browser back/forward)
  useEffect(() => {
    const urlFilterValue = searchParams.get('filter');
    const newFilter: TaskFilter = isValidFilter(urlFilterValue) ? urlFilterValue : 'all';
    if (newFilter !== state.filter) {
      setState((prev) => ({ ...prev, filter: newFilter }));
    }
  }, [searchParams, state.filter]);

  // Fetch tasks on mount
  const fetchTasks = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const result = await getTasks();

    if (isApiError(result)) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.error.message,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      tasks: result.data,
      isLoading: false,
      error: null,
    }));
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Add task with optimistic update
  const addTask = useCallback(
    async (input: CreateTaskInput): Promise<boolean> => {
      // Create optimistic task
      const optimisticTask: Task = {
        id: generateId(),
        title: input.title,
        description: input.description || null,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'optimistic',
      };

      // Optimistically add to state
      setState((prev) => ({
        ...prev,
        tasks: [optimisticTask, ...prev.tasks],
      }));

      const result = await createTask(input);

      if (isApiError(result)) {
        // Revert optimistic update
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== optimisticTask.id),
        }));
        showError(result.error.message || ERROR_MESSAGES.TASK_CREATE_ERROR);
        return false;
      }

      // Replace optimistic task with real task
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === optimisticTask.id ? result.data : t
        ),
      }));

      success(SUCCESS_MESSAGES.TASK_CREATED);
      return true;
    },
    [success, showError]
  );

  // Edit task with optimistic update
  const editTask = useCallback(
    async (id: string, input: UpdateTaskInput): Promise<boolean> => {
      // Store original task for rollback
      const originalTask = state.tasks.find((t) => t.id === id);
      if (!originalTask) return false;

      // Optimistically update
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                ...input,
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      }));

      const result = await updateTask(id, input);

      if (isApiError(result)) {
        // Revert optimistic update
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? originalTask : t)),
        }));
        showError(result.error.message || ERROR_MESSAGES.TASK_UPDATE_ERROR);
        return false;
      }

      // Update with server response
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? result.data : t)),
      }));

      success(SUCCESS_MESSAGES.TASK_UPDATED);
      return true;
    },
    [state.tasks, success, showError]
  );

  // Remove task with optimistic update
  const removeTask = useCallback(
    async (id: string): Promise<boolean> => {
      // Store original task for rollback
      const originalTask = state.tasks.find((t) => t.id === id);
      if (!originalTask) return false;

      // Optimistically remove
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
      }));

      const result = await deleteTask(id);

      if (isApiError(result)) {
        // Revert optimistic update
        setState((prev) => ({
          ...prev,
          tasks: [...prev.tasks, originalTask].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
        }));
        showError(result.error.message || ERROR_MESSAGES.TASK_DELETE_ERROR);
        return false;
      }

      success(SUCCESS_MESSAGES.TASK_DELETED);
      return true;
    },
    [state.tasks, success, showError]
  );

  // Toggle task completion with optimistic update
  const toggleTaskStatus = useCallback(
    async (id: string): Promise<boolean> => {
      // Store original task for rollback
      const originalTask = state.tasks.find((t) => t.id === id);
      if (!originalTask) return false;

      const newCompleted = !originalTask.completed;

      // Optimistically toggle
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                completed: newCompleted,
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      }));

      const result = await toggleTask(id);

      if (isApiError(result)) {
        // Revert optimistic update
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? originalTask : t)),
        }));
        showError(result.error.message || ERROR_MESSAGES.TASK_UPDATE_ERROR);
        return false;
      }

      // Update with server response
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? result.data : t)),
      }));

      success(
        newCompleted
          ? SUCCESS_MESSAGES.TASK_COMPLETED
          : SUCCESS_MESSAGES.TASK_REOPENED
      );
      return true;
    },
    [state.tasks, success, showError]
  );

  // Set filter with URL persistence
  const setFilter = useCallback((filter: TaskFilter) => {
    setState((prev) => ({ ...prev, filter }));

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    if (filter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  // Get filtered tasks
  const filteredTasks = state.tasks.filter((task) => {
    switch (state.filter) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  // Calculate counts
  const counts = {
    total: state.tasks.length,
    pending: state.tasks.filter((t) => !t.completed).length,
    completed: state.tasks.filter((t) => t.completed).length,
  };

  return {
    ...state,
    fetchTasks,
    addTask,
    editTask,
    removeTask,
    toggleTaskStatus,
    setFilter,
    filteredTasks,
    counts,
  };
}
