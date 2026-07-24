import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { Accept: 'application/json' },
  withCredentials: true,
  timeout: 30000, // 30 second timeout
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || '')
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.url} - Status: ${response.status}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url, error.message)
    return Promise.reject(error)
  }
)

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
