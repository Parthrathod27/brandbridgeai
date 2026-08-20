import { SkeletonBlock } from "@/components/dashboard/Skeleton";

export default function ProtectedLoading() {
  return (
    <div className="w-full max-w-full" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading dashboard…</span>

      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-48 sm:w-64" />
          <SkeletonBlock className="h-3 w-56 sm:w-80" />
        </div>
        <SkeletonBlock className="h-10 w-full sm:w-36" />
      </div>

      {/* Stat row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bb-glass rounded-2xl p-5">
            <SkeletonBlock className="h-10 w-10" />
            <SkeletonBlock className="mt-4 h-8 w-16" />
            <SkeletonBlock className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Content cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bb-glass rounded-2xl p-6">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="mt-4 h-20 w-full" />
            <SkeletonBlock className="mt-3 h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
