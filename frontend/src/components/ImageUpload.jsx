import { useCallback, useRef, useState } from 'react'
import { Upload, ImageIcon, X } from 'lucide-react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const MAX_SIZE_MB = 10

export default function ImageUpload({ file, preview, onFileSelect, onClear, disabled }) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
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

  if (preview) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-leaf-200 bg-white shadow-sm">
        <img src={preview} alt="Selected leaf" className="max-h-80 w-full object-contain bg-earth-50" />
        {!disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-earth-700 shadow-md transition hover:bg-white hover:text-red-600"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 transition-colors ${
          dragOver
            ? 'border-leaf-500 bg-leaf-50'
            : 'border-leaf-200 bg-white hover:border-leaf-400 hover:bg-leaf-50/50'
        } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-600">
          {dragOver ? <ImageIcon className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
        </div>
        <p className="text-lg font-semibold text-earth-900">
          {dragOver ? 'Drop your leaf image here' : 'Upload a leaf photo'}
        </p>
        <p className="mt-2 text-sm text-earth-700/70">
          Drag &amp; drop or click to browse — JPEG, PNG, WebP up to {MAX_SIZE_MB} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {file && !preview && (
        <p className="mt-2 text-sm text-leaf-700">Selected: {file.name}</p>
      )}
    </div>
  )
}
