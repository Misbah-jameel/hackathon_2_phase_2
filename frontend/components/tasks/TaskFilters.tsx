'use client';

import { cn } from '@/lib/utils';
import type { TaskFilter, TaskSortBy, TaskSortOrder } from '@/types';

interface TaskFiltersProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  counts: {
    total: number;
    pending: number;
    completed: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  sortBy: TaskSortBy;
  onSortByChange: (sortBy: TaskSortBy) => void;
  sortOrder: TaskSortOrder;
  onSortOrderChange: (order: TaskSortOrder) => void;
  onClearFilters: () => void;
}

const statusFilters: { value: TaskFilter; label: string; countKey: keyof TaskFiltersProps['counts'] }[] = [
  { value: 'all', label: 'All', countKey: 'total' },
  { value: 'pending', label: 'Pending', countKey: 'pending' },
  { value: 'completed', label: 'Completed', countKey: 'completed' },
];

export function TaskFilters({
  currentFilter,
  onFilterChange,
  counts,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
}: TaskFiltersProps) {
  const hasActiveFilters = searchQuery || priorityFilter || currentFilter !== 'all' || sortBy !== 'created_at';

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Status Filters + Priority + Sort */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter tasks">
          {statusFilters.map(({ value, label, countKey }) => {
            const isActive = currentFilter === value;
            const count = counts[countKey];
            return (
              <button
                key={value}
                role="tab"
                aria-selected={isActive}
                aria-controls="task-list"
                onClick={() => onFilterChange(value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-card'
                    : 'bg-white dark:bg-dark-100 text-gray-secondary border border-gray-border dark:border-dark-border hover:border-primary hover:text-primary'
                )}
              >
                {label}
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-semibold',
                    isActive ? 'bg-white/30 text-gray-primary' : 'bg-gray-100 text-gray-secondary'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Priority filter */}
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-xs focus:ring-2 focus:ring-primary"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as TaskSortBy)}
          className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-xs focus:ring-2 focus:ring-primary"
        >
          <option value="created_at">Created</option>
          <option value="updated_at">Updated</option>
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>

        {/* Sort order toggle */}
        <button
          onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 hover:border-primary transition-colors"
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(sortOrder === 'desc' && 'rotate-180', 'transition-transform')}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-primary hover:text-primary/80 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
