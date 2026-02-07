'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { TaskForm } from './TaskForm';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types';
import type { CreateTaskFormData } from '@/lib/schemas';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onCreateTask: (input: CreateTaskInput) => Promise<boolean>;
  onUpdateTask: (id: string, input: UpdateTaskInput) => Promise<boolean>;
}

function formDataToInput(data: CreateTaskFormData): CreateTaskInput {
  const input: CreateTaskInput = {
    title: data.title,
    description: data.description,
  };

  if (data.priority && data.priority !== 'none') {
    input.priority = data.priority;
  }

  if (data.tags) {
    const tagsArray = data.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (tagsArray.length > 0) {
      input.tags = tagsArray;
    }
  }

  if (data.due_date) {
    input.due_date = new Date(data.due_date).toISOString();
  }

  if (data.reminder_minutes_before && data.reminder_minutes_before !== 15) {
    input.reminder_minutes_before = data.reminder_minutes_before;
  }

  if (data.recurrence_pattern && data.recurrence_pattern !== '') {
    input.recurrence_pattern = data.recurrence_pattern;
  }

  return input;
}

export function TaskFormModal({
  isOpen,
  onClose,
  task,
  onCreateTask,
  onUpdateTask,
}: TaskFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!task;

  const handleSubmit = async (data: CreateTaskFormData): Promise<boolean> => {
    setIsSubmitting(true);

    const input = formDataToInput(data);

    let success: boolean;
    if (isEditing && task) {
      success = await onUpdateTask(task.id, input as UpdateTaskInput);
    } else {
      success = await onCreateTask(input);
    }

    setIsSubmitting(false);

    if (success) {
      onClose();
    }

    return success;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      size="md"
    >
      <TaskForm
        task={task}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isSubmitting}
      />
    </Modal>
  );
}
