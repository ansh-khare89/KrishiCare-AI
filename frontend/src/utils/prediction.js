export function isHealthy(diseaseName) {
  return diseaseName?.toLowerCase().includes('healthy')
}

export function confidenceColor(confidence) {
  if (confidence >= 85) return 'text-leaf-600 bg-leaf-100 dark:text-leaf-300 dark:bg-leaf-900/40'
  if (confidence >= 60) return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40'
  return 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40'
}

export function severityColor(severity) {
  switch (severity) {
    case 'High':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    case 'Moderate':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    case 'Low':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
    default:
      return 'bg-leaf-100 text-leaf-700 dark:bg-leaf-900/40 dark:text-leaf-300'
  }
}
