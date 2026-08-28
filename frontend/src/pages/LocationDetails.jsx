import { useEffect, useState } from 'react'
import { ArrowLeft, ClipboardCheck, Layers, Clock } from 'lucide-react'
import { getLocation, getRiskDetails, getSignalTrends, getAlerts, updateAlertStatus, getLocations } from '../api/api'
import EmptyState from '../components/EmptyState'
import RiskBadge from '../components/RiskBadge'
import TrendPanel from '../components/TrendPanel'

const FACTOR_COLORS = {
  'ASHA Syndromic Reports': '#3D5A80',
  'OPD Clinical Visits': '#577590',
  'Pharmacy Product Demand': '#6D597A',
  'Multi-Source Corroboration': '#0E7C7B',
  'Spatial Cluster Grouping': '#2A9D8F',
  'Environmental Indicators': '#4A7C59',
}

function LocationDetails({ locationId, onBack, onSelectOtherLocation }) {
  const [location, setLocation] = useState(null)
  const [risk, setRisk] = useState(null)
  const [trends, setTrends] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [allLocations, setAllLocations] = useState([])
  const [days, setDays] = useState(14)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadLocationData() {
    if (!locationId) return
    setLoading(true)
    setError('')
    try {
      const [locData, riskData, trendData, alertData, allLocs] = await Promise.all([
        getLocation(locationId),
        getRiskDetails(locationId),
        getSignalTrends(locationId, days),
        getAlerts(),
        getLocations(),
      ])
      setLocation(locData)
      setRisk(riskData)
      setTrends(trendData)
      setAlerts(alertData.filter((a) => a.location_id === locationId))
      setAllLocations(allLocs)
    } catch (err) {
      console.error('Failed to load location investigation:', err)
      setError('Unable to load investigation data from FastAPI backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLocationData()
  }, [locationId, days])

  async function handleStatusChange(alertId, newStatus) {
    try {
      const updated = await updateAlertStatus(alertId, newStatus)
      setAlerts((current) => current.map((a) => (a.id === alertId ? updated : a)))
    } catch (err) {
      console.error('Failed to update alert status:', err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6" id="main-content" tabIndex={-1}>
        <div className="h-96 rounded-lg border border-slate-200 bg-white p-6 animate-pulse">
          <div className="h-6 w-64 bg-slate-200 rounded"></div>
          <div className="mt-4 h-80 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !location || !risk) {
    return (
      <div className="space-y-6" id="main-content" tabIndex={-1}>
        <EmptyState
          title="Investigation Loading Failed"
          message={error || 'Location risk data unavailable.'}
          actionLabel="Back to Directory"
          onAction={onBack}
        />
      </div>
    )
  }

  const score = risk.score_0_100
  const category = score >= 70 ? 'High' : score >= 40 ? 'Watch' : 'Low'
  const factors = risk.factors || []

  // Neighboring villages in same cluster
  const clusterVillages = risk.cluster_id
    ? allLocations.filter((l) => l.location_id !== locationId && l.block === location.block)
    : []

  return (
    <div className="space-y-6" id="main-content" tabIndex={-1}>
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-sentinel-teal" />
          <span>Back to Village Directory</span>
        </button>

        <span className="text-xs text-slate-500 font-mono">
          Node ID: {location.location_id} · Model: {risk.model_version}
        </span>
      </div>

      {/* Village Investigation Header */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-sentinel-teal/15 px-2 py-0.5 text-xs font-bold text-sentinel-teal uppercase">
                Village Node Investigation
              </span>
              {risk.cluster_id && (
                <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 uppercase">
                  Cluster {risk.cluster_id}
                </span>
              )}
            </div>

            <h1 className="mt-2 text-2xl font-bold text-sentinel-ink sm:text-3xl">
              {location.name}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {location.block} Block · {location.district} · {Number(location.latitude).toFixed(4)}°N, {Number(location.longitude).toFixed(4)}°E
            </p>
          </div>

          <RiskBadge score={score} category={category} size="lg" modelVersion={risk.model_version} />
        </div>
      </section>

      {/* Time Window Selector for Trends */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-3.5 rounded-lg shadow-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-sentinel-teal" />
          <span className="text-xs font-bold text-sentinel-ink">Signal Observation Window:</span>
        </div>
        <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`min-h-[32px] rounded px-3 text-xs font-semibold cursor-pointer transition-colors ${
                days === d
                  ? 'bg-sentinel-teal text-white shadow-xs'
                  : 'text-slate-600 hover:text-sentinel-ink'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Grid: Trends & Why This Score */}
      <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left: Recharts Trend Panel */}
        <div className="space-y-6">
          <TrendPanel trends={trends} />

          {/* Cluster Context */}
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Layers className="h-4 w-4 text-sentinel-teal" />
              <h2 className="text-sm font-bold text-sentinel-ink">
                Geographic Cluster Context
              </h2>
            </div>

            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
              {risk.cluster_id ? (
                <>
                  This village is spatially associated with <strong>Cluster {risk.cluster_id}</strong> based on DBSCAN geographic proximity ($eps=2.5\text{ km}$). Neighboring village nodes in <strong>{location.block}</strong> block include:
                </>
              ) : (
                'This village currently exhibits isolated baseline signal characteristics with no active spatial cluster grouping.'
              )}
            </p>

            {clusterVillages.length > 0 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {clusterVillages.map((neighbor) => (
                  <button
                    key={neighbor.location_id}
                    type="button"
                    onClick={() => onSelectOtherLocation?.(neighbor.location_id)}
                    className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-2.5 text-left text-xs hover:border-sentinel-teal cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-sentinel-ink">{neighbor.name}</p>
                      <p className="text-[10px] text-slate-500">{neighbor.block} Block</p>
                    </div>
                    <span className="text-[10px] font-semibold text-sentinel-teal">View</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: Transparent Mathematical Factor Decomposition */}
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-sentinel-ink">
                  Why This Score?
                </h2>
                <p className="text-xs text-slate-500">
                  Deterministic factor contribution breakdown
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-sentinel-ink">
                {Number(score).toFixed(1)} pts
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {factors.map((factor) => {
                const color = FACTOR_COLORS[factor.factor_name] || '#0E7C7B'
                const contribution = Number(factor.live_contribution ?? factor.contribution)
                const percentage = Number(factor.live_percentage ?? factor.percentage)
                const barWidth = Math.min(100, Math.max(3, (contribution / Math.max(score, 1)) * 100))

                return (
                  <div key={factor.factor_name} className="rounded-md border border-slate-100 bg-slate-50/70 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-sentinel-ink flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        {factor.factor_name}
                      </span>
                      <div className="font-mono font-bold text-slate-700">
                        +{contribution.toFixed(1)} pts <span className="text-slate-400 font-normal">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                      {factor.note}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Public-Health Review Guidance */}
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <ClipboardCheck className="h-4 w-4 text-sentinel-teal" />
              <h2 className="text-sm font-bold text-sentinel-ink">
                Administrative Protocol Recommendations
              </h2>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 leading-relaxed list-disc pl-4">
              <li>Review ASHA fever reporting logs with the Kalyanpur block medical officer.</li>
              <li>Cross-verify pharmacy ORS sales with neighboring PHC outpatient registers.</li>
              <li>Coordinate field environmental survey for local water quality and drainage.</li>
              <li className="font-medium text-slate-500 italic">
                Notice: This system provides early statistical cluster signals and does not provide clinical diagnosis or treatment guidance.
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* Alert History for this village */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-sm font-bold text-sentinel-ink">
            Location Alert History ({alerts.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Automatic Threshold Trigger ($\ge 70$)</span>
        </div>

        {alerts.length > 0 ? (
          <div className="mt-3 space-y-2.5">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-rose-600 px-2 py-0.5 text-xs font-bold text-white uppercase">
                      {alert.severity} Alert
                    </span>
                    <span className="text-xs font-bold text-sentinel-ink">
                      Status: {alert.status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Created: {alert.created_at ? new Date(alert.created_at).toLocaleString('en-IN') : 'Recent'} · Trigger Score: {alert.score_0_100 ?? score}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {alert.status === 'open' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(alert.id, 'investigating')}
                      className="min-h-[34px] rounded-md bg-sentinel-teal px-3 text-xs font-bold text-white hover:bg-sentinel-teal-dark cursor-pointer"
                    >
                      Investigate
                    </button>
                  )}
                  {alert.status !== 'acknowledged' && alert.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(alert.id, 'acknowledged')}
                      className="min-h-[34px] rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(alert.id, 'resolved')}
                      className="min-h-[34px] rounded-md bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            No active or historical alerts recorded for {location.name}.
          </p>
        )}
      </section>
    </div>
  )
}

export default LocationDetails
