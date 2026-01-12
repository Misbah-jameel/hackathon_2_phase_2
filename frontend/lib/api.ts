import {
  API_BASE_URL,
  API_ENDPOINTS,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from './constants';
import {
  mockLogin,
  mockSignup,
  mockLogout,
  mockGetMe,
  mockGetTasks,
  mockGetTask,
  mockCreateTask,
  mockUpdateTask,
  mockDeleteTask,
  mockToggleTask,
  setMockCurrentUser,
} from './mock-api';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  User,
  LoginInput,
  SignupInput,
  AuthResponse,
  ApiResult,
} from '@/types';

// Enable mock mode for development without backend
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// ============ Token Management ============
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ============ Base Fetch Function ============
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const url = API_BASE_URL + endpoint;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = 'Bearer ' + accessToken;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      setAccessToken(null);
      return {
        error: {
          message: ERROR_MESSAGES.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        },
      };
    }

    if (response.status === HTTP_STATUS.NO_CONTENT) {
      return { data: null as T };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          message: data.message || data.detail || ERROR_MESSAGES.GENERIC_ERROR,
          code: data.code || 'HTTP_' + response.status,
        },
      };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return {
      error: {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
      },
    };
  }
}

// ============ Auth API ============
export async function login(input: LoginInput): Promise<ApiResult<AuthResponse>> {
  if (USE_MOCK_API) {
    const result = await mockLogin(input);
    if ('data' in result && result.data) {
      setAccessToken(result.data.token);
      setMockCurrentUser(result.data.user);
    }
    return result;
  }

  const result = await fetchApi<AuthResponse>(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if ('data' in result && result.data) {
    setAccessToken(result.data.token);
  }

  return result;
}

export async function signup(input: SignupInput): Promise<ApiResult<AuthResponse>> {
  if (USE_MOCK_API) {
    const result = await mockSignup(input);
    if ('data' in result && result.data) {
      setAccessToken(result.data.token);
      setMockCurrentUser(result.data.user);
    }
    return result;
  }

  const result = await fetchApi<AuthResponse>(API_ENDPOINTS.SIGNUP, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if ('data' in result && result.data) {
    setAccessToken(result.data.token);
  }

  return result;
}

export async function logout(): Promise<ApiResult<null>> {
  if (USE_MOCK_API) {
    setAccessToken(null);
    setMockCurrentUser(null);
    return mockLogout();
  }

  const result = await fetchApi<null>(API_ENDPOINTS.LOGOUT, {
    method: 'POST',
  });

  setAccessToken(null);
  return result;
}

export async function getMe(): Promise<ApiResult<User>> {
  if (USE_MOCK_API) {
    return mockGetMe();
  }
  return fetchApi<User>(API_ENDPOINTS.ME);
}

// ============ Tasks API ============
export async function getTasks(): Promise<ApiResult<Task[]>> {
  if (USE_MOCK_API) {
    return mockGetTasks();
  }
  return fetchApi<Task[]>(API_ENDPOINTS.TASKS);
}

export async function getTask(id: string): Promise<ApiResult<Task>> {
  if (USE_MOCK_API) {
    return mockGetTask(id);
  }
  return fetchApi<Task>(API_ENDPOINTS.TASK(id));
}

export async function createTask(input: CreateTaskInput): Promise<ApiResult<Task>> {
  if (USE_MOCK_API) {
    return mockCreateTask(input);
  }
  return fetchApi<Task>(API_ENDPOINTS.TASKS, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<ApiResult<Task>> {
  if (USE_MOCK_API) {
    return mockUpdateTask(id, input);
  }
  return fetchApi<Task>(API_ENDPOINTS.TASK(id), {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteTask(id: string): Promise<ApiResult<null>> {
  if (USE_MOCK_API) {
    return mockDeleteTask(id);
  }
  return fetchApi<null>(API_ENDPOINTS.TASK(id), {
    method: 'DELETE',
  });
}

export async function toggleTask(id: string): Promise<ApiResult<Task>> {
  if (USE_MOCK_API) {
    return mockToggleTask(id);
  }
  return fetchApi<Task>(API_ENDPOINTS.TASK_TOGGLE(id), {
    method: 'PATCH',
  });
}

// ============ Helper Functions ============
export function isApiError<T>(result: ApiResult<T>): result is { error: { message: string; code: string } } {
  return 'error' in result && result.error !== undefined;
}

export function isApiSuccess<T>(result: ApiResult<T>): result is { data: T } {
  return 'data' in result && !('error' in result && result.error !== undefined);
}
