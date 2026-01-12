'use client';

import { cn } from '@/lib/utils';

interface TaskCountersProps {
  counts: {
    total: number;
    pending: number;
    completed: number;
  };
  className?: string;
}

interface CounterCardProps {
  label: string;
  value: number;
  color: 'default' | 'pink' | 'purple';
}

function CounterCard({ label, value, color }: CounterCardProps) {
  const colorClasses = {
    default: 'text-gray-primary dark:text-white',
    pink: 'text-primary',
    purple: 'text-secondary',
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-4 shadow-card text-center transition-all duration-200 hover:shadow-card-hover dark:shadow-none dark:border dark:border-dark-border">
      <div className={cn('text-2xl font-bold', colorClasses[color])}>
        {value}
      </div>
      <div className="text-sm text-gray-secondary dark:text-gray-400 mt-1">{label}</div>
    </div>
  );
}

export function TaskCounters({ counts, className }: TaskCountersProps) {
  // Don't render if there are no tasks
  if (counts.total === 0) {
    return null;
  }

  // Calculate completion percentage
  const completionPercentage = counts.total > 0
    ? Math.round((counts.completed / counts.total) * 100)
    : 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Counter Cards */}
      <div className="grid grid-cols-3 gap-4">
        <CounterCard label="Total" value={counts.total} color="default" />
        <CounterCard label="Pending" value={counts.pending} color="pink" />
        <CounterCard label="Completed" value={counts.completed} color="purple" />
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-dark-card rounded-xl p-4 shadow-card dark:shadow-none dark:border dark:border-dark-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-secondary dark:text-gray-400">Progress</span>
          <span className="text-sm font-semibold text-primary">{completionPercentage}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-dark-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${completionPercentage}% tasks completed`}
          />
        </div>
      </div>
    </div>
  );
}
