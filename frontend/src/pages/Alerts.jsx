import { useEffect, useState } from 'react'
import { getAlerts } from '../api/api'
import EmptyState from '../components/EmptyState'
import RiskBadge from '../components/RiskBadge'

/** Map the FastAPI /alerts response shape to the fields the UI needs. */
function normaliseAlert(raw) {
  const severityScore = raw.severity === 'high' ? 80 : raw.severity === 'medium' ? 55 : 25
  return {
    id: raw.id,
    location: raw.location_id,
    createdAt: raw.created_at ? new Date(raw.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—',
    score: severityScore,
    status: raw.status === 'open' ? 'Open' : raw.status === 'acknowledged' ? 'Acknowledged' : raw.status,
    syndrome: '—',
    topFactor: `Severity: ${raw.severity} · Synthetic aggregate signals · not a diagnosis`,
    dataMode: raw.data_mode,
  }
}

function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadAlerts() {
      setLoading(true)
      setError('')
      try {
        const data = await getAlerts()
        if (!cancelled) setAlerts(data.map(normaliseAlert))
      } catch {
        if (!cancelled) setError('Backend unavailable. Start FastAPI server.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAlerts()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-sentinel-ink sm:text-2xl">Alerts</h1>
          <p className="mt-1 text-sm text-slate-600">Geographic notices for public health review · synthetic data only.</p>
        </div>
        <EmptyState title="Loading alerts..." message="Fetching alert records from FastAPI /alerts endpoint." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-sentinel-ink sm:text-2xl">Alerts</h1>
          <p className="mt-1 text-sm text-slate-600">Geographic notices for public health review · synthetic data only.</p>
        </div>
        <EmptyState
          title="Backend unavailable. Start FastAPI server."
          message="Run `python backend/seed_database.py`, then `uvicorn backend.app.main:app --reload`, and refresh this page."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sentinel-ink sm:text-2xl">Alerts</h1>
        <p className="mt-1 text-sm text-slate-600">
          Geographic notices for public health review · synthetic data only · not a medical diagnosis.
        </p>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          title="No alerts found"
          message="No alert records were returned by the FastAPI backend. Re-seed the database or check the /alerts endpoint."
        />
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => {
            const isHigh = alert.score >= 70
            return (
              <li
                key={alert.id}
                className={`rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm ${
                  isHigh ? 'border-l-4 border-l-risk-high' : ''
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sentinel-ink">{alert.location}</p>
                    <p className="text-xs text-slate-500">{alert.createdAt}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge
                      score={alert.score}
                      category={alert.score >= 70 ? 'High' : alert.score >= 40 ? 'Watch' : 'Low'}
                    />
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        alert.status === 'Open'
                          ? 'bg-sentinel-teal/15 text-sentinel-teal'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-700">{alert.topFactor}</p>
                <p className="mt-1 text-xs text-slate-500">Synthetic aggregate data · not a diagnosis</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Alerts
