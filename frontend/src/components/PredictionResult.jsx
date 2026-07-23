import { AlertTriangle, CheckCircle2, Download, Leaf, ShieldAlert } from 'lucide-react'
import { resolveImageUrl } from '../api/client'
import { confidenceColor, isHealthy, severityColor } from '../utils/prediction'
import { printDiagnosisReport } from '../utils/report'

export default function PredictionResult({ result }) {
  const healthy = isHealthy(result.diseaseName)
  const lowConfidence = result.confidence < 60

  return (
    <div className="overflow-hidden rounded-2xl border border-leaf-200 bg-white/80 shadow-lg shadow-leaf-900/5 backdrop-blur dark:border-earth-700 dark:bg-earth-900/80">
      <div
        className={`flex items-center gap-3 px-6 py-4 ${healthy ? 'bg-leaf-600' : 'bg-amber-600'} text-white`}
      >
        {healthy ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
        <div>
          <p className="text-sm font-medium opacity-90">Diagnosis complete</p>
          <h2 className="text-xl font-bold">{result.diseaseName}</h2>
        </div>
      </div>

      {lowConfidence && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Low confidence — double-check with a local agronomist before treating.
        </div>
      )}

      <div className="grid gap-6 p-6 md:grid-cols-2">
        <div className="space-y-4">
          {result.imageUrl && (
            <div className="overflow-hidden rounded-xl border border-leaf-100 bg-earth-50 dark:border-earth-700 dark:bg-earth-800">
              <img
                src={resolveImageUrl(result.imageUrl)}
                alt="Analyzed leaf"
                className="h-56 w-full object-cover"
              />
            </div>
          )}
          {result.heatmapBase64 && (
            <div className="overflow-hidden rounded-xl border border-amber-200 bg-earth-50 dark:border-amber-900 dark:bg-earth-800">
              <p className="bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Grad-CAM — model focus area
              </p>
              <img
                src={`data:image/png;base64,${result.heatmapBase64}`}
                alt="Grad-CAM heatmap"
                className="h-56 w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1 text-sm font-medium text-leaf-800 dark:bg-leaf-900/40 dark:text-leaf-300">
              <Leaf className="h-3.5 w-3.5" />
              {result.cropName}
            </span>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${confidenceColor(result.confidence)}`}
            >
              {result.confidence?.toFixed(1)}% confidence
            </span>
            {result.severity && (
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${severityColor(result.severity)}`}
              >
                {result.severity} severity
              </span>
            )}
            {result.modelVersion && (
              <span className="inline-flex rounded-full bg-earth-100 px-3 py-1 text-xs text-earth-600 dark:bg-earth-800 dark:text-earth-300">
                model {result.modelVersion}
              </span>
            )}
          </div>

          {result.topPredictions?.length > 0 && (
            <div className="rounded-xl bg-earth-50 p-4 dark:bg-earth-800/60">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-earth-700 dark:text-earth-300">
                Top predictions
              </h3>
              <div className="space-y-2">
                {result.topPredictions.map((p, i) => (
                  <div key={`${p.rawClass}-${i}`}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-earth-800 dark:text-earth-200">{p.diseaseName}</span>
                      <span className="font-medium text-earth-600 dark:text-earth-400">
                        {p.confidence?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-earth-200 dark:bg-earth-700">
                      <div
                        className="h-full rounded-full bg-leaf-500 transition-all"
                        style={{ width: `${Math.min(p.confidence, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-earth-50 p-4 dark:bg-earth-800/60">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-earth-700 dark:text-earth-300">
              Advisory
            </h3>
            <p className="text-sm leading-relaxed text-earth-800 dark:text-earth-200">{result.advisory}</p>
          </div>

          {result.timestamp && (
            <p className="text-xs text-earth-700/50 dark:text-earth-400">
              Analyzed on {new Date(result.timestamp).toLocaleString()}
            </p>
          )}

          <button
            type="button"
            onClick={() => printDiagnosisReport(result)}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-leaf-200 px-4 py-2 text-sm font-medium text-leaf-700 hover:bg-leaf-50 dark:border-earth-600 dark:text-leaf-300 dark:hover:bg-earth-800"
          >
            <Download className="h-4 w-4" />
            Download report
          </button>
        </div>
      </div>
    </div>
  )
}
