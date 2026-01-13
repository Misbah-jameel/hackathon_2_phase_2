/**
 * Frontend Todo Application - API Client Interface
 * Feature: 002-frontend-todo-app
 *
 * This file defines the API client interface and implementation skeleton.
 * All backend communication goes through this module.
 */

import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  User,
  LoginInput,
  SignupInput,
  AuthResponse,
  ApiResult,
  PaginatedResponse,
} from './types';

// ============================================
// CONFIGURATION
// ============================================

/**
 * API client configuration
 */
export interface ApiConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** Function to get current auth token */
  getToken: () => string | null;
  /** Function called on 401 responses */
  onUnauthorized?: () => void;
}

// ============================================
// API CLIENT INTERFACE
// ============================================

/**
 * API client interface defining all available endpoints
 */
export interface IApiClient {
  // ---- Tasks ----

  /**
   * Get all tasks for current user
   * @endpoint GET /api/tasks
   * @auth Required
   */
  getTasks(): Promise<ApiResult<Task[]>>;

  /**
   * Get a single task by ID
   * @endpoint GET /api/tasks/:id
   * @auth Required
   */
  getTask(id: string): Promise<ApiResult<Task>>;

  /**
   * Create a new task
   * @endpoint POST /api/tasks
   * @auth Required
   */
  createTask(input: CreateTaskInput): Promise<ApiResult<Task>>;

  /**
   * Update an existing task
   * @endpoint PATCH /api/tasks/:id
   * @auth Required
   */
  updateTask(id: string, input: UpdateTaskInput): Promise<ApiResult<Task>>;

  /**
   * Delete a task
   * @endpoint DELETE /api/tasks/:id
   * @auth Required
   */
  deleteTask(id: string): Promise<ApiResult<void>>;

  /**
   * Toggle task completion status
   * @endpoint PATCH /api/tasks/:id/toggle
   * @auth Required
   */
  toggleTask(id: string): Promise<ApiResult<Task>>;

  // ---- Auth ----

  /**
   * Login with email/password
   * @endpoint POST /api/auth/login
   * @auth Not required
   */
  login(input: LoginInput): Promise<ApiResult<AuthResponse>>;

  /**
   * Register new account
   * @endpoint POST /api/auth/signup
   * @auth Not required
   */
  signup(input: SignupInput): Promise<ApiResult<AuthResponse>>;

  /**
   * Logout current session
   * @endpoint POST /api/auth/logout
   * @auth Required
   */
  logout(): Promise<ApiResult<void>>;

  /**
   * Get current user profile
   * @endpoint GET /api/auth/me
   * @auth Required
   */
  getMe(): Promise<ApiResult<User>>;
}

// ============================================
// API CLIENT IMPLEMENTATION
// ============================================

/**
 * Creates an API client instance
 */
export function createApiClient(config: ApiConfig): IApiClient {
  const { baseUrl, getToken, onUnauthorized } = config;

  /**
   * Make an authenticated request
   */
  async function request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<ApiResult<T>> {
    const url = `${baseUrl}${path}`;
    const token = getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Include cookies for Better Auth
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        onUnauthorized?.();
        return {
          error: {
            message: 'Please log in to continue',
            code: 'UNAUTHORIZED',
          },
        };
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: {
            message: errorData.detail || 'An error occurred',
            code: errorData.code || 'UNKNOWN_ERROR',
          },
        };
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: undefined as T };
      }

      // Parse successful response
      const data = await response.json();
      return { data };
    } catch (error) {
      // Network or parsing errors
      return {
        error: {
          message: 'Unable to connect to server',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  return {
    // ---- Tasks ----
    getTasks: () => request<Task[]>('GET', '/api/tasks'),

    getTask: (id) => request<Task>('GET', `/api/tasks/${id}`),

    createTask: (input) => request<Task>('POST', '/api/tasks', input),

    updateTask: (id, input) => request<Task>('PATCH', `/api/tasks/${id}`, input),

    deleteTask: (id) => request<void>('DELETE', `/api/tasks/${id}`),

    toggleTask: (id) => request<Task>('PATCH', `/api/tasks/${id}/toggle`),

    // ---- Auth ----
    login: (input) => request<AuthResponse>('POST', '/api/auth/login', input),

    signup: (input) => request<AuthResponse>('POST', '/api/auth/signup', input),

    logout: () => request<void>('POST', '/api/auth/logout'),

    getMe: () => request<User>('GET', '/api/auth/me'),
  };
}

// ============================================
// API ENDPOINTS REFERENCE
// ============================================

/**
 * API Endpoints Summary
 *
 * TASKS (all require JWT auth):
 * | Method | Endpoint              | Request Body      | Response      |
 * |--------|-----------------------|-------------------|---------------|
 * | GET    | /api/tasks            | -                 | Task[]        |
 * | GET    | /api/tasks/:id        | -                 | Task          |
 * | POST   | /api/tasks            | CreateTaskInput   | Task          |
 * | PATCH  | /api/tasks/:id        | UpdateTaskInput   | Task          |
 * | DELETE | /api/tasks/:id        | -                 | 204 No Content|
 * | PATCH  | /api/tasks/:id/toggle | -                 | Task          |
 *
 * AUTH:
 * | Method | Endpoint              | Request Body      | Response      | Auth    |
 * |--------|-----------------------|-------------------|---------------|---------|
 * | POST   | /api/auth/login       | LoginInput        | AuthResponse  | No      |
 * | POST   | /api/auth/signup      | SignupInput       | AuthResponse  | No      |
 * | POST   | /api/auth/logout      | -                 | 204 No Content| JWT     |
 * | GET    | /api/auth/me          | -                 | User          | JWT     |
 *
 * ERROR RESPONSES:
 * {
 *   "detail": "Human-readable error message",
 *   "code": "ERROR_CODE"
 * }
 *
 * Common error codes:
 * - UNAUTHORIZED: Missing or invalid JWT token
 * - NOT_FOUND: Resource does not exist
 * - VALIDATION_ERROR: Invalid request body
 * - FORBIDDEN: Access denied to resource
 */

// ============================================
// DEFAULT EXPORT
// ============================================

export type { ApiConfig };
