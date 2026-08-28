import { useEffect, useState } from 'react'
import { getLocations, getRisks } from '../api/api'
import EmptyState from '../components/EmptyState'
import RiskBadge from '../components/RiskBadge'

function Locations({ onSelectLocation }) {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([getLocations(), getRisks()]).then(([locations, risks]) => {
      const byId = new Map(risks.map((risk) => [risk.location_id, risk]))
      setRows(locations.map((location) => ({ ...location, risk: byId.get(location.location_id) })))
    }).catch(() => setError('Backend unavailable. Start FastAPI server.'))
  }, [])
  if (error) return <EmptyState title={error} message="Run the local backend and refresh this view." />
  if (!rows.length) return <EmptyState title="Loading locations..." message="Retrieving synthetic location risk records." />
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-sentinel-ink">Locations</h1><p className="mt-1 text-sm text-slate-600">Investigate the twelve synthetic village aggregates.</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.sort((a, b) => (b.risk?.score_0_100 || 0) - (a.risk?.score_0_100 || 0)).map((row) => { const score = row.risk?.score_0_100 || 0; const category = score >= 70 ? 'High' : score >= 40 ? 'Watch' : 'Low'; return <button key={row.location_id} type="button" onClick={() => onSelectLocation(row.location_id)} className="rounded-lg border border-slate-200 bg-sentinel-card p-4 text-left shadow-sm transition hover:border-sentinel-teal/50"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-sentinel-ink">{row.name}</p><p className="mt-1 text-xs text-slate-500">{row.block} · {row.location_id}</p></div><RiskBadge score={score} category={category} /></div><p className="mt-4 text-xs text-slate-500">{row.risk?.cluster_id ? `Cluster ${row.risk.cluster_id}` : 'No current spatial cluster'}</p></button>})}</div></div>
}

export default Locations
