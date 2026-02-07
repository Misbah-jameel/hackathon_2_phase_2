'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  TaskSortBy,
  TaskSortOrder,
  TaskQueryParams,
} from '@/types';
import { generateId } from '@/lib/utils';

interface UseTasksReturn extends TasksState {
  fetchTasks: () => Promise<void>;
  addTask: (input: CreateTaskInput) => Promise<boolean>;
  editTask: (id: string, input: UpdateTaskInput) => Promise<boolean>;
  removeTask: (id: string) => Promise<boolean>;
  toggleTaskStatus: (id: string) => Promise<boolean>;
  setFilter: (filter: TaskFilter) => void;
  filteredTasks: Task[];
  counts: {
    total: number;
    pending: number;
    completed: number;
  };
  // Phase V: Search, filter, sort state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  sortBy: TaskSortBy;
  setSortBy: (sortBy: TaskSortBy) => void;
  sortOrder: TaskSortOrder;
  setSortOrder: (order: TaskSortOrder) => void;
  clearFilters: () => void;
}

const VALID_FILTERS: TaskFilter[] = ['all', 'pending', 'completed'];

function isValidFilter(value: string | null): value is TaskFilter {
  return value !== null && VALID_FILTERS.includes(value as TaskFilter);
}

export function useTasks(): UseTasksReturn {
  const { success, error: showError } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlFilter = searchParams.get('filter');
  const initialFilter: TaskFilter = isValidFilter(urlFilter) ? urlFilter : 'all';

  const [state, setState] = useState<TasksState>({
    tasks: [],
    filter: initialFilter,
    isLoading: true,
    error: null,
  });

  // Phase V: Advanced filter/sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState<TaskSortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('desc');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync filter from URL
  useEffect(() => {
    const urlFilterValue = searchParams.get('filter');
    const newFilter: TaskFilter = isValidFilter(urlFilterValue) ? urlFilterValue : 'all';
    if (newFilter !== state.filter) {
      setState((prev) => ({ ...prev, filter: newFilter }));
    }
  }, [searchParams, state.filter]);

  // Build query params
  const buildQueryParams = useCallback((): TaskQueryParams | undefined => {
    const params: TaskQueryParams = {};
    if (searchQuery) params.search = searchQuery;
    if (priorityFilter) params.priority = priorityFilter;
    if (state.filter === 'pending') params.status = 'pending';
    if (state.filter === 'completed') params.status = 'completed';
    if (sortBy !== 'created_at') params.sort_by = sortBy;
    if (sortOrder !== 'desc') params.sort_order = sortOrder;

    return Object.keys(params).length > 0 ? params : undefined;
  }, [searchQuery, priorityFilter, state.filter, sortBy, sortOrder]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const params = buildQueryParams();
    const result = await getTasks(params);

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
  }, [buildQueryParams]);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Debounced search
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      // fetchTasks will be called by the useEffect on buildQueryParams change
    }, 300);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setPriorityFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setState((prev) => ({ ...prev, filter: 'all' }));

    const params = new URLSearchParams(searchParams.toString());
    params.delete('filter');
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  // Add task with optimistic update
  const addTask = useCallback(
    async (input: CreateTaskInput): Promise<boolean> => {
      const optimisticTask: Task = {
        id: generateId(),
        title: input.title,
        description: input.description || null,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'optimistic',
        priority: input.priority || 'none',
        tags: input.tags || [],
        dueDate: input.due_date || null,
        reminderAt: null,
        recurrencePattern: input.recurrence_pattern || null,
        recurrenceEnabled: !!input.recurrence_pattern,
        parentTaskId: null,
        isOverdue: false,
      };

      setState((prev) => ({
        ...prev,
        tasks: [optimisticTask, ...prev.tasks],
      }));

      const result = await createTask(input);

      if (isApiError(result)) {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== optimisticTask.id),
        }));
        showError(result.error.message || ERROR_MESSAGES.TASK_CREATE_ERROR);
        return false;
      }

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

  // Edit task
  const editTask = useCallback(
    async (id: string, input: UpdateTaskInput): Promise<boolean> => {
      const originalTask = state.tasks.find((t) => t.id === id);
      if (!originalTask) return false;

      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id
            ? { ...t, ...input, updatedAt: new Date().toISOString() }
            : t
        ),
      }));

      const result = await updateTask(id, input);

      if (isApiError(result)) {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? originalTask : t)),
        }));
        showError(result.error.message || ERROR_MESSAGES.TASK_UPDATE_ERROR);
        return false;
      }

      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? result.data : t)),
      }));

      success(SUCCESS_MESSAGES.TASK_UPDATED);
      return true;
    },
    [state.tasks, success, showError]
  );

  // Remove task
  const removeTask = useCallback(
    async (id: string): Promise<boolean> => {
      const originalTask = state.tasks.find((t) => t.id === id);
      if (!originalTask) return false;

      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
      }));

      const result = await deleteTask(id);

      if (isApiError(result)) {
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

  // Toggle task completion
  const toggleTaskStatus = useCallback(
    async (id: string): Promise<boolean> => {
      const originalTask = state.tasks.find((t) => t.id === id);
      if (!originalTask) return false;

      const newCompleted = !originalTask.completed;

      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id
            ? { ...t, completed: newCompleted, updatedAt: new Date().toISOString() }
            : t
        ),
      }));

      const result = await toggleTask(id);

      if (isApiError(result)) {
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? originalTask : t)),
        }));
        showError(result.error.message || ERROR_MESSAGES.TASK_UPDATE_ERROR);
        return false;
      }

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

    const params = new URLSearchParams(searchParams.toString());
    if (filter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  // Filtered tasks (client-side for status filter when using mock API)
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
    searchQuery,
    setSearchQuery: handleSearchChange,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    clearFilters,
  };
}
