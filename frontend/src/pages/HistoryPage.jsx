import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronLeft, ChevronRight, Leaf, Loader2, Lock, LogIn, RefreshCw, UserPlus } from 'lucide-react'
import { fetchPredictionHistory, resolveImageUrl } from '../api/client'
import { SkeletonCard } from '../components/Skeleton'
import { confidenceColor, isHealthy } from '../utils/prediction'
import { useAuth } from '../context/AuthContext'

function HistoryCard({ item }) {
  const healthy = isHealthy(item.diseaseName)
  const [imgError, setImgError] = useState(false)

  return (
    <article className="overflow-hidden rounded-2xl border border-leaf-200/60 bg-white/80 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md dark:border-earth-700 dark:bg-earth-900/80">
      <div className="aspect-video overflow-hidden bg-earth-50 dark:bg-earth-800">
        {item.imageUrl && !imgError ? (
          <img
            src={resolveImageUrl(item.imageUrl)}
            alt={item.diseaseName}
            onError={() => setImgError(true)}
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
  const { isAuthenticated, user } = useAuth()
  const [data, setData] = useState(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHistory = async (targetPage = page) => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
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
  }, [page, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="rounded-3xl border border-leaf-200/80 bg-white/90 p-8 shadow-xl backdrop-blur-xl dark:border-earth-700 dark:bg-earth-900/90 sm:p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-leaf-600 to-emerald-500 text-white shadow-lg shadow-leaf-600/30">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-earth-900 dark:text-earth-50 sm:text-3xl">
            Sign in to view your history
          </h2>
          <p className="mt-3 text-sm text-earth-700/80 dark:text-earth-300 leading-relaxed">
            Your diagnosis history and recommended treatments are saved to your personal account. Sign in to review your past scans.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/auth?tab=login&redirect=/history"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-leaf-600/25 transition hover:bg-leaf-700 active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/auth?tab=register&redirect=/history"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-leaf-200 bg-white px-6 py-3 text-sm font-semibold text-leaf-700 shadow-sm transition hover:bg-leaf-50 dark:border-earth-700 dark:bg-earth-900 dark:text-leaf-300"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 dark:text-earth-50">Your diagnoses</h1>
          <p className="mt-2 text-earth-700/70 dark:text-earth-400">
            Personal diagnosis history for <span className="font-semibold text-leaf-700 dark:text-leaf-300">{user?.email}</span>
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
