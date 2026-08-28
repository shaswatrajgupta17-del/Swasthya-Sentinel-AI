import { useEffect, useMemo, useState } from 'react'
import { Layers, Search } from 'lucide-react'
import { getLocations, getRisks } from '../api/api'
import HealthMap from '../components/HealthMap'
import RiskBadge from '../components/RiskBadge'
import EmptyState from '../components/EmptyState'

function riskCategory(score) {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Watch'
  return 'Low'
}

function SurveillanceMap({ onSelectLocation, onNavigateToLocation }) {
  const [locations, setLocations] = useState([])
  const [risks, setRisks] = useState([])
  const [selectedId, setSelectedId] = useState('loc_001')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [locData, riskData] = await Promise.all([getLocations(), getRisks()])
        if (!cancelled) {
          setLocations(locData)
          setRisks(riskData)
          if (locData.length > 0) setSelectedId(locData[0].location_id)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load map surveillance data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  function handleSelect(id) {
    setSelectedId(id)
    if (onSelectLocation) onSelectLocation(id)
  }

  const apiLocations = useMemo(() => {
    const riskByLocationId = new Map(risks.map((r) => [r.location_id, r]))
    return locations.map((loc) => {
      const risk = riskByLocationId.get(loc.location_id)
      const score = Number(risk?.score_0_100 ?? 0)
      return {
        id: loc.location_id,
        name: loc.name,
        block: loc.block,
        district: loc.district,
        lat: loc.latitude,
        lng: loc.longitude,
        riskScore: score,
        riskCategory: riskCategory(score),
        clusterId: risk?.cluster_id ?? null,
        modelVersion: risk?.model_version ?? 'phase5-v1',
        factors: risk?.factors ?? [],
      }
    })
  }, [locations, risks])

  const filteredLocations = useMemo(() => {
    return apiLocations.filter((loc) => {
      const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || loc.block.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCat = selectedCategory === 'All' || loc.riskCategory === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [apiLocations, searchQuery, selectedCategory])

  const selectedLoc = apiLocations.find((l) => l.id === selectedId) || apiLocations[0]

  // Detected clusters summary
  const detectedClusters = useMemo(() => {
    const clusters = new Map()
    apiLocations.forEach((loc) => {
      if (loc.clusterId) {
        if (!clusters.has(loc.clusterId)) clusters.set(loc.clusterId, [])
        clusters.get(loc.clusterId).push(loc)
      }
    })
    return Array.from(clusters.entries()).map(([clusterId, villages]) => ({
      clusterId,
      villages,
      avgRisk: (villages.reduce((acc, v) => acc + v.riskScore, 0) / villages.length).toFixed(1),
    }))
  }, [apiLocations])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-96 rounded-lg border border-slate-200 bg-white p-6 animate-pulse">
          <div className="h-6 w-64 bg-slate-200 rounded"></div>
          <div className="mt-4 h-80 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return <EmptyState title="Map Service Error" message={error} />
  }

  return (
    <div className="space-y-6" id="main-content" tabIndex={-1}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-4 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-sentinel-ink sm:text-2xl">
              District Surveillance Map
            </h1>
            <span className="rounded bg-sentinel-teal/15 px-2 py-0.5 text-xs font-bold text-sentinel-teal">
              Spatial Intelligence
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Geographic distribution of syndromic anomaly scores and DBSCAN-detected village clusters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1">
            {['All', 'High', 'Watch', 'Low'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[32px] rounded px-3 text-xs font-semibold cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? 'bg-sentinel-teal text-white shadow-xs'
                    : 'text-slate-600 hover:text-sentinel-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar Investigation Grid */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Full Interactive Map */}
        <div className="space-y-4">
          <HealthMap
            locations={filteredLocations}
            selectedLocation={selectedLoc}
            onSelectLocation={handleSelect}
            onOpenInvestigation={onNavigateToLocation}
            height="540px"
            showClusterConnectors={true}
          />

          {/* Spatial Clusters Summary Panel */}
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Layers className="h-4 w-4 text-sentinel-teal" />
              <h2 className="text-sm font-bold text-sentinel-ink">
                Detected Spatial Clusters ({detectedClusters.length})
              </h2>
            </div>

            <div className="mt-3 space-y-2.5">
              {detectedClusters.map((cluster) => (
                <div
                  key={cluster.clusterId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50/50 p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-rose-600 px-2 py-0.5 text-xs font-bold text-white uppercase">
                        Cluster {cluster.clusterId}
                      </span>
                      <span className="text-xs font-semibold text-rose-900">
                        {cluster.villages.length} Linked Villages
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      Villages: {cluster.villages.map((v) => v.name).join(', ')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-medium uppercase text-slate-500">Average Risk</p>
                    <p className="tabular-nums text-base font-bold text-rose-700">{cluster.avgRisk} / 100</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Village Node Explorer */}
        <aside className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-sm font-bold text-sentinel-ink">
              Village Surveillance Nodes
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {filteredLocations.length} Listed
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search village or block..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium text-sentinel-ink placeholder-slate-400 focus:border-sentinel-teal focus:bg-white focus:outline-none"
            />
          </div>

          {/* Scrollable Location List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredLocations.map((loc) => {
              const active = loc.id === selectedLoc?.id
              return (
                <div
                  key={loc.id}
                  onClick={() => handleSelect(loc.id)}
                  className={`rounded-lg border p-3 cursor-pointer transition-all ${
                    active
                      ? 'border-sentinel-teal bg-sentinel-teal/5 ring-1 ring-sentinel-teal shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-sentinel-ink">{loc.name}</p>
                      <p className="text-[11px] text-slate-500">{loc.block} Block</p>
                    </div>
                    <RiskBadge score={loc.riskScore} category={loc.riskCategory} />
                  </div>

                  {loc.clusterId && (
                    <p className="mt-2 text-[10px] font-bold text-rose-600">
                      ● Part of Cluster {loc.clusterId}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default SurveillanceMap
