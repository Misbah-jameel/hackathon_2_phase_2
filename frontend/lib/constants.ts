// ============ API Configuration ============
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============ API Endpoints ============
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  REFRESH: '/api/auth/refresh',

  // Tasks
  TASKS: '/api/tasks',
  TASK: (id: string) => `/api/tasks/${id}`,
  TASK_TOGGLE: (id: string) => `/api/tasks/${id}/toggle`,
} as const;

// ============ Routes ============
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Protected
  DASHBOARD: '/tasks',
  TASKS: '/tasks',
} as const;

// ============ UI Constants ============
export const TOAST_DURATION = {
  SHORT: 3000,
  DEFAULT: 5000,
  LONG: 8000,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
} as const;

// ============ Validation Constants ============
export const VALIDATION = {
  TASK_TITLE_MAX: 200,
  TASK_DESCRIPTION_MAX: 1000,
  USER_NAME_MAX: 100,
  PASSWORD_MIN: 8,
} as const;

// ============ Pagination ============
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ============ Storage Keys ============
export const STORAGE_KEYS = {
  THEME: 'todo-app-theme',
  TASK_FILTER: 'todo-app-task-filter',
} as const;

// ============ HTTP Status Codes ============
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ============ Error Messages ============
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to server. Please check your internet connection.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  TASK_CREATE_ERROR: 'Failed to create task. Please try again.',
  TASK_UPDATE_ERROR: 'Failed to update task. Please try again.',
  TASK_DELETE_ERROR: 'Failed to delete task. Please try again.',
  LOGIN_ERROR: 'Invalid email or password.',
  SIGNUP_ERROR: 'Failed to create account. Please try again.',
} as const;

// ============ Success Messages ============
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  TASK_COMPLETED: 'Task marked as complete',
  TASK_REOPENED: 'Task marked as pending',
  LOGGED_IN: 'Welcome back!',
  SIGNED_UP: 'Account created successfully',
  LOGGED_OUT: 'You have been logged out',
} as const;
