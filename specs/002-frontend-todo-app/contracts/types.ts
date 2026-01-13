/**
 * Frontend Todo Application - Type Definitions
 * Feature: 002-frontend-todo-app
 *
 * This file contains all TypeScript type definitions for the frontend.
 * Import from this file for type-safe development.
 */

// ============================================
// USER TYPES
// ============================================

/**
 * Authenticated user profile
 */
export interface User {
  /** Unique identifier (UUID) */
  id: string;
  /** User's email address */
  email: string;
  /** Display name */
  name: string;
  /** Account creation timestamp (ISO 8601) */
  createdAt: string;
}

// ============================================
// TASK TYPES
// ============================================

/**
 * Task entity - a to-do item belonging to a user
 */
export interface Task {
  /** Unique identifier (UUID) */
  id: string;
  /** Task title (1-200 characters) */
  title: string;
  /** Optional description (0-1000 characters) */
  description: string | null;
  /** Completion status */
  completed: boolean;
  /** Creation timestamp (ISO 8601) */
  createdAt: string;
  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
  /** Owner's user ID */
  userId: string;
}

/**
 * Input for creating a new task
 */
export interface CreateTaskInput {
  /** Task title (required, 1-200 chars) */
  title: string;
  /** Optional description (max 1000 chars) */
  description?: string;
}

/**
 * Input for updating an existing task
 */
export interface UpdateTaskInput {
  /** New title (optional) */
  title?: string;
  /** New description (optional, null to clear) */
  description?: string | null;
  /** New completion status (optional) */
  completed?: boolean;
}

// ============================================
// AUTH TYPES
// ============================================

/**
 * Login credentials
 */
export interface LoginInput {
  /** User's email */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Signup registration data
 */
export interface SignupInput {
  /** Display name */
  name: string;
  /** Email address */
  email: string;
  /** Password (min 8 characters) */
  password: string;
}

/**
 * Response from successful authentication
 */
export interface AuthResponse {
  /** Authenticated user data */
  user: User;
  /** JWT access token */
  token: string;
}

/**
 * Session state (frontend perspective)
 */
export interface Session {
  /** JWT access token */
  token: string;
  /** Current user's ID */
  userId: string;
  /** Token expiration (ISO 8601) */
  expiresAt: string;
  /** Whether session is still valid */
  isValid: boolean;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

/**
 * Notification severity types
 */
export type NotificationType = 'success' | 'error' | 'info';

/**
 * Toast notification data
 */
export interface Notification {
  /** Unique identifier */
  id: string;
  /** Notification type/severity */
  type: NotificationType;
  /** Display message */
  message: string;
  /** Auto-dismiss duration in ms (default: 5000) */
  duration?: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Successful API response
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  error?: never;
}

/**
 * API error response
 */
export interface ApiError {
  data?: never;
  /** Error details */
  error: {
    /** Human-readable error message */
    message: string;
    /** Error code for programmatic handling */
    code: string;
  };
}

/**
 * Union type for API results
 */
export type ApiResult<T> = ApiResponse<T> | ApiError;

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Total count across all pages */
  total: number;
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Whether more pages exist */
  hasMore: boolean;
}

// ============================================
// UI STATE TYPES
// ============================================

/**
 * Task filter options
 */
export type TaskFilter = 'all' | 'pending' | 'completed';

/**
 * Task list state
 */
export interface TasksState {
  /** Array of tasks */
  tasks: Task[];
  /** Current filter */
  filter: TaskFilter;
  /** Loading indicator */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
}

/**
 * Auth state
 */
export interface AuthState {
  /** Current user (null if not authenticated) */
  user: User | null;
  /** Whether auth is being checked */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Input field states
 */
export type InputState = 'default' | 'error' | 'success' | 'disabled';

/**
 * Modal sizes
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Make all properties optional except specified keys
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Extract the resolved type from a Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;
