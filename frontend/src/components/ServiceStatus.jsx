import { useEffect, useState } from 'react'
import { Activity, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { fetchHealth, wakeUpService } from '../api/client'

export default function ServiceStatus() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [wakingUp, setWakingUp] = useState(false)

  useEffect(() => {
    let active = true

    const check = async () => {
      try {
        const data = await fetchHealth()
        if (active) setStatus(data)
      } catch {
        if (active) setStatus({ status: 'unreachable' })
      } finally {
        if (active) setLoading(false)
      }
    }

    check()
    const interval = setInterval(check, 30000)
    
    // Keep-alive ping every 4 minutes to prevent Render sleep
    const keepAlive = setInterval(async () => {
      if (active) {
        await wakeUpService()
      }
    }, 240000)

    return () => {
      active = false
      clearInterval(interval)
      clearInterval(keepAlive)
    }
  }, [])

  const handleWakeUp = async () => {
    setWakingUp(true)
    await wakeUpService()
    // Re-check health after wake-up
    try {
      const data = await fetchHealth()
      setStatus(data)
    } catch {
      setStatus({ status: 'unreachable' })
    }
    setWakingUp(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-leaf-100 bg-white/80 px-4 py-2 text-sm text-earth-700">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking services…
      </div>
    )
  }

  const mlReady = status?.mlService?.modelLoaded
  const backendOk = status?.status === 'healthy'
  const mlStatus = status?.mlService?.status

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-leaf-100 bg-white/80 px-4 py-2 text-sm">
      <Activity className="h-4 w-4 text-leaf-600" />
      <span className="flex items-center gap-1.5 text-earth-700">
        {backendOk ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-leaf-600" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
        )}
        API {backendOk ? 'online' : 'offline'}
      </span>
      <span className="text-earth-300">|</span>
      <span className="flex items-center gap-1.5 text-earth-700">
        {mlReady ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-leaf-600" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
        )}
        ML model {mlReady ? 'ready' : mlStatus === 'unreachable' ? 'waking up...' : 'not trained'}
      </span>
      {!backendOk && (
        <button
          onClick={handleWakeUp}
          disabled={wakingUp}
          className="ml-2 flex items-center gap-1 rounded-lg bg-leaf-100 px-2 py-1 text-xs font-medium text-leaf-700 hover:bg-leaf-200 disabled:opacity-50"
        >
          {wakingUp ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          Wake Up
        </button>
      )}
    </div>
  )
}
