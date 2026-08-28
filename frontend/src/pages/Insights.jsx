import { useEffect, useState } from 'react'
import { BrainCircuit } from 'lucide-react'
import { getInsights } from '../api/api'
import EmptyState from '../components/EmptyState'
import KPICard from '../components/KPICard'

function Insights() {
  const [data, setData] = useState(null)
  useEffect(() => { getInsights().then(setData).catch(() => setData({ error: true })) }, [])
  if (!data) return <EmptyState title="Loading model insights..." message="Retrieving the current synthetic anomaly summary." />
  if (data.error) return <EmptyState title="Backend unavailable" message="Model insights need the local FastAPI service." />
  return <div className="space-y-6"><div><p className="text-xs font-semibold uppercase tracking-wide text-sentinel-teal">Model room</p><h1 className="mt-1 text-2xl font-semibold text-sentinel-ink">Insights</h1><p className="mt-1 text-sm text-slate-600">A transparent view of what the local scoring pipeline sees right now.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KPICard label="Model status" value={data.model_status} hint={data.model_version} icon={BrainCircuit} /><KPICard label="Locations analyzed" value={data.locations_analyzed} hint="Synthetic aggregates" /><KPICard label="Anomalies detected" value={data.anomalies_detected} hint="Watch and High bands" /><KPICard label="Highest anomaly" value={data.highest_anomaly} hint="0–100 risk view" /></div><section className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm"><h2 className="text-base font-semibold text-sentinel-ink">Pipeline status</h2><div className="mt-3 grid gap-3 sm:grid-cols-3"><div><p className="text-xs text-slate-500">Model</p><p className="mt-1 font-medium">{data.model_name}</p></div><div><p className="text-xs text-slate-500">Last inference</p><p className="mt-1 font-medium">{data.last_inference ? new Date(data.last_inference).toLocaleString() : 'Batch baseline'}</p></div><div><p className="text-xs text-slate-500">Clusters detected</p><p className="mt-1 font-medium">{data.clusters_detected}</p></div></div><p className="mt-4 rounded-md bg-sentinel-mist p-3 text-sm text-slate-600">{data.logic_note}</p></section><section className="rounded-lg border border-slate-200 bg-sentinel-card p-4 shadow-sm"><h2 className="text-base font-semibold text-sentinel-ink">Top contributing signal types</h2><div className="mt-3 flex flex-wrap gap-2">{data.top_signal_types.map((type) => <span key={type} className="rounded-full bg-sentinel-teal/10 px-3 py-1.5 text-sm text-sentinel-teal">{type}</span>)}</div></section></div>
}

export default Insights
