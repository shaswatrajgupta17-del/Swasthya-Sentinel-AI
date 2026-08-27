/**
 * Phase 2 presentation data only. All village names, coordinates and counts are fictional.
 * Coordinates mark demo locations, never patient or household locations.
 */

const dates = [
  '14 Aug', '15 Aug', '16 Aug', '17 Aug', '18 Aug', '19 Aug', '20 Aug',
  '21 Aug', '22 Aug', '23 Aug', '24 Aug', '25 Aug', '26 Aug', '27 Aug',
]

function trend(asha, opd, pharmacy) {
  return dates.map((date, index) => ({
    date,
    ashaReports: asha[index],
    opdCases: opd[index],
    pharmacyDemand: pharmacy[index],
  }))
}

const clusterTrend = trend(
  [3, 4, 3, 4, 5, 4, 5, 6, 7, 9, 11, 14, 17, 20],
  [4, 3, 4, 5, 4, 5, 5, 6, 8, 9, 11, 13, 16, 18],
  [8, 9, 8, 10, 9, 10, 11, 12, 14, 17, 21, 25, 29, 33],
)

const quietTrend = trend(
  [2, 3, 2, 3, 2, 2, 3, 2, 3, 3, 2, 2, 3, 2],
  [3, 3, 4, 3, 4, 3, 3, 4, 3, 3, 4, 3, 3, 4],
  [7, 8, 8, 7, 8, 8, 7, 8, 7, 8, 8, 7, 8, 8],
)

export const locations = [
  {
    id: 'rampur', name: 'Rampur', lat: 23.184, lng: 79.952, riskScore: 82, riskCategory: 'High', syndrome: 'Diarrhea',
    factors: ['ASHA diarrhea reports increased over the previous week', 'OPD symptoms are above the local baseline', 'Pharmacy ORS demand increased alongside nearby villages'],
    trendData: clusterTrend,
  },
  {
    id: 'lakshmipur', name: 'Lakshmipur', lat: 23.190, lng: 79.960, riskScore: 78, riskCategory: 'High', syndrome: 'Diarrhea',
    factors: ['ASHA diarrhea reports increased over the previous week', 'OPD symptoms are above the local baseline', 'Pharmacy ORS demand increased alongside nearby villages'],
    trendData: trend([3, 3, 4, 3, 4, 5, 5, 6, 8, 9, 10, 13, 15, 17], [4, 4, 3, 4, 5, 4, 5, 6, 7, 8, 10, 12, 14, 16], [8, 8, 9, 9, 10, 10, 11, 12, 13, 16, 19, 23, 27, 30]),
  },
  {
    id: 'devgaon', name: 'Devgaon', lat: 23.178, lng: 79.961, riskScore: 73, riskCategory: 'High', syndrome: 'Diarrhea',
    factors: ['ASHA reports rose across several consecutive days', 'OPD symptom counts are above baseline', 'Pharmacy demand increased with adjacent villages'],
    trendData: trend([2, 3, 3, 3, 4, 4, 5, 5, 6, 8, 9, 11, 13, 15], [3, 4, 3, 4, 4, 4, 5, 5, 6, 7, 9, 10, 12, 14], [7, 8, 8, 8, 9, 9, 10, 10, 12, 14, 17, 20, 23, 26]),
  },
  {
    id: 'madhavpur', name: 'Madhavpur', lat: 23.205, lng: 79.915, riskScore: 34, riskCategory: 'Low', syndrome: 'Fever',
    factors: ['Signals remain within the expected local range', 'No multi-source rise is present', 'No nearby location is elevated'],
    trendData: trend([3, 3, 4, 3, 4, 3, 4, 5, 4, 5, 4, 5, 5, 6], [4, 5, 4, 5, 5, 4, 5, 5, 6, 5, 6, 5, 6, 6], [8, 9, 8, 9, 8, 9, 9, 8, 9, 9, 8, 9, 9, 9]),
  },
  {
    id: 'bansipur', name: 'Bansipur', lat: 23.220, lng: 79.938, riskScore: 38, riskCategory: 'Low', syndrome: 'Cough',
    factors: ['Signals remain within the expected local range', 'No multi-source rise is present', 'No nearby location is elevated'], trendData: quietTrend,
  },
  {
    id: 'chandpur', name: 'Chandpur', lat: 23.212, lng: 79.980, riskScore: 29, riskCategory: 'Low', syndrome: 'Fever',
    factors: ['Signals remain within the expected local range', 'No multi-source rise is present', 'No nearby location is elevated'], trendData: quietTrend,
  },
  {
    id: 'gokulwadi', name: 'Gokulwadi', lat: 23.165, lng: 79.925, riskScore: 24, riskCategory: 'Low', syndrome: 'Rash',
    factors: ['Signals remain within the expected local range', 'No multi-source rise is present', 'No nearby location is elevated'], trendData: quietTrend,
  },
  {
    id: 'sundarpur', name: 'Sundarpur', lat: 23.155, lng: 79.987, riskScore: 18, riskCategory: 'Low', syndrome: 'Fever',
    factors: ['Signals remain within the expected local range', 'No multi-source rise is present', 'No nearby location is elevated'], trendData: quietTrend,
  },
]

export const DEMO_DISTRICT_CENTER = [23.19, 79.95]
