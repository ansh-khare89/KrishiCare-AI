import { useState, useMemo } from 'react'
import { DISEASES } from '../data/diseases'
import { Search, Filter, Leaf, ShieldCheck, AlertTriangle, Zap, Target, ChevronDown, X, BookOpen } from 'lucide-react'

const CROP_CONFIG = {
  Tomato: { icon: '🍅', color: 'from-red-500 to-rose-600', badge: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  Potato: { icon: '🥔', color: 'from-amber-500 to-orange-600', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  Corn: { icon: '🌽', color: 'from-yellow-500 to-amber-600', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300' },
  Apple: { icon: '🍎', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  Grape: { icon: '🍇', color: 'from-violet-500 to-purple-600', badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300' },
  Pepper: { icon: '🌶️', color: 'from-rose-500 to-red-600', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  Peach: { icon: '🍑', color: 'from-orange-500 to-pink-600', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  Cherry: { icon: '🍒', color: 'from-pink-500 to-rose-600', badge: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300' },
  Strawberry: { icon: '🍓', color: 'from-rose-500 to-red-600', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  Orange: { icon: '🍊', color: 'from-orange-500 to-amber-600', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  Squash: { icon: '🎃', color: 'from-amber-500 to-yellow-600', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  Blueberry: { icon: '🫐', color: 'from-blue-500 to-indigo-600', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  Soybean: { icon: '🌱', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
}

function DiseaseCard({ disease }) {
  const config = CROP_CONFIG[disease.crop] || {
    icon: '🌿',
    color: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  }
  const isHealthy = disease.name === 'Healthy'
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="mb-3.5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl shadow-inner dark:bg-slate-800">
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${config.badge}`}>
                {disease.crop}
              </span>
              {isHealthy && (
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Healthy
                </span>
              )}
            </div>
            <h2 className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
              {disease.name}
            </h2>
          </div>
        </div>

        {/* Symptoms snippet */}
        <div className={`rounded-2xl p-3 text-xs leading-relaxed ${isHealthy ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300'}`}>
          <p className="font-bold mb-0.5">{isHealthy ? 'Condition' : 'Symptoms'}:</p>
          <p className="line-clamp-3 font-medium">{disease.symptoms}</p>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-3 space-y-2 text-xs animate-slide-down">
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-950 dark:bg-sky-950/40 dark:text-sky-300">
              <p className="font-bold flex items-center gap-1 mb-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-600" /> Prevention:
              </p>
              <p className="font-medium leading-relaxed">{disease.prevention}</p>
            </div>
            <div className="rounded-2xl bg-teal-50 p-3 text-teal-950 dark:bg-teal-950/40 dark:text-teal-300">
              <p className="font-bold flex items-center gap-1 mb-0.5">
                <Zap className="h-3.5 w-3.5 text-teal-600" /> Treatment:
              </p>
              <p className="font-medium leading-relaxed">{disease.treatment}</p>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all cursor-pointer"
      >
        <span>{expanded ? 'Hide Details' : 'View Treatment & Care'}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
    </article>
  )
}

export default function EncyclopediaPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCrop, setSelectedCrop] = useState('')

  const crops = useMemo(() => {
    return [...new Set(DISEASES.map((d) => d.crop))].sort()
  }, [])

  const filteredDiseases = useMemo(() => {
    return DISEASES.filter((disease) => {
      const matchesSearch =
        !searchQuery ||
        disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disease.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disease.symptoms.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCrop = !selectedCrop || disease.crop === selectedCrop

      return matchesSearch && matchesCrop
    })
  }, [searchQuery, selectedCrop])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Crop Disease Encyclopedia
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Complete diagnostic reference and treatment guide for 38+ plant pathologies.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search diseases, crops, or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-white focus:outline-emerald-500 font-medium"
            />
          </div>

          <div className="sm:w-56">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 focus:outline-emerald-500 cursor-pointer"
            >
              <option value="">All Crops ({crops.length})</option>
              {crops.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDiseases.map((d) => (
          <DiseaseCard key={d.id} disease={d} />
        ))}
      </div>
    </div>
  )
}