import { useState, useMemo } from 'react'
import { DISEASES } from '../data/diseases'
import { Search, Filter, Leaf, ShieldCheck, AlertTriangle, Zap, Target, ChevronDown, X } from 'lucide-react'

// Category icons and colors
const CROP_CONFIG = {
  Tomato: { icon: '🍅', color: 'from-red-500 to-rose-500', bg: 'from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20', border: 'border-red-200/50 dark:border-red-900/30' },
  Potato: { icon: '🥔', color: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20', border: 'border-amber-200/50 dark:border-amber-900/30' },
  Corn: { icon: '🌽', color: 'from-yellow-500 to-amber-500', bg: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20', border: 'border-yellow-200/50 dark:border-yellow-900/30' },
  Apple: { icon: '🍎', color: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20', border: 'border-green-200/50 dark:border-green-900/30' },
  Grape: { icon: '🍇', color: 'from-violet-500 to-purple-500', bg: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20', border: 'border-violet-200/50 dark:border-violet-900/30' },
  Pepper: { icon: '🌶️', color: 'from-red-500 to-orange-500', bg: 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20', border: 'border-red-200/50 dark:border-red-900/30' },
  Peach: { icon: '🍑', color: 'from-orange-500 to-pink-500', bg: 'from-orange-50 to-pink-50 dark:from-orange-950/30 dark:to-pink-950/20', border: 'border-orange-200/50 dark:border-orange-900/30' },
  Cherry: { icon: '🍒', color: 'from-rose-500 to-pink-500', bg: 'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20', border: 'border-rose-200/50 dark:border-rose-900/30' },
  Strawberry: { icon: '🍓', color: 'from-rose-500 to-red-500', bg: 'from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/20', border: 'border-rose-200/50 dark:border-rose-900/30' },
  Orange: { icon: '🍊', color: 'from-orange-500 to-amber-500', bg: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20', border: 'border-orange-200/50 dark:border-orange-900/30' },
  Squash: { icon: '🎃', color: 'from-amber-500 to-yellow-500', bg: 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20', border: 'border-amber-200/50 dark:border-amber-900/30' },
  Blueberry: { icon: '🫐', color: 'from-blue-500 to-indigo-500', bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20', border: 'border-blue-200/50 dark:border-blue-900/30' },
  Soybean: { icon: '🌱', color: 'from-leaf-500 to-emerald-500', bg: 'from-leaf-50 to-emerald-50 dark:from-leaf-950/30 dark:to-emerald-950/20', border: 'border-leaf-200/50 dark:border-leaf-900/30' },
}

function DiseaseCard({ disease, index }) {
  const config = CROP_CONFIG[disease.crop] || { 
    icon: '🌿', 
    color: 'from-leaf-500 to-emerald-500', 
    bg: 'from-leaf-50 to-emerald-50 dark:from-leaf-950/30 dark:to-emerald-950/20',
    border: 'border-leaf-200/50 dark:border-leaf-900/30'
  }
  const isHealthy = disease.name === 'Healthy'
  const [expanded, setExpanded] = useState(false)

  return (
    <article 
      className={`relative group overflow-hidden rounded-2xl p-5 transition-all duration-300 ${config.bg} ${config.border} bg-surface-card/80 dark:bg-surface-elevated/80 backdrop-blur-xl shadow-sm hover:shadow-xl hover:-translate-y-1 border border-border-primary/50 dark:border-border-primary/50`}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Animated background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r" style={{ background: config.color.replace('from-', 'from-').replace('to-', 'to-') }} />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg" style={{ background: config.color }}>
            <span className="text-xl">{config.icon}</span>
            <div className="absolute inset-0 rounded-xl bg-white/20 animate-ping" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm" style={{ background: config.color.replace('500', '600') }}>
                {disease.crop}
              </span>
              {isHealthy && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  Healthy
                </span>
              )}
            </div>
            <h2 className="mt-1 font-bold text-text-primary dark:text-text-primary truncate pr-2">{disease.name}</h2>
          </div>
          
          {/* Expand button */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-all dark:text-text-muted dark:hover:bg-surface-card"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-sm leading-relaxed">
          {/* Symptoms */}
          <div className={`rounded-xl p-4 transition-all duration-300 ${isHealthy ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30' : 'bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`rounded-lg p-1.5 ${isHealthy ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                {isHealthy ? <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
              </div>
              <span className="font-semibold text-text-primary dark:text-text-primary">{isHealthy ? 'Plant Status' : 'Symptoms'}</span>
            </div>
            <p className="text-text-secondary dark:text-text-muted">{disease.symptoms}</p>
          </div>

          {/* Expandable sections */}
          {expanded && (
            <>
              {/* Prevention */}
              <div className="rounded-xl p-4 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/50 dark:border-sky-900/30 animate-slide-down">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg p-1.5 bg-sky-100 dark:bg-sky-900/30">
                    <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className="font-semibold text-text-primary dark:text-text-primary">Prevention</span>
                </div>
                <p className="text-text-secondary dark:text-text-muted">{disease.prevention}</p>
              </div>

              {/* Treatment */}
              <div className="rounded-xl p-4 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-900/30 animate-slide-down">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg p-1.5 bg-violet-100 dark:bg-violet-900/30">
                    <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="font-semibold text-text-primary dark:text-text-primary">Treatment</span>
                </div>
                <p className="text-text-secondary dark:text-text-muted">{disease.treatment}</p>
              </div>
            </>
          )}

          {/* Collapsed hint */}
          {!expanded && (
            <div className="text-center py-2">
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-leaf-600 dark:hover:text-leaf-400 transition-colors"
              >
                <Target className="h-3.5 w-3.5" />
                View prevention & treatment details
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function SearchAndFilter({ searchQuery, setSearchQuery, selectedCrop, setSelectedCrop, crops, clearFilters }) {
  return (
    <div className="relative rounded-2xl border border-border-primary bg-surface-card/80 p-4 shadow-sm backdrop-blur-xl dark:border-border-primary dark:bg-surface-elevated/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search diseases by name, crop, or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border-primary bg-surface-elevated pl-10 pr-4 py-2.5 text-text-primary placeholder-text-muted focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20 focus:outline-none transition-all dark:border-border-primary dark:bg-surface-card dark:text-text-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter */}
        <div className="relative flex-1 sm:w-64">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full rounded-xl border border-border-primary bg-surface-elevated pl-10 pr-10 py-2.5 text-text-primary focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20 focus:outline-none transition-all appearance-none cursor-pointer dark:border-border-primary dark:bg-surface-card dark:text-text-primary"
            >
              <option value="">All Crops</option>
              {crops.map((crop) => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Clear filters */}
        {(searchQuery || selectedCrop) && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-xl bg-surface-elevated px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-card hover:text-text-primary transition-all border border-border-primary dark:bg-surface-card dark:border-border-primary dark:text-text-muted"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}

function StatsBar({ total, filtered, selectedCrop }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-text-secondary dark:text-text-muted">
      <div className="flex items-center gap-4">
        <span>Showing <span className="font-bold text-text-primary dark:text-text-primary">{filtered}</span> of <span className="font-bold text-text-primary dark:text-text-primary">{total}</span> diseases</span>
        {selectedCrop && (
          <span className="inline-flex items-center gap-1 rounded-full bg-leaf-100 px-2.5 py-0.5 text-xs font-semibold text-leaf-800 dark:bg-leaf-900/30 dark:text-leaf-400">
            <Leaf className="h-3 w-3" />
            Filtered: {selectedCrop}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated border border-border-primary dark:bg-surface-card dark:border-border-primary">
          {total} conditions documented
        </span>
      </div>
    </div>
  )
}

export default function EncyclopediaPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCrop, setSelectedCrop] = useState('')

  // Get unique crops
  const crops = useMemo(() => {
    return [...new Set(DISEASES.map(d => d.crop))].sort()
  }, [])

  // Filter diseases
  const filteredDiseases = useMemo(() => {
    return DISEASES.filter(disease => {
      const matchesSearch = !searchQuery || 
        disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disease.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disease.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disease.prevention.toLowerCase().includes(searchQuery.toLowerCase()) ||
        disease.treatment.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCrop = !selectedCrop || disease.crop === selectedCrop
      
      return matchesSearch && matchesCrop
    })
  }, [searchQuery, selectedCrop])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCrop('')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-leaf-500 to-emerald-500 text-white shadow-lg shadow-leaf-500/30">
            <Leaf className="h-6 w-6" />
          </div>
          Disease Encyclopedia
        </h1>
        <p className="mt-2 text-text-secondary dark:text-text-muted max-w-2xl">
          Comprehensive reference for <span className="font-semibold text-leaf-600 dark:text-leaf-400">{DISEASES.length}+ crop diseases</span> including tomato, potato, corn, apple, grape, and more. Search by symptoms, crop, or disease name.
        </p>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        selectedCrop={selectedCrop}
        setSelectedCrop={setSelectedCrop}
        crops={crops}
        clearFilters={clearFilters}
      />

      {/* Stats */}
      <StatsBar total={DISEASES.length} filtered={filteredDiseases.length} selectedCrop={selectedCrop} />

      {/* Disease Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDiseases.length > 0 ? (
          filteredDiseases.map((disease, index) => (
            <DiseaseCard key={disease.id} disease={disease} index={index} />
          ))
        ) : (
          // Empty state
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-surface-elevated p-4 dark:bg-surface-card border border-border-primary">
              <AlertTriangle className="h-10 w-10 text-text-muted" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-text-primary dark:text-text-primary">No diseases found</h3>
            <p className="mt-2 text-text-secondary dark:text-text-muted max-w-sm">
              {searchQuery && selectedCrop 
                ? `No matches for "${searchQuery}" in ${selectedCrop}. Try adjusting your filters.`
                : searchQuery
                  ? `No matches for "${searchQuery}". Try a different search term.`
                  : selectedCrop
                    ? `No diseases documented for ${selectedCrop} yet.`
                    : 'No diseases match your current filters.'
              }
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-leaf-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-leaf-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <X className="h-4 w-4" />
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="relative rounded-2xl border border-border-primary bg-surface-card/50 p-6 dark:border-border-primary dark:bg-surface-elevated/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-leaf-500/5 to-transparent" />
        <div className="relative grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-leaf-100 p-2 dark:bg-leaf-900/30">
              <Target className="h-5 w-5 text-leaf-600 dark:text-leaf-400" />
            </div>
            <div>
              <p className="font-semibold text-text-primary dark:text-text-primary">Accurate Information</p>
              <p className="text-xs text-text-muted dark:text-text-muted">Curated from agricultural extension services</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-100 p-2 dark:bg-sky-900/30">
              <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="font-semibold text-text-primary dark:text-text-primary">Prevention Focused</p>
              <p className="text-xs text-text-muted dark:text-text-muted">Integrated pest management strategies</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2 dark:bg-amber-900/30">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-text-primary dark:text-text-primary">Actionable Treatments</p>
              <p className="text-xs text-text-muted dark:text-text-muted">Both organic and conventional options</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}