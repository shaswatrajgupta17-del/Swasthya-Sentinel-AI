import RiskBadge from '../components/RiskBadge'
import EmptyState from '../components/EmptyState'

function Alerts({ alerts }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sentinel-ink sm:text-2xl">Alerts</h1>
        <p className="mt-1 text-sm text-slate-600">
          Geographic notices for public health review. Acknowledge is a visual demo only in Phase 1.
        </p>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          title="No alerts in this filter"
          message="Open alerts will appear here when a mock score is High and matches the sidebar filters."
        />
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => {
            const isHigh = alert.score >= 70
            return (
              <li
                key={alert.id}
                className={`rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm ${
                  isHigh ? 'border-l-4 border-l-risk-high' : ''
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sentinel-ink">{alert.location}</p>
                    <p className="text-xs text-slate-500">{alert.createdAt}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge score={alert.score} category={alert.score >= 70 ? 'High' : alert.score >= 40 ? 'Watch' : 'Low'} />
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        alert.status === 'Open'
                          ? 'bg-sentinel-teal/15 text-sentinel-teal'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-700">{alert.topFactor}</p>
                <p className="mt-1 text-xs text-slate-500">Syndrome: {alert.syndrome} · Demo data</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Alerts
