import { useEffect, useRef, useState } from 'react'
import { Loader2, ScanSearch, CloudSun, Droplet, Thermometer, Search, AlertCircle } from 'lucide-react'
import heroImg from '../assets/hero.png'
import ImageUpload from '../components/ImageUpload'
import PredictionResult from '../components/PredictionResult'
import { SkeletonResult } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import { predictCropHealth, predictBatch, fetchWeatherAdvisory } from '../api/client'

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
      <section className="relative overflow-hidden rounded-3xl border border-leaf-200/70 bg-white/80 p-8 shadow-lg backdrop-blur-xl dark:border-earth-700 dark:bg-earth-900/50">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-leaf-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl" />

        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-leaf-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-leaf-700 dark:bg-leaf-900/50 dark:text-leaf-300">
              AI crop health
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-earth-900 dark:text-earth-50 sm:text-5xl">
              Spot leaf disease in seconds
            </h1>
            <p className="mt-4 text-lg text-earth-700/80 dark:text-earth-300">
              Upload leaf images from 30+ crops including tomato, potato, corn, apple, grape, and more. Get disease ID, confidence, and farming advice.
            </p>
          </div>
          <div className="flex justify-center">
            <img src={heroImg} alt="" className="max-h-64 w-auto drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* Weather Advisory Section */}
      <section className="rounded-3xl border border-leaf-200/60 bg-white/80 p-6 shadow-md backdrop-blur-xl dark:border-earth-700 dark:bg-earth-900/50">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-earth-900 dark:text-earth-50 flex items-center gap-2">
              <CloudSun className="h-6 w-6 text-leaf-600 dark:text-leaf-400" />
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
              className="rounded-xl border border-leaf-100/50 bg-white/80 dark:border-earth-700 dark:bg-earth-800 px-3 py-2 text-sm text-earth-900 focus:outline-none dark:text-earth-50 shadow-sm font-semibold transition-all hover:border-leaf-300 cursor-pointer"
            >
              {POPULAR_CITIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            {selectedCityOption === 'custom' && (
              <form 
                onSubmit={(e) => { e.preventDefault(); handleFetchWeather(weatherInput); }}
                className="flex items-center gap-2 bg-white/80 dark:bg-earth-800 rounded-xl p-1 shadow-inner border border-leaf-100/50 dark:border-earth-700 animate-in fade-in slide-in-from-left-2 duration-200"
              >
                <input
                  type="text"
                  value={weatherInput}
                  onChange={(e) => setWeatherInput(e.target.value)}
                  placeholder="Enter city..."
                  className="bg-transparent px-3 py-1 text-sm text-earth-900 focus:outline-none dark:text-earth-50"
                  required
                />
                <button
                  type="submit"
                  disabled={weatherLoading}
                  className="rounded-lg bg-leaf-600 p-1.5 text-white shadow-md hover:bg-leaf-700 disabled:opacity-50 transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {weatherLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-leaf-600" />
          </div>
        ) : weatherData ? (
          <div className="grid gap-6 md:grid-cols-3 items-center">
            <div className="md:col-span-2 flex flex-col justify-center rounded-2xl bg-leaf-50/50 p-5 dark:bg-leaf-900/20 border border-leaf-100/30 dark:border-earth-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-leaf-600 dark:text-leaf-400 shrink-0 mt-0.5" />
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
            
            <div className="flex items-center justify-around rounded-2xl border border-leaf-100/40 bg-earth-50/40 p-5 dark:border-earth-800 dark:bg-earth-800/30">
              <div className="text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                  <Thermometer className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs text-earth-600 dark:text-earth-400 font-medium">Temperature</p>
                <p className="text-lg font-bold text-earth-800 dark:text-earth-200 mt-0.5">{weatherData.temperature || '--'}</p>
              </div>
              <div className="h-12 w-px bg-leaf-100 dark:bg-earth-700" />
              <div className="text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-earth-900 dark:text-earth-50">Upload leaf</h2>
          <div className="flex gap-2 rounded-xl bg-earth-50 p-1 dark:bg-earth-800">
            <button
              type="button"
              onClick={() => setBatchMode(false)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${!batchMode ? 'bg-white shadow dark:bg-earth-900' : ''}`}
            >
              Single
            </button>
            <button
              type="button"
              onClick={() => setBatchMode(true)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${batchMode ? 'bg-white shadow dark:bg-earth-900' : ''}`}
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
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-earth-700 dark:text-earth-300">
              <input
                type="checkbox"
                checked={explain}
                onChange={(e) => setExplain(e.target.checked)}
                className="rounded border-leaf-300"
              />
              Show Grad-CAM heatmap (slower)
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
            className="inline-flex items-center gap-2 rounded-xl bg-leaf-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-leaf-600/30 transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-50"
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
            <button type="button" onClick={handleClear} className="text-sm text-earth-700 dark:text-earth-300">
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}
      </section>

      {loading && <SkeletonResult />}
      {result && !loading && <PredictionResult result={result} />}
      {batchResults.length > 0 && !loading && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-earth-900 dark:text-earth-50">
            Batch results ({batchResults.length})
          </h2>
          {batchResults.map((r) => (
            <PredictionResult key={r.id} result={r} />
          ))}
        </div>
      )}
    </div>
  )
}
