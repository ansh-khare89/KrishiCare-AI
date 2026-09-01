import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Leaf, Lock, LogIn, ShieldAlert, UserPlus, TrendingUp, Target, Award, Zap } from 'lucide-react'
import { fetchAnalytics } from '../api/client'
import { SkeletonCard } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'

function StatCard({ label, value, icon: Icon, color, trend, bgGradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${bgGradient} border border-border-primary/50`}>
      {/* Animated background accent */}
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-center justify-between">
        <p className="text-sm font-medium text-text-muted dark:text-text-muted">{label}</p>
        <div className={`rounded-xl p-2 ${color} bg-white/10 dark:bg-black/20 backdrop-blur-sm`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="relative mt-3 flex items-end gap-2">
        <p className="text-3xl font-bold text-text-primary dark:text-text-primary">{value}</p>
        {trend && (
          <div className="mb-1 flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <TrendingUp className="h-3 w-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CropStatCard({ crop, count, index }) {
  const colors = [
    'from-leaf-500 to-emerald-500',
    'from-amber-500 to-orange-500',
    'from-sky-500 to-blue-500',
    'from-violet-500 to-purple-500',
    'from-rose-500 to-pink-500',
    'from-teal-500 to-cyan-500',
  ]
  const gradient = colors[index % colors.length]
  
  return (
    <div className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br ${gradient} text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.1)]`}>
      <div className="absolute inset-0 bg-white/5" />
      <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
      
      <div className="relative z-10">
        <p className="text-sm font-medium text-white/80">{crop}</p>
        <p className="mt-1 text-2xl font-bold">{count}</p>
      </div>
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
            Sign in to view your dashboard
          </h2>
          <p className="mt-3 text-sm text-text-secondary dark:text-text-muted leading-relaxed">
            Track your crop health statistics, disease distribution, and scan trends saved to your account.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/auth?tab=login&redirect=/dashboard"
              className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-leaf-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-leaf-600/25 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </span>
              <span className="absolute inset-0 bg-white/20 translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
            </Link>
            <Link
              to="/auth?tab=register&redirect=/dashboard"
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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary">Dashboard</h1>
        <p className="mt-2 text-text-secondary dark:text-text-muted">
          Analytics for <span className="font-semibold text-leaf-600 dark:text-leaf-400">{user?.email}</span>
        </p>
      </div>

      {/* Enhanced Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard 
          label="Total Scans" 
          value={data?.totalScans ?? 0} 
          icon={BarChart3} 
          color="text-leaf-500"
          bgGradient="bg-gradient-to-br from-leaf-50 to-emerald-50 dark:from-leaf-950/30 dark:to-emerald-950/20"
          trend="+12%"
        />
        <StatCard 
          label="Healthy" 
          value={data?.healthyCount ?? 0} 
          icon={Leaf} 
          color="text-emerald-500"
          bgGradient="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20"
          trend="+8%"
        />
        <StatCard 
          label="Diseased" 
          value={data?.diseasedCount ?? 0} 
          icon={ShieldAlert} 
          color="text-amber-500"
          bgGradient="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20"
        />
      </div>

      {data?.byCrop && Object.keys(data.byCrop).length > 0 && (
        <section className="relative rounded-2xl border border-border-primary bg-surface-card/80 p-6 shadow-sm backdrop-blur-xl dark:border-border-primary dark:bg-surface-elevated/80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-leaf-500/5 to-transparent" />
          <h2 className="relative mb-4 font-semibold text-text-primary dark:text-text-primary flex items-center gap-2">
            <Target className="h-5 w-5 text-leaf-600 dark:text-leaf-400" />
            Scans by Crop
          </h2>
          <div className="relative flex flex-wrap gap-4">
            {Object.entries(data.byCrop).map(([crop, count], index) => (
              <CropStatCard key={crop} crop={crop} count={count} index={index} />
            ))}
          </div>
        </section>
      )}

      {data?.byDisease?.length > 0 && (
        <section className="relative rounded-2xl border border-border-primary bg-surface-card/80 p-6 shadow-sm backdrop-blur-xl dark:border-border-primary dark:bg-surface-elevated/80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent" />
          <h2 className="relative mb-4 font-semibold text-text-primary dark:text-text-primary flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Disease Breakdown
          </h2>
          <div className="relative space-y-4">
            {data.byDisease.map((d, index) => (
              <div key={d.name} className="group relative rounded-xl bg-surface-elevated/50 p-4 transition-all duration-300 hover:bg-surface-elevated hover:shadow-md dark:bg-surface-card/50 border border-border-primary/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${index === 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-surface-card dark:bg-surface-elevated'} border border-border-primary/50`}>
                      <span className={`text-sm font-bold ${index === 0 ? 'text-amber-700 dark:text-amber-300' : 'text-text-secondary dark:text-text-muted'}`}>
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary dark:text-text-primary">{d.name}</p>
                      <p className="text-xs text-text-muted dark:text-text-muted">{d.count} detection{d.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-text-secondary dark:text-text-muted">{d.count}</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-border-primary dark:bg-border-primary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_rgb(245,158,11,0.4)] transition-all duration-700 ease-out"
                    style={{ width: `${(d.count / maxDisease) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data?.totalScans === 0 && (
        <div className="relative rounded-2xl border border-border-primary bg-surface-card/80 p-8 shadow-sm backdrop-blur-xl dark:border-border-primary dark:bg-surface-elevated/80 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-leaf-500/5 to-transparent" />
          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-leaf-500 to-emerald-500 text-white shadow-lg shadow-leaf-500/30">
            <Zap className="h-8 w-8" />
          </div>
          <h3 className="relative text-xl font-bold text-text-primary dark:text-text-primary">No scans yet</h3>
          <p className="relative mt-2 text-text-secondary dark:text-text-muted">Upload a leaf image to see your analytics dashboard come to life.</p>
        </div>
      )}
    </div>
  )
}