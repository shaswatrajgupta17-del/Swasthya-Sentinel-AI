import { Activity, Bell, Clock, MapPinned } from 'lucide-react'
import KPICard from '../components/KPICard'
import RiskBadge from '../components/RiskBadge'
import EmptyState from '../components/EmptyState'
import { kpis, MODEL_VERSION } from '../data/mockData'

function Dashboard({ locations, selectedId, onSelectLocation, days }) {
  const selected = locations.find((loc) => loc.id === selectedId) || locations[0]
  const ranked = [...locations].sort((a, b) => b.riskScore - a.riskScore)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sentinel-ink sm:text-2xl">District overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          Map-first command centre (last {days} days, mock). Live map arrives in Phase 2.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key figures">
        <KPICard
          label="Locations monitored"
          value={kpis.locationsMonitored}
          hint="Villages and PHC catchments"
          icon={MapPinned}
        />
        <KPICard
          label="Open alerts"
          value={kpis.openAlerts}
          hint="Awaiting officer review"
          icon={Bell}
        />
        <KPICard
          label="Highest risk score"
          value={kpis.highestRiskScore}
          hint="Scale 0–100, mock engine"
          icon={Activity}
        />
        <KPICard
          label="Last engine run"
          value={kpis.lastEngineRun}
          hint={`Version ${MODEL_VERSION}`}
          icon={Clock}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Reserved map pane — Leaflet is Phase 2 */}
        <section className="lg:col-span-3">
          <div className="flex h-full min-h-[280px] flex-col rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm">
            <p className="text-sm font-semibold text-sentinel-ink">District map</p>
            <p className="text-xs text-slate-500">Placeholder. React Leaflet in Phase 2.</p>
            <div className="mt-3 flex flex-1 flex-col items-center justify-center rounded-md bg-sentinel-mist px-4 py-10 text-center">
              <p className="text-sm text-slate-600">
                Loading synthetic district geography…
              </p>
              <p className="mt-2 max-w-sm text-xs text-slate-500">
                Colour will show Low / Watch / High at village points. Coordinates are already in
                mock data.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-risk-low" /> Low
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-risk-watch" /> Watch
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-risk-high" /> High
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-2" aria-label="Risk summary">
          {selected ? (
            <div className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm">
              <p className="text-sm font-semibold text-sentinel-ink">Selected location</p>
              <h2 className="mt-1 text-lg font-semibold">{selected.villageName}</h2>
              <p className="text-xs text-slate-500">
                {selected.type} · {selected.block} · {selected.district}
              </p>
              <div className="mt-3">
                <RiskBadge score={selected.riskScore} category={selected.riskCategory} size="lg" />
              </div>
              <p className="mt-3 text-sm text-slate-700">
                <span className="font-medium">Syndrome focus: </span>
                {selected.syndrome}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-medium">Why this score: </span>
                {selected.topFactor}
              </p>
              <p className="mt-4 text-xs text-slate-500">
                Statistical unusualness, not a confirmed outbreak. Risk increased when multiple
                signals move together (explained fully in Phase 6).
              </p>
            </div>
          ) : (
            <EmptyState
              title="No location selected"
              message="Choose a village from the list. If filters hide every row, widen the syndrome or score range."
            />
          )}
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-sentinel-ink">Top risk locations</h2>
        {ranked.length === 0 ? (
          <EmptyState
            title="No locations match these filters"
            message="Try syndrome “All” or lower the minimum score."
          />
        ) : (
          <ul className="space-y-2">
            {ranked.map((loc) => {
              const active = loc.id === selected?.id
              return (
                <li key={loc.id}>
                  <button
                    type="button"
                    onClick={() => onSelectLocation(loc.id)}
                    className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left shadow-sm ${
                      active
                        ? 'border-sentinel-teal bg-sentinel-teal/5'
                        : 'border-slate-200 bg-sentinel-card hover:border-sentinel-teal/40'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sentinel-ink">{loc.villageName}</p>
                      <p className="text-xs text-slate-500">
                        {loc.syndrome} · {loc.block}
                      </p>
                    </div>
                    <RiskBadge score={loc.riskScore} category={loc.riskCategory} />
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
