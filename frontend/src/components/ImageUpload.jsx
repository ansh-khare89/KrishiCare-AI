import { useCallback, useRef, useState } from 'react'
import { Upload, ImageIcon, X, Check, AlertCircle, Loader2 } from 'lucide-react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const MAX_SIZE_MB = 10

export default function ImageUpload({ file, preview, onFileSelect, onClear, disabled, analyzing = false }) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const inputRef = useRef(null)

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
      if (disabled) return
      const dropped = e.dataTransfer.files?.[0]
      handleFile(dropped)
    },
    [disabled, handleFile],
  )

  const clearFile = () => {
    setSelectedFileName('')
    onClear()
  }

  if (preview) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border-primary bg-surface-card shadow-sm dark:border-border-primary dark:bg-surface-elevated group">
        <img 
          src={preview} 
          alt="Selected leaf" 
          className="max-h-80 w-full object-contain bg-surface-elevated dark:bg-surface-card transition-transform duration-300 group-hover:scale-[1.01]"
        />
        
        {/* Top overlay with crop info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        
        {!disabled && !analyzing && (
          <button
            type="button"
            onClick={clearFile}
            className="absolute right-3 top-3 z-10 rounded-full bg-surface-card/90 p-2 text-text-secondary shadow-lg backdrop-blur-sm transition-all hover:bg-red-500/90 hover:text-white hover:scale-110 dark:bg-surface-elevated/90 dark:text-text-muted"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {analyzing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3 text-white">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-leaf-400" />
                <div className="absolute inset-0 rounded-full bg-leaf-500/30 animate-ping" />
              </div>
              <p className="font-medium">Analyzing leaf...</p>
              <p className="text-sm text-white/70">AI is examining the image</p>
            </div>
          </div>
        )}
        
        {/* File name badge */}
        <div className="absolute bottom-3 left-3 right-3 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-xl text-white/90 text-sm font-medium truncate">
          {selectedFileName || file?.name || 'Selected image'}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onClick={() => !disabled && !analyzing && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled && !analyzing) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 transition-all duration-300 ${
          dragOver
            ? 'border-leaf-500 bg-gradient-to-br from-leaf-500/10 to-emerald-500/10 dark:from-leaf-900/20 dark:to-emerald-900/20'
            : 'border-border-primary bg-surface-card/50 hover:border-leaf-500/50 hover:bg-leaf-500/5 dark:hover:border-leaf-500/30 dark:bg-surface-elevated/30 dark:hover:bg-leaf-500/10'
        } ${disabled || analyzing ? 'pointer-events-none opacity-60' : ''}`}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
          <div className="absolute -top-1/2 -right-1/2 h-[80%] w-[80%] rounded-full bg-leaf-500/10 blur-3xl animate-pulse-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Upload Icon Area */}
        <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110">
          {dragOver ? (
            <>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-leaf-500 to-emerald-500 animate-ping opacity-75" />
              <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-500 to-emerald-500 text-white shadow-xl shadow-leaf-500/30">
                <ImageIcon className="h-10 w-10" />
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-leaf-500/20 to-emerald-500/20" />
              <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-100 to-emerald-100 text-leaf-600 shadow-lg dark:from-leaf-900/50 dark:to-emerald-900/30 dark:text-leaf-400">
                <Upload className="h-10 w-10" />
              </div>
            </>
          )}
        </div>

        {/* Main Text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-text-primary dark:text-text-primary">
            {dragOver ? 'Drop your leaf image here' : 'Upload a leaf photo'}
          </p>
          <p className="mt-2 text-sm text-text-secondary dark:text-text-muted max-w-xs">
            Drag & drop or click to browse — JPEG, PNG, WebP up to {MAX_SIZE_MB} MB
          </p>
        </div>

        {/* Supported formats badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {ACCEPTED_TYPES.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-elevated/50 px-2.5 py-1 text-xs font-medium text-text-muted border border-border-primary/50 dark:bg-surface-card/50 dark:border-border-primary/50"
            >
              <ImageIcon className="h-3 w-3" />
              {type.split('/')[1].toUpperCase()}
            </span>
          ))}
        </div>

        {/* Features hints */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-leaf-500" />
            AI-powered analysis
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-leaf-500" />
            Instant results
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-leaf-500" />
            Treatment recommendations
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          disabled={disabled || analyzing}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200/50 dark:border-red-900/30 animate-slide-down">
          <div className="relative flex items-center justify-center">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          </div>
          {error}
        </div>
      )}

      {selectedFileName && !preview && !analyzing && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-leaf-50/80 px-4 py-3 text-sm text-leaf-800 dark:bg-leaf-950/30 dark:text-leaf-400 border border-leaf-200/50 dark:border-leaf-900/30 animate-slide-down">
          <div className="relative flex items-center justify-center">
            <Check className="h-5 w-5 text-leaf-600 dark:text-leaf-400" />
            <span className="absolute inset-0 rounded-full bg-leaf-500/20 animate-ping" />
          </div>
          <span className="font-medium">Selected:</span>
          <span className="truncate max-w-xs">{selectedFileName}</span>
          <button
            type="button"
            onClick={clearFile}
            className="ml-auto rounded-lg p-1 text-leaf-600 hover:bg-leaf-100 dark:hover:bg-leaf-900/30 transition-colors"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {analyzing && !preview && (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-leaf-50 to-emerald-50 p-6 dark:from-leaf-950/30 dark:to-emerald-950/20 border border-leaf-200/50 dark:border-leaf-900/30 animate-fade-in">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-leaf-500" />
            <div className="absolute inset-0 rounded-full bg-leaf-500/30 animate-ping" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-text-primary dark:text-text-primary">Analyzing your leaf...</p>
            <p className="text-sm text-text-secondary dark:text-text-muted">Our AI is examining the image for diseases</p>
          </div>
          <div className="w-full max-w-md h-2 bg-surface-elevated rounded-full overflow-hidden dark:bg-surface-card">
            <div className="h-full bg-gradient-to-r from-leaf-500 to-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  )
}