'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TaskActivity } from '@/types';

interface TaskCompletionChartProps {
  activities: TaskActivity[];
}

interface ChartDataPoint {
  date: string;
  created: number;
  completed: number;
  deleted: number;
}

export function TaskCompletionChart({ activities }: TaskCompletionChartProps) {
  const chartData = useMemo(() => {
    // Group activities by date
    const dataMap = new Map<string, ChartDataPoint>();

    // Get last 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dataMap.set(dateKey, {
        date: dateKey,
        created: 0,
        completed: 0,
        deleted: 0,
      });
    }

    // Count activities by date and type
    activities.forEach((activity) => {
      const activityDate = new Date(activity.timestamp);
      const dateKey = activityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (dataMap.has(dateKey)) {
        const point = dataMap.get(dateKey)!;
        if (activity.type === 'created') {
          point.created++;
        } else if (activity.type === 'completed') {
          point.completed++;
        } else if (activity.type === 'deleted') {
          point.deleted++;
        }
      }
    });

    return Array.from(dataMap.values());
  }, [activities]);

  // Check if there's any data to show
  const hasData = chartData.some(
    (point) => point.created > 0 || point.completed > 0 || point.deleted > 0
  );

  if (!hasData) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-gray-secondary dark:text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-3 opacity-50"
        >
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
        <p className="text-center">No activity data yet.</p>
        <p className="text-sm text-center mt-1">Start managing tasks to see trends here!</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDeleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: '#f3f4f6', fontWeight: 600, marginBottom: '4px' }}
            itemStyle={{ color: '#d1d5db', fontSize: '13px' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="created"
            name="Created"
            stroke="#22c55e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCreated)"
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke="#EC4899"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCompleted)"
          />
          <Area
            type="monotone"
            dataKey="deleted"
            name="Deleted"
            stroke="#ef4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDeleted)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
