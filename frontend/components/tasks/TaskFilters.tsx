'use client';

import { cn } from '@/lib/utils';
import type { TaskFilter } from '@/types';

interface TaskFiltersProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  counts: {
    total: number;
    pending: number;
    completed: number;
  };
}

const filters: { value: TaskFilter; label: string; countKey: keyof TaskFiltersProps['counts'] }[] = [
  { value: 'all', label: 'All', countKey: 'total' },
  { value: 'pending', label: 'Pending', countKey: 'pending' },
  { value: 'completed', label: 'Completed', countKey: 'completed' },
];

export function TaskFilters({ currentFilter, onFilterChange, counts }: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter tasks">
      {filters.map(({ value, label, countKey }) => {
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
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              isActive
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-card'
                : 'bg-white dark:bg-dark-100 text-gray-secondary border border-gray-border dark:border-dark-border hover:border-primary hover:text-primary'
            )}
          >
            {label}
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-semibold',
                isActive
                  ? 'bg-white/30 text-gray-primary'
                  : 'bg-gray-100 text-gray-secondary'
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
