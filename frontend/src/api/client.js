import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { Accept: 'application/json' },
  withCredentials: true,
})

export function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = import.meta.env.VITE_API_URL || ''
  return `${base}${url}`
}

export async function predictCropHealth(imageFile, explain = false) {
  const formData = new FormData()
  formData.append('image', imageFile)
  const { data } = await api.post('/api/crop/predict', formData, {
    params: { explain },
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function predictBatch(imageFiles) {
  const formData = new FormData()
  imageFiles.forEach((file) => formData.append('images', file))
  const { data } = await api.post('/api/crop/predict/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function fetchAnalytics() {
  const { data } = await api.get('/api/crop/analytics')
  return data
}

export async function fetchPredictionHistory(page = 0, size = 12) {
  const { data } = await api.get('/api/crop/history', { params: { page, size } })
  return data
}

export async function fetchHealth() {
  const { data } = await api.get('/api/health')
  return data
}

export async function fetchWeatherAdvisory(city = 'New Delhi') {
  const { data } = await api.get('/api/weather', { params: { city } })
  return data
}

export default api
