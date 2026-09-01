import { createContext, useCallback, useContext, useState, useEffect, useRef } from 'react'
import { CheckCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = 'info', options = {}) => {
    const id = crypto.randomUUID()
    const toast = { 
      id, 
      message, 
      type, 
      duration: options.duration ?? (type === 'error' ? 5000 : 3500),
      action: options.action,
      dismissible: options.dismissible ?? true
    }
    
    setToasts((prev) => [...prev, toast])
    
    if (toast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, toast.duration)
    }
    
    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = useCallback((message, options) => push(message, 'success', options), [push])
  const error = useCallback((message, options) => push(message, 'error', options), [push])
  const info = useCallback((message, options) => push(message, 'info', options), [push])
  const warning = useCallback((message, options) => push(message, 'warning', options), [push])
  const loading = useCallback((message, options) => push(message, 'loading', { ...options, duration: 0 }), [push])

  return (
    <ToastContext.Provider value={{ push, dismiss, dismissAll, success, error, info, warning, loading }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col-reverse gap-3 pointer-events-none sm:bottom-6 sm:right-6">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const progressRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true))
    
    // Progress bar animation for timed toasts
    if (toast.duration > 0) {
      timeoutRef.current = setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.transitionDuration = '0ms'
          progressRef.current.style.width = '0%'
        }
      }, 50)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [toast.duration])

  const handleDismiss = () => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), 200)
  }

  const configs = {
    success: { 
      icon: CheckCircle, 
      bg: 'bg-gradient-to-r from-emerald-500 to-teal-500', 
      border: 'border-emerald-400/30',
      text: 'text-white',
      iconBg: 'bg-white/20'
    },
    error: { 
      icon: AlertCircle, 
      bg: 'bg-gradient-to-r from-red-500 to-rose-500', 
      border: 'border-red-400/30',
      text: 'text-white',
      iconBg: 'bg-white/20'
    },
    warning: { 
      icon: AlertCircle, 
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500', 
      border: 'border-amber-400/30',
      text: 'text-white',
      iconBg: 'bg-white/20'
    },
    info: { 
      icon: Info, 
      bg: 'bg-gradient-to-r from-sky-500 to-blue-500', 
      border: 'border-sky-400/30',
      text: 'text-white',
      iconBg: 'bg-white/20'
    },
    loading: { 
      icon: Loader2, 
      bg: 'bg-gradient-to-r from-violet-500 to-purple-500', 
      border: 'border-violet-400/30',
      text: 'text-white',
      iconBg: 'bg-white/20'
    }
  }

  const config = configs[toast.type] || configs.info
  const Icon = config.icon

  return (
    <div 
      className={`relative pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-md rounded-2xl border shadow-2xl backdrop-blur-xl overflow-hidden transform transition-all duration-300 ease-out ${
        config.bg
      } ${config.border} ${config.text} ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${exiting ? 'translate-x-full opacity-0 scale-95' : ''}`}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      {/* Left icon */}
      <div className="relative shrink-0 mt-0.5">
        <div className={`rounded-xl p-2 ${config.iconBg}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
          {toast.type === 'loading' && <span className="animate-spin absolute inset-0" />}
        </div>
        {/* Pulse ring for important toasts */}
        {(toast.type === 'error' || toast.type === 'success') && (
          <div className="absolute inset-0 rounded-xl bg-white/20 animate-ping" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
        
        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      {toast.dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Progress bar */}
      {toast.duration > 0 && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-white/30"
          ref={progressRef}
          style={{ 
            width: '100%',
            transition: `width ${toast.duration}ms linear`,
            transformOrigin: 'left center'
          }}
        />
      )}

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shine_3s_infinite]" />
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Helper hook for promise-based toasts
export function usePromiseToast() {
  const { loading, success, error, dismiss } = useToast()
  
  const promise = useCallback(async (promise, messages) => {
    const loadingId = loading(messages.loading || 'Loading...', { duration: 0 })
    try {
      const result = await promise
      dismiss(loadingId)
      success(messages.success || 'Success!')
      return result
    } catch (err) {
      dismiss(loadingId)
      error(messages.error || 'Something went wrong')
      throw err
    }
  }, [loading, success, error, dismiss])

  return { promise }
}