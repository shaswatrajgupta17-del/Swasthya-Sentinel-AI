import { useEffect, useMemo, useState } from 'react'
import { Activity, Bell, Clock, MapPinned, RefreshCw, Layers } from 'lucide-react'
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
  getNotificationStatus,
} from '../api/api'
import ClusterPanel from '../components/ClusterPanel'
import EmptyState from '../components/EmptyState'
import HealthMap from '../components/HealthMap'
import KPICard from '../components/KPICard'
import RiskBadge from '../components/RiskBadge'
import SimulationControls from '../components/SimulationControls'
import TrendPanel from '../components/TrendPanel'
import WhatChanged from '../components/WhatChanged'
import SystemHealth from '../components/SystemHealth'

function riskCategory(score) {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Watch'
  return 'Low'
}

function Dashboard({ selectedId, onSelectLocation, days = 7, minScore = 0 }) {
  const [locations, setLocations] = useState([])
  const [risks, setRisks] = useState([])
  const [alerts, setAlerts] = useState([])
  const [signalSummary, setSignalSummary] = useState(null)
  const [notificationStatus, setNotificationStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorDetails, setErrorDetails] = useState('')
  const [simulation, setSimulation] = useState(null)
  const [scenario, setScenario] = useState('NORMAL')
  const [speed, setSpeed] = useState(1.0)
  const [trends, setTrends] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Primary data fetcher with resilient error tracking
  async function loadDashboardData() {
    setLoading(true)
    setErrorDetails('')

    try {
      const results = await Promise.allSettled([
        getLocations(),
        getRisks(),
        getAlerts(),
        getSignalsSummary(),
        getSimulationStatus(),
        getNotificationStatus(),
      ])

      const [locRes, riskRes, alertRes, sumRes, simRes, notifRes] = results

      if (locRes.status === 'fulfilled') setLocations(locRes.value)
      else console.error('Failed to load locations:', locRes.reason)

      if (riskRes.status === 'fulfilled') setRisks(riskRes.value)
      else console.error('Failed to load risks:', riskRes.reason)

      if (alertRes.status === 'fulfilled') setAlerts(alertRes.value)
      else console.error('Failed to load alerts:', alertRes.reason)

      if (sumRes.status === 'fulfilled') setSignalSummary(sumRes.value)
      else console.error('Failed to load signal summary:', sumRes.reason)

      if (simRes.status === 'fulfilled') setSimulation(simRes.value)
      else console.error('Failed to load simulation status:', simRes.reason)

      if (notifRes.status === 'fulfilled') setNotificationStatus(notifRes.value)
      else console.error('Failed to load notification status:', notifRes.reason)

      // Check if critical core data failed
      if (locRes.status === 'rejected' && riskRes.status === 'rejected') {
        throw new Error('FastAPI backend is unreachable on http://localhost:8000')
      }

      if (locRes.status === 'fulfilled' && locRes.value.length > 0) {
        onSelectLocation((currentId) => currentId || locRes.value[0]?.location_id || 'loc_001')
      }
    } catch (err) {
      console.error('[Dashboard Load Error]', err)
      setErrorDetails(err.message || 'Backend service connection failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Poll for live simulation updates
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const nextSim = await getSimulationStatus()
        setSimulation(nextSim)
        if (nextSim.running) {
          const [updatedRisks, updatedAlerts] = await Promise.all([getRisks(), getAlerts()])
          setRisks(updatedRisks)
          setAlerts(updatedAlerts)
        }
      } catch {
        // Polling error silently logged; initial load owns critical error screen
      }
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // Update trends whenever selected village or simulation tick changes
  useEffect(() => {
    if (!selectedId) return
    getSignalTrends(selectedId, days)
      .then(setTrends)
      .catch((err) => {
        console.error('Failed to load signal trends for', selectedId, err)
        setTrends(null)
      })
  }, [selectedId, days, simulation?.tick])

  async function handleStart() {
    try {
      const next = await startSimulation(scenario, speed)
      setSimulation(next)
      const updatedRisks = await getRisks()
      setRisks(updatedRisks)
    } catch (err) {
      console.error('Failed to start simulation:', err)
    }
  }

  async function handlePause() {
    try {
      const next = await pauseSimulation()
      setSimulation(next)
    } catch (err) {
      console.error('Failed to pause simulation:', err)
    }
  }

  async function handleReset() {
    try {
      const next = await resetSimulation()
      setSimulation(next)
      const updatedRisks = await getRisks()
      setRisks(updatedRisks)
      if (selectedId) {
        const updatedTrends = await getSignalTrends(selectedId, days)
        setTrends(updatedTrends)
      }
    } catch (err) {
      console.error('Failed to reset simulation:', err)
    }
  }

  async function handleManualRefresh() {
    setIsRefreshing(true)
    await loadDashboardData()
    setIsRefreshing(false)
  }

  const apiLocations = useMemo(() => {
    const riskByLocationId = new Map(risks.map((risk) => [risk.location_id, risk]))
    return locations
      .map((location) => {
        const risk = riskByLocationId.get(location.location_id)
        const score = Number(risk?.score_0_100 ?? 0)
        return {
          id: location.location_id,
          name: location.name,
          block: location.block,
          district: location.district,
          lat: location.latitude,
          lng: location.longitude,
          riskScore: score,
          riskCategory: riskCategory(score),
          clusterId: risk?.cluster_id ?? null,
          modelVersion: risk?.model_version ?? 'phase5-v1',
          factors: risk?.factors ?? [],
        }
      })
      .filter((loc) => loc.riskScore >= minScore)
  }, [locations, risks, minScore])

  const selectedLocation = apiLocations.find((loc) => loc.id === selectedId) || apiLocations[0]
  const rankedLocations = [...apiLocations].sort((a, b) => b.riskScore - a.riskScore)
  const highestScore = Math.max(0, ...apiLocations.map((loc) => loc.riskScore))
  const openAlertsCount = alerts.filter((a) => a.status === 'open' || a.status === 'investigating').length
  const clusterCount = new Set(apiLocations.map((l) => l.clusterId).filter(Boolean)).size

  if (loading) {
    return (
      <div className="space-y-6" id="main-content" tabIndex={-1}>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs animate-pulse">
          <div className="h-6 w-64 bg-slate-200 rounded"></div>
          <div className="mt-2 h-4 w-96 bg-slate-100 rounded"></div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="h-24 bg-slate-100 rounded"></div>
            <div className="h-24 bg-slate-100 rounded"></div>
            <div className="h-24 bg-slate-100 rounded"></div>
            <div className="h-24 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (errorDetails) {
    return (
      <div className="space-y-6" id="main-content" tabIndex={-1}>
        <EmptyState
          title="Surveillance Backend Connection Error"
          message={`Unable to reach FastAPI backend (${errorDetails}). Please ensure FastAPI is running on http://localhost:8000.`}
          actionLabel="Retry Connection"
          onAction={loadDashboardData}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6" id="main-content" tabIndex={-1}>
      {/* Top Banner / Ticker */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-4 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-sentinel-ink sm:text-2xl">
              Surveillance Command Centre
            </h1>
            <span className="rounded bg-sentinel-ink px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
              Live Feed
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Multi-source anomaly surveillance & early cluster signals · Kalyanpur District
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sentinel-teal ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="District Surveillance Key Indicators">
        <KPICard
          label="Locations Monitored"
          value={locations.length}
          hint="12 Village Nodes in SQLite"
          icon={MapPinned}
          color="teal"
        />
        <KPICard
          label="Active Alerts"
          value={openAlertsCount}
          hint="High severity threshold (≥70)"
          icon={Bell}
          color={openAlertsCount > 0 ? 'rose' : 'slate'}
        />
        <KPICard
          label="Detected Clusters"
          value={clusterCount}
          hint="DBSCAN (eps=2.5km, min=2)"
          icon={Layers}
          color="indigo"
        />
        <KPICard
          label="Highest Risk Score"
          value={highestScore > 0 ? highestScore.toFixed(1) : '—'}
          hint="0–100 Scale · phase5-v1"
          icon={Activity}
          color={highestScore >= 70 ? 'rose' : highestScore >= 40 ? 'amber' : 'teal'}
        />
        <KPICard
          label="Surveillance Window"
          value={
            signalSummary?.date_range?.start && signalSummary?.date_range?.end
              ? `${String(signalSummary.date_range.start).slice(5)} → ${String(signalSummary.date_range.end).slice(5)}`
              : '60 Days'
          }
          hint="Synthetic Aggregate Window"
          icon={Clock}
          color="slate"
        />
      </section>

      {/* Simulation Controls Panel */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-sm font-bold text-sentinel-ink">
              Synthetic Surveillance Stream & Scenario Controls
            </h2>
            <p className="text-xs text-slate-500">
              Inject controlled syndromic surges across village nodes to observe live model response
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${simulation?.running ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
              <span className={`h-2 w-2 rounded-full ${simulation?.running ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {simulation?.running ? `STREAM LIVE · Tick #${simulation.tick}` : 'STREAM PAUSED'}
            </span>
          </div>
        </div>

        <SimulationControls
          scenario={scenario}
          speed={speed}
          running={simulation?.running}
          onScenarioChange={setScenario}
          onSpeedChange={setSpeed}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
        />
      </section>

      {/* WHAT CHANGED IN THE LAST UPDATE (Prominent Section) */}
      <WhatChanged
        trends={trends}
        locationName={selectedLocation?.name || 'Rampur'}
        simulation={simulation}
        riskScore={selectedLocation?.riskScore}
      />

      {/* MAP & LOCATION CLUSTER INVESTIGATION (Centrepiece) */}
      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(380px,0.7fr)]">
        <HealthMap
          locations={apiLocations}
          selectedLocation={selectedLocation}
          onSelectLocation={onSelectLocation}
        />
        <ClusterPanel
          location={selectedLocation}
          signalSummary={signalSummary}
        />
      </section>

      {/* LOCATIONS BY RISK SCORE TABLE / GRID */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs" aria-labelledby="top-risk-title">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 id="top-risk-title" className="text-base font-bold text-sentinel-ink">
              Village Surveillance Ranking
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by live anomaly score (0–100) · Select a village to sync map and multi-source trends
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            Showing {rankedLocations.length} of {locations.length} Locations
          </span>
        </div>

        {rankedLocations.length === 0 ? (
          <EmptyState title="No locations match filter" message="Adjust minimum score in sidebar." />
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {rankedLocations.map((loc) => {
              const active = loc.id === selectedLocation?.id
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => onSelectLocation(loc.id)}
                  className={`flex min-h-[64px] w-full items-center justify-between gap-3 rounded-lg border p-3.5 text-left transition-all cursor-pointer ${
                    active
                      ? 'border-sentinel-teal bg-sentinel-teal/5 ring-2 ring-sentinel-teal/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-sentinel-teal/50 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-sentinel-ink truncate">{loc.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {loc.block} · {loc.clusterId ? `Cluster ${loc.clusterId}` : 'Isolated'}
                    </p>
                  </div>
                  <RiskBadge score={loc.riskScore} category={loc.riskCategory} />
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* 14-DAY MULTI-SIGNAL TRENDS */}
      <TrendPanel trends={trends} />

      {/* SYSTEM HEALTH & TELEMETRY */}
      <SystemHealth
        simulation={simulation}
        notificationStatus={notificationStatus}
        risksCount={locations.length}
      />
    </div>
  )
}

export default Dashboard
