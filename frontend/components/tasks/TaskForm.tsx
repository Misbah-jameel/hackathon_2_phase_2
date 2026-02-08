'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createTaskSchema, type CreateTaskFormData } from '@/lib/schemas';
import type { Task } from '@/types';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: CreateTaskFormData) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'none',
      tags: task?.tags?.join(', ') || '',
      due_date: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
      reminder_minutes_before: 15,
      recurrence_pattern: (task?.recurrencePattern as CreateTaskFormData['recurrence_pattern']) || '',
    },
  });

  useEffect(() => {
    setFocus('title');
  }, [setFocus]);

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'none',
        tags: task.tags?.join(', ') || '',
        due_date: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
        recurrence_pattern: (task.recurrencePattern as CreateTaskFormData['recurrence_pattern']) || '',
      });
    }
  }, [task, reset]);

  const handleFormSubmit = async (data: CreateTaskFormData) => {
    const success = await onSubmit(data);
    if (success && !isEditing) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-5">
      <Input
        label="Title"
        placeholder="What needs to be done?"
        error={errors.title?.message}
        disabled={isLoading}
        className="text-base sm:text-sm"
        {...register('title')}
      />

      <Textarea
        label="Description (optional)"
        placeholder="Add some details..."
        error={errors.description?.message}
        disabled={isLoading}
        rows={3}
        className="text-base sm:text-sm"
        {...register('description')}
      />

      {/* Priority & Tags row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            id="priority"
            {...register('priority')}
            disabled={isLoading}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <Input
          label="Tags (comma separated)"
          placeholder="work, urgent, personal"
          disabled={isLoading}
          className="text-base sm:text-sm"
          {...register('tags')}
        />
      </div>

      {/* Due Date & Recurrence row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Due Date (optional)"
          type="datetime-local"
          disabled={isLoading}
          className="text-base sm:text-sm"
          {...register('due_date')}
        />

        <div>
          <label htmlFor="recurrence_pattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recurrence
          </label>
          <select
            id="recurrence_pattern"
            {...register('recurrence_pattern')}
            disabled={isLoading}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2 sm:pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px]"
        >
          {isEditing ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
