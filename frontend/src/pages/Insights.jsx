import { useEffect, useState } from 'react'
import { BrainCircuit, Activity, Layers, Sparkles, Sliders, CheckCircle2 } from 'lucide-react'
import { getInsights, getRisks } from '../api/api'
import EmptyState from '../components/EmptyState'
import KPICard from '../components/KPICard'

function Insights() {
  const [data, setData] = useState(null)
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [insightsRes, risksRes] = await Promise.all([getInsights(), getRisks()])
        setData(insightsRes)
        setRisks(risksRes)
      } catch {
        setError('Unable to retrieve model telemetry from FastAPI')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6" id="main-content" tabIndex={-1}>
        <div className="h-96 rounded-lg border border-slate-200 bg-white p-6 animate-pulse">
          <div className="h-6 w-64 bg-slate-200 rounded"></div>
          <div className="mt-4 h-80 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return <EmptyState title="Model Telemetry Error" message={error} />
  }

  const weights = [
    { name: 'Statistical Anomaly Ratio', weight: '40%', desc: 'Current 7-day volume vs 30-day historical baseline median across syndromic streams', color: 'bg-[#3D5A80]' },
    { name: 'Multi-Source Corroboration', weight: '30%', desc: 'Simultaneous elevation across 2+ independent channels (ASHA + OPD + Pharmacy)', color: 'bg-[#0E7C7B]' },
    { name: 'DBSCAN Spatial Clustering', weight: '20%', desc: 'Geographic proximity grouping (radius eps=2.5km, min_samples=2)', color: 'bg-[#2A9D8F]' },
    { name: 'Environmental Indicators', weight: '10%', desc: 'Water risk index and heavy rainfall anomalies in local drainage basin', color: 'bg-[#4A7C59]' },
  ]

  const highRiskCount = risks.filter((r) => r.score_0_100 >= 70).length
  const watchCount = risks.filter((r) => r.score_0_100 >= 40 && r.score_0_100 < 70).length
  const lowCount = risks.filter((r) => r.score_0_100 < 40).length

  return (
    <div className="space-y-6" id="main-content" tabIndex={-1}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-4 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-sentinel-ink sm:text-2xl">
              AI Insights & Model Telemetry
            </h1>
            <span className="rounded bg-sentinel-teal/15 px-2 py-0.5 text-xs font-bold text-sentinel-teal">
              Transparent ML Room
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Real-time inference parameters, mathematical weights, and anomaly distribution
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          label="Model Architecture"
          value="phase5-v1"
          hint="Transparent Weighted ML Engine"
          icon={BrainCircuit}
          color="teal"
        />
        <KPICard
          label="Locations Evaluated"
          value={data.locations_analyzed}
          hint="12 Village Spatial Nodes"
          icon={Activity}
          color="slate"
        />
        <KPICard
          label="Detected Anomalies"
          value={data.anomalies_detected}
          hint="Watch & High Risk Bands"
          icon={Sparkles}
          color={data.anomalies_detected > 0 ? 'rose' : 'teal'}
        />
        <KPICard
          label="Spatial Clusters"
          value={data.clusters_detected}
          hint="DBSCAN (eps=2.5km, min=2)"
          icon={Layers}
          color="indigo"
        />
      </section>

      {/* Model Health & Pipeline Metadata */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-sentinel-ink">
              Scoring Pipeline Specifications
            </h2>
          </div>
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
            {data.model_status}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Model Identifier</p>
            <p className="mt-1 text-sm font-bold text-sentinel-ink">{data.model_name}</p>
            <p className="text-[10px] text-slate-400">Deterministic statistical scoring</p>
          </div>

          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Last Inference Cycle</p>
            <p className="mt-1 text-sm font-bold text-sentinel-ink">
              {data.last_inference ? new Date(data.last_inference).toLocaleString('en-IN') : 'Live In-Memory Baseline'}
            </p>
            <p className="text-[10px] text-slate-400">Simulation Clock Synchronized</p>
          </div>

          <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Peak Anomaly Index</p>
            <p className="mt-1 text-sm font-bold text-rose-600">{data.highest_anomaly} / 100</p>
            <p className="text-[10px] text-slate-400">Planted Cluster (East Block)</p>
          </div>
        </div>

        <div className="mt-4 rounded-md bg-sentinel-mist p-3 text-xs text-slate-700 leading-relaxed border border-slate-200">
          <strong>Scoring Methodology Note: </strong>
          {data.logic_note}
        </div>
      </section>

      {/* Scoring Weight Breakdown */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="h-4 w-4 text-sentinel-teal" />
          <h2 className="text-sm font-bold text-sentinel-ink">
            Mathematical Component Weighting Matrix (Total = 100%)
          </h2>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {weights.map((w) => (
            <div key={w.name} className="rounded-md border border-slate-200 bg-slate-50 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sentinel-ink">{w.name}</span>
                  <span className="text-xs font-mono font-bold text-sentinel-teal">{w.weight}</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-600 leading-relaxed">{w.desc}</p>
              </div>
              <div className="mt-3 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${w.color}`} style={{ width: w.weight }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Anomaly Distribution across Villages */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-sm font-bold text-sentinel-ink mb-3">
          Village Risk Distribution Summary
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-center">
            <p className="text-xs font-bold text-emerald-800 uppercase">Low Risk (0–39)</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{lowCount}</p>
            <p className="text-[11px] text-emerald-600">Expected baseline volume</p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-center">
            <p className="text-xs font-bold text-amber-800 uppercase">Watch Level (40–69)</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{watchCount}</p>
            <p className="text-[11px] text-amber-600">Moderate single-stream surge</p>
          </div>

          <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-center">
            <p className="text-xs font-bold text-rose-800 uppercase">High Risk (70–100)</p>
            <p className="mt-1 text-2xl font-bold text-rose-700">{highRiskCount}</p>
            <p className="text-[11px] text-rose-600">Multi-source spatial cluster</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Insights
