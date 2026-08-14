import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, History, Leaf, LogIn, LogOut, Moon, Sprout, Sun, User } from 'lucide-react'
import ServiceStatus from './ServiceStatus'
import { useTheme } from './ThemeProvider'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Diagnose', icon: Sprout },
  { to: '/history', label: 'History', icon: History },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/guide', label: 'Guide', icon: BookOpen },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen dark:bg-gradient-to-b dark:from-earth-900 dark:via-earth-900 dark:to-earth-950">
      <header className="sticky top-0 z-50 border-b border-leaf-200/60 bg-white/90 backdrop-blur-lg shadow-sm dark:border-earth-700 dark:bg-earth-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-600 text-white shadow-md shadow-leaf-600/25">
              <Leaf className="h-5 w-5" />
            </span>
            <div className="text-left">
              <p className="text-lg font-bold tracking-tight text-earth-900 dark:text-earth-50">KrishiCare</p>
              <p className="text-xs text-earth-700/70 dark:text-earth-400">Crop disease AI</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 rounded-xl bg-earth-50 p-1 dark:bg-earth-800">
              {navItems.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-white text-leaf-700 shadow-sm dark:bg-earth-900 dark:text-leaf-300'
                        : 'text-earth-700 hover:text-leaf-700 dark:text-earth-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                )
              })}
            </nav>

            <button
              type="button"
              onClick={toggle}
              className="rounded-lg p-2 text-earth-700 hover:bg-earth-100 dark:text-earth-300 dark:hover:bg-earth-800"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Auth Controls */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 border-l border-leaf-200/60 pl-2 dark:border-earth-700">
                <div
                  className="flex items-center gap-1.5 rounded-xl bg-leaf-50 px-2.5 py-1.5 text-xs font-semibold text-leaf-800 dark:bg-leaf-950/50 dark:text-leaf-300"
                  title={user?.email}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-leaf-600 text-[11px] font-bold text-white uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                  <span className="max-w-[100px] truncate hidden md:inline">{user?.name || user?.email}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-earth-600 hover:bg-red-50 hover:text-red-600 dark:text-earth-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 rounded-xl bg-leaf-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm shadow-leaf-600/25 transition-all hover:bg-leaf-700 active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6">
          <ServiceStatus />
        </div>
        <Outlet />
      </main>

      <footer className="border-t border-leaf-100 py-6 text-center text-sm text-earth-700/60 dark:border-earth-800 dark:text-earth-500">
        © {new Date().getFullYear()} KrishiCare — AI-powered crop disease detection for 30+ crops
      </footer>
    </div>
  )
}
