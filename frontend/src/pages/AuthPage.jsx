import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Leaf, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('tab') === 'register' ? 'register' : 'login'
  const redirect = searchParams.get('redirect') || '/'

  const [mode, setMode] = useState(initialMode) // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('Please enter your name.')
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.')
        }
        await register(name.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
      navigate(redirect)
    } catch (err) {
      console.error('Auth error:', err)
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        'Authentication failed. Please check your credentials.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-6 sm:py-12">
      {/* Header Badge & Title */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-600 to-emerald-600 text-white shadow-lg shadow-leaf-600/30">
          <Leaf className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-earth-900 dark:text-earth-50 sm:text-3xl">
          {mode === 'login' ? 'Welcome back to KrishiCare' : 'Create your KrishiCare account'}
        </h1>
        <p className="mt-2 text-sm text-earth-700/70 dark:text-earth-400">
          {mode === 'login'
            ? 'Sign in to access AI crop diagnosis & your scan history'
            : 'Sign up to diagnose crop diseases and save your results'}
        </p>
      </div>

      {/* Auth Card */}
      <div className="relative overflow-hidden rounded-3xl border border-leaf-200/80 bg-gradient-to-br from-white via-leaf-50/50 to-sky-50/50 p-6 shadow-2xl backdrop-blur-xl dark:border-earth-800/50 dark:from-earth-900/60 dark:via-earth-900/80 dark:to-earth-950/60">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-leaf-400/20 to-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-gradient-to-br from-sky-400/15 to-blue-400/10 blur-3xl" />
        
        {/* Tab switch */}
        <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-2xl bg-earth-100/80 p-1.5 dark:bg-earth-900/60 backdrop-blur-sm border border-leaf-200/40 dark:border-earth-800/40 relative">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError('')
            }}
            className={`rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
              mode === 'login'
                ? 'bg-white text-leaf-800 shadow-sm dark:bg-earth-900 dark:text-leaf-300'
                : 'text-earth-600 hover:text-earth-900 dark:text-earth-400 dark:hover:text-earth-100'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError('')
            }}
            className={`rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
              mode === 'register'
                ? 'bg-white text-leaf-800 shadow-sm dark:bg-earth-900 dark:text-leaf-300'
                : 'text-earth-600 hover:text-earth-900 dark:text-earth-400 dark:hover:text-earth-100'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200/60 bg-red-50/90 p-3.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {mode === 'register' && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-earth-700 dark:text-earth-300">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-earth-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-leaf-200/60 bg-white/90 py-2.5 pl-10 pr-4 text-sm text-earth-900 placeholder:text-earth-400 focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20 dark:border-earth-700 dark:bg-earth-900/80 dark:text-earth-100 dark:focus:border-leaf-400 dark:focus:bg-earth-900 backdrop-blur-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-earth-700 dark:text-earth-300">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-earth-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-leaf-200/60 bg-white/90 py-2.5 pl-10 pr-4 text-sm text-earth-900 placeholder:text-earth-400 focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20 dark:border-earth-700 dark:bg-earth-900/80 dark:text-earth-100 dark:focus:border-leaf-400 dark:focus:bg-earth-900 backdrop-blur-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-earth-700 dark:text-earth-300">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-earth-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-leaf-200/60 bg-white/90 py-2.5 pl-10 pr-10 text-sm text-earth-900 placeholder:text-earth-400 focus:border-leaf-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500/20 dark:border-earth-700 dark:bg-earth-900/80 dark:text-earth-100 dark:focus:border-leaf-400 dark:focus:bg-earth-900 backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-leaf-600 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-leaf-600/25 transition-all hover:from-leaf-700 hover:to-emerald-700 hover:shadow-leaf-600/35 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to KrishiCare' : 'Create Free Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Benefits list */}
        <div className="mt-6 border-t border-leaf-200/60 pt-5 dark:border-earth-800 relative">
          <div className="flex items-center gap-2 text-xs font-medium text-earth-700/80 dark:text-earth-300">
            <Sparkles className="h-4 w-4 text-leaf-600 dark:text-leaf-400 shrink-0" />
            <span>Diagnose 30+ crop diseases & keep a permanent diagnosis log</span>
          </div>
        </div>
      </div>
    </div>
  )
}
