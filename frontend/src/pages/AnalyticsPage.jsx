import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Leaf, Lock, LogIn, ShieldAlert, UserPlus } from 'lucide-react'
import { fetchAnalytics } from '../api/client'
import { SkeletonCard } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-leaf-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-earth-700 dark:bg-earth-900/80">
      <div className="flex items-center justify-between">
        <p className="text-sm text-earth-600 dark:text-earth-400">{label}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-2 text-3xl font-bold text-earth-900 dark:text-earth-50">{value}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const { isAuthenticated, user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchAnalytics()
      .then(setData)
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="rounded-3xl border border-leaf-200/80 bg-white/90 p-8 shadow-xl backdrop-blur-xl dark:border-earth-700 dark:bg-earth-900/90 sm:p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-leaf-600 to-emerald-500 text-white shadow-lg shadow-leaf-600/30">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-earth-900 dark:text-earth-50 sm:text-3xl">
            Sign in to view your dashboard
          </h2>
          <p className="mt-3 text-sm text-earth-700/80 dark:text-earth-300 leading-relaxed">
            Track your crop health statistics, disease distribution, and scan trends saved to your account.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/auth?tab=login&redirect=/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-leaf-600/25 transition hover:bg-leaf-700 active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/auth?tab=register&redirect=/dashboard"
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

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  const maxDisease = Math.max(...(data?.byDisease?.map((d) => d.count) || [1]), 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-earth-900 dark:text-earth-50">Dashboard</h1>
        <p className="mt-2 text-earth-600 dark:text-earth-400">
          Analytics for <span className="font-semibold text-leaf-700 dark:text-leaf-300">{user?.email}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total scans" value={data?.totalScans ?? 0} icon={BarChart3} color="text-leaf-600" />
        <StatCard label="Healthy" value={data?.healthyCount ?? 0} icon={Leaf} color="text-leaf-600" />
        <StatCard label="Diseased" value={data?.diseasedCount ?? 0} icon={ShieldAlert} color="text-amber-600" />
      </div>

      {data?.byCrop && Object.keys(data.byCrop).length > 0 && (
        <section className="rounded-2xl border border-leaf-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-earth-700 dark:bg-earth-900/80">
          <h2 className="mb-4 font-semibold text-earth-900 dark:text-earth-50">By crop</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(data.byCrop).map(([crop, count]) => (
              <div key={crop} className="rounded-xl bg-leaf-50 px-5 py-3 dark:bg-leaf-900/30">
                <p className="text-sm text-earth-600 dark:text-earth-400">{crop}</p>
                <p className="text-2xl font-bold text-leaf-700 dark:text-leaf-300">{count}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {data?.byDisease?.length > 0 && (
        <section className="rounded-2xl border border-leaf-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-earth-700 dark:bg-earth-900/80">
          <h2 className="mb-4 font-semibold text-earth-900 dark:text-earth-50">Disease breakdown</h2>
          <div className="space-y-3">
            {data.byDisease.map((d) => (
              <div key={d.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-earth-800 dark:text-earth-200">{d.name}</span>
                  <span className="text-earth-500">{d.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-earth-100 dark:bg-earth-800">
                  <div
                    className="h-full rounded-full bg-leaf-500"
                    style={{ width: `${(d.count / maxDisease) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data?.totalScans === 0 && (
        <p className="text-center text-earth-500">No scans yet. Upload a leaf to see stats here.</p>
      )}
    </div>
  )
}
