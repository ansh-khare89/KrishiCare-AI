import { Link, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, BookOpen, History, Leaf, Moon, Sprout, Sun } from 'lucide-react'
import ServiceStatus from './ServiceStatus'
import { useTheme } from './ThemeProvider'

const navItems = [
  { to: '/', label: 'Diagnose', icon: Sprout },
  { to: '/history', label: 'History', icon: History },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/guide', label: 'Guide', icon: BookOpen },
]

export default function Layout() {
  const location = useLocation()
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-screen dark:bg-gradient-to-b dark:from-earth-900 dark:via-earth-900 dark:to-earth-950">
      <header className="sticky top-0 z-50 border-b border-leaf-200/60 bg-white/90 backdrop-blur-lg shadow-sm dark:border-earth-700 dark:bg-earth-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
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
            <button
              type="button"
              onClick={toggle}
              className="rounded-lg p-2 text-earth-700 hover:bg-earth-100 dark:text-earth-300 dark:hover:bg-earth-800"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <nav className="flex items-center gap-1 rounded-xl bg-earth-50 p-1 dark:bg-earth-800">
              {navItems.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
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
