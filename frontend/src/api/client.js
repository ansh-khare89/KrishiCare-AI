import axios from 'axios'

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // Initial delay in ms

// Sleep function for retry delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Retry logic with exponential backoff
const retryRequest = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error
    
    // Don't retry on 4xx errors (client errors)
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      throw error
    }
    
    console.log(`Retrying request... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`)
    await sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1)) // Exponential backoff
    return retryRequest(fn, retries - 1)
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { Accept: 'application/json' },
  withCredentials: true,
  timeout: 45000, // 45 second timeout (increased for Render wake-up)
})

// Add request interceptor for auth and debugging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('krishi_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
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
    
    // Provide better error messages
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. The service may be waking up. Please try again.'
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error. Please check your connection and try again.'
    } else if (error.response?.status === 503) {
      const detail = error.response?.data?.detail || error.response?.data?.message
      error.message = detail || 'Service temporarily unavailable. Please try again in a moment.'
    }
    
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
  return retryRequest(async () => {
    const formData = new FormData()
    formData.append('image', imageFile)
    const { data } = await api.post('/api/crop/predict', formData, {
      params: { explain },
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  })
}

export async function predictBatch(imageFiles) {
  return retryRequest(async () => {
    const formData = new FormData()
    imageFiles.forEach((file) => formData.append('images', file))
    const { data } = await api.post('/api/crop/predict/batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  })
}

export async function fetchAnalytics() {
  return retryRequest(async () => {
    const { data } = await api.get('/api/crop/analytics')
    return data
  })
}

export async function fetchPredictionHistory(page = 0, size = 12) {
  return retryRequest(async () => {
    const { data } = await api.get('/api/crop/history', { params: { page, size } })
    return data
  })
}

export async function fetchHealth() {
  return retryRequest(async () => {
    const { data } = await api.get('/api/health')
    return data
  })
}

export async function fetchWeatherAdvisory(city = 'New Delhi') {
  return retryRequest(async () => {
    const { data } = await api.get('/api/weather', { params: { city } })
    return data
  })
}

// Auth API methods
export async function loginUser(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password })
  return data
}

export async function registerUser(name, email, password) {
  const { data } = await api.post('/api/auth/register', { name, email, password })
  return data
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/api/auth/me')
  return data
}

// Wake up backend and ML service by pinging ML wake-up endpoint
export async function wakeUpService() {
  try {
    const { data } = await api.get('/api/ml/wakeup', { timeout: 20000 })
    return data
  } catch (error) {
    console.log('Service wake-up ping failed:', error.message)
    return { success: false, message: error.message }
  }
}

export default api

