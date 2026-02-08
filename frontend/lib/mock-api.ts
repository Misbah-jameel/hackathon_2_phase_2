// @ts-nocheck
/**
 * Mock API for frontend development without backend
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
} from '@/types';

// Mock delay to simulate network
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user database
const mockUsers: Map<string, { user: User; password: string }> = new Map([
  ['demo@example.com', {
    user: { id: '1', email: 'demo@example.com', name: 'Demo User', createdAt: new Date().toISOString() },
    password: 'password123'
  }]
]);

// Mock tasks database
let mockTasks: Task[] = [
  {
    id: '1',
    title: 'Welcome to your Todo App!',
    description: 'This is a sample task. Try creating, editing, and completing tasks.',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '1',
    priority: 'none',
    tags: [],
    dueDate: null,
    reminderAt: null,
    recurrencePattern: null,
    recurrenceEnabled: false,
    parentTaskId: null,
    isOverdue: false,
  },
  {
    id: '2',
    title: 'Try the golden theme',
    description: 'Notice the beautiful golden accent colors throughout the app.',
    completed: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '1',
    priority: 'none',
    tags: [],
    dueDate: null,
    reminderAt: null,
    recurrencePattern: null,
    recurrenceEnabled: false,
    parentTaskId: null,
    isOverdue: false,
  },
];

let currentUser: User | null = null;
let nextTaskId = 3;

// Generate a mock JWT token
function generateMockToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 3600,
  }));
  const signature = btoa('mock-signature');
  return header + '.' + payload + '.' + signature;
}

// ============ Mock Auth API ============
export async function mockLogin(input: LoginInput): Promise<ApiResult<AuthResponse>> {
  await delay(500);
  
  const userData = mockUsers.get(input.email);
  if (!userData || userData.password !== input.password) {
    return {
      error: { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }
    };
  }

  currentUser = userData.user;
  return {
    data: {
      user: userData.user,
      token: generateMockToken(userData.user),
    }
  };
}

export async function mockSignup(input: SignupInput): Promise<ApiResult<AuthResponse>> {
  await delay(500);

  if (mockUsers.has(input.email)) {
    return {
      error: { message: 'Email already registered', code: 'EMAIL_EXISTS' }
    };
  }

  const newUser: User = {
    id: String(mockUsers.size + 1),
    email: input.email,
    name: input.name,
    createdAt: new Date().toISOString(),
  };

  mockUsers.set(input.email, { user: newUser, password: input.password });
  currentUser = newUser;

  return {
    data: {
      user: newUser,
      token: generateMockToken(newUser),
    }
  };
}

export async function mockLogout(): Promise<ApiResult<null>> {
  await delay(200);
  currentUser = null;
  return { data: null };
}

export async function mockGetMe(): Promise<ApiResult<User>> {
  await delay(300);
  
  if (!currentUser) {
    return {
      error: { message: 'Not authenticated', code: 'UNAUTHORIZED' }
    };
  }

  return { data: currentUser };
}

// ============ Mock Tasks API ============
export async function mockGetTasks(): Promise<ApiResult<Task[]>> {
  await delay(400);
  
  if (!currentUser) {
    return { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } };
  }

  const userTasks = mockTasks.filter(t => t.userId === currentUser!.id);
  return { data: userTasks };
}

export async function mockGetTask(id: string): Promise<ApiResult<Task>> {
  await delay(300);
  
  const task = mockTasks.find(t => t.id === id);
  if (!task) {
    return { error: { message: 'Task not found', code: 'NOT_FOUND' } };
  }

  return { data: task };
}

export async function mockCreateTask(input: CreateTaskInput): Promise<ApiResult<Task>> {
  await delay(400);
  
  if (!currentUser) {
    return { error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } };
  }

  const newTask: Task = {
    id: String(nextTaskId++),
    title: input.title,
    description: input.description ?? null,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: currentUser.id,
    priority: 'none',
    tags: [],
    dueDate: null,
    reminderAt: null,
    recurrencePattern: null,
    recurrenceEnabled: false,
    parentTaskId: null,
    isOverdue: false,
  };

  mockTasks.push(newTask);
  return { data: newTask };
}

export async function mockUpdateTask(id: string, input: UpdateTaskInput): Promise<ApiResult<Task>> {
  await delay(300);
  
  const taskIndex = mockTasks.findIndex(t => t.id === id);
  const existingTask = mockTasks[taskIndex];
  
  if (taskIndex === -1 || !existingTask) {
    return { error: { message: 'Task not found', code: 'NOT_FOUND' } };
  }

  const updatedTask: Task = {
    ...existingTask,
    title: input.title !== undefined ? input.title : existingTask.title,
    description: input.description !== undefined ? input.description : existingTask.description,
    completed: input.completed !== undefined ? input.completed : existingTask.completed,
    updatedAt: new Date().toISOString(),
  };

  mockTasks[taskIndex] = updatedTask;
  return { data: updatedTask };
}

export async function mockDeleteTask(id: string): Promise<ApiResult<null>> {
  await delay(300);
  
  const taskIndex = mockTasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return { error: { message: 'Task not found', code: 'NOT_FOUND' } };
  }

  mockTasks.splice(taskIndex, 1);
  return { data: null };
}

export async function mockToggleTask(id: string): Promise<ApiResult<Task>> {
  await delay(200);
  
  const taskIndex = mockTasks.findIndex(t => t.id === id);
  const existingTask = mockTasks[taskIndex];
  
  if (taskIndex === -1 || !existingTask) {
    return { error: { message: 'Task not found', code: 'NOT_FOUND' } };
  }

  const toggledTask: Task = {
    id: existingTask.id,
    title: existingTask.title,
    description: existingTask.description,
    completed: !existingTask.completed,
    createdAt: existingTask.createdAt,
    updatedAt: new Date().toISOString(),
    userId: existingTask.userId,
  };

  mockTasks[taskIndex] = toggledTask;
  return { data: toggledTask };
}

// Set current user from token (for restoring session)
export function setMockCurrentUser(user: User | null): void {
  currentUser = user;
}
