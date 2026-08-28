import {
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  ResponsiveContainer as RechartsContainer,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid as RechartsGrid,
  Legend as RechartsLegend,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

const METRICS = [
  { key: 'asha_reports', label: 'ASHA Syndromic Reports', color: '#3D5A80' },
  { key: 'opd_visits', label: 'OPD Clinical Visits', color: '#577590' },
  { key: 'pharmacy_demand', label: 'Pharmacy Medicine Demand', color: '#6D597A' },
]

function TrendPanel({ trends }) {
  if (!trends) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs text-sm text-slate-500 animate-pulse">
        Loading multi-signal trends...
      </div>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs" aria-label="Signal Trend Visualizations">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-sentinel-teal" />
          <div>
            <h2 className="text-sm font-bold text-sentinel-ink">
              Multi-Source Rolling Signal Trajectories
            </h2>
            <p className="text-xs text-slate-500">
              Daily aggregate case counts across ASHA, OPD, and Pharmacy channels
            </p>
          </div>
        </div>
        <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          Last {trends.window_days} Days Window
        </span>
      </div>

      {/* Recharts Multi-line Chart */}
      <div className="mt-4 h-72 w-full">
        <RechartsContainer width="100%" height="100%">
          <RechartsLineChart data={trends.series} margin={{ top: 12, right: 16, left: -20, bottom: 0 }}>
            <RechartsGrid stroke="#E2E8F0" strokeDasharray="3 3" />
            <RechartsXAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748B' }}
              interval={Math.ceil(trends.series.length / 7)}
              tickFormatter={(val) => (val ? val.slice(5) : '')}
            />
            <RechartsYAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#0F2A3A',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#0E7C7B', fontWeight: 'bold' }}
            />
            <RechartsLegend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
            />
            {METRICS.map((m) => (
              <RechartsLine
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </RechartsLineChart>
        </RechartsContainer>
      </div>

      <p className="mt-3 text-[11px] text-slate-400">
        Aggregate time series derived from local SQLite store · Synthetic non-PHI signals.
      </p>
    </section>
  )
}

export default TrendPanel
