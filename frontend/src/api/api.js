// REST wrapper for the local FastAPI server. No health or risk logic belongs here.
const API_BASE_URL = 'http://localhost:8000'

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)
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

