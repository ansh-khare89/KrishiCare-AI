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
  Image as ImageIcon
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

  // Retrieve rich remedies data based on model class and disease name
  const remedies = useMemo(() => {
    return getRemediesForPrediction(result.rawClass, result.diseaseName, result.cropName)
  }, [result.rawClass, result.diseaseName, result.cropName])

  // Resolve best image URL with fallback to uploaded blob preview
  const primaryImgUrl = result.imageUrl ? resolveImageUrl(result.imageUrl) : null
  const displayImgUrl = !imageError && primaryImgUrl ? primaryImgUrl : fallbackPreview

  return (
    <div className="overflow-hidden rounded-3xl border border-leaf-200 bg-white/90 shadow-xl shadow-leaf-900/5 backdrop-blur-xl dark:border-earth-700 dark:bg-earth-900/90 transition-all duration-300">
      {/* Header Banner */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 ${
          healthy ? 'bg-gradient-to-r from-leaf-600 to-emerald-600' : 'bg-gradient-to-r from-amber-600 to-orange-600'
        } text-white`}
      >
        <div className="flex items-center gap-3">
          {healthy ? (
            <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
          ) : (
            <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
              <AlertTriangle className="h-6 w-6 text-white" />
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
          className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur hover:bg-white/30 active:scale-95 transition-all"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {lowConfidence && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Low model confidence ({result.confidence?.toFixed(1)}%) — please inspect visually or consult a local agronomist before applying chemical treatments.
        </div>
      )}

      {/* Main Grid: Visuals + Metadata */}
      <div className="grid gap-6 p-6 lg:grid-cols-12">
        {/* Left Column: Leaf Photo & Grad-CAM */}
        <div className="space-y-4 lg:col-span-5">
          <div className="overflow-hidden rounded-2xl border border-leaf-100 bg-earth-50 shadow-inner dark:border-earth-700 dark:bg-earth-800/80 relative">
            <div className="absolute top-2 left-2 z-10 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" /> Analyzed Leaf
            </div>
            {displayImgUrl ? (
              <img
                src={displayImgUrl}
                alt="Analyzed leaf"
                onError={() => setImageError(true)}
                className="h-64 w-full object-cover sm:h-72 transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="flex h-64 sm:h-72 w-full flex-col items-center justify-center gap-2 text-earth-400 bg-earth-100 dark:bg-earth-800">
                <Leaf className="h-12 w-12 text-leaf-500/50" />
                <span className="text-xs">Image processed</span>
              </div>
            )}
          </div>

          {result.heatmapBase64 && (
            <div className="overflow-hidden rounded-2xl border border-amber-200 bg-earth-50 shadow-sm dark:border-amber-900/60 dark:bg-earth-800">
              <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                <Layers className="h-3.5 w-3.5 text-amber-600" />
                Grad-CAM AI Attention Heatmap
              </div>
              <img
                src={`data:image/png;base64,${result.heatmapBase64}`}
                alt="Grad-CAM heatmap"
                className="h-56 w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Right Column: Key Stats, Top Predictions & Overview */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3.5 py-1.5 text-sm font-semibold text-leaf-800 dark:bg-leaf-900/50 dark:text-leaf-300 shadow-sm">
              <Leaf className="h-4 w-4" />
              {result.cropName}
            </span>
            <span
              className={`inline-flex rounded-full px-3.5 py-1.5 text-sm font-bold shadow-sm ${confidenceColor(
                result.confidence
              )}`}
            >
              {result.confidence?.toFixed(1)}% confidence
            </span>
            {result.severity && (
              <span
                className={`inline-flex rounded-full px-3.5 py-1.5 text-sm font-bold shadow-sm ${severityColor(
                  result.severity
                )}`}
              >
                {result.severity} Severity
              </span>
            )}
            {remedies?.pathogenType && remedies.pathogenType !== 'None' && (
              <span className="inline-flex rounded-full bg-earth-100 px-3 py-1 text-xs font-medium text-earth-700 dark:bg-earth-800 dark:text-earth-300">
                {remedies.pathogenType}
              </span>
            )}
          </div>

          {/* Top Predictions Bar */}
          {result.topPredictions?.length > 0 && (
            <div className="rounded-2xl bg-earth-50/90 p-4.5 dark:bg-earth-800/60 border border-leaf-100/50 dark:border-earth-700/50">
              <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-earth-600 dark:text-earth-400">
                AI Classification Probability
              </h3>
              <div className="space-y-2">
                {result.topPredictions.slice(0, 4).map((p, i) => (
                  <div key={`${p.rawClass}-${i}`}>
                    <div className="mb-1 flex justify-between text-xs sm:text-sm">
                      <span className="font-medium text-earth-800 dark:text-earth-200">{p.diseaseName}</span>
                      <span className="font-semibold text-earth-700 dark:text-earth-300">
                        {p.confidence?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-earth-200 dark:bg-earth-700">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          i === 0 ? 'bg-leaf-500' : 'bg-earth-400 dark:bg-earth-500'
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
          <div className="rounded-2xl bg-leaf-50/60 p-4 border border-leaf-100 dark:bg-leaf-950/20 dark:border-earth-800">
            <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-leaf-800 dark:text-leaf-300">
              <Info className="h-4 w-4" /> Advisory Summary
            </h3>
            <p className="text-sm leading-relaxed text-earth-800 dark:text-earth-200">{result.advisory}</p>
          </div>
        </div>
      </div>

      {/* Comprehensive Remedies & Treatment Section */}
      <div className="border-t border-leaf-100 bg-earth-50/40 p-6 dark:border-earth-800 dark:bg-earth-900/50">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-earth-900 dark:text-earth-50 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-leaf-600 dark:text-leaf-400" />
              Recommended Remedies &amp; Treatment Plan
            </h3>
            <p className="text-xs text-earth-600 dark:text-earth-400 mt-0.5">
              Actionable agronomic solutions categorized for organic and conventional management.
            </p>
          </div>

          {/* Tab Filters */}
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-white p-1 shadow-sm border border-leaf-100 dark:bg-earth-800 dark:border-earth-700">
            {[
              { id: 'all', label: 'All Remedies' },
              { id: 'organic', label: '🌿 Organic', count: remedies?.organic?.length },
              { id: 'chemical', label: '🧪 Chemical', count: remedies?.chemical?.length },
              { id: 'prevention', label: '🛡️ Prevention', count: remedies?.prevention?.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-leaf-600 text-white shadow-sm'
                    : 'text-earth-700 hover:bg-leaf-50 dark:text-earth-300 dark:hover:bg-earth-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Immediate Action Steps Alert (Always visible if present) */}
        {remedies?.immediateActions?.length > 0 && (
          <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/80 p-4.5 text-orange-950 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-orange-200/80 p-2 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300 shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-orange-900 dark:text-orange-200 uppercase tracking-wide">
                  Immediate Containment Steps
                </h4>
                <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-orange-900/90 dark:text-orange-200/90 leading-relaxed font-medium">
                  {remedies.immediateActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Organic / Biological Remedies */}
          {(activeTab === 'all' || activeTab === 'organic') && remedies?.organic?.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-leaf-200 pb-2 dark:border-earth-700">
                <Leaf className="h-5 w-5 text-leaf-600 dark:text-leaf-400" />
                <h4 className="font-bold text-base text-earth-900 dark:text-earth-100">
                  Organic &amp; Biological Remedies
                </h4>
              </div>

              <div className="space-y-3">
                {remedies.organic.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-leaf-200/70 bg-white p-4 shadow-sm dark:border-earth-700 dark:bg-earth-800/80"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-sm text-leaf-900 dark:text-leaf-300">{item.title}</h5>
                      <span className="rounded-full bg-leaf-100 px-2 py-0.5 text-[11px] font-semibold text-leaf-800 dark:bg-leaf-900/60 dark:text-leaf-300 shrink-0">
                        Eco-Friendly
                      </span>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm font-medium text-earth-800 dark:text-earth-200 leading-relaxed">
                      <strong>Application:</strong> {item.application}
                    </p>
                    {item.notes && (
                      <p className="mt-1.5 text-xs text-earth-600 dark:text-earth-400 italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chemical / Conventional Treatments */}
          {(activeTab === 'all' || activeTab === 'chemical') && remedies?.chemical?.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-amber-200 pb-2 dark:border-earth-700">
                <FlaskConical className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h4 className="font-bold text-base text-earth-900 dark:text-earth-100">
                  Targeted Chemical Treatments
                </h4>
              </div>

              <div className="space-y-3">
                {remedies.chemical.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm dark:border-amber-900/40 dark:bg-earth-800/80"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-sm text-amber-950 dark:text-amber-200">{item.name}</h5>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">
                        Conventional
                      </span>
                    </div>
                    <div className="mt-2 rounded-lg bg-amber-50/60 px-3 py-1.5 text-xs sm:text-sm font-semibold text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                      Recommended Dosage: <span className="font-bold text-amber-700 dark:text-amber-400">{item.dosage}</span>
                    </div>
                    {item.safety && (
                      <p className="mt-2 text-xs text-earth-600 dark:text-earth-400">
                        <strong>Safety &amp; Usage:</strong> {item.safety}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preventative & Cultural Practices */}
          {(activeTab === 'all' || activeTab === 'prevention') && remedies?.prevention?.length > 0 && (
            <div className={`space-y-4 ${activeTab === 'prevention' ? 'md:col-span-2' : ''}`}>
              <div className="flex items-center gap-2 border-b border-sky-200 pb-2 dark:border-earth-700">
                <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                <h4 className="font-bold text-base text-earth-900 dark:text-earth-100">
                  Long-term Prevention &amp; Cultural Care
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-1">
                {remedies.prevention.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm dark:border-earth-700 dark:bg-earth-800/80"
                  >
                    <h5 className="font-bold text-sm text-sky-900 dark:text-sky-300">{item.title}</h5>
                    <p className="mt-1 text-xs sm:text-sm text-earth-700 dark:text-earth-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
