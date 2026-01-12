import { SkeletonList } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="h-8 w-32 bg-gray-200 dark:bg-dark-200 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-dark-200 rounded mt-2 animate-pulse" />
        </div>
        <div className="h-12 w-full sm:w-32 bg-gray-200 dark:bg-dark-200 rounded-xl animate-pulse" />
      </div>

      {/* Task Counters Skeleton */}
      <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-border dark:border-dark-border p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="h-5 w-24 bg-gray-200 dark:bg-dark-200 rounded animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-dark-200 rounded animate-pulse" />
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-dark-200 rounded-full animate-pulse" />
      </div>

      {/* Filter Skeleton */}
      <div className="flex gap-2 mb-6">
        <div className="h-10 w-20 bg-gray-200 dark:bg-dark-200 rounded-lg animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 dark:bg-dark-200 rounded-lg animate-pulse" />
        <div className="h-10 w-28 bg-gray-200 dark:bg-dark-200 rounded-lg animate-pulse" />
      </div>

      {/* Task List Skeleton */}
      <SkeletonList count={4} />
    </div>
  );
}
