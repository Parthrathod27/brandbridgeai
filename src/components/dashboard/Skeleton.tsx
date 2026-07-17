interface SkeletonProps {
  className?: string;
}

export function SkeletonBlock({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--surface-strong)] ${className}`}
      aria-hidden
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bb-glass rounded-2xl p-5">
      <SkeletonBlock className="h-10 w-10" />
      <SkeletonBlock className="mt-4 h-8 w-16" />
      <SkeletonBlock className="mt-2 h-3 w-24" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bb-glass rounded-2xl p-6">
      <SkeletonBlock className="h-5 w-40" />
      <SkeletonBlock className="mt-4 h-20 w-full" />
      <SkeletonBlock className="mt-3 h-20 w-full" />
    </div>
  );
}

export function RecommendationSkeleton() {
  return (
    <div className="bb-glass rounded-2xl p-5">
      <div className="flex gap-4">
        <SkeletonBlock className="h-12 w-12 shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-2/3" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <SkeletonBlock className="h-9 flex-1" />
        <SkeletonBlock className="h-9 flex-1" />
      </div>
    </div>
  );
}
