import { useEffect, useState, useCallback, useRef } from 'react'
import { Activity, Bell, AlertTriangle, CheckCircle2, TrendingUp, RefreshCw, Play, Pause, RotateCcw, MapPin, Clock, Zap } from 'lucide-react'
import {
  getAlerts,
  getLocations,
  getRisks,
  getSignalsSummary,
  getSimulationStatus,
  startSimulation,
  pauseSimulation,
  resetSimulation,
  getSignalTrends,
} from '../api/api'
import HealthMap from '../components/HealthMap'
import RiskBadge from '../components/RiskBadge'
import TrendPanel from '../components/TrendPanel'
import SimulationControls from '../components/SimulationControls'
import WhatChanged from '../components/WhatChanged'
import SystemHealth from '../components/SystemHealth'
import DailyBrief from '../components/DailyBrief'

function riskLabel(score) {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Watch'
  return 'Low'
}

function timeAgo(isoString) {
  if (!isoString) return 'never'
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function Dashboard({ selectedId, onSelectLocation, days = 14, syndrome = 'All', minScore = 0 }) {
  const [locations, setLocations] = useState([])
  const [risks, setRisks] = useState([])
  const [alerts, setAlerts] = useState([])
  const [signalSummary, setSignalSummary] = useState(null)
  const [simStatus, setSimStatus] = useState(null)
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [updateTick, setUpdateTick] = useState(0)
  const pollingRef = useRef(null)

  const syndromeKey = syndrome === 'All' ? 'all' : syndrome.toLowerCase()

  const loadData = useCallback(async () => {
    try {
      const [locData, riskData, alertData, summaryData, simData] = await Promise.all([
        getLocations(),
        getRisks(syndromeKey),
        getAlerts(),
        getSignalsSummary().catch(() => null),
        getSimulationStatus(),
      ])
      setLocations(locData)
      setRisks(riskData)
      setAlerts(alertData)
      setSignalSummary(summaryData)
      setSimStatus(simData)
      setLastUpdated(new Date().toISOString())
      setUpdateTick(t => t + 1)
    } catch {
      setError('Unable to reach the FastAPI backend. Make sure it is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }, [syndromeKey])

  // Load trends for the selected location
  useEffect(() => {
    if (!selectedId) return
    getSignalTrends(selectedId, days).then(setTrends).catch(() => null)
  }, [selectedId, days, updateTick])

  // Initial load
  useEffect(() => {
    setLoading(true)
    loadData()
  }, [loadData])

  // Polling every 5s
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(loadData, 5000)
    return () => clearInterval(pollingRef.current)
  }, [loadData])

  const filteredRisks = risks.filter(r => r.score_0_100 >= minScore)
  const highRisk = filteredRisks.filter(r => r.score_0_100 >= 70)
  const watchRisk = filteredRisks.filter(r => r.score_0_100 >= 40 && r.score_0_100 < 70)
  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'new')
  const needsReview = highRisk.length + watchRisk.length
  const topRisks = filteredRisks.slice(0, 5)

  // District status message
  const districtStatus = () => {
    if (highRisk.length > 0) {
      const topVillage = highRisk[0]
      return {
        level: 'high',
        message: `${highRisk.length} village${highRisk.length > 1 ? 's' : ''} need${highRisk.length === 1 ? 's' : ''} immediate review`,
        detail: `${topVillage.location_name}: ${topVillage.flag_reason || 'Risk score is high'}`,
        icon: AlertTriangle,
      }
    }
    if (watchRisk.length > 0) {
      return {
        level: 'watch',
        message: `${watchRisk.length} village${watchRisk.length > 1 ? 's' : ''} need${watchRisk.length === 1 ? 's' : ''} monitoring`,
        detail: 'Health signals are elevated but not critical. Continue watching.',
        icon: Bell,
      }
    }
    return {
      level: 'low',
      message: 'All villages are within normal range',
      detail: 'No unusual health signals detected today.',
      icon: CheckCircle2,
    }
  }

  const status = districtStatus()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card p-5 animate-pulse">
          <div className="h-6 w-64 rounded" style={{ background: 'var(--border)' }} />
          <div className="mt-3 h-4 w-96 rounded" style={{ background: 'var(--border)' }} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-4 animate-pulse h-24" />
          ))}
        </div>
        <div className="card h-80 animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--red)' }} />
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Cannot connect to backend</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white cursor-pointer"
          style={{ background: 'var(--teal)' }}
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const StatusIcon = status.icon

  return (
    <div className="space-y-4">

      {/* ── DISTRICT STATUS BANNER ── */}
      <div
        className="card p-4 border-l-4"
        style={{
          borderLeftColor: status.level === 'high' ? 'var(--red)' : status.level === 'watch' ? 'var(--amber)' : 'var(--green)',
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg mt-0.5"
              style={{
                background: status.level === 'high' ? 'rgba(220,38,38,0.1)' : status.level === 'watch' ? 'rgba(217,119,6,0.1)' : 'rgba(42,157,143,0.1)',
              }}
            >
              <StatusIcon
                className="h-5 w-5"
                style={{ color: status.level === 'high' ? 'var(--red)' : status.level === 'watch' ? 'var(--amber)' : 'var(--green)' }}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                District Status: {status.message}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{status.detail}</p>
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-light)' }}>
                <Clock className="h-3 w-3" />
                Updated {timeAgo(lastUpdated)} · Kalyanpur District · {syndrome === 'All' ? 'All health signals' : `${syndrome} signal`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-light)' }}>
            {simStatus?.running && (
              <span className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(14,124,123,0.1)', color: 'var(--teal)' }}>
                <span className="live-pulse" style={{ width: 6, height: 6 }} />
                Live simulation
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI
          label="Villages Monitored"
          value={locations.length}
          hint="Total surveillance nodes"
          icon={MapPin}
          color="teal"
        />
        <KPI
          label="Needs Review"
          value={needsReview}
          hint={`${highRisk.length} high · ${watchRisk.length} watch`}
          icon={AlertTriangle}
          color={needsReview > 0 ? 'red' : 'green'}
        />
        <KPI
          label="Open Alerts"
          value={openAlerts.length}
          hint="Awaiting acknowledgement"
          icon={Bell}
          color={openAlerts.length > 0 ? 'amber' : 'green'}
        />
        <KPI
          label="Reports Received"
          value={signalSummary?.total_asha_signals ?? risks.length * 12}
          hint={`Last ${days} days`}
          icon={Activity}
          color="teal"
        />
      </div>

      {/* ── DAILY BRIEF ── */}
      <DailyBrief risks={filteredRisks} alerts={alerts} syndrome={syndrome} />

      {/* ── WHAT CHANGED? ── */}
      <WhatChanged risks={filteredRisks} simStatus={simStatus} syndrome={syndrome} />

      {/* ── DISTRICT MAP ── */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>District Map</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Click any village to see details · Colours show risk level
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" /> Low</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" /> Watch</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600" /> High</span>
          </div>
        </div>
        <HealthMap
          locations={locations}
          risks={filteredRisks}
          selectedId={selectedId}
          onSelectLocation={onSelectLocation}
        />
      </section>

      {/* ── LOWER GRID: Villages needing review + Simulation ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Villages needing review */}
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>
              Villages Needing Review
            </h2>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}>
              Ranked by risk
            </span>
          </div>
          {topRisks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--green)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>All villages are within normal range</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topRisks.map(risk => {
                const locAlert = alerts.find(a => a.location_id === risk.location_id && (a.status === 'open' || a.status === 'new'))
                return (
                  <button
                    key={risk.location_id}
                    type="button"
                    onClick={() => onSelectLocation(risk.location_id)}
                    className="w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors cursor-pointer hover:opacity-90"
                    style={{ background: 'var(--bg-app)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
                          {risk.location_name}
                        </span>
                        {locAlert && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: 'rgba(220,38,38,0.1)', color: 'var(--red)' }}>
                            ALERT
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {risk.flag_reason || `Risk level: ${riskLabel(risk.score_0_100)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-bold tabular-nums" style={{
                          color: risk.score_0_100 >= 70 ? 'var(--red)' : risk.score_0_100 >= 40 ? 'var(--amber)' : 'var(--green)'
                        }}>
                          {Math.round(risk.score_0_100)}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-light)' }}>/ 100</div>
                      </div>
                      <RiskBadge score={risk.score_0_100} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Simulation controls */}
        <div className="card p-4">
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-main)' }}>Live Simulation</h2>
          <SimulationControls
            simStatus={simStatus}
            onStart={startSimulation}
            onPause={pauseSimulation}
            onReset={resetSimulation}
            onUpdate={setSimStatus}
          />
        </div>
      </div>

      {/* ── SIGNAL TRENDS ── */}
      <TrendPanel trends={trends} />

      {/* ── RECENT ALERTS ── */}
      <section className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <Bell className="h-4 w-4" style={{ color: 'var(--teal)' }} />
            Recent Alerts
          </h2>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {alerts.length} total
          </span>
        </div>
        {alerts.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No alerts in the system.</p>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-lg p-3"
                style={{ background: 'var(--bg-app)', border: '1px solid var(--border)' }}
              >
                <Zap
                  className="h-4 w-4 mt-0.5 shrink-0"
                  style={{ color: alert.severity === 'high' ? 'var(--red)' : 'var(--amber)' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
                      {alert.location_name}
                    </span>
                    <AlertStatusBadge status={alert.status} />
                  </div>
                  {alert.top_factors?.[0] && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {alert.top_factors[0].note || `${alert.top_factors[0].factor_name} flagged`}
                    </p>
                  )}
                </div>
                <span className="text-xs shrink-0" style={{ color: 'var(--text-light)' }}>
                  {alert.score_0_100 != null ? `Score: ${Math.round(alert.score_0_100)}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── SYSTEM HEALTH ── */}
      <SystemHealth simStatus={simStatus} />

    </div>
  )
}

// KPI card inline component
function KPI({ label, value, hint, icon: Icon, color = 'teal' }) {
  const colors = {
    teal:  { bg: 'var(--teal-light)',              fg: 'var(--teal)' },
    red:   { bg: 'rgba(220,38,38,0.08)',            fg: 'var(--red)' },
    amber: { bg: 'rgba(217,119,6,0.08)',            fg: 'var(--amber)' },
    green: { bg: 'rgba(42,157,143,0.08)',           fg: 'var(--green)' },
  }
  const c = colors[color] || colors.teal

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
          style={{ background: c.bg }}
        >
          <Icon className="h-4 w-4" style={{ color: c.fg }} />
        </div>
      </div>
      <p className="tabular-nums text-3xl font-bold" style={{ color: 'var(--text-main)' }}>
        {value}
      </p>
      {hint && <p className="text-xs" style={{ color: 'var(--text-light)' }}>{hint}</p>}
    </div>
  )
}

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
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  )
}

export default Dashboard
