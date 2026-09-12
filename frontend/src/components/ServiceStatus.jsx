import { useState } from 'react'
import { Activity, CheckCircle2, Loader2, RefreshCw, Server, Cpu, Sparkles, AlertCircle, Zap } from 'lucide-react'
import { useModelStatus } from '../context/ModelStatusContext'

export default function ServiceStatus() {
  const {
    isReady,
    isBackendOnline,
    isMlReady,
    isMlLoading,
    isWakingUp,
    coldStartElapsed,
    manualWakeUp,
  } = useModelStatus()

  const [collapsed, setCollapsed] = useState(false)

  // If everything is operational, render a compact subtle pill
  if (isReady) {
    if (collapsed) return null
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-800/40 backdrop-blur-md shadow-2xs transition-all">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold">Neural Engine Operational</span>
          <span className="text-emerald-400 dark:text-emerald-700">|</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">Ready for instant sub-second leaf inference</span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="text-[11px] text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    )
  }

  // During cold start / waking up
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-emerald-50/80 p-4 shadow-sm backdrop-blur-md dark:border-amber-900/50 dark:from-slate-900/90 dark:via-amber-950/40 dark:to-slate-900/90">
      {/* Background Animated Glow */}
      <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Status Message & Steps */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <Loader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>Waking Up Cloud AI Engine</span>
                <span className="rounded-md bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.2 text-[10px] font-extrabold text-amber-800 dark:text-amber-300">
                  {coldStartElapsed}s elapsed
                </span>
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Free-tier cloud servers spin down after 15m of inactivity. Booting deep learning containers…
              </p>
            </div>
          </div>

          {/* Progressive 3-Step Indicator */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold">
            {/* Step 1: Backend */}
            <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border transition-all ${
              isBackendOnline
                ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100/70 text-amber-800 border-amber-300/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
            }`}>
              {isBackendOnline ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Loader2 className="h-3 w-3 animate-spin text-amber-600" />}
              <span>1. Cloud API {isBackendOnline ? 'Online' : 'Booting…'}</span>
            </div>

            {/* Step 2: ML Service Container */}
            <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border transition-all ${
              isMlReady || isMlLoading
                ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100/70 text-amber-800 border-amber-300/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
            }`}>
              {isMlReady || isMlLoading ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Loader2 className="h-3 w-3 animate-spin text-amber-600" />}
              <span>2. Python ML {isMlReady || isMlLoading ? 'Connected' : 'Connecting…'}</span>
            </div>

            {/* Step 3: Neural Model */}
            <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border transition-all ${
              isMlReady
                ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100/70 text-amber-800 border-amber-300/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
            }`}>
              {isMlReady ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Cpu className="h-3.5 w-3.5 text-amber-600 animate-pulse" />}
              <span>3. Model Weights {isMlReady ? 'Loaded' : 'Loading…'}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={manualWakeUp}
            disabled={isWakingUp}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isWakingUp ? 'animate-spin' : ''}`} />
            <span>Force Wake-Up Ping</span>
          </button>
        </div>
      </div>
    </div>
  )
}

