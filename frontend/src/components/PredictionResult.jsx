import { useState, useMemo } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Leaf,
  ShieldAlert,
  Sparkles,
  FlaskConical,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Image as ImageIcon,
  ChevronRight,
  Target,
  TrendingUp,
  Search
} from 'lucide-react'
import { resolveImageUrl } from '../api/client'
import { confidenceColor, isHealthy, severityColor } from '../utils/prediction'
import { printDiagnosisReport } from '../utils/report'
import { getRemediesForPrediction } from '../data/remedies'

export default function PredictionResult({ result, fallbackPreview }) {
  const healthy = isHealthy(result.diseaseName)
  const lowConfidence = result.confidence < 60
  const [activeTab, setActiveTab] = useState('all') // 'all', 'organic', 'chemical', 'prevention'
  const [imageError, setImageError] = useState(false)
  const [expandedItems, setExpandedItems] = useState(new Set())

  // Retrieve rich remedies data based on model class and disease name
  const remedies = useMemo(() => {
    return getRemediesForPrediction(result.rawClass, result.diseaseName, result.cropName)
  }, [result.rawClass, result.diseaseName, result.cropName])

  // Resolve best image URL with fallback to uploaded blob preview
  const primaryImgUrl = result.imageUrl ? resolveImageUrl(result.imageUrl) : null
  const displayImgUrl = !imageError && primaryImgUrl ? primaryImgUrl : fallbackPreview

  const toggleExpand = (index) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-leaf-200 bg-white dark:border-earth-700 dark:bg-surface-elevated shadow-xl shadow-leaf-900/5 dark:shadow-[0_25px_50px_-12px_rgb(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-leaf-900/10 dark:hover:shadow-[0_25px_50px_-12px_rgb(0,0,0,0.6)]">
      {/* Header Banner with subtle animated background */}
      <div
        className={`relative overflow-hidden flex flex-wrap items-center justify-between gap-3 px-6 py-4 ${
          healthy ? 'bg-gradient-to-r from-leaf-600 via-leaf-700 to-emerald-700' : 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600'
        } text-white`}
      >
        {/* Animated background blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 h-[80%] w-[80%] rounded-full bg-white/10 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-1/2 -left-1/2 h-[60%] w-[60%] rounded-full bg-white/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {healthy ? (
            <div className="relative rounded-full bg-white/20 p-2 backdrop-blur-sm">
              <CheckCircle2 className="h-6 w-6 text-white" />
              <div className="absolute -inset-1 rounded-full bg-leaf-400/30 animate-ping" />
            </div>
          ) : (
            <div className="relative rounded-full bg-white/20 p-2 backdrop-blur-sm">
              <AlertTriangle className="h-6 w-6 text-white" />
              <div className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping" />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Diagnosis Result</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{result.diseaseName}</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => printDiagnosisReport(result, remedies)}
          className="relative inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur hover:bg-white/30 active:scale-95 transition-all z-10 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </span>
          <span className="absolute inset-0 bg-white/10 translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
        </button>
      </div>

      {lowConfidence && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-gradient-to-r dark:from-amber-950/50 dark:to-amber-900/30 dark:text-amber-200">
          <div className="rounded-full bg-amber-200 p-1.5 dark:bg-amber-900/50">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span>Low model confidence ({result.confidence?.toFixed(1)}%) — please inspect visually or consult a local agronomist before applying chemical treatments.</span>
        </div>
      )}

      {/* Main Grid: Visuals + Metadata */}
      <div className="grid gap-6 p-6 lg:grid-cols-12">
        {/* Left Column: Leaf Photo & Grad-CAM */}
        <div className="space-y-4 lg:col-span-5">
          <div className="relative overflow-hidden rounded-2xl border border-leaf-100 bg-surface-elevated shadow-inner dark:border-earth-700 dark:bg-surface-card group">
            <div className="absolute top-2 left-2 z-10 rounded-md bg-surface-card/90 px-2.5 py-1 text-xs font-medium text-text-primary backdrop-blur-sm flex items-center gap-1.5 shadow-sm border border-border-primary dark:bg-surface-elevated/90 dark:border-border-primary">
              <ImageIcon className="h-3.5 w-3.5 text-leaf-500" /> Analyzed Leaf
            </div>
            {displayImgUrl ? (
              <img
                src={displayImgUrl}
                alt="Analyzed leaf"
                onError={() => setImageError(true)}
                className="h-64 w-full object-cover sm:h-72 transition-all duration-500 hover:scale-[1.02] hover:brightness-105"
              />
            ) : (
              <div className="flex h-64 sm:h-72 w-full flex-col items-center justify-center gap-2 text-text-muted bg-surface-card dark:bg-surface-elevated">
                <div className="rounded-full bg-leaf-100 p-3 dark:bg-leaf-900/30">
                  <Leaf className="h-12 w-12 text-leaf-500" />
                </div>
                <span className="text-xs font-medium">Image processed</span>
              </div>
            )}
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>

          {result.heatmapBase64 && (
            <div className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-surface-elevated shadow-sm dark:border-amber-900/30 dark:bg-surface-card group">
              <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border-b border-amber-200/50 dark:border-amber-900/30">
                <div className="relative flex items-center justify-center">
                  <Layers className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="absolute -inset-1 rounded-full bg-amber-400/20 animate-ping" />
                </div>
                Grad-CAM AI Attention Heatmap
              </div>
              <img
                src={`data:image/png;base64,${result.heatmapBase64}`}
                alt="Grad-CAM heatmap"
                className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          )}
        </div>

        {/* Right Column: Key Stats, Top Predictions & Overview */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="relative inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3.5 py-1.5 text-sm font-semibold text-leaf-800 dark:bg-leaf-900/50 dark:text-leaf-300 shadow-sm border border-leaf-200/50 dark:border-leaf-800/30">
              <Leaf className="h-4 w-4" />
              {result.cropName}
            </span>
            <span
              className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold shadow-sm ${confidenceColor(
                result.confidence
              )}`}
            >
              <Target className="h-3.5 w-3.5" />
              {result.confidence?.toFixed(1)}% confidence
            </span>
            {result.severity && (
              <span
                className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold shadow-sm ${severityColor(
                  result.severity
                )}`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {result.severity} Severity
              </span>
            )}
            {remedies?.pathogenType && remedies.pathogenType !== 'None' && (
              <span className="relative inline-flex items-center gap-1.5 rounded-full bg-surface-card px-3 py-1 text-xs font-medium text-text-secondary dark:bg-surface-elevated dark:text-text-muted border border-border-primary dark:border-border-primary">
                <Search className="h-3 w-3" />
                {remedies.pathogenType}
              </span>
            )}
          </div>

          {/* Top Predictions Bar */}
          {result.topPredictions?.length > 0 && (
            <div className="relative rounded-2xl bg-surface-elevated/90 p-4.5 dark:bg-surface-card/60 border border-border-primary dark:border-border-primary overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-leaf-500/5 to-transparent" />
              <h3 className="relative mb-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-leaf-500" />
                AI Classification Probability
              </h3>
              <div className="relative space-y-2">
                {result.topPredictions.slice(0, 4).map((p, i) => (
                  <div key={`${p.rawClass}-${i}`} className="group">
                    <div className="mb-1 flex justify-between text-xs sm:text-sm">
                      <span className="font-medium text-text-primary group-hover:text-leaf-600 dark:group-hover:text-leaf-400 transition-colors">{p.diseaseName}</span>
                      <span className="font-semibold text-text-secondary">
                        {p.confidence?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-border-primary dark:bg-border-primary relative">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          i === 0 ? 'bg-gradient-to-r from-leaf-500 to-emerald-500 shadow-[0_0_8px_rgb(34,197,94,0.5)]' : 'bg-gradient-to-r from-earth-400 to-earth-500 dark:from-earth-500 dark:to-earth-600'
                        }`}
                        style={{ width: `${Math.min(p.confidence, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Advisory Summary */}
          <div className="relative rounded-2xl bg-gradient-to-br from-leaf-50 to-leaf-100 p-4 border border-leaf-100 dark:from-leaf-950/30 dark:to-leaf-900/20 dark:border-earth-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-leaf-500/5 to-transparent" />
            <h3 className="relative mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-leaf-800 dark:text-leaf-300">
              <div className="rounded-full bg-leaf-100 p-1 dark:bg-leaf-900/30">
                <Info className="h-4 w-4" />
              </div>
              Advisory Summary
            </h3>
            <p className="relative text-sm leading-relaxed text-text-secondary dark:text-text-muted">{result.advisory}</p>
          </div>
        </div>
      </div>

      {/* Comprehensive Remedies & Treatment Section */}
      <div className="border-t border-border-primary bg-surface-card/50 p-6 dark:border-border-primary dark:bg-surface-elevated/50">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-text-primary dark:text-text-primary flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-leaf-600 dark:text-leaf-400" />
                <span className="absolute inset-0 rounded-full bg-leaf-400/20 animate-ping" />
              </div>
              Recommended Remedies & Treatment Plan
            </h3>
            <p className="text-xs text-text-muted dark:text-text-muted mt-0.5">
              Actionable agronomic solutions categorized for organic and conventional management.
            </p>
          </div>

          {/* Tab Filters - Enhanced */}
          <div className="relative flex flex-wrap gap-1.5 rounded-xl bg-surface-card p-1 shadow-sm border border-border-primary dark:bg-surface-elevated dark:border-border-primary">
            {/* Active tab indicator */}
            <div
              className="absolute inset-y-1 left-1 h-[calc(100%-0.5rem)] rounded-lg bg-gradient-to-r from-leaf-500 to-emerald-500 shadow-sm transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${
                  ['all', 'organic', 'chemical', 'prevention'].indexOf(activeTab) * 92
                }px)`
              }}
            />
            {[
              { id: 'all', label: 'All Remedies', icon: Sparkles },
              { id: 'organic', label: 'Organic', icon: Leaf, count: remedies?.organic?.length },
              { id: 'chemical', label: 'Chemical', icon: FlaskConical, count: remedies?.chemical?.length },
              { id: 'prevention', label: 'Prevention', icon: ShieldCheck, count: remedies?.prevention?.length },
            ].map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 z-10 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-text-secondary hover:text-text-primary dark:text-text-muted dark:hover:text-text-primary'
                }`}
              >
                <tab.icon className={`h-3.5 w-3.5 ${activeTab === tab.id ? 'text-white' : 'text-text-muted'}`} />
                {tab.label}
                {tab.count && tab.count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-surface-elevated text-text-muted dark:bg-surface-card'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Immediate Action Steps Alert (Always visible if present) */}
        {remedies?.immediateActions?.length > 0 && (
          <div className="relative mb-6 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4.5 text-orange-950 dark:border-orange-900/30 dark:from-orange-950/30 dark:to-amber-950/20 dark:text-orange-200 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent" />
            <div className="relative flex items-start gap-3">
              <div className="relative rounded-xl bg-orange-200/80 p-2 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300 shrink-0">
                <Zap className="h-5 w-5" />
                <span className="absolute -inset-1 rounded-xl bg-orange-400/20 animate-ping" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-orange-900 dark:text-orange-200 uppercase tracking-wide">
                  Immediate Containment Steps
                </h4>
                <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-orange-900/90 dark:text-orange-200/90 leading-relaxed font-medium">
                  {remedies.immediateActions.map((action, idx) => (
                    <li key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Organic / Biological Remedies */}
          {(activeTab === 'all' || activeTab === 'organic') && remedies?.organic?.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 border-b border-leaf-200/50 pb-2 dark:border-earth-700/50">
                <div className="rounded-lg bg-leaf-100 p-1.5 dark:bg-leaf-900/30">
                  <Leaf className="h-5 w-5 text-leaf-600 dark:text-leaf-400" />
                </div>
                <h4 className="font-bold text-base text-text-primary dark:text-text-primary">
                  Organic & Biological Remedies
                </h4>
              </div>

              <div className="space-y-3">
                {remedies.organic.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-2xl border border-leaf-200/50 bg-surface-card p-4 shadow-sm dark:border-earth-700/50 dark:bg-surface-elevated transition-all duration-300 hover:border-leaf-300 dark:hover:border-leaf-600/50 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-sm text-leaf-900 dark:text-leaf-300">{item.title}</h5>
                      <span className="relative rounded-full bg-leaf-100 px-2 py-0.5 text-[11px] font-semibold text-leaf-800 dark:bg-leaf-900/60 dark:text-leaf-300 shrink-0">
                        Eco-Friendly
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs sm:text-sm font-medium text-text-secondary dark:text-text-muted leading-relaxed">
                        <strong>Application:</strong> {item.application}
                      </p>
                    </div>
                    {item.notes && (
                      <div className="mt-2 rounded-lg bg-leaf-50/50 p-2.5 dark:bg-leaf-950/30 border border-leaf-100/50 dark:border-leaf-900/30">
                        <p className="text-xs text-text-muted dark:text-text-muted italic flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5 text-leaf-500 dark:text-leaf-400" />
                          {item.notes}
                        </p>
                      </div>
                    )}
                    {/* Expand indicator */}
                    {item.details && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(`organic-${idx}`)}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-leaf-600 hover:text-leaf-700 dark:text-leaf-400 dark:hover:text-leaf-300 transition-colors"
                      >
                        {expandedItems.has(`organic-${idx}`) ? 'Show less' : 'Show details'}
                        <ChevronRight
                          className={`h-3.5 w-3.5 transition-transform ${
                            expandedItems.has(`organic-${idx}`) ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                    )}
                    {expandedItems.has(`organic-${idx}`) && item.details && (
                      <div className="mt-3 rounded-lg bg-leaf-50/50 p-3 dark:bg-leaf-950/30 border border-leaf-100/50 dark:border-leaf-900/30 animate-slide-down">
                        <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">{item.details}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chemical / Conventional Treatments */}
          {(activeTab === 'all' || activeTab === 'chemical') && remedies?.chemical?.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 border-b border-amber-200/50 pb-2 dark:border-earth-700/50">
                <div className="rounded-lg bg-amber-100 p-1.5 dark:bg-amber-900/30">
                  <FlaskConical className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="font-bold text-base text-text-primary dark:text-text-primary">
                  Targeted Chemical Treatments
                </h4>
              </div>

              <div className="space-y-3">
                {remedies.chemical.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-2xl border border-amber-200/50 bg-surface-card p-4 shadow-sm dark:border-amber-900/30 dark:bg-surface-elevated transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-600/50 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-sm text-amber-950 dark:text-amber-200">{item.name}</h5>
                      <span className="relative rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">
                        Conventional
                      </span>
                    </div>
                    <div className="mt-2 rounded-lg bg-amber-50/60 px-3 py-1.5 text-xs sm:text-sm font-semibold text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 flex items-center justify-between">
                      <span>Recommended Dosage:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400 bg-surface-card px-2 py-0.5 rounded dark:bg-surface-elevated">{item.dosage}</span>
                    </div>
                    {item.safety && (
                      <div className="mt-2 rounded-lg bg-amber-50/50 p-2.5 dark:bg-amber-950/30 border border-amber-100/50 dark:border-amber-900/30">
                        <p className="text-xs text-text-muted dark:text-text-muted flex items-center gap-1.5">
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                          <strong>Safety & Usage:</strong> {item.safety}
                        </p>
                      </div>
                    )}
                    {item.details && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleExpand(`chemical-${idx}`)}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                        >
                          {expandedItems.has(`chemical-${idx}`) ? 'Show less' : 'Show details'}
                          <ChevronRight
                            className={`h-3.5 w-3.5 transition-transform ${
                              expandedItems.has(`chemical-${idx}`) ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        {expandedItems.has(`chemical-${idx}`) && (
                          <div className="mt-3 rounded-lg bg-amber-50/50 p-3 dark:bg-amber-950/30 border border-amber-100/50 dark:border-amber-900/30 animate-slide-down">
                            <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">{item.details}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preventative & Cultural Practices */}
          {(activeTab === 'all' || activeTab === 'prevention') && remedies?.prevention?.length > 0 && (
            <div className={`space-y-4 animate-fade-in ${activeTab === 'prevention' ? 'md:col-span-2' : ''}`}>
              <div className="flex items-center gap-2 border-b border-sky-200/50 pb-2 dark:border-earth-700/50">
                <div className="rounded-lg bg-sky-100 p-1.5 dark:bg-sky-900/30">
                  <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <h4 className="font-bold text-base text-text-primary dark:text-text-primary">
                  Long-term Prevention & Cultural Care
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-1">
                {remedies.prevention.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-2xl border border-sky-100 bg-surface-card p-4 shadow-sm dark:border-earth-700/50 dark:bg-surface-elevated transition-all duration-300 hover:border-sky-200 dark:hover:border-sky-600/50 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <h5 className="font-bold text-sm text-sky-900 dark:text-sky-300">{item.title}</h5>
                    <p className="mt-1 text-xs sm:text-sm text-text-secondary dark:text-text-muted leading-relaxed">
                      {item.description}
                    </p>
                    {item.details && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleExpand(`prevention-${idx}`)}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
                        >
                          {expandedItems.has(`prevention-${idx}`) ? 'Show less' : 'Show details'}
                          <ChevronRight
                            className={`h-3.5 w-3.5 transition-transform ${
                              expandedItems.has(`prevention-${idx}`) ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        {expandedItems.has(`prevention-${idx}`) && (
                          <div className="mt-3 rounded-lg bg-sky-50/50 p-3 dark:bg-sky-950/30 border border-sky-100/50 dark:border-sky-900/30 animate-slide-down">
                            <p className="text-xs text-text-secondary dark:text-text-muted leading-relaxed">{item.details}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state when no remedies for selected tab */}
          {((activeTab === 'organic' && (!remedies?.organic?.length)) ||
            (activeTab === 'chemical' && (!remedies?.chemical?.length)) ||
            (activeTab === 'prevention' && (!remedies?.prevention?.length)) ||
            (activeTab === 'all' && !remedies?.organic?.length && !remedies?.chemical?.length && !remedies?.prevention?.length)) && (
            <div className="md:col-span-2 flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-surface-elevated p-4 dark:bg-surface-card border border-border-primary">
                <Leaf className="h-10 w-10 text-text-muted" />
              </div>
              <p className="mt-4 text-text-secondary dark:text-text-muted">
                No {activeTab === 'all' ? 'remedies' : activeTab} remedies available for this condition.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}