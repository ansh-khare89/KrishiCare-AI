import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ModelStatusProvider } from './context/ModelStatusContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import AnalyticsPage from './pages/AnalyticsPage'
import EncyclopediaPage from './pages/EncyclopediaPage'
import AuthPage from './pages/AuthPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ModelStatusProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="auth" element={<AuthPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="dashboard" element={<AnalyticsPage />} />
              <Route path="guide" element={<EncyclopediaPage />} />
            </Route>
          </Routes>
        </ModelStatusProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

