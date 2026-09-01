import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronLeft, ChevronRight, Leaf, Loader2, Lock, LogIn, RefreshCw, UserPlus, Calendar, Tag, Eye } from 'lucide-react'
import { fetchPredictionHistory, resolveImageUrl } from '../api/client'
import { SkeletonCard } from '../components/Skeleton'
import { confidenceColor, isHealthy } from '../utils/prediction'
import { useAuth } from '../context/AuthContext'

function HistoryCard({ item }) {
  const healthy = isHealthy(item.diseaseName)
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <article 
      className="relative group overflow-hidden rounded-2xl border border-border-primary bg-surface-card/80 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-border-primary dark:bg-surface-elevated/80"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden bg-surface-elevated dark:bg-surface-card">
        {item.imageUrl && !imgError ? (
          <img
            src={resolveImageUrl(item.imageUrl)}
            alt={item.diseaseName}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            <div className="rounded-full bg-surface-elevated p-3 dark:bg-surface-card border border-border-primary">
              <Leaf className="h-10 w-10 text-leaf-500 dark:text-leaf-400" />
            </div>
          </div>
        )}
        
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Status badge on image */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-lg backdrop-blur-sm ${
            healthy 
              ? 'bg-emerald-500/90 text-white' 
              : 'bg-amber-500/90 text-white'
          }`}>
            {healthy ? 'Healthy' : 'Diseased'}
          </span>
        </div>
        
        {/* Confidence badge on image */}
        <div className="absolute top-3 right-3 z-10">
          <span className="rounded-full bg-surface-card/90 px-2.5 py-1 text-xs font-bold shadow-lg backdrop-blur-sm text-text-primary dark:bg-surface-elevated/90 dark:text-text-primary border border-border-primary/50">
            {item.confidence?.toFixed(0)}%
          </span>
        </div>
        
        {/* Quick view button on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
          <button className="rounded-full bg-surface-card/90 p-2 text-text-secondary shadow-lg backdrop-blur-sm hover:bg-surface-elevated hover:text-text-primary transition-colors dark:bg-surface-elevated/90 dark:text-text-muted">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4.5 space-y-3">
        {/* Header with disease name and crop */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-text-primary dark:text-text-primary truncate pr-2">{item.diseaseName}</h3>
            <p className="mt-0.5 text-xs text-text-muted dark:text-text-muted flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {item.cropName}
            </p>
          </div>
          <div className="shrink-0 rounded-lg bg-surface-elevated p-1.5 dark:bg-surface-card border border-border-primary/50">
            <Calendar className="h-3.5 w-3.5 text-text-muted" />
          </div>
        </div>

        {/* Advisory text */}
        <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary dark:text-text-muted">
          {item.advisory}
        </p>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted dark:text-text-muted pt-1 border-t border-border-primary/50">
          <Calendar className="h-3 w-3" />
          <time dateTime={item.timestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </time>
        </div>
      </div>
    </article>
  )
}

function EmptyState() {
  return (
    <div className="relative rounded-2xl border-2 border-dashed border-border-primary bg-surface-card/50 py-16 text-center dark:border-border-primary dark:bg-surface-elevated/30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-leaf-500/5 to-transparent" />
      <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-leaf-500 to-emerald-500 text-white shadow-lg shadow-leaf-500/30">
        <Leaf className="h-8 w-8" />
      </div>
      <h3 className="relative text-xl font-bold text-text-primary dark:text-text-primary">Nothing here yet</h3>
      <p className="relative mt-2 text-text-secondary dark:text-text-muted max-w-sm mx-auto">
        Upload a leaf image on the home page to start building your diagnosis history.
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
        <div className="relative rounded-3xl border border-border-primary bg-surface-card/90 p-8 shadow-xl backdrop-blur-xl dark:border-border-primary dark:bg-surface-elevated/90 sm:p-10 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-1/2 -right-1/2 h-[80%] w-[80%] rounded-full bg-gradient-to-br from-leaf-500/10 to-emerald-500/10 blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-1/2 -left-1/2 h-[60%] w-[60%] rounded-full bg-gradient-to-tr from-amber-500/10 to-orange-500/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="mx-auto mb-4 relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-leaf-600 to-emerald-500 text-white shadow-lg shadow-leaf-600/30">
            <Lock className="h-8 w-8" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping" />
          </div>
          
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary sm:text-3xl">
            Sign in to view your history
          </h2>
          <p className="mt-3 text-sm text-text-secondary dark:text-text-muted leading-relaxed">
            Your diagnosis history and recommended treatments are saved to your personal account. Sign in to review your past scans.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/auth?tab=login&redirect=/history"
              className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-leaf-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-leaf-600/25 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </span>
              <span className="absolute inset-0 bg-white/20 translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
            </Link>
            <Link
              to="/auth?tab=register&redirect=/history"
              className="relative inline-flex items-center justify-center gap-2 rounded-xl border border-border-primary bg-surface-card px-6 py-3 text-sm font-semibold text-text-primary shadow-sm transition-all hover:border-leaf-500 hover:bg-surface-elevated hover:-translate-y-0.5 active:scale-95 dark:border-border-primary dark:bg-surface-elevated dark:text-text-primary"
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary">Your Diagnoses</h1>
          <p className="mt-2 text-text-secondary dark:text-text-muted">
            Personal diagnosis history for <span className="font-semibold text-leaf-600 dark:text-leaf-400">{user?.email}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadHistory(page)}
          disabled={loading}
          className="relative inline-flex items-center gap-2 rounded-xl border border-border-primary bg-surface-card px-4 py-2 text-sm font-medium text-text-primary transition-all hover:border-leaf-500 hover:bg-surface-elevated hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 dark:border-border-primary dark:bg-surface-elevated dark:text-text-primary overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-leaf-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
        <div className="relative flex items-center gap-3 rounded-xl border border-red-200/50 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-300 shadow-sm">
          <div className="relative flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          </div>
          {error}
        </div>
      )}

      {!loading && !error && data?.content?.length === 0 && (
        <EmptyState />
      )}

      {!loading && data?.content?.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map((item, index) => (
              <HistoryCard key={item.id} item={item} style={{ animationDelay: `${index * 0.05}s` }} />
            ))}
          </div>

          {/* Enhanced Pagination */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-primary bg-surface-card px-3 py-2 text-sm font-medium text-text-primary transition-all hover:border-leaf-500 hover:bg-surface-elevated hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 dark:border-border-primary dark:bg-surface-elevated dark:text-text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => {
                let pageNum = i
                if (data.totalPages > 5) {
                  if (page <= 1) pageNum = i
                  else if (page >= data.totalPages - 2) pageNum = data.totalPages - 5 + i
                  else pageNum = page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                      page === pageNum
                        ? 'bg-gradient-to-r from-leaf-500 to-emerald-500 text-white shadow-md shadow-leaf-500/30'
                        : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary dark:text-text-muted'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}
            </div>
            
            <button
              type="button"
              disabled={page >= data.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-primary bg-surface-card px-3 py-2 text-sm font-medium text-text-primary transition-all hover:border-leaf-500 hover:bg-surface-elevated hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 dark:border-border-primary dark:bg-surface-elevated dark:text-text-primary"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-center text-sm text-text-muted dark:text-text-muted mt-4">
            Page {data.page + 1} of {data.totalPages} · {data.totalElements} total scan{data.totalElements !== 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  )
}