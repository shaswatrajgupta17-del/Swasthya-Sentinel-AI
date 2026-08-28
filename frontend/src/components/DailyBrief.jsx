import { format } from 'date-fns'
import { FileText, AlertTriangle } from 'lucide-react'

function DailyBrief({ risks, alerts, syndrome }) {
  const highRisks = risks.filter(r => r.score_0_100 >= 70)
  const today = format(new Date(), 'dd MMM yyyy')

  return (
    <div className="card p-5 mt-4" style={{ background: 'var(--teal-light)', borderColor: 'rgba(14,124,123,0.2)' }}>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-5 w-5" style={{ color: 'var(--teal)' }} />
        <h2 className="text-lg font-bold" style={{ color: 'var(--teal)' }}>Today's Health Brief — {today}</h2>
      </div>

      <div className="space-y-2 text-sm" style={{ color: 'var(--text-main)' }}>
        {highRisks.length > 0 ? (
          <>
            <p className="font-semibold">
              {highRisks.length} village{highRisks.length > 1 ? 's' : ''} need{highRisks.length === 1 ? 's' : ''} review today.
            </p>
            {highRisks.map(r => (
              <p key={r.location_id}>
                <span className="font-bold">{r.location_name}:</span> {r.flag_reason || `Unusual ${syndrome !== 'All' ? syndrome : 'health'} signals detected.`}
              </p>
            ))}
          </>
        ) : (
          <p>All monitored villages in the district are reporting normal health signals today.</p>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 p-3 rounded bg-white/50 border" style={{ borderColor: 'rgba(14,124,123,0.1)' }}>
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--amber)' }} />
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          No diagnosis is made. These are surveillance signals for review by district health officers.
        </p>
      </div>
    </div>
  )
}

export default DailyBrief
