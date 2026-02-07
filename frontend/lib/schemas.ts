import { z } from 'zod';

// ============ Task Schemas ============
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .transform((s) => s.trim()),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .transform((s) => s.trim())
    .optional(),
  priority: z.enum(['high', 'medium', 'low', 'none']).optional().default('none'),
  tags: z.string().optional().default(''),
  due_date: z.string().optional(),
  reminder_minutes_before: z.number().min(1).max(10080).optional().default(15),
  recurrence_pattern: z.enum(['daily', 'weekly', 'monthly', 'custom', '']).optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .transform((s) => s.trim())
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .transform((s) => s.trim())
    .nullable()
    .optional(),
  completed: z.boolean().optional(),
});

// ============ Auth Schemas ============
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .transform((s) => s.trim()),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============ Type Inference ============
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
