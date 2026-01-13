# Data Model: Frontend Todo Application

**Feature**: 002-frontend-todo-app
**Date**: 2026-01-06
**Source**: Derived from spec.md Key Entities section

## Entity Overview

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │   Notification  │
│─────────────────│       │─────────────────│
│ id              │       │ id              │
│ email           │       │ type            │
│ name            │       │ message         │
│ createdAt       │       │ duration        │
└────────┬────────┘       └─────────────────┘
         │ owns (1:N)
         ▼
┌─────────────────┐       ┌─────────────────┐
│      Task       │       │     Session     │
│─────────────────│       │─────────────────│
│ id              │       │ token           │
│ title           │       │ userId          │
│ description     │       │ expiresAt       │
│ completed       │       │ isValid         │
│ createdAt       │       └─────────────────┘
│ updatedAt       │
│ userId (FK)     │
└─────────────────┘
```

## Entity Definitions

### User

Represents an authenticated person who owns tasks.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | string (UUID) | Yes | Unique, immutable | Primary identifier |
| email | string | Yes | Valid email, unique | Login credential |
| name | string | Yes | 1-100 chars | Display name |
| createdAt | datetime | Yes | Auto-generated | Account creation timestamp |

**Frontend Usage**:
- Displayed in Header user menu
- Used for task ownership verification
- Never displayed: password, internal IDs

**State Location**: `useAuth` hook, stored in context after login

---

### Task

Represents a to-do item belonging to a user.

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| id | string (UUID) | Yes | Auto | Unique | Primary identifier |
| title | string | Yes | - | 1-200 chars | Task name |
| description | string | No | null | 0-1000 chars | Optional details |
| completed | boolean | Yes | false | - | Completion status |
| createdAt | datetime | Yes | Auto | Immutable | Creation timestamp |
| updatedAt | datetime | Yes | Auto | Auto-update | Last modification |
| userId | string (UUID) | Yes | - | FK to User | Owner reference |

**Validation Rules**:
- Title: Required, trimmed, 1-200 characters
- Description: Optional, trimmed, max 1000 characters
- Completed: Boolean only (no tri-state)

**State Transitions**:
```
[Created] → completed=false
    ↓ toggle
[Completed] → completed=true
    ↓ toggle
[Reopened] → completed=false
    ↓ delete
[Deleted] → removed from list
```

**Frontend State Location**: `useTasks` hook with optimistic updates

---

### Session

Represents authentication state (frontend perspective).

| Field | Type | Description |
|-------|------|-------------|
| token | string (JWT) | Access token for API calls |
| userId | string | Current user's ID |
| expiresAt | datetime | Token expiration time |
| isValid | boolean | Computed: not expired |

**Note**: Session is managed by Better Auth; frontend tracks minimal state.

**State Location**: Better Auth client, accessed via `useAuth` hook

---

### Notification

Represents transient feedback messages (client-only).

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | Auto (uuid) | Unique identifier |
| type | enum | Yes | 'info' | 'success' | 'error' | 'info' |
| message | string | Yes | - | Display text |
| duration | number | No | 5000 | Auto-dismiss milliseconds |

**Types**:
| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| success | Green | ✓ | Task created, updated, deleted |
| error | Red | ✕ | API failure, validation error |
| info | Blue | ℹ | General information |

**State Location**: `useToast` hook, managed in ToastProvider context

---

## TypeScript Type Definitions

```typescript
// types/index.ts

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
```

## Validation Schemas (Zod)

```typescript
// lib/schemas.ts
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .transform(s => s.trim()),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .transform(s => s.trim())
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .transform(s => s.trim())
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .transform(s => s.trim())
    .nullable()
    .optional(),
  completed: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .transform(s => s.trim()),
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

// Type inference from schemas
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
```

## State Management Summary

| Entity | Location | Persistence | Sync Strategy |
|--------|----------|-------------|---------------|
| User | AuthContext | Better Auth (cookies) | On login/logout |
| Task | useTasks hook | Backend API | Optimistic + refetch |
| Session | Better Auth | httpOnly cookie | Automatic |
| Notification | ToastContext | Memory only | N/A (ephemeral) |

## Related Documents

- [spec.md](./spec.md) - Feature specification with Key Entities section
- [contracts/types.ts](./contracts/types.ts) - TypeScript type exports
- [research.md](./research.md) - Form validation approach decision
