import { useEffect, useState, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import {
  Activity,
  Bell,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Clock,
  Zap,
  ChevronRight,
  ShieldAlert,
  FileText,
} from 'lucide-react'
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
  const today = format(new Date(), 'dd MMM yyyy')

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
        icon: ShieldAlert,
      }
    }
    if (watchRisk.length > 0) {
      return {
        level: 'watch',
        message: `${watchRisk.length} village${watchRisk.length > 1 ? 's' : ''} need${watchRisk.length === 1 ? 's' : ''} monitoring`,
        detail: 'Health signals are elevated but not critical. Continue surveillance.',
        icon: Bell,
      }
    }
    return {
      level: 'low',
      message: 'All villages are within normal range',
      detail: 'No unusual health signals detected across active surveillance nodes.',
      icon: CheckCircle2,
    }
  }

  const status = districtStatus()

  if (loading) {
    return (
      <div className="space-y-3.5">
        <div className="card p-4 animate-pulse">
          <div className="h-5 w-60 rounded" style={{ background: 'var(--border)' }} />
          <div className="mt-2.5 h-3.5 w-80 rounded" style={{ background: 'var(--border)' }} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-3.5 animate-pulse h-20" />
          ))}
        </div>
        <div className="card h-96 animate-pulse" />
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
    <div className="space-y-3.5">

      {/* ── 1. DISTRICT STATUS COMMAND BANNER ── */}
      <div
        className="card px-4 py-3 border-l-4 transition-theme"
        style={{
          borderLeftColor: status.level === 'high' ? 'var(--red)' : status.level === 'watch' ? 'var(--amber)' : 'var(--green)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: status.level === 'high' ? 'rgba(220,38,38,0.12)' : status.level === 'watch' ? 'rgba(217,119,6,0.12)' : 'rgba(42,157,143,0.12)',
              }}
            >
              <StatusIcon
                className="h-5 w-5"
                style={{ color: status.level === 'high' ? 'var(--red)' : status.level === 'watch' ? 'var(--amber)' : 'var(--green)' }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{
                    background: status.level === 'high' ? 'rgba(220,38,38,0.15)' : status.level === 'watch' ? 'rgba(217,119,6,0.15)' : 'rgba(42,157,143,0.15)',
                    color: status.level === 'high' ? 'var(--red)' : status.level === 'watch' ? 'var(--amber)' : 'var(--green)',
                  }}
                >
                  {status.level === 'high' ? 'Immediate Review Required' : status.level === 'watch' ? 'Surveillance Watch' : 'Normal Baseline'}
                </span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-light)' }}>
                  Kalyanpur District Command Centre
                </span>
              </div>
              <h1 className="text-base font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>
                District Status: {status.message}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {status.detail} · Updated {timeAgo(lastUpdated)} · {syndrome === 'All' ? 'All health signals' : `${syndrome} signal`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs shrink-0 self-start sm:self-auto">
            {simStatus?.running ? (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold border text-xs"
                style={{
                  background: 'rgba(217,119,6,0.1)',
                  borderColor: 'rgba(217,119,6,0.3)',
                  color: 'var(--amber)',
                }}
              >
                <span className="live-pulse" style={{ width: 7, height: 7, backgroundColor: 'var(--amber)' }} />
                Simulation Active (Tick {simStatus?.tick || 0})
              </span>
            ) : (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded font-medium text-[11px]"
                style={{
                  background: 'var(--bg-app)',
                  color: 'var(--text-light)',
                  border: '1px solid var(--border)',
                }}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Surveillance
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. OPERATIONAL KPI STRIP ── */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
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
          hint={`Last ${days} days · ${syndrome === 'All' ? 'All signals' : syndrome}`}
          icon={Activity}
          color="teal"
        />
      </div>

      {/* WhatChanged intentionally hidden from Command Centre */}
      {/* <WhatChanged risks={filteredRisks} simStatus={simStatus} syndrome={syndrome} /> */}

      {/* ── 3. PRIMARY SURVEILLANCE STAGE: MAP (HERO) + ACTION & TRIAGE DECK ── */}
      <div className="grid gap-3.5 lg:grid-cols-12 items-start">

        {/* DISTRICT HEALTH MAP — Prominent Hero Visualization (Left / Top Stage) */}
        <section className="card overflow-hidden lg:col-span-7 xl:col-span-8 flex flex-col">
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
                  District Health Surveillance Map
                </h2>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded"
                  style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}
                >
                  {locations.length} Nodes
                </span>
              </div>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Click any village pin to inspect local signal telemetry &amp; trends
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" /> Low (0–39)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" /> Watch (40–69)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600" /> High (70–100)
              </span>
            </div>
          </div>
          <HealthMap
            locations={locations}
            risks={filteredRisks}
            selectedId={selectedId}
            onSelectLocation={onSelectLocation}
          />
        </section>

        {/* RIGHT COLUMN: Today's Brief + Villages Needing Review + Live Simulation Deck */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-3.5">

          {/* Today's Health Brief — Rapid Scan Executive Layout */}
          <div
            className="card p-3.5 border transition-all"
            style={{
              background: highRisk.length > 0 ? 'rgba(220,38,38,0.03)' : 'var(--teal-light)',
              borderColor: highRisk.length > 0 ? 'rgba(220,38,38,0.25)' : 'rgba(14,124,123,0.2)',
            }}
          >
            {/* Header: Title + Date + Status Badge */}
            <div
              className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 shrink-0" style={{ color: highRisk.length > 0 ? 'var(--red)' : 'var(--teal)' }} />
                <h2 className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: 'var(--text-main)' }}>
                  Today's Health Brief — {today}
                </h2>
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
                style={{
                  background: highRisk.length > 0 ? 'rgba(220,38,38,0.12)' : 'rgba(42,157,143,0.12)',
                  color: highRisk.length > 0 ? 'var(--red)' : 'var(--green)',
                }}
              >
                {highRisk.length > 0
                  ? `${highRisk.length} ${highRisk.length === 1 ? 'Village' : 'Villages'} Need Review`
                  : 'All Clear'}
              </span>
            </div>

            {/* Separated Village Alert Cards or Normal Baseline */}
            {highRisk.length > 0 ? (
              <div className="space-y-2">
                {highRisk.map(r => {
                  const isSelected = selectedId === r.location_id
                  return (
                    <div
                      key={r.location_id}
                      onClick={() => onSelectLocation(r.location_id)}
                      className={`group p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-1 ring-[var(--teal)]'
                          : 'hover:border-slate-400/50'
                      }`}
                      style={{
                        background: isSelected ? 'var(--teal-light)' : 'var(--bg-app)',
                        borderColor: isSelected ? 'var(--teal)' : 'var(--border)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="inline-block w-2 h-2 rounded-full bg-red-600 shrink-0 animate-pulse" />
                          <span className="font-bold text-xs sm:text-sm tracking-tight truncate" style={{ color: 'var(--text-main)' }}>
                            {r.location_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tabular-nums"
                            style={{ background: 'rgba(220,38,38,0.12)', color: 'var(--red)' }}
                          >
                            Score: {Math.round(r.score_0_100)}/100
                          </span>
                          <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />
                        </div>
                      </div>
                      <p className="text-[11px] mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                        {r.flag_reason || `Unusual ${syndrome !== 'All' ? syndrome : 'health'} signals detected.`}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 py-2 px-1">
                <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'var(--green)' }} />
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  All monitored villages in the district are reporting normal health signals today.
                </p>
              </div>
            )}

            {/* Mandatory Surveillance Disclaimer */}
            <div
              className="mt-2.5 flex items-start gap-1.5 p-2 rounded border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: 'var(--amber)' }} />
              <p className="text-[10px] font-medium leading-snug" style={{ color: 'var(--text-muted)' }}>
                No diagnosis is made. These are surveillance signals for review by district health officers.
              </p>
            </div>
          </div>

          {/* Villages Needing Review — Triage List */}
          <div className="card p-3.5">
            <div className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" style={{ color: needsReview > 0 ? 'var(--red)' : 'var(--green)' }} />
                <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                  Villages Needing Review
                </h2>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-bold uppercase"
                style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}
              >
                {topRisks.length} Priority
              </span>
            </div>

            {topRisks.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-7 w-7 mx-auto mb-1.5" style={{ color: 'var(--green)' }} />
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>All villages are within normal range</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                {topRisks.map(risk => {
                  const locAlert = alerts.find(a => a.location_id === risk.location_id && (a.status === 'open' || a.status === 'new'))
                  const isSelected = selectedId === risk.location_id
                  return (
                    <button
                      key={risk.location_id}
                      type="button"
                      onClick={() => onSelectLocation(risk.location_id)}
                      className={`w-full flex items-center justify-between gap-2 rounded-lg p-2.5 text-left transition-all cursor-pointer border ${
                        isSelected ? 'ring-1 ring-[var(--teal)]' : 'hover:border-slate-400/40'
                      }`}
                      style={{
                        background: isSelected ? 'var(--teal-light)' : 'var(--bg-app)',
                        borderColor: isSelected ? 'var(--teal)' : 'var(--border)',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs truncate" style={{ color: 'var(--text-main)' }}>
                            {risk.location_name}
                          </span>
                          {locAlert && (
                            <span
                              className="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase"
                              style={{ background: 'rgba(220,38,38,0.15)', color: 'var(--red)' }}
                            >
                              Alert
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                          {risk.flag_reason || `Risk level: ${riskLabel(risk.score_0_100)}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span
                            className="text-sm font-bold tabular-nums"
                            style={{
                              color: risk.score_0_100 >= 70 ? 'var(--red)' : risk.score_0_100 >= 40 ? 'var(--amber)' : 'var(--green)',
                            }}
                          >
                            {Math.round(risk.score_0_100)}
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--text-light)' }}>/100</span>
                        </div>
                        <RiskBadge score={risk.score_0_100} />
                        <ChevronRight className="h-3.5 w-3.5 opacity-40" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Live Simulation Controls Deck */}
          <div className="card p-3.5">
            <div className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4" style={{ color: 'var(--amber)' }} />
                <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                  Live Simulation Controls
                </h2>
              </div>
              {simStatus?.running && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-bold uppercase"
                  style={{ background: 'rgba(217,119,6,0.15)', color: 'var(--amber)' }}
                >
                  Running
                </span>
              )}
            </div>
            <SimulationControls
              simStatus={simStatus}
              onStart={startSimulation}
              onPause={pauseSimulation}
              onReset={resetSimulation}
              onUpdate={setSimStatus}
            />
          </div>

        </div>
      </div>

      {/* ── 4. SURVEILLANCE SIGNALS & TELEMETRY ── */}
      <div className="grid gap-3.5 lg:grid-cols-12 items-start">

        {/* Multi-Source Signal Trends */}
        <div className="lg:col-span-7 xl:col-span-8 [&>section]:!bg-[var(--bg-card)] [&>section]:!border-[var(--border)] [&>section_h2]:!text-[var(--text-main)] [&>section_.bg-slate-100]:!bg-[var(--bg-app)] [&>section_.text-slate-600]:!text-[var(--text-muted)] [&>section_.text-slate-500]:!text-[var(--text-muted)] [&>div]:!bg-[var(--bg-card)] [&>div]:!border-[var(--border)]">
          <TrendPanel trends={trends} />
        </div>

        {/* Right Stack: Recent Alerts + System Health */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-3.5">

          {/* Recent Surveillance Alerts */}
          <section className="card p-3.5">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                <Bell className="h-3.5 w-3.5" style={{ color: 'var(--teal)' }} />
                Recent Surveillance Alerts
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded font-semibold" style={{ background: 'var(--bg-app)', color: 'var(--text-muted)' }}>
                {alerts.length} total
              </span>
            </div>
            {alerts.length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>No alerts in the system.</p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 3).map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-2.5 rounded-lg p-2.5 border"
                    style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}
                  >
                    <Zap
                      className="h-3.5 w-3.5 mt-0.5 shrink-0"
                      style={{ color: alert.severity === 'high' ? 'var(--red)' : 'var(--amber)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs" style={{ color: 'var(--text-main)' }}>
                          {alert.location_name}
                        </span>
                        <AlertStatusBadge status={alert.status} />
                      </div>
                      {alert.top_factors?.[0] && (
                        <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                          {alert.top_factors[0].note || `${alert.top_factors[0].factor_name} flagged`}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-bold shrink-0 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {alert.score_0_100 != null ? `${Math.round(alert.score_0_100)}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* System Health */}
          <SystemHealth simStatus={simStatus} />

        </div>
      </div>

    </div>
  )
}

// Operational KPI card inline component
function KPI({ label, value, hint, icon: Icon, color = 'teal' }) {
  const colors = {
    teal:  { bg: 'var(--teal-light)',              fg: 'var(--teal)' },
    red:   { bg: 'rgba(220,38,38,0.08)',            fg: 'var(--red)' },
    amber: { bg: 'rgba(217,119,6,0.08)',            fg: 'var(--amber)' },
    green: { bg: 'rgba(42,157,143,0.08)',           fg: 'var(--green)' },
  }
  const c = colors[color] || colors.teal

  return (
    <div className="card p-3 sm:p-3.5 flex flex-col justify-between transition-all hover:border-[var(--teal)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider truncate" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{ background: c.bg }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: c.fg }} />
        </div>
      </div>
      <div className="mt-1">
        <div className="tabular-nums text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
          {value}
        </div>
        {hint && <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-light)' }}>{hint}</p>}
      </div>
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
