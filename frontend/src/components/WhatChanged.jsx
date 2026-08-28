import { AlertTriangle, MapPin, Activity, CheckCircle2 } from 'lucide-react'

function WhatChanged({ risks, simStatus, syndrome }) {
  const highRisks = risks.filter(r => r.score_0_100 >= 70)
  const watchRisks = risks.filter(r => r.score_0_100 >= 40 && r.score_0_100 < 70)

  // Use simulation status description if running, else synthesize from current risks
  let message = ''
  let details = []

  if (simStatus && simStatus.running) {
    message = simStatus.scenario_description
  } else if (highRisks.length > 0) {
    message = `${highRisks.length} village${highRisks.length > 1 ? 's' : ''} reported unusual ${syndrome === 'All' ? 'health' : syndrome} signals today.`
    details.push(`Significant increases seen in ${highRisks.map(r => r.location_name).join(', ')}.`)
  } else if (watchRisks.length > 0) {
    message = `Minor increases in health signals detected.`
    details.push(`Monitor ${watchRisks.length} village${watchRisks.length > 1 ? 's' : ''} for further changes.`)
  } else {
    message = 'No significant changes in the district today.'
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4" style={{ color: 'var(--teal)' }} />
        <h2 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>What Changed Today?</h2>
      </div>

      <div className="rounded-lg p-3 border" style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
          {message}
        </p>
        {details.length > 0 && (
          <ul className="mt-2 space-y-1">
            {details.map((detail, idx) => (
              <li key={idx} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                {detail}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-3 text-[10px]" style={{ color: 'var(--text-light)' }}>
        This summary is generated automatically from daily surveillance reports. It does not constitute a medical diagnosis.
      </p>
    </section>
  )
}

export default WhatChanged
