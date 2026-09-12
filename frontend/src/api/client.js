import axios from 'axios'

// Retry configuration
const MAX_RETRIES = 4
const RETRY_DELAY = 1200 // Initial delay in ms

// Sleep function for retry delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Retry logic with exponential backoff & cold-start awareness
const retryRequest = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error

    // Don't retry on 4xx client errors except 429 (rate limit) or 408 (timeout)
    if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429 && error.response.status !== 408) {
      throw error
    }

    const nextAttempt = MAX_RETRIES - retries + 1
    console.log(`Retrying request... (${nextAttempt}/${MAX_RETRIES})`)
    await sleep(RETRY_DELAY * nextAttempt) // Exponential backoff
    return retryRequest(fn, retries - 1)
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { Accept: 'application/json' },
  withCredentials: true,
  timeout: 60000, // 60s timeout for cold starts
})

// Direct client for ML service (bypasses sleeping backend to wake ML container simultaneously)
const directMlUrl = import.meta.env.VITE_ML_DIRECT_URL || 'https://krishicare-ml.onrender.com'
const mlDirectClient = axios.create({
  baseURL: directMlUrl,
  timeout: 35000,
})

// Request interceptor for auth & session telemetry
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('krishi_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Persistent guest session identifier for cross-origin reliability
    let sessionId = localStorage.getItem('krishi_session_id')
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36)
      localStorage.setItem('krishi_session_id', sessionId)
    }
    config.headers['X-Session-Id'] = sessionId

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for user-friendly error messages & session sync
api.interceptors.response.use(
  (response) => {
    const serverSession = response.headers?.['x-session-id']
    if (serverSession) {
      localStorage.setItem('krishi_session_id', serverSession)
    }
    return response
  },
  (error) => {

    if (error.code === 'ECONNABORTED') {
      error.message = 'Cloud servers are warming up from dormancy. Please wait a moment.'
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network connection issue or cloud server is waking up. Please try again.'
    } else if (error.response?.status === 503) {
      const detail = error.response?.data?.detail || error.response?.data?.message
      error.message = detail || 'AI model is loading into memory. Ready in a few seconds.'
    }
    return Promise.reject(error)
  }
)

export function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url
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
  const { data } = await api.get('/api/health', { timeout: 15000 })
  return data
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

/**
 * Parallel Multi-Channel Wake-up:
 * Fires wake-up signals concurrently to:
 * 1. Backend proxy /api/ml/wakeup
 * 2. Backend ping /api/ping
 * 3. Direct ML service /wakeup (if on Render/cloud)
 * 4. Image beacon ping (forces browser HTTP connection open)
 */
export async function wakeUpAllServices() {
  console.log('⚡ Waking up KrishiCare Cloud backend & AI model...')
  
  // 1. Image Beacon (lightweight HTTP wake-up)
  try {
    const img = new Image()
    img.src = `${import.meta.env.VITE_API_URL || ''}/api/ping?t=${Date.now()}`
  } catch (e) {
    // Ignore beacon errors
  }

  // 2. Parallel wake-up promises
  const promises = []

  // Backend wake-up ping
  promises.push(
    api.get('/api/ml/wakeup', { timeout: 35000 })
      .then((res) => ({ channel: 'backend-wakeup', data: res.data, success: true }))
      .catch((err) => ({ channel: 'backend-wakeup', error: err.message, success: false }))
  )

  // Fast backend ping
  promises.push(
    api.get('/api/ping', { timeout: 15000 })
      .then((res) => ({ channel: 'backend-ping', data: res.data, success: true }))
      .catch((err) => ({ channel: 'backend-ping', error: err.message, success: false }))
  )

  // Direct ML service wake-up (for when backend is still starting)
  if (directMlUrl && !directMlUrl.includes('localhost')) {
    promises.push(
      mlDirectClient.get('/wakeup', { timeout: 35000 })
        .then((res) => ({ channel: 'direct-ml', data: res.data, success: true }))
        .catch((err) => ({ channel: 'direct-ml', error: err.message, success: false }))
    )
  }

  const results = await Promise.allSettled(promises)
  return results
}

export async function wakeUpService() {
  return wakeUpAllServices()
}

