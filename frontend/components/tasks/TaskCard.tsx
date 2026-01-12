'use client';

import { useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onEdit?: (task: Task) => void;
}

export function TaskCard({ task, onToggle, onDelete, onEdit }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    await onToggle(task.id);
    setIsToggling(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    await onDelete(task.id);
    setShowDeleteConfirm(false);
    setIsDeleting(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          variant="interactive"
          padding="none"
          className={cn(
            'group relative overflow-hidden',
            task.completed && 'bg-gray-50'
          )}
        >
          <div className="p-4">
            <div className="flex items-start gap-4">
              {/* Checkbox - 44px touch target */}
              <Checkbox.Root
                checked={task.completed}
                onCheckedChange={handleToggle}
                disabled={isToggling}
                className={cn(
                  'flex-shrink-0 w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  // Ensure 44px touch target on mobile
                  'relative before:absolute before:inset-[-8px] before:content-[""]',
                  task.completed
                    ? 'bg-primary border-primary'
                    : 'border-gray-border hover:border-primary'
                )}
                aria-label={
                  task.completed ? 'Mark as incomplete' : 'Mark as complete'
                }
              >
                <Checkbox.Indicator className="flex items-center justify-center">
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                    aria-hidden="true"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </motion.svg>
                </Checkbox.Indicator>
              </Checkbox.Root>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    'font-medium text-gray-primary transition-all duration-200',
                    task.completed && 'line-through text-gray-secondary'
                  )}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p
                    className={cn(
                      'mt-1 text-sm text-gray-secondary line-clamp-2',
                      task.completed && 'line-through'
                    )}
                  >
                    {task.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-secondary/70">
                  {formatRelativeTime(task.updatedAt)}
                </p>
              </div>

              {/* Actions - Always visible on mobile, hover on desktop */}
              <div className={cn(
                'flex items-center gap-1 sm:gap-2 transition-opacity duration-200',
                // Always visible on mobile (touch devices), hover on desktop
                'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
              )}>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(task)}
                    className="min-w-[44px] min-h-[44px] p-2 sm:p-2"
                    aria-label="Edit task"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="min-w-[44px] min-h-[44px] p-2 sm:p-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                  aria-label="Delete task"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Completion indicator bar */}
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary origin-left"
              />
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
