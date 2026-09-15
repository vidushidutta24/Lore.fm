
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
}

export function ArtistCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
      <Skeleton className="w-full aspect-square rounded-xl" />
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
      <Skeleton className="h-3 w-2/3 rounded" />
    </div>
  );
}

export function TrackRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
      <Skeleton className="w-6 h-4 rounded" />
      <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
      <Skeleton className="h-3 w-10 rounded" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div
      className="rounded-3xl p-8 flex flex-col gap-6"
      style={{ background: 'var(--gradient-card)', border: '1px solid var(--border-subtle)', minHeight: 320 }}
    >
      <Skeleton className="h-5 w-28 rounded-full" />
      <div className="flex gap-6 items-center">
        <Skeleton className="w-36 h-36 rounded-2xl flex-shrink-0" />
        <div className="flex flex-col gap-3 flex-1">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-3 w-full rounded" />
        </div>
      ))}
    </div>
  );
}
