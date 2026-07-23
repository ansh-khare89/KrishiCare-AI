import { useEffect, useState } from 'react'
import { Loader2, ScanSearch } from 'lucide-react'
import heroImg from '../assets/hero.png'
import ImageUpload from '../components/ImageUpload'
import PredictionResult from '../components/PredictionResult'
import { SkeletonResult } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import { predictCropHealth, predictBatch } from '../api/client'

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
        const message = err.response?.data?.message || 'Batch failed.'
        setError(message)
        push('Batch failed', 'error')
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
        err.response?.data ||
        err.message ||
        'Something went wrong. Check that backend and ML service are up.'
      setError(typeof message === 'string' ? message : 'Unexpected error.')
      push('Prediction failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-leaf-100 bg-white/60 p-8 shadow-sm backdrop-blur-md dark:border-earth-700 dark:bg-earth-900/50">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-leaf-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-leaf-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-leaf-700 dark:bg-leaf-900/50 dark:text-leaf-300">
              AI crop health
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-earth-900 dark:text-earth-50 sm:text-5xl">
              Spot leaf disease in seconds
            </h1>
            <p className="mt-4 text-lg text-earth-700/80 dark:text-earth-300">
              Upload a tomato or potato leaf. Get disease ID, confidence, and farming advice.
            </p>
          </div>
          <div className="flex justify-center">
            <img src={heroImg} alt="" className="max-h-64 w-auto drop-shadow-xl" />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-leaf-100 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-earth-700 dark:bg-earth-900/60 sm:p-8">
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
