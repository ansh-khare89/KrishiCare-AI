import { useState, useMemo, useEffect } from 'react'
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
  Search,
  Volume2,
  VolumeX,
  Sliders,
  Share2
} from 'lucide-react'
import { resolveImageUrl } from '../api/client'
import { confidenceColor, isHealthy, severityColor } from '../utils/prediction'
import { printDiagnosisReport } from '../utils/report'
import { getRemediesForPrediction } from '../data/remedies'

export default function PredictionResult({ result, fallbackPreview }) {
  const healthy = isHealthy(result.diseaseName)
  const lowConfidence = result.confidence < 55
  const [activeTab, setActiveTab] = useState('all') // 'all', 'organic', 'chemical', 'prevention'
  const [imageError, setImageError] = useState(false)
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [heatmapOpacity, setHeatmapOpacity] = useState(65) // 0 to 100%
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Retrieve rich remedies data
  const remedies = useMemo(() => {
    return getRemediesForPrediction(result.rawClass, result.diseaseName, result.cropName)
  }, [result.rawClass, result.diseaseName, result.cropName])

  // Resolve best image URL
  const primaryImgUrl = result.imageUrl ? resolveImageUrl(result.imageUrl) : null
  const displayImgUrl = !imageError && primaryImgUrl ? primaryImgUrl : fallbackPreview

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const toggleExpand = (index) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  // Voice Readout for Field Farmers
  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech is not supported on this browser.')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const textToSpeak = `Diagnosis result: ${result.diseaseName} on ${result.cropName}. Confidence: ${Math.round(
      result.confidence
    )} percent. ${result.advisory || ''} ${
      remedies?.organic?.[0]?.title ? `Recommended organic treatment: ${remedies.organic[0].title}.` : ''
    }`

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.rate = 0.95
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xl backdrop-blur-xl transition-all duration-300">
      {/* Header Banner */}
      <div
        className={`relative overflow-hidden flex flex-wrap items-center justify-between gap-4 px-6 py-5 text-white ${
          healthy
            ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800'
            : 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700'
        }`}
      >
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
            {healthy ? <CheckCircle2 className="h-7 w-7 text-white" /> : <AlertTriangle className="h-7 w-7 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/85 bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                AI Diagnostic Report
              </span>
              <span className="text-xs font-semibold text-white/90">· {result.cropName}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">{result.diseaseName}</h2>
          </div>
        </div>


        {/* Action Controls */}
        <div className="flex items-center gap-2.5 z-10">
          {/* Audio Readout */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
              isSpeaking
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title="Read out diagnosis in audio"
          >
            {isSpeaking ? <VolumeX className="h-4 w-4 text-red-600 animate-pulse" /> : <Volume2 className="h-4 w-4" />}
            <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
          </button>

          {/* Download PDF / Report */}
          <button
            type="button"
            onClick={() => printDiagnosisReport(result, remedies)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-emerald-700" />
            <span>Save Report</span>
          </button>
        </div>
      </div>

      {lowConfidence && (
        <div className="flex items-center gap-2 border-b border-amber-200/80 bg-amber-50/90 px-6 py-3 text-xs font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            Lower confidence prediction ({result.confidence?.toFixed(1)}%). Consider uploading a clearer, close-up photo of the lesion under good lighting.
          </span>
        </div>
      )}

      {/* Main Grid: Leaf Photo & Heatmap + Metadata */}
      <div className="grid gap-6 p-6 lg:grid-cols-12">
        {/* Left Column: Visual Inspector (Leaf + Grad-CAM Heatmap Blend) */}
        <div className="space-y-3 lg:col-span-5">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 dark:border-slate-800 shadow-inner group">
            {/* Tag Badge */}
            <div className="absolute top-3 left-3 z-20 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span>{result.heatmapBase64 ? 'Interactive Visual Inspection' : 'Analyzed Leaf'}</span>
            </div>

            {/* Base Image */}
            {displayImgUrl ? (
              <div className="relative h-72 sm:h-80 w-full overflow-hidden flex items-center justify-center">
                <img
                  src={displayImgUrl}
                  alt="Analyzed leaf"
                  onError={() => setImageError(true)}
                  className="h-full w-full object-contain"
                />

                {/* Grad-CAM Heatmap Overlay with Opacity Slider */}
                {result.heatmapBase64 && (
                  <img
                    src={`data:image/png;base64,${result.heatmapBase64}`}
                    alt="Grad-CAM Heatmap"
                    className="absolute inset-0 h-full w-full object-contain mix-blend-screen transition-opacity duration-150"
                    style={{ opacity: heatmapOpacity / 100 }}
                  />
                )}
              </div>
            ) : (
              <div className="flex h-72 sm:h-80 w-full flex-col items-center justify-center gap-2 text-slate-500 bg-slate-900">
                <Leaf className="h-12 w-12 text-emerald-500" />
                <span className="text-xs font-semibold">Image analyzed</span>
              </div>
            )}
          </div>

          {/* Grad-CAM Heatmap Controls (if available) */}
          {result.heatmapBase64 && (
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>AI Heatmap Overlay: {heatmapOpacity}%</span>
                </div>
                <span className="text-[10px] text-slate-500">Grad-CAM Neural Attention</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                <span>Original Leaf (0%)</span>
                <span>Blended</span>
                <span>Full Heatmap (100%)</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Badges & Classification Probabilities */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* Diagnostic Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100/80 px-3 py-1.5 text-xs font-bold text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
              <Leaf className="h-3.5 w-3.5" />
              {result.cropName}
            </span>

            <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-2xs ${confidenceColor(result.confidence)}`}>
              <Target className="h-3.5 w-3.5" />
              {result.confidence?.toFixed(1)}% Confidence
            </span>

            {result.severity && (
              <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-2xs ${severityColor(result.severity)}`}>
                <TrendingUp className="h-3.5 w-3.5" />
                {result.severity} Severity
              </span>
            )}

            {remedies?.pathogenType && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Search className="h-3 w-3" />
                {remedies.pathogenType}
              </span>
            )}
          </div>

          {/* Top-4 Classification Probability Breakdown */}
          {result.topPredictions?.length > 0 && (
            <div className="rounded-2xl bg-slate-50/90 p-4 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Neural Classification Distribution
              </h3>
              <div className="space-y-2.5">
                {result.topPredictions.slice(0, 4).map((p, i) => (
                  <div key={`${p.rawClass}-${i}`}>
                    <div className="mb-1 flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{p.diseaseName}</span>
                      <span className="text-slate-600 dark:text-slate-400">{p.confidence?.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          i === 0
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm'
                            : 'bg-slate-400 dark:bg-slate-600'
                        }`}
                        style={{ width: `${Math.min(p.confidence, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Summary Advisory */}
          <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/40">
            <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              <Info className="h-4 w-4" />
              Agronomic Advisory
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
              {result.advisory}
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive Remedies & Treatment Section */}
      <div className="border-t border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Prescribed Treatment & Management
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Integrated Pest & Disease Management strategies tailored for {result.cropName}.
            </p>
          </div>

          {/* Tab Filters */}
          <div className="flex flex-wrap gap-1 rounded-2xl bg-white p-1 shadow-xs border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            {[
              { id: 'all', label: 'All', icon: Sparkles },
              { id: 'organic', label: 'Organic', icon: Leaf, count: remedies?.organic?.length },
              { id: 'chemical', label: 'Chemical', icon: FlaskConical, count: remedies?.chemical?.length },
              { id: 'prevention', label: 'Prevention', icon: ShieldCheck, count: remedies?.prevention?.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count && tab.count > 0 ? (
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Immediate Containment Notice */}
        {remedies?.immediateActions?.length > 0 && (
          <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/90 p-4 text-orange-950 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-200 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-300 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-900 dark:text-orange-300">
                  Immediate Containment Steps
                </h4>
                <ul className="mt-1.5 space-y-1 text-xs list-disc list-inside font-medium leading-relaxed">
                  {remedies.immediateActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {/* Organic Remedies */}
          {(activeTab === 'all' || activeTab === 'organic') && remedies?.organic?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-emerald-200/60 pb-2 dark:border-slate-800">
                <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Organic & Biological Controls
                </h4>
              </div>

              {remedies.organic.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-emerald-300 dark:hover:border-emerald-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-sm text-emerald-950 dark:text-emerald-300">{item.title}</h5>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                      Organic
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    <strong>Application:</strong> {item.application}
                  </p>
                  {item.notes && (
                    <p className="mt-2 rounded-xl bg-emerald-50/70 p-2 text-[11px] text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
                      💡 {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Chemical Treatments */}
          {(activeTab === 'all' || activeTab === 'chemical') && remedies?.chemical?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2 dark:border-slate-800">
                <FlaskConical className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Targeted Chemical Treatments
                </h4>
              </div>

              {remedies.chemical.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-amber-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-amber-300 dark:hover:border-amber-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-sm text-amber-950 dark:text-amber-200">{item.name}</h5>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                      Conventional
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-amber-50/80 px-3 py-1.5 text-xs font-bold text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    <span>Dosage:</span>
                    <span>{item.dosage}</span>
                  </div>
                  {item.safety && (
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      ⚠️ <strong>Safety note:</strong> {item.safety}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Prevention & Cultural Care */}
          {(activeTab === 'all' || activeTab === 'prevention') && remedies?.prevention?.length > 0 && (
            <div className={`space-y-3 ${activeTab === 'prevention' ? 'md:col-span-2' : ''}`}>
              <div className="flex items-center gap-2 border-b border-teal-200/60 pb-2 dark:border-slate-800">
                <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Prevention & Cultural Practices
                </h4>
              </div>

              {remedies.prevention.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-teal-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <h5 className="font-bold text-sm text-teal-950 dark:text-teal-300">{item.title}</h5>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}