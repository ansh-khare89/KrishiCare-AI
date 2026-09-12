import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronLeft, ChevronRight, Leaf, Loader2, Lock, LogIn, RefreshCw, UserPlus, Calendar, Tag, Eye, Clock } from 'lucide-react'
import { fetchPredictionHistory, resolveImageUrl } from '../api/client'
import { SkeletonCard } from '../components/Skeleton'
import { confidenceColor, isHealthy } from '../utils/prediction'
import { useAuth } from '../context/AuthContext'

function HistoryCard({ item }) {
  const healthy = isHealthy(item.diseaseName)
  const [imgError, setImgError] = useState(false)

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-all hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        {item.imageUrl && !imgError ? (
          <img
            src={resolveImageUrl(item.imageUrl)}
            alt={item.diseaseName}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-600 bg-slate-950">
            <Leaf className="h-10 w-10 text-emerald-500" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold shadow-sm backdrop-blur-md ${
              healthy ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/90 text-white'
            }`}
          >
            {healthy ? 'Healthy' : 'Diseased'}
          </span>
        </div>

        {/* Confidence Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md">
            {item.confidence?.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {item.cropName}
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
              {item.diseaseName}
            </h3>
          </div>
        </div>

        {item.advisory && (
          <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {item.advisory}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Clock className="h-3 w-3" />
          <time dateTime={item.timestamp}>
            {new Date(item.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </time>
        </div>
      </div>
    </article>
  )
}

function EmptyState() {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-300 py-16 text-center dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
        <Leaf className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">No scans recorded yet</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        Diagnose a leaf photo on the home page to start building your personal disease history.
      </p>
    </div>
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
      setError('Could not load history. Please verify services are awake.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory(page)
  }, [page, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Sign In to View Your Scan History
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your diagnosis records and treatments are preserved securely in your personal account.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              to="/auth?tab=login&redirect=/history"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/auth?tab=register&redirect=/history"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <UserPlus className="h-4 w-4" />
              <span>Register</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Personal Diagnostic Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Historical logs and prescribed treatments for <strong className="text-emerald-700 dark:text-emerald-400">{user?.email}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadHistory(page)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && data?.content?.length === 0 && <EmptyState />}

      {!loading && data?.content?.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-semibold text-slate-500">
              Page {data.page + 1} of {data.totalPages}
            </span>

            <button
              type="button"
              disabled={page >= data.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}