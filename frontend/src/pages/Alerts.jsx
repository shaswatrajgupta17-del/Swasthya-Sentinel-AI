import { useEffect, useMemo, useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { getAlerts, updateAlertStatus } from '../api/api'
import EmptyState from '../components/EmptyState'
import RiskBadge from '../components/RiskBadge'

function normaliseAlert(raw) {
  const score = Number.isFinite(Number(raw.score_0_100)) ? Number(raw.score_0_100) : raw.severity === 'high' ? 85 : 50
  const factorSummary = (raw.top_factors || [])
    .map((factor) => `${factor.factor_name} (+${Number(factor.contribution).toFixed(1)} pts)`)
    .join('; ')

  return {
    id: raw.id,
    locationId: raw.location_id,
    locationName: raw.location_name || raw.location_id,
    severity: raw.severity || 'high',
    status: raw.status || 'open',
    createdAt: raw.created_at ? new Date(raw.created_at).toLocaleString('en-IN') : 'Recent',
    score,
    clusterId: raw.cluster_id,
    modelVersion: raw.model_version || 'phase5-v1',
    topFactors: raw.top_factors || [],
    factorSummary: factorSummary || 'Multi-source signal anomaly elevated above historical baseline',
  }
}

function Alerts({ onSelectLocation }) {
  const [alerts, setAlerts] = useState([])
  const [activeFilter, setActiveFilter] = useState('All') // 'All' | 'High' | 'Open' | 'Investigating' | 'Acknowledged' | 'Resolved'
  const [search, setSearch] = useState('')
  const [selectedAlertId, setSelectedAlertId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAlertsData() {
    setLoading(true)
    setError('')
    try {
      const data = await getAlerts()
      const list = data.map(normaliseAlert)
      setAlerts(list)
      if (list.length > 0 && !selectedAlertId) setSelectedAlertId(list[0].id)
    } catch (err) {
      setError('Unable to load alert operations from FastAPI')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlertsData()
  }, [])

  async function changeStatus(alertId, newStatus) {
    try {
      const updated = await updateAlertStatus(alertId, newStatus)
      setAlerts((current) => current.map((a) => (a.id === alertId ? normaliseAlert(updated) : a)))
    } catch (err) {
      console.error('Failed to change alert status:', err)
    }
  }

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchesSearch =
        a.locationName.toLowerCase().includes(search.toLowerCase()) ||
        a.locationId.toLowerCase().includes(search.toLowerCase())

      if (!matchesSearch) return false

      if (activeFilter === 'All') return true
      if (activeFilter === 'High') return a.severity === 'high'
      if (activeFilter === 'Open') return a.status === 'open'
      if (activeFilter === 'Investigating') return a.status === 'investigating'
      if (activeFilter === 'Acknowledged') return a.status === 'acknowledged'
      if (activeFilter === 'Resolved') return a.status === 'resolved'
      return true
    })
  }, [alerts, search, activeFilter])

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0]

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

  if (error) {
    return <EmptyState title="Alerts Service Error" message={error} />
  }

  const filterTabs = ['All', 'Open', 'Investigating', 'Acknowledged', 'Resolved', 'High']

  return (
    <div className="space-y-6" id="main-content" tabIndex={-1}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-4 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-sentinel-ink sm:text-2xl">
              Alerts & Response Operations
            </h1>
            <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 uppercase">
              Operational Queue
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Geographic threshold notices generated automatically when calculated risk scores cross $\ge 70$
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md">
            Total Active Alerts: <strong>{alerts.filter((a) => a.status !== 'resolved').length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`min-h-[34px] rounded-md px-3 text-xs font-semibold cursor-pointer transition-colors ${
                  activeFilter === tab
                    ? 'bg-sentinel-teal text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert by village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs font-medium text-sentinel-ink focus:border-sentinel-teal focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Main Alert Layout: List & Detailed Inspection Panel */}
      <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left: Alerts Table / List */}
        <section className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <EmptyState
              title="No alerts in this view"
              message="No alerts match the selected status filter."
            />
          ) : (
            <div className="space-y-2.5">
              {filteredAlerts.map((alert) => {
                const isSelected = alert.id === selectedAlert?.id
                const isHigh = alert.score >= 70
                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                    className={`rounded-lg border bg-white p-4 shadow-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sentinel-teal ring-2 ring-sentinel-teal/20'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${isHigh ? 'border-l-4 border-l-rose-500' : ''}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-sentinel-ink">{alert.locationName}</p>
                          <span className="text-[11px] font-mono text-slate-400">({alert.locationId})</span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{alert.createdAt}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <RiskBadge score={alert.score} category={alert.score >= 70 ? 'High' : 'Watch'} />
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                            alert.status === 'open'
                              ? 'bg-rose-100 text-rose-700'
                              : alert.status === 'investigating'
                              ? 'bg-amber-100 text-amber-700'
                              : alert.status === 'acknowledged'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {alert.status}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2.5 text-xs text-slate-700 leading-relaxed line-clamp-2">
                      {alert.factorSummary}
                    </p>

                    {/* Action buttons */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5">
                      {alert.status === 'open' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            changeStatus(alert.id, 'investigating')
                          }}
                          className="min-h-[32px] rounded bg-sentinel-teal px-3 text-xs font-bold text-white hover:bg-sentinel-teal-dark"
                        >
                          Investigate
                        </button>
                      )}
                      {alert.status !== 'acknowledged' && alert.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            changeStatus(alert.id, 'acknowledged')
                          }}
                          className="min-h-[32px] rounded border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            changeStatus(alert.id, 'resolved')
                          }}
                          className="min-h-[32px] rounded bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Right: Selected Alert Detail & Lifecycle Timeline */}
        {selectedAlert && (
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-sentinel-teal uppercase tracking-wider">
                Alert Protocol Detail
              </span>
              <h2 className="mt-1 text-lg font-bold text-sentinel-ink">
                Alert #{selectedAlert.id} — {selectedAlert.locationName}
              </h2>
              <p className="text-xs text-slate-500">
                Created: {selectedAlert.createdAt} · Model: {selectedAlert.modelVersion}
              </p>
            </div>

            {/* Lifecycle Timeline Progression */}
            <div>
              <h3 className="text-xs font-bold text-sentinel-ink uppercase tracking-wider mb-2.5">
                Surveillance Lifecycle Timeline
              </h3>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <span className="mt-1 text-[11px] text-slate-700">Detected</span>
                </div>
                <div className="h-0.5 flex-1 bg-emerald-300 mx-1"></div>

                <div className="flex flex-col items-center">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                    selectedAlert.status !== 'open' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {selectedAlert.status !== 'open' ? '✓' : '2'}
                  </div>
                  <span className="mt-1 text-[11px] text-slate-700">Investigating</span>
                </div>
                <div className={`h-0.5 flex-1 mx-1 ${
                  selectedAlert.status === 'acknowledged' || selectedAlert.status === 'resolved' ? 'bg-emerald-300' : 'bg-slate-200'
                }`}></div>

                <div className="flex flex-col items-center">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                    selectedAlert.status === 'acknowledged' || selectedAlert.status === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {selectedAlert.status === 'acknowledged' || selectedAlert.status === 'resolved' ? '✓' : '3'}
                  </div>
                  <span className="mt-1 text-[11px] text-slate-700">Acknowledged</span>
                </div>
                <div className={`h-0.5 flex-1 mx-1 ${
                  selectedAlert.status === 'resolved' ? 'bg-emerald-300' : 'bg-slate-200'
                }`}></div>

                <div className="flex flex-col items-center">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                    selectedAlert.status === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {selectedAlert.status === 'resolved' ? '✓' : '4'}
                  </div>
                  <span className="mt-1 text-[11px] text-slate-700">Resolved</span>
                </div>
              </div>
            </div>

            {/* Contributing Factors */}
            <div className="border-t border-slate-100 pt-3">
              <h3 className="text-xs font-bold text-sentinel-ink mb-2">
                Contributing Anomaly Factors
              </h3>
              <div className="space-y-2">
                {selectedAlert.topFactors.map((tf) => (
                  <div key={tf.factor_name} className="rounded bg-slate-50 p-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-sentinel-ink">
                      <span>{tf.factor_name}</span>
                      <span className="font-mono text-sentinel-teal">+{Number(tf.contribution).toFixed(1)} pts</span>
                    </div>
                    {tf.note && <p className="mt-1 text-[11px] text-slate-500">{tf.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Jump Button */}
            {onSelectLocation && (
              <button
                type="button"
                onClick={() => onSelectLocation(selectedAlert.locationId)}
                className="w-full flex items-center justify-center gap-1.5 rounded-md bg-sentinel-teal py-2 text-xs font-bold text-white hover:bg-sentinel-teal-dark cursor-pointer"
              >
                <span>Investigate {selectedAlert.locationName} Node</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}

export default Alerts
