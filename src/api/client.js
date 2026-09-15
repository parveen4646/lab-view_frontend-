// All requests go through Vite's dev proxy (see vite.config.js) in development,
// or can be pointed at an absolute URL in production via VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL || ''

async function parseErrorDetail(res, fallback) {
  try {
    const data = await res.json()
    if (data && data.detail) return typeof data.detail === 'string' ? data.detail : fallback
  } catch (e) {
    // response wasn't JSON — use fallback
  }
  return fallback
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res, `Request failed (${res.status})`))
  }
  if (res.status === 204) return null
  return res.json()
}

// Uploads a PDF and runs the extraction agent server-side. Returns the
// proposed report + tests for the user to review before saving.
export async function extractReport(file, onSlowNotice) {
  const formData = new FormData()
  formData.append('file', file)
  const timer = onSlowNotice ? setTimeout(onSlowNotice, 6000) : null
  try {
    const res = await fetch(`${BASE_URL}/api/reports/extract`, { method: 'POST', body: formData })
    if (!res.ok) {
      throw new Error(await parseErrorDetail(res, `Could not read that file (${res.status})`))
    }
    return res.json()
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export function listReports() {
  return request('/api/reports')
}

export function saveReport(payload) {
  return request('/api/reports', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteReport(id) {
  return request(`/api/reports/${id}`, { method: 'DELETE' })
}

export function clearAllReports() {
  return request('/api/reports', { method: 'DELETE' })
}

export function getInsight() {
  return request('/api/insights')
}

export function askQuestion(query) {
  return request('/api/ask', { method: 'POST', body: JSON.stringify({ query }) })
}
