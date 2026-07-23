import { useEffect, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, Leaf, Loader2, RefreshCw } from 'lucide-react'
import { fetchPredictionHistory, resolveImageUrl } from '../api/client'
import { SkeletonCard } from '../components/Skeleton'
import { confidenceColor, isHealthy } from '../utils/prediction'

function HistoryCard({ item }) {
  const healthy = isHealthy(item.diseaseName)

  return (
    <article className="overflow-hidden rounded-2xl border border-leaf-100 bg-white/80 shadow-sm backdrop-blur transition hover:shadow-md dark:border-earth-700 dark:bg-earth-900/80">
      <div className="aspect-video overflow-hidden bg-earth-50 dark:bg-earth-800">
        {item.imageUrl ? (
          <img
            src={resolveImageUrl(item.imageUrl)}
            alt={item.diseaseName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-earth-700/40">
            <Leaf className="h-12 w-12" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-earth-900 dark:text-earth-100">{item.diseaseName}</h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
              healthy ? 'bg-leaf-100 text-leaf-700 dark:bg-leaf-900/40 dark:text-leaf-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
            }`}
          >
            {item.confidence?.toFixed(0)}%
          </span>
        </div>

        <p className="mb-1 text-xs text-earth-700/60 dark:text-earth-400">{item.cropName}</p>
        <p className="line-clamp-2 text-sm leading-relaxed text-earth-700 dark:text-earth-300">
          {item.advisory}
        </p>
        <p className="mt-3 text-xs text-earth-700/50 dark:text-earth-500">
          {new Date(item.timestamp).toLocaleString()}
        </p>
      </div>
    </article>
  )
}

export default function HistoryPage() {
  const [data, setData] = useState(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHistory = async (targetPage = page) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchPredictionHistory(targetPage, 12)
      setData(res)
    } catch {
      setError('Could not load history. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory(page)
  }, [page])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 dark:text-earth-50">Your diagnoses</h1>
          <p className="mt-2 text-earth-700/70 dark:text-earth-400">
            Past results from this browser session.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadHistory(page)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-leaf-200 bg-white px-4 py-2 text-sm font-medium text-leaf-700 transition hover:bg-leaf-50 disabled:opacity-50 dark:border-earth-700 dark:bg-earth-900 dark:text-leaf-300"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && data?.content?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-leaf-200 bg-white/60 py-16 text-center dark:border-earth-700 dark:bg-earth-900/40">
          <Leaf className="mx-auto mb-4 h-12 w-12 text-leaf-300 dark:text-leaf-800" />
          <p className="text-lg font-medium text-earth-900 dark:text-earth-100">Nothing here yet</p>
          <p className="mt-1 text-sm text-earth-700/60 dark:text-earth-400">
            Upload a leaf on the home page to get started.
          </p>
        </div>
      )}

      {!loading && data?.content?.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-leaf-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-earth-700"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <span className="text-sm text-earth-600 dark:text-earth-400">
              Page {data.page + 1} of {data.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= data.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-leaf-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-earth-700"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
