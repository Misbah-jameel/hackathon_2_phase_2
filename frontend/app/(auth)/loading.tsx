export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Skeleton */}
        <div className="text-center mb-8">
          <div className="h-8 w-32 bg-gray-200 dark:bg-dark-200 rounded-lg animate-pulse mx-auto" />
        </div>

        {/* Form Card Skeleton */}
        <div className="bg-white dark:bg-dark-100 rounded-2xl border border-gray-border dark:border-dark-border p-6 sm:p-8 shadow-lg">
          {/* Title Skeleton */}
          <div className="h-8 w-48 bg-gray-200 dark:bg-dark-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-dark-200 rounded animate-pulse mb-6" />

          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            {/* Field 1 */}
            <div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-dark-200 rounded animate-pulse mb-1.5" />
              <div className="h-12 w-full bg-gray-200 dark:bg-dark-200 rounded-xl animate-pulse" />
            </div>

            {/* Field 2 */}
            <div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-dark-200 rounded animate-pulse mb-1.5" />
              <div className="h-12 w-full bg-gray-200 dark:bg-dark-200 rounded-xl animate-pulse" />
            </div>

            {/* Submit Button Skeleton */}
            <div className="h-12 w-full bg-gray-200 dark:bg-dark-200 rounded-xl animate-pulse mt-6" />
          </div>

          {/* Footer Link Skeleton */}
          <div className="h-4 w-48 bg-gray-200 dark:bg-dark-200 rounded animate-pulse mx-auto mt-6" />
        </div>
      </div>
    </div>
  );
}
