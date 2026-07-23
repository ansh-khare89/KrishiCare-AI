import { useEffect, useState } from 'react'
import { Activity, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import api from '../api/client'

export default function ServiceStatus() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const check = async () => {
      try {
        const { data } = await api.get('/api/health')
        if (active) setStatus(data)
      } catch {
        if (active) setStatus({ status: 'unreachable' })
      } finally {
        if (active) setLoading(false)
      }
    }

    check()
    const interval = setInterval(check, 30000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

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
        ML model {mlReady ? 'ready' : 'not trained'}
      </span>
    </div>
  )
}
