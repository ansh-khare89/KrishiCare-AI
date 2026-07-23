import { DISEASES } from '../data/diseases'

export default function EncyclopediaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-earth-900 dark:text-earth-50">Disease guide</h1>
        <p className="mt-2 text-earth-600 dark:text-earth-400">
          Quick reference for tomato and potato leaf diseases.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {DISEASES.map((d) => (
          <article
            key={d.id}
            className="rounded-2xl border border-leaf-100 bg-white/80 p-6 backdrop-blur dark:border-earth-700 dark:bg-earth-900/80"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-leaf-100 px-2.5 py-0.5 text-xs font-medium text-leaf-700 dark:bg-leaf-900/40 dark:text-leaf-300">
                {d.crop}
              </span>
              <h2 className="text-lg font-semibold text-earth-900 dark:text-earth-50">{d.name}</h2>
            </div>
            <div className="space-y-3 text-sm text-earth-700 dark:text-earth-300">
              <p><span className="font-medium text-earth-900 dark:text-earth-100">Symptoms:</span> {d.symptoms}</p>
              <p><span className="font-medium text-earth-900 dark:text-earth-100">Prevention:</span> {d.prevention}</p>
              <p><span className="font-medium text-earth-900 dark:text-earth-100">Treatment:</span> {d.treatment}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
