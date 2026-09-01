export function SkeletonCard({ className = '' }) {
  return (
    <div className={`animate-pulse overflow-hidden rounded-2xl border border-border-primary bg-surface-card dark:border-border-primary dark:bg-surface-elevated shadow-sm ${className}`}>
      {/* Image area skeleton */}
      <div className="aspect-video bg-gradient-to-br from-surface-elevated to-surface-card dark:from-surface-card dark:to-surface-elevated relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      
      {/* Content area */}
      <div className="space-y-4 p-5">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded-lg bg-surface-elevated dark:bg-surface-card" />
          <div className="h-4 w-1/2 rounded-lg bg-surface-elevated dark:bg-surface-card" />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-surface-elevated dark:bg-surface-card" />
          <div className="h-6 w-20 rounded-full bg-surface-elevated dark:bg-surface-card" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded bg-surface-elevated dark:bg-surface-card" />
          <div className="h-3.5 w-5/6 rounded bg-surface-elevated dark:bg-surface-card" />
        </div>
        
        {/* Footer skeleton */}
        <div className="pt-2 border-t border-border-primary dark:border-border-primary">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-surface-elevated dark:bg-surface-card" />
            <div className="h-8 w-20 rounded-lg bg-surface-elevated dark:bg-surface-card" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonResult({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-2xl border border-border-primary bg-surface-card p-6 dark:border-border-primary dark:bg-surface-elevated shadow-sm ${className}`}>
      {/* Header skeleton */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-surface-elevated dark:bg-surface-card" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-lg bg-surface-elevated dark:bg-surface-card" />
          <div className="h-4 w-32 rounded-lg bg-surface-elevated dark:bg-surface-card" />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Image area skeleton */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl bg-gradient-to-br from-surface-elevated to-surface-card dark:from-surface-card dark:to-surface-elevated relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
          {/* Additional badge skeletons */}
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded-full bg-surface-elevated dark:bg-surface-card" />
            <div className="h-8 w-28 rounded-full bg-surface-elevated dark:bg-surface-card" />
          </div>
        </div>
        
        {/* Content area skeleton */}
        <div className="space-y-4">
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-xl bg-surface-elevated dark:bg-surface-card" />
            <div className="h-20 rounded-xl bg-surface-elevated dark:bg-surface-card" />
          </div>
          
          {/* Progress bars */}
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-surface-elevated dark:bg-surface-card" />
              <div className="h-2 w-full rounded-full bg-surface-elevated dark:bg-surface-card">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-leaf-500 to-emerald-500 opacity-30" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-5/6 rounded bg-surface-elevated dark:bg-surface-card" />
              <div className="h-2 w-full rounded-full bg-surface-elevated dark:bg-surface-card">
                <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-leaf-500 to-emerald-500 opacity-30" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-4/5 rounded bg-surface-elevated dark:bg-surface-card" />
              <div className="h-2 w-full rounded-full bg-surface-elevated dark:bg-surface-card">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-leaf-500 to-emerald-500 opacity-30" />
              </div>
            </div>
          </div>
          
          {/* Recommendation section */}
          <div className="rounded-xl bg-surface-elevated/50 p-4 dark:bg-surface-card/50 space-y-3">
            <div className="h-4 w-40 rounded bg-surface-elevated dark:bg-surface-card" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-surface-elevated dark:bg-surface-card" />
              <div className="h-3 w-5/6 rounded bg-surface-elevated dark:bg-surface-card" />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            <div className="h-12 flex-1 rounded-xl bg-surface-elevated dark:bg-surface-card" />
            <div className="h-12 flex-1 rounded-xl bg-surface-elevated dark:bg-surface-card" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, className = '' }) {
  return (
    <div className={`animate-pulse rounded-2xl border border-border-primary bg-surface-card p-6 dark:border-border-primary dark:bg-surface-elevated shadow-sm ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-40 rounded-lg bg-surface-elevated dark:bg-surface-card" />
        <div className="h-10 w-32 rounded-xl bg-surface-elevated dark:bg-surface-card" />
      </div>
      
      {/* Table header */}
      <div className="mb-4 grid grid-cols-4 gap-4 pb-4 border-b border-border-primary dark:border-border-primary">
        <div className="h-4 rounded bg-surface-elevated dark:bg-surface-card" />
        <div className="h-4 rounded bg-surface-elevated dark:bg-surface-card" />
        <div className="h-4 rounded bg-surface-elevated dark:bg-surface-card" />
        <div className="h-4 rounded bg-surface-elevated dark:bg-surface-card" />
      </div>
      
      {/* Table rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 py-2">
            <div className="h-4 w-3/4 rounded bg-surface-elevated dark:bg-surface-card" />
            <div className="h-4 w-1/2 rounded bg-surface-elevated dark:bg-surface-card" />
            <div className="h-4 w-2/3 rounded bg-surface-elevated dark:bg-surface-card" />
            <div className="h-4 w-1/2 rounded bg-surface-elevated dark:bg-surface-card" />
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-surface-elevated dark:bg-surface-card" />
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-lg bg-surface-elevated dark:bg-surface-card" />
          <div className="h-9 w-9 rounded-lg bg-surface-elevated dark:bg-surface-card" />
          <div className="h-9 w-9 rounded-lg bg-surface-elevated dark:bg-surface-card" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonHero({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-3xl bg-gradient-to-br from-surface-card to-surface-elevated dark:from-surface-elevated dark:to-surface-card p-10 shadow-xl ${className}`}>
      <div className="max-w-2xl space-y-6">
        <div className="space-y-3">
          <div className="h-12 w-3/4 rounded-xl bg-surface-elevated/80 dark:bg-surface-card/80" />
          <div className="h-10 w-2/3 rounded-xl bg-surface-elevated/80 dark:bg-surface-card/80" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-full rounded bg-surface-elevated/80 dark:bg-surface-card/80" />
          <div className="h-5 w-5/6 rounded bg-surface-elevated/80 dark:bg-surface-card/80" />
        </div>
        <div className="flex gap-4 pt-4">
          <div className="h-14 w-44 rounded-xl bg-surface-elevated/80 dark:bg-surface-card/80" />
          <div className="h-14 w-40 rounded-xl bg-surface-elevated/80 dark:bg-surface-card/80" />
        </div>
      </div>
    </div>
  )
}

// Add shimmer keyframe to CSS (you might need to add this to your global CSS)
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }