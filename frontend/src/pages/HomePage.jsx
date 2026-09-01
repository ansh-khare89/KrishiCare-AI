import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, ScanSearch, CloudSun, Droplet, Thermometer, Search, AlertCircle, Lock, Sparkles, UserPlus, LogIn, ArrowRight } from 'lucide-react'
import heroImg from '../assets/hero.png'
import ImageUpload from '../components/ImageUpload'
import PredictionResult from '../components/PredictionResult'
import { SkeletonResult } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import { predictCropHealth, predictBatch, fetchWeatherAdvisory } from '../api/client'
import { useAuth } from '../context/AuthContext'


const POPULAR_CITIES = [
  { value: 'New Delhi', label: 'New Delhi (NCR)' },
  { value: 'Mumbai', label: 'Mumbai (Maharashtra)' },
  { value: 'Bengaluru', label: 'Bengaluru (Karnataka)' },
  { value: 'Chennai', label: 'Chennai (Tamil Nadu)' },
  { value: 'Kolkata', label: 'Kolkata (West Bengal)' },
  { value: 'Hyderabad', label: 'Hyderabad (Telangana)' },
  { value: 'Pune', label: 'Pune (Maharashtra)' },
  { value: 'Jaipur', label: 'Jaipur (Rajasthan)' },
  { value: 'Lucknow', label: 'Lucknow (Uttar Pradesh)' },
  { value: 'Patna', label: 'Patna (Bihar)' },
  { value: 'Bhopal', label: 'Bhopal (Madhya Pradesh)' },
  { value: 'Chandigarh', label: 'Chandigarh (Punjab/Haryana)' },
  { value: 'Amritsar', label: 'Amritsar (Punjab)' },
  { value: 'Nashik', label: 'Nashik (Maharashtra)' },
  { value: 'Nagpur', label: 'Nagpur (Maharashtra)' },
  { value: 'Coimbatore', label: 'Coimbatore (Tamil Nadu)' },
  { value: 'Vijayawada', label: 'Vijayawada (Andhra Pradesh)' },
  { value: 'Guwahati', label: 'Guwahati (Assam)' },
  { value: 'Srinagar', label: 'Srinagar (Jammu & Kashmir)' },
  { value: 'Ranchi', label: 'Ranchi (Jharkhand)' },
  { value: 'Shimla', label: 'Shimla (Himachal Pradesh)' },
  { value: 'custom', label: 'Other (Type manually)...' }
]

export default function HomePage() {
  const { push } = useToast()
  const { isAuthenticated, user } = useAuth()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [explain, setExplain] = useState(false)
  const [batchMode, setBatchMode] = useState(false)
  const [batchFiles, setBatchFiles] = useState([])
  const [batchResults, setBatchResults] = useState([])
  const [weatherCity, setWeatherCity] = useState('New Delhi')
  const [weatherInput, setWeatherInput] = useState('New Delhi')
  const [selectedCityOption, setSelectedCityOption] = useState('New Delhi')
  const [weatherData, setWeatherData] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const weatherRequestId = useRef(0)

  const handleFetchWeather = async (cityToFetch) => {
    if (!cityToFetch?.trim()) return
    const requestId = ++weatherRequestId.current
    setWeatherLoading(true)
    setWeatherCity(cityToFetch)
    setWeatherData(null) // clear stale data immediately so heading doesn't show old city
    try {
      const data = await fetchWeatherAdvisory(cityToFetch)
      if (requestId !== weatherRequestId.current) return
      setWeatherData(data)
      setWeatherCity(data.city || cityToFetch)
    } catch (err) {
      if (requestId !== weatherRequestId.current) return
      console.error('Weather fetch error:', err)
      setWeatherCity(cityToFetch)
      setWeatherData({
        city: cityToFetch,
        advisory: 'Weather service temporarily unavailable. Showing general advisory: Humid conditions favor fungal diseases — avoid evening irrigation and ensure good airflow between plants.',
        temperature: '--',
        humidity: '--',
        condition: '--',
      })
    } finally {
      if (requestId === weatherRequestId.current) {
        setWeatherLoading(false)
      }
    }
  }

  useEffect(() => {
    handleFetchWeather('New Delhi')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleFileSelect = (selected) => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setResult(null)
    setError('')
  }

  const handleClear = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setResult(null)
    setError('')
  }

  const handleAnalyze = async () => {
    if (!isAuthenticated) {
      setError('Please sign in or create an account to diagnose crop leaves.')
      push('Sign in required to run diagnosis', 'error')
      return
    }

    if (batchMode) {
      if (batchFiles.length === 0) return
      setLoading(true)
      setError('')
      setBatchResults([])
      setResult(null)
      try {
        const data = await predictBatch(batchFiles)
        setBatchResults(data)
        push(`Analyzed ${data.length} images`, 'success')
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Batch failed. Please check if services are running.'
        setError(message)
        push('Batch failed. Try clicking "Wake Up" in the service status.', 'error')
      } finally {
        setLoading(false)
      }
      return
    }

    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    setBatchResults([])

    try {
      const data = await predictCropHealth(file, explain)
      setResult(data)
      push('Diagnosis ready', 'success')
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Prediction failed. Please check if services are running and try again.'
      const displayMessage = message.includes('not loaded') || message.includes('not trained')
        ? 'ML model is not ready. Start the ML service (port 8000) or run scripts/train-model.ps1 to train the model.'
        : (typeof message === 'string' ? message : 'Unexpected error.')
      setError(displayMessage)
      push('Prediction failed. Try clicking "Wake Up" in the service status.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-leaf-200/70 bg-gradient-to-br from-white via-leaf-50/50 to-sky-50/50 p-8 shadow-2xl backdrop-blur-xl dark:border-earth-800/50 dark:bg-gradient-to-br dark:from-earth-900/60 dark:via-earth-900/80 dark:to-earth-950/60">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-leaf-400/30 to-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-br from-sky-400/20 to-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-leaf-500/5 to-transparent blur-3xl" />

        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-leaf-100/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-leaf-700 dark:bg-leaf-900/50 dark:text-leaf-300 border border-leaf-200/50 dark:border-earth-800/50 shadow-sm">
              AI crop health
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-earth-900 dark:text-earth-50 sm:text-5xl">
              Spot leaf disease in <span className="gradient-text">seconds</span>
            </h1>
            <p className="mt-4 text-lg text-earth-700/80 dark:text-earth-300">
              Upload leaf images from 30+ crops including tomato, potato, corn, apple, grape, and more. Get disease ID, confidence, and farming advice.
            </p>
          </div>
          <div className="flex justify-center relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-leaf-500/10 via-transparent to-sky-500/10 rounded-3xl blur-2xl" />
            <img src={heroImg} alt="" className="relative max-h-64 w-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Weather Advisory Section */}
      <section className="relative overflow-hidden rounded-3xl border border-leaf-200/60 bg-gradient-to-br from-white via-leaf-50/30 to-sky-50/30 p-6 shadow-xl backdrop-blur-xl dark:border-earth-800/50 dark:bg-gradient-to-br dark:from-earth-900/60 dark:via-earth-900/80 dark:to-earth-950/60">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-leaf-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-sky-400/10 blur-3xl" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative">
          <div>
            <h2 className="text-xl font-bold text-earth-900 dark:text-earth-50 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-leaf-500 to-emerald-500 text-white shadow-lg shadow-leaf-500/25">
                <CloudSun className="h-5 w-5" />
              </span>
              Live Agro-Weather Advisory
            </h2>
            <p className="text-sm text-earth-700/80 dark:text-earth-400">
              Get disease risk alerts and watering advice based on your local weather.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCityOption}
              onChange={(e) => {
                const val = e.target.value
                setSelectedCityOption(val)
                if (val !== 'custom') {
                  setWeatherInput(val)
                  handleFetchWeather(val)
                } else {
                  setWeatherInput('')
                }
              }}
              className="rounded-xl border border-leaf-200/60 bg-white/90 dark:border-earth-700 dark:bg-earth-900/80 px-3 py-2 text-sm text-earth-900 focus:outline-none dark:text-earth-100 shadow-sm font-semibold transition-all hover:border-leaf-300 hover:shadow-md cursor-pointer backdrop-blur-sm"
            >
              {POPULAR_CITIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            {selectedCityOption === 'custom' && (
              <form 
                onSubmit={(e) => { e.preventDefault(); handleFetchWeather(weatherInput); }}
                className="flex items-center gap-2 bg-white/90 dark:bg-earth-900/80 rounded-xl p-1 shadow-inner border border-leaf-200/60 dark:border-earth-700 animate-in fade-in slide-in-from-left-2 duration-200 backdrop-blur-sm"
              >
                <input
                  type="text"
                  value={weatherInput}
                  onChange={(e) => setWeatherInput(e.target.value)}
                  placeholder="Enter city..."
                  className="bg-transparent px-3 py-1 text-sm text-earth-900 focus:outline-none dark:text-earth-100"
                  required
                />
                <button
                  type="submit"
                  disabled={weatherLoading}
                  className="rounded-lg bg-gradient-to-r from-leaf-600 to-emerald-600 p-1.5 text-white shadow-lg shadow-leaf-600/25 hover:from-leaf-700 hover:to-emerald-700 hover:shadow-leaf-600/35 disabled:opacity-50 transition-all"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {weatherLoading ? (
          <div className="flex items-center justify-center py-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-leaf-500/10 via-transparent to-sky-500/10 rounded-2xl blur-xl" />
            <Loader2 className="h-6 w-6 animate-spin text-leaf-600 relative" />
          </div>
        ) : weatherData ? (
          <div className="grid gap-6 md:grid-cols-3 items-center relative">
            <div className="md:col-span-2 flex flex-col justify-center rounded-2xl bg-gradient-to-br from-leaf-50/80 to-leaf-100/50 p-5 dark:from-leaf-900/30 dark:to-leaf-900/10 border border-leaf-200/50 dark:border-earth-800/50 shadow-lg shadow-leaf-500/5 dark:shadow-leaf-900/5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100/80 text-leaf-600 dark:bg-leaf-900/50 dark:text-leaf-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-semibold text-leaf-800 dark:text-leaf-300 text-sm mb-1">
                    Advisory for {weatherData.city || weatherCity}
                  </h4>
                  <p className="text-sm text-earth-800 dark:text-earth-200 leading-relaxed font-medium">
                    {weatherData.advisory || "No weather advisory returned."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-around rounded-2xl border border-leaf-200/50 bg-gradient-to-br from-earth-50/80 to-earth-100/50 p-5 dark:border-earth-800/50 dark:from-earth-900/50 dark:to-earth-900/30 shadow-lg">
              <div className="text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25">
                  <Thermometer className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs text-earth-600 dark:text-earth-400 font-medium">Temperature</p>
                <p className="text-lg font-bold text-earth-800 dark:text-earth-200 mt-0.5">{weatherData.temperature || '--'}</p>
              </div>
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-leaf-200/50 to-transparent dark:via-earth-700/50" />
              <div className="text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-lg shadow-blue-500/25">
                  <Droplet className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs text-earth-600 dark:text-earth-400 font-medium">Humidity</p>
                <p className="text-lg font-bold text-earth-800 dark:text-earth-200 mt-0.5">{weatherData.humidity || '--'}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-earth-500 text-center py-4">Search a city to view crop safety tip.</p>
        )}
      </section>

      <section className="rounded-3xl border border-leaf-200/60 bg-white/80 p-6 shadow-md backdrop-blur-xl dark:border-earth-700 dark:bg-earth-900/60 sm:p-8">
        {!isAuthenticated ? (
          <div className="py-6 text-center sm:py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-leaf-600 to-emerald-500 text-white shadow-lg shadow-leaf-600/30">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-earth-900 dark:text-earth-50 sm:text-3xl">
              Sign in to scan & diagnose crops
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-base text-earth-700/80 dark:text-earth-300">
              Create a free account or log in to run AI disease predictions and save your diagnostic history permanently across all your devices.
            </p>

            <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/auth?tab=login&redirect=/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-leaf-600/25 transition hover:bg-leaf-700 active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In to Scan</span>
              </Link>
              <Link
                to="/auth?tab=register&redirect=/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-leaf-200 bg-white px-6 py-3 text-sm font-semibold text-leaf-700 shadow-sm transition hover:bg-leaf-50 dark:border-earth-700 dark:bg-earth-900 dark:text-leaf-300"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Free Account</span>
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 text-left border-t border-leaf-100 pt-6 dark:border-earth-800">
              <div className="flex items-start gap-2 text-xs text-earth-700 dark:text-earth-300">
                <Sparkles className="h-4 w-4 text-leaf-600 dark:text-leaf-400 shrink-0 mt-0.5" />
                <span>Fast AI leaf diagnosis for 30+ crops</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-earth-700 dark:text-earth-300">
                <Sparkles className="h-4 w-4 text-leaf-600 dark:text-leaf-400 shrink-0 mt-0.5" />
                <span>Permanent scan & treatment history</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-earth-700 dark:text-earth-300">
                <Sparkles className="h-4 w-4 text-leaf-600 dark:text-leaf-400 shrink-0 mt-0.5" />
                <span>Personalized analytics & insights</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-earth-900 dark:text-earth-50">Upload leaf</h2>
                <p className="text-xs text-earth-600 dark:text-earth-400">Logged in as {user?.name || user?.email}</p>
              </div>
              <div className="flex gap-1.5 rounded-xl bg-earth-100/80 p-1 dark:bg-earth-900/60 backdrop-blur-sm border border-leaf-200/40 dark:border-earth-800/40">
                <button
                  type="button"
                  onClick={() => setBatchMode(false)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    !batchMode 
                      ? 'bg-white shadow-sm text-leaf-700 dark:bg-earth-900 dark:text-leaf-300' 
                      : 'text-earth-700 hover:text-leaf-700 dark:text-earth-300 dark:hover:text-earth-100 dark:hover:bg-earth-800/50'
                  }`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setBatchMode(true)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    batchMode 
                      ? 'bg-white shadow-sm text-leaf-700 dark:bg-earth-900 dark:text-leaf-300' 
                      : 'text-earth-700 hover:text-leaf-700 dark:text-earth-300 dark:hover:text-earth-100 dark:hover:bg-earth-800/50'
                  }`}
                >
                  Batch
                </button>
              </div>
            </div>

            {!batchMode ? (
              <>
                <ImageUpload
                  file={file}
                  preview={preview}
                  onFileSelect={handleFileSelect}
                  onClear={handleClear}
                  disabled={loading}
                />
                <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-earth-700 dark:text-earth-300 group">
                  <input
                    type="checkbox"
                    checked={explain}
                    onChange={(e) => setExplain(e.target.checked)}
                    className="rounded border-leaf-300 h-4 w-4 text-leaf-600 focus:ring-2 focus:ring-leaf-500/30"
                  />
                  <span className="group-hover:text-leaf-700 dark:group-hover:text-leaf-300 transition-colors">Show Grad-CAM heatmap (slower)</span>
                </label>
              </>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={loading}
                  onChange={(e) => setBatchFiles(Array.from(e.target.files || []))}
                  className="block w-full text-sm text-earth-600 file:mr-4 file:rounded-lg file:border-0 file:bg-leaf-600 file:px-4 file:py-2 file:text-white"
                />
                {batchFiles.length > 0 && (
                  <p className="mt-2 text-sm text-earth-600 dark:text-earth-400">
                    {batchFiles.length} file(s) selected
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || (batchMode ? batchFiles.length === 0 : !file)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-leaf-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-leaf-600/30 transition-all hover:from-leaf-700 hover:to-emerald-700 hover:shadow-leaf-600/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running model…
                  </>
                ) : (
                  <>
                    <ScanSearch className="h-4 w-4" />
                    Analyze
                  </>
                )}
              </button>
              {file && !loading && (
                <button type="button" onClick={handleClear} className="text-sm text-earth-700 dark:text-earth-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium">
                  Clear
                </button>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}
      </section>

      {loading && <SkeletonResult />}
      {result && !loading && <PredictionResult result={result} fallbackPreview={preview} />}
      {batchResults.length > 0 && !loading && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-earth-900 dark:text-earth-50">
            Batch results ({batchResults.length})
          </h2>
          {batchResults.map((r) => (
            <PredictionResult key={r.id || r.diseaseName} result={r} />
          ))}
        </div>
      )}
    </div>
  )
}
