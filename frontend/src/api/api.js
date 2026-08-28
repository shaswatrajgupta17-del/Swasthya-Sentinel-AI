const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'http://localhost:8000'

async function getJson(path) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`)
    if (!response.ok) {
      console.error(`[API GET Failed] ${path} -> HTTP ${response.status}`)
      throw new Error(`API request failed: ${response.status} on ${path}`)
    }
    return await response.json()
  } catch (err) {
    console.error(`[API Network Error] GET ${path}:`, err.message)
    throw err
  }
}

async function postJson(path, body) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      console.error(`[API POST Failed] ${path} -> HTTP ${response.status}`)
      throw new Error(`API request failed: ${response.status} on ${path}`)
    }
    return await response.json()
  } catch (err) {
    console.error(`[API Network Error] POST ${path}:`, err.message)
    throw err
  }
}

export function getHealth() {
  return getJson('/health')
}

export function getLocations() {
  return getJson('/locations')
}

export function getRisks() {
  return getJson('/risks')
}

export function getAlerts(status = null) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return getJson(`/alerts${query}`)
}

export function getSignalsSummary() {
  return getJson('/signals/summary')
}

export function getRiskDetails(locationId) {
  return getJson(`/risks/${locationId}`)
}

export function getLocation(locationId) {
  return getJson(`/locations/${locationId}`)
}

export function getSignalTrends(locationId, days = 14) {
  return getJson(`/signals/trends/${locationId}?days=${days}`)
}

export function getInsights() {
  return getJson('/insights')
}

export function getSimulationStatus() {
  return getJson('/simulation/status')
}

export function startSimulation(scenario = 'NORMAL', speed = 1.0) {
  return postJson('/simulation/start', { scenario, speed })
}

export function pauseSimulation() {
  return postJson('/simulation/pause', {})
}

export function resetSimulation() {
  return postJson('/simulation/reset', {})
}

export function getNotificationStatus() {
  return getJson('/notifications/status')
}

export function updateAlertStatus(alertId, status) {
  return postJson(`/alerts/${alertId}/status`, { status })
}

export function triggerRiskRun() {
  return postJson('/internal/run-risk', {})
}
