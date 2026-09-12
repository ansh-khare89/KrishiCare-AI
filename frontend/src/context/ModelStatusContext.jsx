import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { fetchHealth, wakeUpAllServices } from '../api/client'

const ModelStatusContext = createContext(null)

export function ModelStatusProvider({ children }) {
  const [status, setStatus] = useState(null)
  const [backendStatus, setBackendStatus] = useState('checking') // 'checking' | 'waking' | 'online' | 'offline'
  const [mlStatus, setMlStatus] = useState('checking') // 'checking' | 'waking' | 'loading_model' | 'ready' | 'offline'
  const [isWakingUp, setIsWakingUp] = useState(false)
  const [coldStartElapsed, setColdStartElapsed] = useState(0)
  const [lastChecked, setLastChecked] = useState(Date.now())
  
  const timerRef = useRef(null)
  const wakeUpAttemptRef = useRef(0)
  const activeRef = useRef(true)

  const isMlReady = Boolean(status?.mlService?.modelLoaded)
  const isMlLoading = Boolean(status?.mlService?.modelLoading)
  const isBackendOnline = status?.status === 'healthy'
  const isAllReady = isBackendOnline && isMlReady

  // Evaluate status sub-states
  const updateDerivedStatuses = useCallback((healthData) => {
    if (!healthData || healthData.status === 'unreachable') {
      setBackendStatus('waking')
      setMlStatus('waking')
      return
    }

    if (healthData.status === 'healthy') {
      setBackendStatus('online')
    } else {
      setBackendStatus('waking')
    }

    const ml = healthData.mlService
    if (ml?.modelLoaded) {
      setMlStatus('ready')
    } else if (ml?.modelLoading) {
      setMlStatus('loading_model')
    } else if (ml?.status === 'healthy') {
      setMlStatus('loading_model')
    } else {
      setMlStatus('waking')
    }
  }, [])

  // Health check worker
  const checkHealth = useCallback(async () => {
    try {
      const data = await fetchHealth()
      if (!activeRef.current) return data
      setStatus(data)
      updateDerivedStatuses(data)
      setLastChecked(Date.now())
      return data
    } catch (err) {
      if (!activeRef.current) return null
      console.warn('Health check retry during warmup:', err.message)
      const fallback = { status: 'unreachable', mlService: { status: 'unreachable', modelLoaded: false } }
      setStatus(fallback)
      updateDerivedStatuses(fallback)
      return fallback
    }
  }, [updateDerivedStatuses])

  // Explicit Trigger Wakeup
  const triggerWakeUp = useCallback(async (isInitial = false) => {
    setIsWakingUp(true)
    wakeUpAttemptRef.current += 1
    
    try {
      // Fire parallel multi-channel wake-up
      await wakeUpAllServices()
      const data = await checkHealth()
      if (data?.mlService?.modelLoaded) {
        setIsWakingUp(false)
      }
    } catch (e) {
      console.log('Wake-up ping registered:', e.message)
    }
  }, [checkHealth])

  // Initial automatic wake-up on website visit + keep-alive loop
  useEffect(() => {
    activeRef.current = true
    let elapsedTimer = null

    // 1. Fire wake-up IMMEDIATELY on component mount
    console.log('🚀 KrishiCare Website visited: Auto-triggering model wake-up in background...')
    triggerWakeUp(true)

    // Cold start seconds timer
    elapsedTimer = setInterval(() => {
      if (!isAllReady) {
        setColdStartElapsed((prev) => prev + 1)
      } else {
        setColdStartElapsed(0)
      }
    }, 1000)

    // Polling loop: every 3.5s during warmup, 20s when healthy
    const pollInterval = setInterval(() => {
      if (activeRef.current) {
        checkHealth().then((h) => {
          if (h?.mlService?.modelLoaded) {
            setIsWakingUp(false)
          }
        })
      }
    }, isAllReady ? 20000 : 3500)

    // Background heartbeat to keep Render instances awake while user is active
    const keepAlive = setInterval(() => {
      if (activeRef.current) {
        console.log('💓 Heartbeat: keeping AI servers warm')
        wakeUpAllServices()
      }
    }, 210000) // 3.5 minutes

    return () => {
      activeRef.current = false
      clearInterval(elapsedTimer)
      clearInterval(pollInterval)
      clearInterval(keepAlive)
    }
  }, [isAllReady, triggerWakeUp, checkHealth])

  return (
    <ModelStatusContext.Provider
      value={{
        status,
        backendStatus,
        mlStatus,
        isBackendOnline,
        isMlReady,
        isMlLoading,
        isReady: isAllReady,
        isWakingUp,
        coldStartElapsed,
        lastChecked,
        manualWakeUp: () => triggerWakeUp(false),
        checkHealth,
      }}
    >
      {children}
    </ModelStatusContext.Provider>
  )
}

export function useModelStatus() {
  const ctx = useContext(ModelStatusContext)
  if (!ctx) {
    throw new Error('useModelStatus must be used within a ModelStatusProvider')
  }
  return ctx
}
