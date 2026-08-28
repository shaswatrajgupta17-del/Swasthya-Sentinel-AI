import { useEffect, useMemo, useState } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { getLocations, getRisks } from '../api/api'
import EmptyState from '../components/EmptyState'
import RiskBadge from '../components/RiskBadge'

function riskCategory(score) {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Watch'
  return 'Low'
}

function Locations({ onSelectLocation }) {
  const [locations, setLocations] = useState([])
  const [risks, setRisks] = useState([])
  const [search, setSearch] = useState('')
  const [selectedBlock, setSelectedBlock] = useState('All')
  const [sortBy, setSortBy] = useState('risk-desc') // 'risk-desc' | 'risk-asc' | 'name'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [locData, riskData] = await Promise.all([getLocations(), getRisks()])
        setLocations(locData)
        setRisks(riskData)
      } catch {
        setError('Unable to load location directory from FastAPI')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const blocks = useMemo(() => {
    return ['All', ...new Set(locations.map((l) => l.block).filter(Boolean))]
  }, [locations])

  const rows = useMemo(() => {
    const riskById = new Map(risks.map((r) => [r.location_id, r]))
    return locations.map((loc) => {
      const risk = riskById.get(loc.location_id)
      const score = Number(risk?.score_0_100 ?? 0)
      return {
        ...loc,
        riskScore: score,
        riskCategory: riskCategory(score),
        clusterId: risk?.cluster_id ?? null,
        topFactor: risk?.factors?.[0]?.factor_name || 'Multi-source baseline',
        factors: risk?.factors || [],
      }
    })
  }, [locations, risks])

  const filteredAndSorted = useMemo(() => {
    let result = rows.filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.location_id.toLowerCase().includes(search.toLowerCase())
      const matchesBlock = selectedBlock === 'All' || r.block === selectedBlock
      return matchesSearch && matchesBlock
    })

    if (sortBy === 'risk-desc') {
      result.sort((a, b) => b.riskScore - a.riskScore)
    } else if (sortBy === 'risk-asc') {
      result.sort((a, b) => a.riskScore - b.riskScore)
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [rows, search, selectedBlock, sortBy])

  if (loading) {
    return (
      <div className="space-y-6" id="main-content" tabIndex={-1}>
        <div className="rounded-lg border border-slate-200 bg-white p-6 animate-pulse">
          <div className="h-6 w-64 bg-slate-200 rounded"></div>
          <div className="mt-4 h-64 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return <EmptyState title="Location Directory Error" message={error} />
  }

  return (
    <div className="space-y-6" id="main-content" tabIndex={-1}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-4 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-sentinel-ink sm:text-2xl">
              Village Surveillance Directory
            </h1>
            <span className="rounded bg-sentinel-teal/15 px-2 py-0.5 text-xs font-bold text-sentinel-teal">
              12 Fictional Nodes
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Comprehensive register of monitored village aggregates, geographic coordinates, and live anomaly status
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search village name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium text-sentinel-ink placeholder-slate-400 focus:border-sentinel-teal focus:bg-white focus:outline-none"
            />
          </div>

          {/* Block Selector */}
          <div>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-sentinel-ink focus:border-sentinel-teal focus:bg-white focus:outline-none"
            >
              {blocks.map((b) => (
                <option key={b} value={b}>
                  Block: {b}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-sentinel-ink focus:border-sentinel-teal focus:bg-white focus:outline-none"
            >
              <option value="risk-desc">Sort: Highest Risk First</option>
              <option value="risk-asc">Sort: Lowest Risk First</option>
              <option value="name">Sort: Village Name (A–Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredAndSorted.map((row) => {
          return (
            <button
              key={row.location_id}
              type="button"
              onClick={() => onSelectLocation(row.location_id)}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4.5 text-left shadow-xs transition-all hover:border-sentinel-teal hover:shadow-sm cursor-pointer group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h2 className="text-base font-bold text-sentinel-ink group-hover:text-sentinel-teal transition-colors">
                      {row.name}
                    </h2>
                    <p className="text-xs font-medium text-slate-500">
                      {row.block} Block · {row.location_id}
                    </p>
                  </div>
                  <RiskBadge score={row.riskScore} category={row.riskCategory} />
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Coordinates:</span>
                    <span className="font-mono text-slate-600">
                      {Number(row.latitude).toFixed(3)}°N, {Number(row.longitude).toFixed(3)}°E
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cluster Status:</span>
                    <span className={row.clusterId ? 'font-bold text-rose-600' : 'text-slate-500'}>
                      {row.clusterId ? `DBSCAN Cluster ${row.clusterId}` : 'Isolated Baseline'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Primary Signal Driver:</span>
                    <span className="font-medium text-sentinel-ink truncate max-w-[170px]">
                      {row.topFactor}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-semibold text-sentinel-teal group-hover:underline">
                <span>Open Full Investigation</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Locations
