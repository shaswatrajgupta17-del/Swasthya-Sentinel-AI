import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const METRICS = [
  ['asha_reports', 'ASHA reports', '#3d5a80'],
  ['opd_visits', 'OPD visits', '#577590'],
  ['pharmacy_demand', 'Pharmacy demand', '#6d597a'],
]

function TrendPanel({ trends }) {
  if (!trends) return <div className="rounded-lg border border-slate-200 bg-sentinel-card p-4 text-sm text-slate-500">Loading synthetic trends...</div>
  return (
    <section className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm" aria-label="Signal and risk trends">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-sentinel-ink">What's changed?</h2>
          <p className="text-xs text-slate-500">Actual aggregate values against the prior 30-day baseline</p>
        </div>
        <span className="text-xs text-slate-400">Last {trends.window_days} days</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {METRICS.map(([key, label]) => {
          const comparison = trends.comparisons[key]
          return <div key={key} className="rounded-md bg-sentinel-mist p-2.5"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-semibold tabular-nums text-sentinel-ink">{comparison.current}</p><p className={`text-xs font-medium ${comparison.percent_change >= 0 ? 'text-risk-high' : 'text-sentinel-teal'}`}>{comparison.percent_change >= 0 ? '+' : ''}{comparison.percent_change}% vs baseline</p></div>
        })}
      </div>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends.series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
            <Tooltip />
            {METRICS.map(([key, label, color]) => <Line key={key} type="monotone" dataKey={key} name={label} stroke={color} strokeWidth={2} dot={false} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default TrendPanel
