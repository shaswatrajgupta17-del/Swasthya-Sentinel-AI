/**
 * Static mock data for Phase 1 only.
 * Later phases replace this with FastAPI responses.
 * All names and counts are synthetic. No personal health information.
 */

export const DISTRICT_NAME = 'Kalyanpur (demo district)'

export const LAST_ENGINE_RUN = '27 Aug 2026, 18:00 IST'

export const MODEL_VERSION = 'mock-ui-v1'

export const locations = [
  {
    id: 'loc-rampur',
    villageName: 'Rampur',
    type: 'Village',
    block: 'East block',
    district: DISTRICT_NAME,
    riskScore: 82,
    riskCategory: 'High',
    syndrome: 'Diarrhea',
    coordinates: { lat: 23.184, lng: 79.952 },
    topFactor: 'ASHA diarrhea reports and ORS sales above baseline',
  },
  {
    id: 'loc-sitapur',
    villageName: 'Sitapur',
    type: 'Village',
    block: 'East block',
    district: DISTRICT_NAME,
    riskScore: 76,
    riskCategory: 'High',
    syndrome: 'Diarrhea',
    coordinates: { lat: 23.191, lng: 79.961 },
    topFactor: 'OPD symptom counts rising with neighbouring Rampur',
  },
  {
    id: 'loc-phc-east',
    villageName: 'East PHC catchment',
    type: 'PHC',
    block: 'East block',
    district: DISTRICT_NAME,
    riskScore: 71,
    riskCategory: 'High',
    syndrome: 'Diarrhea',
    coordinates: { lat: 23.188, lng: 79.956 },
    topFactor: 'Pharmacy ORS units spiked over 7 days',
  },
  {
    id: 'loc-madhavpur',
    villageName: 'Madhavpur',
    type: 'Village',
    block: 'West block',
    district: DISTRICT_NAME,
    riskScore: 58,
    riskCategory: 'Watch',
    syndrome: 'Fever',
    coordinates: { lat: 23.201, lng: 79.91 },
    topFactor: 'Mild ASHA fever reports vs last month',
  },
  {
    id: 'loc-bilkhera',
    villageName: 'Bilkhera',
    type: 'Village',
    block: 'West block',
    district: DISTRICT_NAME,
    riskScore: 44,
    riskCategory: 'Watch',
    syndrome: 'Cough',
    coordinates: { lat: 23.21, lng: 79.9 },
    topFactor: 'OPD cough counts slightly above baseline',
  },
  {
    id: 'loc-gokul',
    villageName: 'Gokul',
    type: 'Village',
    block: 'North block',
    district: DISTRICT_NAME,
    riskScore: 22,
    riskCategory: 'Low',
    syndrome: 'Fever',
    coordinates: { lat: 23.22, lng: 79.94 },
    topFactor: 'Signals near the usual seasonal range',
  },
  {
    id: 'loc-narsingh',
    villageName: 'Narsingh Kheda',
    type: 'Village',
    block: 'North block',
    district: DISTRICT_NAME,
    riskScore: 18,
    riskCategory: 'Low',
    syndrome: 'Rash',
    coordinates: { lat: 23.175, lng: 79.92 },
    topFactor: 'No unusual multi-source movement',
  },
  {
    id: 'loc-amra',
    villageName: 'Amra Tola',
    type: 'Village',
    block: 'South block',
    district: DISTRICT_NAME,
    riskScore: 31,
    riskCategory: 'Low',
    syndrome: 'Fever',
    coordinates: { lat: 23.16, lng: 79.97 },
    topFactor: 'Stable ASHA and OPD counts',
  },
]

export const alerts = [
  {
    id: 'alert-1',
    location: 'Rampur',
    locationId: 'loc-rampur',
    score: 82,
    status: 'Open',
    syndrome: 'Diarrhea',
    topFactor: 'ASHA diarrhea reports and ORS sales above baseline',
    createdAt: '27 Aug 2026, 18:05 IST',
  },
  {
    id: 'alert-2',
    location: 'Sitapur',
    locationId: 'loc-sitapur',
    score: 76,
    status: 'Open',
    syndrome: 'Diarrhea',
    topFactor: 'OPD symptom counts rising with neighbouring Rampur',
    createdAt: '27 Aug 2026, 18:05 IST',
  },
  {
    id: 'alert-3',
    location: 'East PHC catchment',
    locationId: 'loc-phc-east',
    score: 71,
    status: 'Acknowledged',
    syndrome: 'Diarrhea',
    topFactor: 'Pharmacy ORS units spiked over 7 days',
    createdAt: '26 Aug 2026, 09:12 IST',
  },
]

export const kpis = {
  locationsMonitored: locations.length,
  openAlerts: alerts.filter((a) => a.status === 'Open').length,
  highestRiskScore: Math.max(...locations.map((l) => l.riskScore)),
  lastEngineRun: LAST_ENGINE_RUN,
}

export const SYNDROME_OPTIONS = ['All', 'Diarrhea', 'Fever', 'Cough', 'Rash']
export const DAY_OPTIONS = [7, 14, 30]
