import { MapPinned } from 'lucide-react'
import RiskBadge from './RiskBadge'
import SignalTrendChart from './SignalTrendChart'

function ClusterPanel({ location }) {
  if (!location) return null

  const clusterMessage = location.riskCategory === 'High'
    ? 'Part of a 3 village unusual signal cluster'
    : 'No multi-village unusual signal cluster identified in this demo view'

  return (
    <aside className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm" aria-label="Selected location details">
      <p className="text-sm font-semibold text-sentinel-ink">Location details</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-sentinel-ink">{location.name}</h2>
          <p className="text-sm text-slate-500">{location.syndrome} signal focus · synthetic</p>
        </div>
        <RiskBadge score={location.riskScore} category={location.riskCategory} size="lg" />
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold text-sentinel-ink">Why this score</h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          {location.factors.map((factor) => <li className="flex gap-2" key={factor}><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sentinel-teal" />{factor}</li>)}
        </ul>
      </div>

      <div className="mt-5 rounded-md bg-sentinel-mist p-3">
        <div className="flex gap-2"><MapPinned className="h-4 w-4 shrink-0 text-sentinel-teal" aria-hidden="true" /><div><h3 className="text-sm font-semibold text-sentinel-ink">Cluster information</h3><p className="mt-1 text-sm text-slate-700">{clusterMessage}.</p></div></div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold text-sentinel-ink">Signal trend</h3>
        <p className="mt-1 text-xs text-slate-500">Last 14 days · synthetic aggregated counts</p>
        <div className="mt-2"><SignalTrendChart data={location.trendData} /></div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Unusual signals require public-health review; this view does not diagnose disease.</p>
    </aside>
  )
}

export default ClusterPanel
