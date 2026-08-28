import { Database, MapPinned } from 'lucide-react'
import RiskBadge from './RiskBadge'

const FACTOR_COLORS = {
  'ASHA Syndromic Reports': '#3D5A80',
  'OPD Clinical Visits': '#577590',
  'Pharmacy Product Demand': '#6D597A',
  'Multi-Source Corroboration': '#0E7C7B',
  'Spatial Cluster Grouping': '#2A9D8F',
  'Environmental Indicators': '#4A7C59',
}

function ClusterPanel({ location, signalSummary }) {
  if (!location) return null

  const clusterMessage = location.clusterId
    ? `Part of spatial cluster ${location.clusterId} with neighbouring elevated villages in ${location.block}`
    : 'No spatial cluster detected for this location'

  const scoreExplanation =
    location.riskScore >= 70
      ? 'High multi-source anomaly: ASHA fever/diarrhea reports, OPD clinic visits, pharmacy ORS demand, and environmental indicators are jointly elevated above historical baseline across this spatial cluster.'
      : location.riskScore >= 40
      ? 'Watch level: one or more syndromic or environmental signals show moderate elevation above normal baseline levels.'
      : 'Low risk: syndromic reports, clinic counts, pharmacy sales, and environmental metrics are within expected historical baseline variations.'

  const factors = location.factors || []

  return (
    <aside className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm" aria-label="Selected location details">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-sentinel-ink">Location details</p>
        <span className="text-xs text-slate-400 font-mono">Model: {location.modelVersion || 'phase5-v1'}</span>
      </div>

      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-sentinel-ink">{location.name}</h2>
          <p className="text-sm text-slate-500">{location.block} · synthetic village aggregate</p>
        </div>
        <RiskBadge score={location.riskScore} category={location.riskCategory} size="lg" modelVersion={location.modelVersion} />
      </div>

      {/* Phase 6: Factor Decomposition (Why this score) */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-sentinel-ink">Why this score</h3>
          <span className="text-xs font-medium text-slate-500">Calculated factor contributions</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{scoreExplanation}</p>

        {factors.length > 0 ? (
          <div className="mt-3.5 space-y-3">
            {factors.map((factor) => {
              const color = FACTOR_COLORS[factor.factor_name] || '#0E7C7B'
              const maxPoints = 30.0
              const contribution = factor.live_contribution ?? factor.contribution
              const percentage = factor.live_percentage ?? factor.percentage
              const barWidthPct = Math.min(100, Math.max(2, (contribution / maxPoints) * 100))

              return (
                <div key={factor.factor_name} className="rounded-md border border-slate-100 bg-slate-50/70 p-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-sentinel-ink">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
                      {factor.factor_name}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="font-semibold text-sentinel-ink">+{contribution.toFixed(1)} pts</span>
                      {location.riskScore > 0 && (
                        <span className="text-slate-400">({percentage.toFixed(0)}%)</span>
                      )}
                    </div>
                  </div>

                  {/* Contribution bar */}
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${barWidthPct}%`,
                        backgroundColor: color,
                        opacity: contribution > 0 ? 0.9 : 0.2,
                      }}
                    />
                  </div>

                  {/* Factor note */}
                  <p className="mt-1.5 text-[11px] leading-tight text-slate-500">{factor.note}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-3 rounded-md bg-slate-50 p-2.5 text-xs text-slate-500">
            Factor breakdown loading from surveillance model...
          </div>
        )}
      </div>

      {/* Cluster Information */}
      <div className="mt-5 rounded-md bg-sentinel-mist p-3">
        <div className="flex gap-2">
          <MapPinned className="h-4 w-4 shrink-0 text-sentinel-teal" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-sentinel-ink">Cluster information</h3>
            <p className="mt-1 text-xs text-slate-700">{clusterMessage}.</p>
          </div>
        </div>
      </div>

      {/* Aggregate District Signal Summary */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="flex gap-2">
          <Database className="h-4 w-4 shrink-0 text-sentinel-teal" aria-hidden="true" />
          <div>
            <h3 className="text-xs font-semibold text-sentinel-ink">District surveillance context</h3>
            <p className="mt-0.5 text-xs text-slate-600">
              {signalSummary
                ? `${signalSummary.totals.asha_case_count.toLocaleString()} ASHA reports, ${signalSummary.totals.opd_patient_count.toLocaleString()} OPD counts, and ${signalSummary.totals.pharmacy_units_sold.toLocaleString()} pharmacy units across all 12 villages.`
                : 'Loading aggregate signal totals.'}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-slate-400">
        Statistical unusualness for public-health review; synthetic demonstration data does not diagnose disease.
      </p>
    </aside>
  )
}

export default ClusterPanel
