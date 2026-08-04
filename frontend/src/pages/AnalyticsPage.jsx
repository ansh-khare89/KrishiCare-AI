import { useEffect, useState } from 'react'
import { BarChart3, Leaf, ShieldAlert } from 'lucide-react'
import { fetchAnalytics } from '../api/client'
import { SkeletonCard } from '../components/Skeleton'

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
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

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
        <p className="mt-2 text-earth-600 dark:text-earth-400">Your session stats at a glance.</p>
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
