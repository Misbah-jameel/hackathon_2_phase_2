'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTaskActivity } from '@/components/providers/TaskActivityProvider';
import { useTasks } from '@/hooks/useTasks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TaskCompletionChart } from '@/components/dashboard/TaskCompletionChart';
import { formatDistanceToNow } from '@/lib/utils';
import type { TaskActivityType } from '@/types';

// Activity type config for icons and colors
const activityConfig: Record<TaskActivityType, { icon: React.ReactNode; color: string; label: string }> = {
  created: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    color: 'text-green-500 bg-green-500/10',
    label: 'Created',
  },
  viewed: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    color: 'text-blue-500 bg-blue-500/10',
    label: 'Viewed',
  },
  edited: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    color: 'text-yellow-500 bg-yellow-500/10',
    label: 'Edited',
  },
  deleted: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    color: 'text-red-500 bg-red-500/10',
    label: 'Deleted',
  },
  completed: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    color: 'text-primary bg-primary/10',
    label: 'Completed',
  },
  reopened: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
      </svg>
    ),
    color: 'text-orange-500 bg-orange-500/10',
    label: 'Reopened',
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { activities, clearActivities, getActivityCounts } = useTaskActivity();
  const { tasks, counts } = useTasks();

  const activityCounts = getActivityCounts();

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-primary dark:text-white">Dashboard</h1>
        <p className="text-gray-secondary dark:text-gray-400 mt-1">
          Your profile and task activity overview
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="p-6 mb-6 card-cinematic">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-primary dark:text-white truncate">
              {user?.name || 'User'}
            </h2>
            <p className="text-gray-secondary dark:text-gray-400 truncate">
              {user?.email || 'user@example.com'}
            </p>
            {user?.createdAt && (
              <p className="text-sm text-gray-secondary dark:text-gray-500 mt-2">
                Member since {formatDate(user.createdAt)}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Task Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 card-cinematic text-center">
          <div className="text-3xl sm:text-4xl font-bold gradient-text">{counts.total}</div>
          <div className="text-sm text-gray-secondary dark:text-gray-400 mt-1">Total Tasks</div>
        </Card>
        <Card className="p-4 card-cinematic text-center">
          <div className="text-3xl sm:text-4xl font-bold text-yellow-500">{counts.pending}</div>
          <div className="text-sm text-gray-secondary dark:text-gray-400 mt-1">Pending</div>
        </Card>
        <Card className="p-4 card-cinematic text-center">
          <div className="text-3xl sm:text-4xl font-bold text-green-500">{counts.completed}</div>
          <div className="text-sm text-gray-secondary dark:text-gray-400 mt-1">Completed</div>
        </Card>
        <Card className="p-4 card-cinematic text-center">
          <div className="text-3xl sm:text-4xl font-bold text-primary">
            {counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-secondary dark:text-gray-400 mt-1">Progress</div>
        </Card>
      </div>

      {/* Activity Counts */}
      <Card className="p-6 mb-6 card-cinematic">
        <h3 className="text-lg font-semibold text-gray-primary dark:text-white mb-4">
          Activity Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.keys(activityConfig) as TaskActivityType[]).map((type) => (
            <div
              key={type}
              className={`flex flex-col items-center p-3 rounded-xl ${activityConfig[type].color}`}
            >
              <span className="mb-1">{activityConfig[type].icon}</span>
              <span className="text-xl font-bold">{activityCounts[type]}</span>
              <span className="text-xs opacity-80">{activityConfig[type].label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Task Completion Trends Chart */}
      <Card className="p-6 mb-6 card-cinematic">
        <h3 className="text-lg font-semibold text-gray-primary dark:text-white mb-4">
          Task Completion Trends
        </h3>
        <p className="text-sm text-gray-secondary dark:text-gray-400 mb-4">
          Your task activity over the last 7 days
        </p>
        <TaskCompletionChart activities={activities} />
      </Card>

      {/* Current Tasks */}
      <Card className="p-6 mb-6 card-cinematic">
        <h3 className="text-lg font-semibold text-gray-primary dark:text-white mb-4">
          Current Tasks
        </h3>
        {tasks.length === 0 ? (
          <p className="text-gray-secondary dark:text-gray-400 text-center py-8">
            No tasks yet. Create your first task to get started!
          </p>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {tasks.slice(0, 10).map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-200 ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    task.completed ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-gray-primary dark:text-white truncate ${
                      task.completed ? 'line-through' : ''
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-gray-secondary dark:text-gray-400 truncate">
                      {task.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-secondary dark:text-gray-500 shrink-0">
                  {formatDistanceToNow(task.createdAt)}
                </span>
              </div>
            ))}
            {tasks.length > 10 && (
              <p className="text-center text-sm text-gray-secondary dark:text-gray-400 pt-2">
                And {tasks.length - 10} more tasks...
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Recent Activity */}
      <Card className="p-6 card-cinematic">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-primary dark:text-white">
            Recent Activity
          </h3>
          {activities.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearActivities}
              className="text-xs"
            >
              Clear History
            </Button>
          )}
        </div>

        {activities.length === 0 ? (
          <p className="text-gray-secondary dark:text-gray-400 text-center py-8">
            No activity recorded yet. Start managing your tasks to see activity here!
          </p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {activities.map((activity) => {
              const config = activityConfig[activity.type];
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-200"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${config.color}`}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-primary dark:text-white">
                      <span className="font-medium">{config.label}</span>{' '}
                      <span className="text-gray-secondary dark:text-gray-400">task:</span>{' '}
                      <span className="font-medium truncate">{activity.taskTitle}</span>
                    </p>
                    {activity.details && (
                      <p className="text-sm text-gray-secondary dark:text-gray-400">
                        {activity.details}
                      </p>
                    )}
                    <p className="text-xs text-gray-secondary dark:text-gray-500 mt-1">
                      {formatDistanceToNow(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
