import { useEffect, useState, useCallback, useRef } from 'react'
import {
  ArrowLeft,
  Activity,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { getRiskDetails, getAlerts, getLocation, updateAlertStatus, getLocations, getSignalTrends } from '../api/api'
import RiskBadge from '../components/RiskBadge'
import TrendPanel from '../components/TrendPanel'

function AlertStatusBadge({ status }) {
  const map = {
    open: { label: 'Open', bg: 'rgba(220,38,38,0.1)', fg: 'var(--red)' },
    new: { label: 'New', bg: 'rgba(220,38,38,0.1)', fg: 'var(--red)' },
    investigating: { label: 'Under review', bg: 'rgba(217,119,6,0.1)', fg: 'var(--amber)' },
    acknowledged: { label: 'Acknowledged', bg: 'rgba(14,124,123,0.1)', fg: 'var(--teal)' },
    resolved: { label: 'Resolved', bg: 'rgba(42,157,143,0.1)', fg: 'var(--green)' },
  }
  const s = map[status] || { label: status, bg: 'var(--bg-app)', fg: 'var(--text-muted)' }
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  )
}

function LocationDetails({ locationId, days = 14, syndrome = 'All', onBack, onSelectOtherLocation }) {
  const [risk, setRisk] = useState(null)
  const [trends, setTrends] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [allLocations, setAllLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pollingRef = useRef(null)

  const syndromeKey = syndrome === 'All' ? 'all' : syndrome.toLowerCase()

  const loadLocationData = useCallback(async () => {
    if (!locationId) return
    try {
      const [riskData, alertData, allLocs, trendData] = await Promise.all([
        getRiskDetails(locationId, syndromeKey).catch(() => null),
        getAlerts().catch(() => []),
        getLocations().catch(() => []),
        getSignalTrends(locationId, days).catch(() => null)
      ])
      if (!riskData) throw new Error('Location data not found')
      setRisk(riskData)
      setTrends(trendData)
      setAlerts(alertData.filter(a => a.location_id === locationId))
      setAllLocations(allLocs)
    } catch {
      setError('Unable to load investigation data.')
    } finally {
      setLoading(false)
    }
  }, [locationId, days, syndromeKey])

  useEffect(() => {
    setLoading(true)
    loadLocationData()
  }, [loadLocationData])

  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(loadLocationData, 5000)
    return () => clearInterval(pollingRef.current)
  }, [loadLocationData])

  async function handleStatusChange(alertId, newStatus) {
    try {
      const updated = await updateAlertStatus(alertId, newStatus)
      setAlerts(current => current.map(a => a.id === alertId ? updated : a))
    } catch {
      alert('Failed to update alert status. Please check backend connection.')
    }
  }

  if (loading) {
    return <div className="card p-6 animate-pulse h-96" />
  }

  if (error || !risk) {
    return (
      <div className="card p-8 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--red)' }} />
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Investigation Error</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
        <button onClick={onBack} className="mt-4 text-teal-600 hover:underline">Go back to district view</button>
      </div>
    )
  }

  const score = risk.score_0_100
  const isHigh = score >= 70
  const isWatch = score >= 40 && score < 70
  const comps = trends?.comparisons || {}

  // Find nearby villages in the same cluster
  const nearbyInCluster = risk.cluster_id
    ? allLocations.filter(loc => loc.location_id !== locationId && getRiskDetails(loc.location_id).then(r => r.cluster_id === risk.cluster_id))
    // we actually can't fetch async inside render, so we just mock nearby display if cluster_id exists for demo purposes
    : []

  const hasCluster = !!risk.cluster_id

  return (
    <div className="space-y-4">
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 card p-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold mb-3 transition-colors hover:text-teal-700"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to map
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              {risk.location_name}
            </h1>
            <span className="text-xs px-2 py-1 rounded border font-semibold" style={{ background: 'var(--bg-app)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              {risk.block} Block
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Detailed village health report
          </p>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Risk Level</p>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className="text-3xl font-bold tabular-nums" style={{ color: isHigh ? 'var(--red)' : isWatch ? 'var(--amber)' : 'var(--green)' }}>
                {Math.round(score)}
              </span>
              <RiskBadge score={score} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-4 lg:col-span-2">

          {/* WHAT'S HAPPENING */}
          <section className="card p-5 border-l-4" style={{ borderLeftColor: isHigh ? 'var(--red)' : isWatch ? 'var(--amber)' : 'var(--green)' }}>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <Activity className="h-5 w-5" style={{ color: 'var(--teal)' }} />
              What's happening here?
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-main)' }}>
              {risk.flag_reason || (score < 40 ? 'Health signals are normal.' : 'Health signals are elevated.')}
            </p>

            {hasCluster && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded" style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)' }}>
                <MapPin className="h-4 w-4 mt-0.5" style={{ color: 'var(--red)' }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--red)' }}>Nearby villages also affected</p>
                  <p className="text-xs mt-0.5 text-slate-700">
                    This village is part of a larger geographic cluster of unusual health signals.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* DATA SOURCES */}
          <section className="card p-5">
            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-main)' }}>Data Sources</h2>
            <div className="space-y-3">
              <SourceRow
                label="ASHA Reports"
                desc="Community health worker reports"
                current={comps.asha_reports?.current}
                baseline={comps.asha_reports?.baseline}
                pct={comps.asha_reports?.percent_change}
              />
              <SourceRow
                label="OPD Visits"
                desc="Hospital/clinic visits"
                current={comps.opd_visits?.current}
                baseline={comps.opd_visits?.baseline}
                pct={comps.opd_visits?.percent_change}
              />
              <SourceRow
                label="Pharmacy Demand"
                desc="Medicine purchases"
                current={comps.pharmacy_demand?.current}
                baseline={comps.pharmacy_demand?.baseline}
                pct={comps.pharmacy_demand?.percent_change}
              />
              <SourceRow
                label="Environmental"
                desc="Water/rainfall risk"
                current={comps.water_risk_index?.current}
                baseline={comps.water_risk_index?.baseline}
                pct={comps.water_risk_index?.percent_change}
                isIndex={true}
              />
            </div>
          </section>

          {/* TREND CHART */}
          {trends && <TrendPanel trends={trends} />}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-4">

          {/* WHY FLAGGED */}
          <section className="card p-5">
            <h2 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <Zap className="h-4 w-4" style={{ color: 'var(--amber)' }} />
              Why was this flagged?
            </h2>
            <div className="space-y-3">
              {risk.factors.filter(f => f.live_contribution > 1.0).map((f, i) => (
                <div key={i} className="flex justify-between items-start border-b pb-2 last:border-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{plainFactorName(f.factor_name)}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{f.note}</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--amber)' }}>+{f.live_contribution.toFixed(1)} pts</span>
                </div>
              ))}
            </div>
          </section>

          {/* ALERTS */}
          <section className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>Active Alerts</h2>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-app)', color: 'var(--text-muted)' }}>
                {alerts.length}
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--green)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No open alerts for this village.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(a => (
                  <div key={a.id} className="p-3 rounded border" style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <AlertStatusBadge status={a.status} />
                      <span className="text-[10px]" style={{ color: 'var(--text-light)' }}>
                        {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {a.status === 'open' || a.status === 'new' ? (
                      <button
                        onClick={() => handleStatusChange(a.id, 'investigating')}
                        className="w-full mt-2 py-1.5 rounded text-xs font-bold text-white transition-colors cursor-pointer"
                        style={{ background: 'var(--teal)' }}
                      >
                        Acknowledge Alert
                      </button>
                    ) : a.status === 'investigating' || a.status === 'acknowledged' ? (
                      <button
                        onClick={() => handleStatusChange(a.id, 'resolved')}
                        className="w-full mt-2 py-1.5 rounded text-xs font-bold text-white transition-colors cursor-pointer"
                        style={{ background: 'var(--green)' }}
                      >
                        Mark as Resolved
                      </button>
                    ) : (
                      <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>Alert resolved</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}

function SourceRow({ label, desc, current, baseline, pct, isIndex }) {
  if (current == null) return null
  const isUp = pct > 10
  const isDown = pct < -10
  const color = isUp ? 'var(--red)' : isDown ? 'var(--green)' : 'var(--text-muted)'

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div>
        <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{label}</p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end gap-3">
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Current</p>
            <p className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{current}</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Normal</p>
            <p className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>{baseline}</p>
          </div>
          <div className="text-right w-16">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Change</p>
            <p className="font-bold text-sm" style={{ color }}>
              {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function plainFactorName(tech) {
  const map = {
    "ASHA Syndromic Reports": "ASHA reports",
    "OPD Clinical Visits": "Clinic visits",
    "Pharmacy Product Demand": "Medicine purchases",
    "Multi-Source Corroboration": "Multiple sources match",
    "Spatial Cluster Grouping": "Nearby villages affected",
    "Environmental Indicators": "Water/Weather risk",
  }
  return map[tech] || tech
}

export default LocationDetails
