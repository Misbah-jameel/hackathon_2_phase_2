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
    },
  });

  // Focus title field on mount
  useEffect(() => {
    setFocus('title');
  }, [setFocus]);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
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
        rows={4}
        className="text-base sm:text-sm"
        {...register('description')}
      />

      {/* Actions - Stack on mobile, inline on desktop */}
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