/**
 * Helper to generate realistic sample leaf images with HTML5 canvas for 1-click test runs
 */
export async function createSampleLeafFile(sampleType) {
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 400
  const ctx = canvas.getContext('2d')

  // Background gradient (natural garden background)
  const bgGrad = ctx.createRadialGradient(200, 200, 50, 200, 200, 250)
  bgGrad.addColorStop(0, '#f0fdf4')
  bgGrad.addColorStop(1, '#dcfce7')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 400, 400)

  // Draw Leaf Shape
  ctx.save()
  ctx.translate(200, 200)
  ctx.rotate(-Math.PI / 12)

  ctx.beginPath()
  ctx.moveTo(0, -150)
  ctx.bezierCurveTo(90, -100, 110, 80, 0, 150)
  ctx.bezierCurveTo(-110, 80, -90, -100, 0, -150)
  ctx.closePath()

  // Base Leaf Color
  let leafColor = '#22c55e'
  if (sampleType === 'tomato_early_blight') leafColor = '#16a34a'
  else if (sampleType === 'potato_late_blight') leafColor = '#15803d'
  else if (sampleType === 'apple_scab') leafColor = '#4ade80'
  else if (sampleType === 'healthy') leafColor = '#10b981'

  const leafGrad = ctx.createLinearGradient(-100, -150, 100, 150)
  leafGrad.addColorStop(0, leafColor)
  leafGrad.addColorStop(1, '#14532d')
  ctx.fillStyle = leafGrad
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = '#064e3b'
  ctx.stroke()

  // Main Stem / Vein
  ctx.beginPath()
  ctx.moveTo(0, -145)
  ctx.lineTo(0, 145)
  ctx.lineWidth = 4
  ctx.strokeStyle = '#86efac'
  ctx.stroke()

  // Side Veins
  for (let y = -110; y <= 110; y += 35) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.quadraticCurveTo(35, y - 15, 65, y - 25)
    ctx.moveTo(0, y)
    ctx.quadraticCurveTo(-35, y - 15, -65, y - 25)
    ctx.lineWidth = 2
    ctx.strokeStyle = '#a7f3d0'
    ctx.stroke()
  }

  // Add specific disease symptoms
  if (sampleType === 'tomato_early_blight') {
    // Concentric ring lesions (Early Blight signature)
    const spots = [{ x: -30, y: -40, r: 24 }, { x: 25, y: 30, r: 18 }, { x: -15, y: 60, r: 15 }]
    spots.forEach((s) => {
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r + 6, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(234, 179, 8, 0.7)' // Yellow halo
      ctx.fill()

      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = '#713f12' // Dark brown target spot
      ctx.fill()

      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r * 0.5, 0, Math.PI * 2)
      ctx.strokeStyle = '#451a03'
      ctx.lineWidth = 2
      ctx.stroke()
    })
  } else if (sampleType === 'potato_late_blight') {
    // Water-soaked dark necrotic blotches
    const blotches = [{ x: 20, y: -50, rx: 35, ry: 20 }, { x: -25, y: 20, rx: 40, ry: 25 }]
    blotches.forEach((b) => {
      ctx.beginPath()
      ctx.ellipse(b.x, b.y, b.rx, b.ry, Math.PI / 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(67, 20, 7, 0.85)' // Dark brown/black necrotic
      ctx.fill()
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)' // Pale border
      ctx.lineWidth = 4
      ctx.stroke()
    })
  } else if (sampleType === 'apple_scab') {
    // Olive/velvety dark spots
    const scabs = [{ x: -20, y: -20, r: 12 }, { x: 30, y: -10, r: 16 }, { x: 10, y: 45, r: 14 }, { x: -35, y: 40, r: 10 }]
    scabs.forEach((s) => {
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = '#3f3f46'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r * 0.7, 0, Math.PI * 2)
      ctx.fillStyle = '#1c1917'
      ctx.fill()
    })
  }

  ctx.restore()

  // Convert canvas to Blob & File
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], `${sampleType}_sample_leaf.jpg`, { type: 'image/jpeg' })
      resolve(file)
    }, 'image/jpeg', 0.95)
  })
}

export default api


