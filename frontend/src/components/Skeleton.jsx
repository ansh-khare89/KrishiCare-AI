export function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-leaf-100 bg-white dark:border-earth-800 dark:bg-earth-900">
      <div className="aspect-video bg-earth-100 dark:bg-earth-800" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 rounded bg-earth-100 dark:bg-earth-800" />
        <div className="h-3 w-1/2 rounded bg-earth-100 dark:bg-earth-800" />
        <div className="h-3 w-full rounded bg-earth-100 dark:bg-earth-800" />
      </div>
    </div>
  )
}

export function SkeletonResult() {
  return (
    <div className="animate-pulse rounded-2xl border border-leaf-100 bg-white p-6 dark:border-earth-800 dark:bg-earth-900">
      <div className="mb-4 h-6 w-1/3 rounded bg-earth-100 dark:bg-earth-800" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-56 rounded-xl bg-earth-100 dark:bg-earth-800" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-earth-100 dark:bg-earth-800" />
          <div className="h-4 w-5/6 rounded bg-earth-100 dark:bg-earth-800" />
          <div className="h-20 rounded bg-earth-100 dark:bg-earth-800" />
        </div>
      </div>
    </div>
  )
}
