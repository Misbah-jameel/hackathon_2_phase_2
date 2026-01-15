'use client';

import { useState } from 'react';
import { useTasksWithActivity } from '@/hooks/useTasksWithActivity';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskCounters } from '@/components/tasks/TaskCounters';
import { Button } from '@/components/ui/Button';
import type { Task } from '@/types';

export default function TasksPage() {
  const {
    filteredTasks,
    filter,
    isLoading,
    error,
    counts,
    setFilter,
    toggleTaskStatus,
    removeTask,
    addTask,
    editTask,
    fetchTasks,
    trackTaskView,
  } = useTasksWithActivity();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    trackTaskView(task.id);
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-primary dark:text-white">My Tasks</h1>
          <p className="text-gray-secondary dark:text-gray-400 mt-1">
            {counts.total === 0
              ? 'No tasks yet'
              : `${counts.pending} pending, ${counts.completed} completed`}
          </p>
        </div>
        <Button onClick={handleAddTask} className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Task
        </Button>
      </div>

      {/* Task Counters */}
      <TaskCounters counts={counts} className="mb-6" />

      {/* Task Filters */}
      {counts.total > 0 && (
        <div className="mb-6">
          <TaskFilters
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={counts}
          />
        </div>
      )}

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        isLoading={isLoading}
        error={error}
        onToggle={toggleTaskStatus}
        onDelete={removeTask}
        onEdit={handleEditTask}
        onAddTask={handleAddTask}
        onRetry={fetchTasks}
      />

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        task={editingTask}
        onCreateTask={addTask}
        onUpdateTask={editTask}
      />
    </div>
  );
}
