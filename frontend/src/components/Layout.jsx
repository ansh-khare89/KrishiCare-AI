import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, History, Leaf, LogIn, LogOut, Moon, Sprout, Sun, Menu, X, Sparkles, Cpu } from 'lucide-react'
import ServiceStatus from './ServiceStatus'
import { useTheme } from './ThemeProvider'
import { useAuth } from '../context/AuthContext'
import { useModelStatus } from '../context/ModelStatusContext'

const navItems = [
  { to: '/', label: 'Diagnose', icon: Sprout },
  { to: '/history', label: 'History', icon: History },
  { to: '/dashboard', label: 'Analytics', icon: BarChart3 },
  { to: '/guide', label: 'Encyclopedia', icon: BookOpen },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const { isReady, isMlLoading, coldStartElapsed } = useModelStatus()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:bg-emerald-500/30 dark:selection:text-emerald-200">
      {/* Sticky Glass Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs dark:border-slate-800/80 dark:bg-[#090d16]/85 transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform duration-300">
              <Leaf className="h-5 w-5 fill-white/20" />
              <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  KrishiCare
                </span>
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  AI 2.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">Crop Pathology & Agro-Advisory</p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 rounded-2xl bg-slate-100/90 p-1 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-md">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-800 dark:text-emerald-400'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-white/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5">
            {/* Live Model Badge */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border backdrop-blur-md transition-all shadow-2xs"
              style={{
                backgroundColor: isReady ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.1)',
                borderColor: isReady ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.35)',
                color: isReady ? '#059669' : '#d97706',
              }}
              title={isReady ? 'Neural network is online and warmed up' : `AI model is warming up (${coldStartElapsed}s)`}
            >
              <span className="relative flex h-2 w-2">
                {isReady ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </>
                )}
              </span>
              <span className="tracking-tight text-[11px]">
                {isReady ? 'AI Engine Ready' : isMlLoading ? 'Loading Weights…' : `Warming AI (${coldStartElapsed}s)`}
              </span>
            </div>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggle}
              className="rounded-xl p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/70 transition-all active:scale-95"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 border-l border-slate-200/80 pl-2.5 dark:border-slate-800">
                <div
                  className="flex items-center gap-2 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40"
                  title={user?.email}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-[10px] font-bold text-white uppercase shadow-2xs">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                  <span className="max-w-[110px] truncate hidden md:inline">{user?.name || user?.email?.split('@')[0]}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 transition-all active:scale-95"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-emerald-600/35 active:scale-95"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 bg-white/95 px-4 pt-3 pb-5 dark:border-slate-800 dark:bg-[#090d16]/95 backdrop-blur-xl animate-slide-down">
            <div className="grid gap-1.5 mb-3">
              {navItems.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>

            {!isAuthenticated && (
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In / Create Account</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <ServiceStatus />
        </div>
        <Outlet />
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60 dark:border-slate-800/80 dark:bg-[#090d16]/60 backdrop-blur-md py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">K</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">KrishiCare AI Engine</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>Supporting 38+ crop diseases & 30+ crop families</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>MobileNetV2 / EfficientNetV2</span>
            <span>•</span>
            <span>Grad-CAM Interpretability</span>
            <span>•</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

