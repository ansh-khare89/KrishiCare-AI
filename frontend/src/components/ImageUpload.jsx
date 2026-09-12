import { useCallback, useEffect, useRef, useState } from 'react'
import { Upload, ImageIcon, X, Check, AlertCircle, Loader2, Camera, Clipboard, Sparkles } from 'lucide-react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const MAX_SIZE_MB = 10

export default function ImageUpload({ file, preview, onFileSelect, onClear, disabled, analyzing = false }) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const inputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const containerRef = useRef(null)

  const validate = useCallback((selected) => {
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.')
      return false
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_SIZE_MB} MB.`)
      return false
    }
    setError('')
    return true
  }, [])

  const handleFile = useCallback(
    (selected) => {
      if (!selected || !validate(selected)) return
      setSelectedFileName(selected.name)
      onFileSelect(selected)
    },
    [onFileSelect, validate],
  )

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled || analyzing) return
      const dropped = e.dataTransfer.files?.[0]
      handleFile(dropped)
    },
    [disabled, analyzing, handleFile],
  )

  // Global & Container Paste Listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      if (disabled || analyzing) return
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const pastedBlob = items[i].getAsFile()
          if (pastedBlob) {
            const pastedFile = new File([pastedBlob], `pasted_leaf_${Date.now()}.png`, { type: pastedBlob.type })
            handleFile(pastedFile)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [disabled, analyzing, handleFile])

  const clearFile = () => {
    setSelectedFileName('')
    onClear()
  }

  if (preview) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-md dark:border-slate-800 group">
        <img
          src={preview}
          alt="Selected leaf"
          className="max-h-96 w-full object-contain bg-slate-950/80 transition-transform duration-300 group-hover:scale-[1.01]"
        />

        {/* Top Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {!disabled && !analyzing && (
          <button
            type="button"
            onClick={clearFile}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 p-2 text-white shadow-lg backdrop-blur-md transition-all hover:bg-red-600 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Remove image"
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {analyzing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3 text-white text-center px-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-400" />
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              </div>
              <p className="font-bold text-base tracking-tight">AI Neural Diagnosis in Progress</p>
              <p className="text-xs text-emerald-200">Evaluating 38 disease patterns with EfficientNet / MobileNet</p>
            </div>
          </div>
        )}

        {/* File name & quick info badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3.5 py-2 bg-black/70 backdrop-blur-md rounded-xl text-white/90 text-xs font-semibold">
          <div className="flex items-center gap-2 truncate">
            <ImageIcon className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="truncate">{selectedFileName || file?.name || 'Selected leaf image'}</span>
          </div>
          <span className="shrink-0 text-[10px] text-emerald-300 font-bold uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
            Image Ready
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full" ref={containerRef}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onClick={() => !disabled && !analyzing && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled && !analyzing) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 transition-all duration-300 ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[1.01]'
            : 'border-slate-300/80 bg-white/70 hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-emerald-500/40 dark:hover:bg-slate-900/70'
        } ${disabled || analyzing ? 'pointer-events-none opacity-60' : ''}`}
      >
        {/* Animated Glow Spot */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute -top-1/2 -right-1/2 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        {/* Upload Icon */}
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 shadow-sm dark:from-emerald-950/60 dark:to-slate-800 dark:text-emerald-400 group-hover:scale-105 transition-transform">
          <Upload className="h-8 w-8" />
        </div>

        {/* Primary Instructions */}
        <div className="text-center max-w-sm">
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {dragOver ? 'Drop leaf image now' : 'Upload or drop leaf photo'}
          </p>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Drag & drop, browse files, or press <kbd className="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">Ctrl+V</kbd> to paste from clipboard
          </p>
        </div>

        {/* Secondary Action Buttons (Camera & File) */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              inputRef.current?.click()
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all active:scale-95 cursor-pointer"
          >
            <ImageIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Browse Files</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              cameraInputRef.current?.click()
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all active:scale-95 cursor-pointer"
          >
            <Camera className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Use Camera</span>
          </button>
        </div>

        {/* Format Badges */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {ACCEPTED_TYPES.map((type) => (
            <span
              key={type}
              className="inline-flex items-center rounded-lg bg-slate-100/80 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800/80 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800"
            >
              {type.split('/')[1].toUpperCase()}
            </span>
          ))}
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">up to 10MB</span>
        </div>

        {/* Hidden Inputs */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          disabled={disabled || analyzing}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={disabled || analyzing}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50 animate-slide-down">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}