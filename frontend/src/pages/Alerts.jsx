import { useEffect, useState } from 'react'
import { Bell, MapPin, Zap, CheckCircle2, ChevronRight, Activity } from 'lucide-react'
import { getAlerts, updateAlertStatus } from '../api/api'

function Alerts({ onSelectLocation }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, open, resolved

  useEffect(() => {
    async function load() {
      try {
        const data = await getAlerts()
        setAlerts(data)
      } catch {
        setError('Unable to load alerts.')
      } finally {
        setLoading(false)
      }
    }
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  async function handleStatusChange(alertId, newStatus) {
    try {
      const updated = await updateAlertStatus(alertId, newStatus)
      setAlerts(curr => curr.map(a => a.id === alertId ? updated : a))
    } catch {
      alert('Failed to update alert status.')
    }
  }

  if (loading) {
    return <div className="card p-6 h-96 animate-pulse" />
  }

  if (error) {
    return <div className="card p-6 text-red-600">{error}</div>
  }

  const displayedAlerts = alerts.filter(a => {
    if (filter === 'open') return a.status === 'open' || a.status === 'new'
    if (filter === 'resolved') return a.status === 'resolved' || a.status === 'acknowledged' || a.status === 'investigating'
    return true
  })

  return (
    <div className="space-y-4">
      {/* ── HEADER ── */}
      <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-5 w-5" style={{ color: 'var(--teal)' }} />
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Alerts &amp; Responses</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage health signal alerts across the district
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm bg-slate-100 p-1 rounded-lg" style={{ background: 'var(--bg-app)' }}>
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All ({alerts.length})</FilterButton>
          <FilterButton active={filter === 'open'} onClick={() => setFilter('open')}>Action Required ({alerts.filter(a => a.status === 'open' || a.status === 'new').length})</FilterButton>
          <FilterButton active={filter === 'resolved'} onClick={() => setFilter('resolved')}>Under Review / Resolved</FilterButton>
        </div>
      </div>

      {/* ── ALERTS LIST ── */}
      {displayedAlerts.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--green)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>No alerts found</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>The district is operating normally.</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {displayedAlerts.map(alert => (
            <div key={alert.id} className="card flex flex-col justify-between overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" style={{ color: alert.severity === 'high' ? 'var(--red)' : 'var(--amber)' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: alert.severity === 'high' ? 'var(--red)' : 'var(--amber)' }}>
                      {alert.severity} Priority
                    </span>
                  </div>
                  <AlertStatusBadge status={alert.status} />
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                    <MapPin className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                    {alert.location_name}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
                    Risk Score: {Math.round(alert.score_0_100)} / 100
                  </p>
                </div>

                <div className="p-3 rounded-md mb-4" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--text-main)' }}>
                    <Activity className="h-3.5 w-3.5" style={{ color: 'var(--teal)' }} /> Why flagged
                  </p>
                  <ul className="text-xs space-y-1 mt-2" style={{ color: 'var(--text-muted)' }}>
                    {alert.top_factors.map((f, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="w-1 h-1 bg-slate-400 rounded-full mt-1.5 shrink-0" />
                        <span><span className="font-semibold text-slate-700">{plain(f.factor_name)}:</span> {f.note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Bar */}
              <div className="border-t p-3 bg-slate-50 flex items-center justify-between gap-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-app)' }}>
                {alert.status === 'open' || alert.status === 'new' ? (
                  <button
                    onClick={() => handleStatusChange(alert.id, 'acknowledged')}
                    className="flex-1 py-1.5 px-3 rounded text-xs font-bold text-white transition-colors cursor-pointer text-center"
                    style={{ background: 'var(--teal)' }}
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="flex-1 text-xs text-center font-medium" style={{ color: 'var(--text-light)' }}>
                    {alert.status === 'acknowledged' || alert.status === 'investigating' ? 'Under review' : 'Resolved'}
                  </span>
                )}
                
                <button
                  onClick={() => onSelectLocation(alert.location_id)}
                  className="flex-1 py-1.5 px-3 rounded border text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-100"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-main)', background: 'var(--bg-card)' }}
                >
                  View Village <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
        active ? 'bg-white shadow-sm text-sentinel-ink border border-slate-200' : 'text-slate-500 hover:text-slate-700'
      }`}
      style={active ? { background: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border)' } : { color: 'var(--text-muted)' }}
    >
      {children}
    </button>
  )
}

function AlertStatusBadge({ status }) {
  const map = {
    open: { label: 'Open', bg: 'rgba(220,38,38,0.1)', fg: 'var(--red)' },
    new: { label: 'New', bg: 'rgba(220,38,38,0.1)', fg: 'var(--red)' },
    investigating: { label: 'Reviewing', bg: 'rgba(217,119,6,0.1)', fg: 'var(--amber)' },
    acknowledged: { label: 'Acknowledged', bg: 'rgba(14,124,123,0.1)', fg: 'var(--teal)' },
    resolved: { label: 'Resolved', bg: 'rgba(42,157,143,0.1)', fg: 'var(--green)' },
  }
  const s = map[status] || { label: status, bg: 'var(--bg-app)', fg: 'var(--text-muted)' }
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  )
}

function plain(tech) {
  const map = {
    "ASHA Syndromic Reports": "ASHA",
    "OPD Clinical Visits": "Clinic",
    "Pharmacy Product Demand": "Pharmacy",
    "Multi-Source Corroboration": "Matching sources",
    "Spatial Cluster Grouping": "Nearby villages",
    "Environmental Indicators": "Environment",
  }
  return map[tech] || tech
}

export default Alerts
