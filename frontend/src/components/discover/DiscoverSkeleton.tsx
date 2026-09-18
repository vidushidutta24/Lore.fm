import { Skeleton } from '../ui/Skeleton';

export function DiscoverSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      {/* Hero Skeleton */}
      <div
        className="rounded-3xl p-8 flex flex-col gap-4"
        style={{
          background: 'var(--gradient-card)',
          border: '1px solid var(--border-subtle)',
          minHeight: 220,
        }}
      >
        <Skeleton className="h-5 w-48 rounded-full" />
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-xl flex-shrink-0" />
        ))}
      </div>

      {/* Section 1: Made for you tracks */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3 w-64 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl flex flex-col gap-3"
              style={{ background: 'var(--bg-card)' }}
            >
              <Skeleton className="w-full aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Artists */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-3 w-64 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl flex flex-col gap-4"
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
