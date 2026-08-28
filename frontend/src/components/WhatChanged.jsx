import { ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles, Activity } from 'lucide-react'

function WhatChanged({ trends, locationName = 'Rampur', simulation, riskScore }) {
  if (!trends || !trends.comparisons) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-sentinel-teal" />
          <h2 className="text-sm font-bold text-sentinel-ink">What Changed in the Last Update?</h2>
        </div>
        <p className="mt-2 text-xs text-slate-500">Loading live signal differential from surveillance engine...</p>
      </section>
    )
  }

  const { comparisons } = trends
  const asha = comparisons.asha_reports || { current: 0, baseline: 0, percent_change: 0 }
  const opd = comparisons.opd_visits || { current: 0, baseline: 0, percent_change: 0 }
  const pharm = comparisons.pharmacy_demand || { current: 0, baseline: 0, percent_change: 0 }
  const env = comparisons.water_risk_index || { current: 0, baseline: 0, percent_change: 0 }

  const streamMetrics = [
    {
      source: 'ASHA Syndromic Reports',
      code: 'ASHA',
      current: asha.current,
      baseline: asha.baseline,
      change: asha.percent_change,
      unit: 'cases/wk',
      color: 'text-[#3D5A80]',
      bgColor: 'bg-[#3D5A80]/10',
    },
    {
      source: 'OPD Clinical Visits',
      code: 'OPD',
      current: opd.current,
      baseline: opd.baseline,
      change: opd.percent_change,
      unit: 'visits/wk',
      color: 'text-[#577590]',
      bgColor: 'bg-[#577590]/10',
    },
    {
      source: 'Pharmacy ORS / Medicine',
      code: 'PHARMACY',
      current: pharm.current,
      baseline: pharm.baseline,
      change: pharm.percent_change,
      unit: 'units/wk',
      color: 'text-[#6D597A]',
      bgColor: 'bg-[#6D597A]/10',
    },
    {
      source: 'Environmental Water Index',
      code: 'ENVIRONMENT',
      current: env.current,
      baseline: env.baseline,
      change: env.percent_change,
      unit: 'index (0-1)',
      color: 'text-[#4A7C59]',
      bgColor: 'bg-[#4A7C59]/10',
    },
  ]

  const isMultiSourceSurge = asha.percent_change > 15 && pharm.percent_change > 15
  const isHighRisk = (riskScore ?? 0) >= 70

  return (
    <section className="rounded-lg border-2 border-sentinel-teal/40 bg-white p-4 shadow-xs" aria-label="What changed in the last update">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-sentinel-teal/15 text-sentinel-teal">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-sentinel-ink flex items-center gap-2">
              <span>What Changed in the Last Update?</span>
              <span className="rounded bg-sentinel-teal px-1.5 py-0.2 text-[10px] font-semibold text-white uppercase tracking-wider">
                Live Diff
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Focus Location: <strong className="text-sentinel-ink">{locationName}</strong> · Scenario: <strong className="text-sentinel-teal">{simulation?.scenario || 'NORMAL'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase text-slate-400">Current Risk Index</p>
            <p className="tabular-nums text-lg font-bold text-sentinel-ink">
              {riskScore ? Number(riskScore).toFixed(1) : '—'} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </p>
          </div>
          <div className={`px-2.5 py-1 rounded text-xs font-bold ${isHighRisk ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-teal-50 text-teal-700 border border-teal-200'}`}>
            {isHighRisk ? 'HIGH ALERT' : 'WATCH / LOW'}
          </div>
        </div>
      </div>

      {/* 4 Multi-Source Channels */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {streamMetrics.map((metric) => {
          const isUp = metric.change >= 0
          return (
            <div key={metric.source} className="rounded-md border border-slate-100 bg-slate-50/60 p-2.5">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${metric.bgColor} ${metric.color}`}>
                  {metric.code}
                </span>
                <div className={`flex items-center text-xs font-bold ${isUp && metric.change > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {isUp && metric.change > 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                  )}
                  <span>{isUp && metric.change > 0 ? '+' : ''}{metric.change}%</span>
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-1">
                <div>
                  <p className="text-[10px] text-slate-400">Current</p>
                  <p className="text-base font-bold tabular-nums text-sentinel-ink">{metric.current}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Baseline (30d)</p>
                  <p className="text-xs font-medium tabular-nums text-slate-500">{metric.baseline}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Operational Interpretation Narrative */}
      <div className="mt-3 flex items-start gap-2 rounded-md bg-sentinel-mist p-2.5 text-xs text-slate-700 border border-slate-200/60">
        <Sparkles className="h-4 w-4 shrink-0 text-sentinel-teal mt-0.5" />
        <div className="leading-relaxed">
          <strong>Surveillance Synthesis: </strong>
          {isMultiSourceSurge ? (
            <span>
              Multi-source activity is moving significantly above the local baseline. Both community syndromic reports and pharmacy sales exhibit coordinated surge.
            </span>
          ) : (
            <span>
              Signals are oscillating within expected deterministic baseline tolerances. No immediate un-modeled surge detected.
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

export default WhatChanged
