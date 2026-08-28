// REST wrapper for the local FastAPI server. No health or risk logic belongs here.
const API_BASE_URL = 'http://localhost:8000'

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  return response.json()
}

async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  return response.json()
}

export function getLocations() {
  return getJson('/locations')
}

export function getRisks() {
  return getJson('/risks')
}

export function getAlerts() {
  return getJson('/alerts')
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

export function startSimulation(scenario, speed) {
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

