import { useEffect, useMemo, useState } from 'react'
import { Activity, Bell, Clock, MapPinned } from 'lucide-react'
import { getAlerts, getLocations, getRisks, getSignalsSummary, getSimulationStatus, startSimulation, pauseSimulation, resetSimulation, getSignalTrends } from '../api/api'
import ClusterPanel from '../components/ClusterPanel'
import EmptyState from '../components/EmptyState'
import HealthMap from '../components/HealthMap'
import KPICard from '../components/KPICard'
import RiskBadge from '../components/RiskBadge'
import LiveStatus from '../components/LiveStatus'
import SimulationControls from '../components/SimulationControls'
import TrendPanel from '../components/TrendPanel'

function riskCategory(score) {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Watch'
  return 'Low'
}

function Dashboard({ selectedId, onSelectLocation, days, syndrome, minScore }) {
  const [locations, setLocations] = useState([])
  const [risks, setRisks] = useState([])
  const [alerts, setAlerts] = useState([])
  const [signalSummary, setSignalSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [simulation, setSimulation] = useState(null)
  const [scenario, setScenario] = useState('NORMAL')
  const [speed, setSpeed] = useState(1)
  const [trends, setTrends] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setLoading(true)
      setError('')
      try {
        const [locationData, riskData, alertData, summaryData] = await Promise.all([
          getLocations(), getRisks(), getAlerts(), getSignalsSummary(),
        ])
        if (cancelled) return
        setLocations(locationData)
        setRisks(riskData)
        setAlerts(alertData)
        setSignalSummary(summaryData)
        setSimulation(await getSimulationStatus())
        onSelectLocation((currentId) => currentId || locationData[0]?.location_id || null)
      } catch {
        if (!cancelled) setError('Backend unavailable. Start FastAPI server.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()
    return () => { cancelled = true }
  }, [onSelectLocation])

  useEffect(() => {
    if (!selectedId) return
    getSignalTrends(selectedId, days).then(setTrends).catch(() => setTrends(null))
  }, [selectedId, days, simulation?.tick])

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const next = await getSimulationStatus()
        setSimulation(next)
        if (next.running) setRisks(await getRisks())
      } catch { /* Initial load owns the visible error state. */ }
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  async function handleStart() { setSimulation(await startSimulation(scenario, speed)) }
  async function handlePause() { setSimulation(await pauseSimulation()) }
  async function handleReset() { setSimulation(await resetSimulation()); setRisks(await getRisks()) }

  const apiLocations = useMemo(() => {
    const riskByLocationId = new Map(risks.map((risk) => [risk.location_id, risk]))
    return locations.map((location) => {
      const risk = riskByLocationId.get(location.location_id)
      const score = Number(risk?.score_0_100 ?? 0)
      return {
        id: location.location_id,
        name: location.name,
        block: location.block,
        lat: location.latitude,
        lng: location.longitude,
        riskScore: score,
        riskCategory: riskCategory(score),
        clusterId: risk?.cluster_id ?? null,
        modelVersion: risk?.model_version ?? 'phase5-v1',
        factors: risk?.factors ?? [],
      }
    }).filter((location) => location.riskScore >= minScore)
  }, [locations, risks, minScore])

  const selected = apiLocations.find((location) => location.id === selectedId) || apiLocations[0]
  const rankedLocations = [...apiLocations].sort((a, b) => b.riskScore - a.riskScore)
  const highestScore = Math.max(0, ...apiLocations.map((location) => location.riskScore))
  const riskEngineReady = risks.some((risk) => risk.model_version === 'phase5-v1')

  if (loading) {
    return <EmptyState title="Loading synthetic district..." message="Retrieving aggregate locations, calculated risks, and signal summary from FastAPI." />
  }

  if (error) {
    return <EmptyState title="Backend unavailable. Start FastAPI server." message="Run `python backend/seed_database.py`, then `python -m ml.run`, then `uvicorn backend.app.main:app --reload`, and refresh this page." />
  }

  if (!riskEngineReady) {
    return <EmptyState title="Risk engine has not run" message="Synthetic locations are ready. Run `python -m ml.run`, then refresh this page to load calculated scores, clusters, alerts, and explanations." />
  }

  return (
    <div className="space-y-6">
      <LiveStatus simulation={simulation} onStart={handleStart} onPause={handlePause} onReset={handleReset} />
      <div>
        <h1 className="text-xl font-semibold text-sentinel-ink sm:text-2xl">District overview</h1>
        <p className="mt-1 text-sm text-slate-600">Map-first command centre · last {days} days · synthetic demonstration data</p>
        {syndrome !== 'All' ? <p className="mt-1 text-xs text-slate-500">Displaying aggregated syndromic overview across all channels.</p> : null}
      </div>

      <section className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm"><div className="mb-3"><h2 className="text-base font-semibold text-sentinel-ink">Simulation controls</h2><p className="text-xs text-slate-500">Controlled synthetic movement over immutable historical data</p></div><SimulationControls scenario={scenario} speed={speed} onScenarioChange={setScenario} onSpeedChange={setSpeed} /></section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key figures">
        <KPICard label="Locations monitored" value={locations.length} hint="From synthetic SQLite data" icon={MapPinned} />
        <KPICard label="Open alerts" value={alerts.filter((alert) => alert.status === 'open').length} hint="From FastAPI" icon={Bell} />
        <KPICard label="Highest risk score" value={highestScore} hint="0–100 · synthetic surveillance" icon={Activity} />
        <KPICard label="Signal data range" value={signalSummary ? `${signalSummary.date_range.start} → ${signalSummary.date_range.end}` : 'Unavailable'} hint="Aggregate records in SQLite" icon={Clock} />
      </section>

      {apiLocations.length === 0 ? (
        <EmptyState title="No locations match this minimum score" message="Lower the minimum score filter to view more locations." />
      ) : (
        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <HealthMap locations={apiLocations} selectedLocation={selected} onSelectLocation={onSelectLocation} />
          <ClusterPanel location={selected} signalSummary={signalSummary} />
        </section>
      )}

      <section aria-labelledby="top-risk-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 id="top-risk-title" className="text-base font-semibold text-sentinel-ink">Locations by risk score</h2>
            <p className="text-xs text-slate-500">Select a row to focus the same village on the map.</p>
          </div>
          <span className="rounded-full bg-sentinel-mist px-2.5 py-1 text-xs text-slate-600">Synthetic data</span>
        </div>
        {rankedLocations.length === 0 ? <EmptyState title="No locations to show" message="Widen the selected score filter." /> : (
          <ul className="grid gap-2 md:grid-cols-2">
            {rankedLocations.map((location) => {
              const active = location.id === selected?.id
              return (
                <li key={location.id}>
                  <button type="button" onClick={() => onSelectLocation(location.id)} className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left shadow-sm transition-colors ${active ? 'border-sentinel-teal bg-sentinel-teal/5' : 'border-slate-200 bg-sentinel-card hover:border-sentinel-teal/40'}`}>
                    <div><p className="font-medium text-sentinel-ink">{location.name}</p><p className="text-xs text-slate-500">{location.block} · synthetic village</p></div>
                    <RiskBadge score={location.riskScore} category={location.riskCategory} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <TrendPanel trends={trends} />
    </div>
  )
}

export default Dashboard
