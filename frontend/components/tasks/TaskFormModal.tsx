'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { TaskForm } from './TaskForm';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onCreateTask: (input: CreateTaskInput) => Promise<boolean>;
  onUpdateTask: (id: string, input: UpdateTaskInput) => Promise<boolean>;
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

  const handleSubmit = async (data: CreateTaskInput): Promise<boolean> => {
    setIsSubmitting(true);

    let success: boolean;
    if (isEditing && task) {
      success = await onUpdateTask(task.id, data);
    } else {
      success = await onCreateTask(data);
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
