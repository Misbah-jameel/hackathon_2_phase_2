import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const defaultSizes = {
    text: { height: '1em', width: '100%' },
    circular: { height: '40px', width: '40px' },
    rectangular: { height: '120px', width: '100%' },
  };

  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
        variants[variant],
        className
      )}
      style={{
        width: width ?? defaultSizes[variant].width,
        height: height ?? defaultSizes[variant].height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

// Pre-built skeleton patterns
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton variant="rectangular" height={160} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
    </div>
  );
}

function SkeletonTaskCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-border p-4 space-y-3',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width={24} height={24} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="90%" height={16} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton variant="rectangular" width={60} height={32} />
        <Skeleton variant="rectangular" width={60} height={32} />
      </div>
    </div>
  );
}

function SkeletonList({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonTaskCard key={index} />
      ))}
    </div>
  );
}

function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTaskCard, SkeletonList, SkeletonText };
