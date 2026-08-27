import { Activity, Bell, Clock, MapPinned } from 'lucide-react'
import ClusterPanel from '../components/ClusterPanel'
import EmptyState from '../components/EmptyState'
import HealthMap from '../components/HealthMap'
import KPICard from '../components/KPICard'
import RiskBadge from '../components/RiskBadge'
import { kpis, MODEL_VERSION } from '../data/mockData'

function Dashboard({ locations, selectedId, onSelectLocation, days }) {
  const selected = locations.find((location) => location.id === selectedId) || locations[0]
  const rankedLocations = [...locations].sort((a, b) => b.riskScore - a.riskScore)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sentinel-ink sm:text-2xl">District overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          Map-first command centre · last {days} days · synthetic demonstration data
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key figures">
        <KPICard label="Locations monitored" value={kpis.locationsMonitored} hint="Fictional villages" icon={MapPinned} />
        <KPICard label="Open alerts" value={kpis.openAlerts} hint="Mock review status" icon={Bell} />
        <KPICard label="Highest risk score" value={kpis.highestRiskScore} hint="Scale 0–100, mock data" icon={Activity} />
        <KPICard label="Last engine run" value={kpis.lastEngineRun} hint={`Version ${MODEL_VERSION}`} icon={Clock} />
      </section>

      {locations.length === 0 ? (
        <EmptyState title="No locations match these filters" message="Try a different syndrome or lower the minimum score." />
      ) : (
        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <HealthMap locations={locations} selectedLocation={selected} onSelectLocation={onSelectLocation} />
          <ClusterPanel location={selected} />
        </section>
      )}

      <section aria-labelledby="top-risk-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 id="top-risk-title" className="text-base font-semibold text-sentinel-ink">Top risk locations</h2>
            <p className="text-xs text-slate-500">Select a row to focus the same village on the map.</p>
          </div>
          <span className="rounded-full bg-sentinel-mist px-2.5 py-1 text-xs text-slate-600">Synthetic data</span>
        </div>
        {rankedLocations.length === 0 ? (
          <EmptyState title="No locations to show" message="Widen the selected filters to restore the mock village list." />
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {rankedLocations.map((location) => {
              const active = location.id === selected?.id
              return (
                <li key={location.id}>
                  <button
                    type="button"
                    onClick={() => onSelectLocation(location.id)}
                    className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left shadow-sm transition-colors ${
                      active ? 'border-sentinel-teal bg-sentinel-teal/5' : 'border-slate-200 bg-sentinel-card hover:border-sentinel-teal/40'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sentinel-ink">{location.name}</p>
                      <p className="text-xs text-slate-500">{location.syndrome} signals · fictional village</p>
                    </div>
                    <RiskBadge score={location.riskScore} category={location.riskCategory} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Dashboard
