import { Database, MapPinned } from 'lucide-react'
import RiskBadge from './RiskBadge'

function ClusterPanel({ location, signalSummary }) {
  if (!location) return null

  const clusterMessage = location.clusterId
    ? `Part of spatial cluster ${location.clusterId} (statistically elevated neighbouring signals)`
    : 'No spatial cluster detected for this location'

  const scoreExplanation =
    location.riskScore >= 70
      ? 'High multi-source anomaly: ASHA fever/diarrhea reports, OPD clinic visits, pharmacy ORS demand, and environmental indicators are jointly elevated above historical baseline across this spatial cluster.'
      : location.riskScore >= 40
      ? 'Watch level: one or more syndromic or environmental signals show moderate elevation above normal baseline levels.'
      : 'Low risk: syndromic reports, clinic counts, pharmacy sales, and environmental metrics are within expected historical baseline variations.'

  return (
    <aside className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm" aria-label="Selected location details">
      <p className="text-sm font-semibold text-sentinel-ink">Location details</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-sentinel-ink">{location.name}</h2>
          <p className="text-sm text-slate-500">{location.block} · synthetic village aggregate</p>
        </div>
        <RiskBadge score={location.riskScore} category={location.riskCategory} size="lg" />
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold text-sentinel-ink">Why this score</h3>
        <p className="mt-2 text-sm text-slate-700">{scoreExplanation}</p>
      </div>

      <div className="mt-5 rounded-md bg-sentinel-mist p-3">
        <div className="flex gap-2">
          <MapPinned className="h-4 w-4 shrink-0 text-sentinel-teal" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-sentinel-ink">Cluster information</h3>
            <p className="mt-1 text-sm text-slate-700">{clusterMessage}.</p>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex gap-2">
          <Database className="h-4 w-4 shrink-0 text-sentinel-teal" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-sentinel-ink">Synthetic signal summary</h3>
            <p className="mt-1 text-sm text-slate-700">
              {signalSummary
                ? `${signalSummary.totals.asha_case_count.toLocaleString()} ASHA reports, ${signalSummary.totals.opd_patient_count.toLocaleString()} OPD counts, and ${signalSummary.totals.pharmacy_units_sold.toLocaleString()} pharmacy units across the district.`
                : 'Loading aggregate signal totals.'}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Statistical unusualness for public-health review; this view does not diagnose disease.</p>
    </aside>
  )
}

export default ClusterPanel
