import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import AnalyticsPage from './pages/AnalyticsPage'
import EncyclopediaPage from './pages/EncyclopediaPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="dashboard" element={<AnalyticsPage />} />
          <Route path="guide" element={<EncyclopediaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
