// ============ User ============
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string; // ISO 8601
}

// ============ Task ============
export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  userId: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

// ============ Auth ============
export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============ Session ============
export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
  isValid: boolean;
}

// ============ Notification ============
export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

// ============ API Responses ============
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: {
    message: string;
    code: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// ============ UI State ============
export type TaskFilter = 'all' | 'pending' | 'completed';

export interface TasksState {
  tasks: Task[];
  filter: TaskFilter;
  isLoading: boolean;
  error: string | null;
}

// ============ Auth State ============
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============ Component Props ============
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

// ============ Task Activity ============
export type TaskActivityType = 'created' | 'viewed' | 'edited' | 'deleted' | 'completed' | 'reopened';

export interface TaskActivity {
  id: string;
  taskId: string;
  taskTitle: string;
  type: TaskActivityType;
  timestamp: string; // ISO 8601
  details?: string;
}

// ============ Chatbot ============
export interface ChatbotMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface ChatbotRequest {
  message: string;
}

export interface ChatbotResponse {
  message: string;
  intent: string;
  success: boolean;
  data?: unknown;
  suggestions: string[];
}
