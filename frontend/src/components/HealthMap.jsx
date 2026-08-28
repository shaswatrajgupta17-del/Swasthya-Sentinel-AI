import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Popup, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { Layers, MapPin, Sparkles, Filter, ExternalLink } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const RISK_COLORS = {
  Low: '#2A9D8F',
  Watch: '#E9C46A',
  High: '#E76F51',
}

function SelectedLocationView({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location && Number.isFinite(location.lat) && Number.isFinite(location.lng)) {
      map.flyTo([location.lat, location.lng], 13.5, { duration: 0.8 })
    }
  }, [location, map])
  return null
}

function FitLocations({ locations }) {
  const map = useMap()
  useEffect(() => {
    if (locations.length > 1) {
      const bounds = locations.map((loc) => [loc.lat, loc.lng])
      map.fitBounds(bounds, { padding: [35, 35] })
    }
  }, [locations, map])
  return null
}

function HealthMap({
  locations = [],
  selectedLocation,
  onSelectLocation,
  onOpenInvestigation,
  height = '440px',
  showClusterConnectors = true,
}) {
  const [activeLayer, setActiveLayer] = useState('risk') // 'risk' | 'clusters' | 'all'
  const initialCenter = locations.length > 0 ? [locations[0].lat, locations[0].lng] : [23.18, 79.95]

  // Group locations by cluster to draw subtle spatial connection lines
  const clusterLines = useMemo(() => {
    if (!showClusterConnectors) return []
    const byCluster = new Map()
    locations.forEach((loc) => {
      if (loc.clusterId) {
        if (!byCluster.has(loc.clusterId)) byCluster.set(loc.clusterId, [])
        byCluster.get(loc.clusterId).push(loc)
      }
    })

    const lines = []
    byCluster.forEach((locs, clusterId) => {
      if (locs.length > 1) {
        const coords = locs.map((l) => [l.lat, l.lng])
        // Complete the loop if 3+ items
        if (locs.length >= 3) {
          coords.push(coords[0])
        }
        lines.push({ clusterId, coords, avgScore: Math.round(locs.reduce((acc, cur) => acc + cur.riskScore, 0) / locs.length) })
      }
    })
    return lines
  }, [locations, showClusterConnectors])

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs" aria-label="District Surveillance Map">
      {/* Map Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-sentinel-ink">
              Spatial Cluster & Anomaly Map
            </h2>
            <span className="rounded bg-sentinel-mist px-2 py-0.5 text-[10px] font-bold text-sentinel-teal uppercase">
              12 Nodes
            </span>
          </div>
          <p className="text-xs text-slate-500">
            DBSCAN spatial radius $eps=2.5\text{ km}$ · Click a node to inspect factor breakdown
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2A9D8F]" aria-hidden="true" />
            <span>Low (0–39)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E9C46A]" aria-hidden="true" />
            <span>Watch (40–69)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E76F51]" aria-hidden="true" />
            <span>High (70–100)</span>
          </div>
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div style={{ height }}>
        <MapContainer
          center={initialCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full"
          aria-label="Interactive district surveillance map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <SelectedLocationView location={selectedLocation} />
          <FitLocations locations={locations} />

          {/* DBSCAN Spatial Cluster Lines */}
          {clusterLines.map((cl) => (
            <Polyline
              key={cl.clusterId}
              positions={cl.coords}
              pathOptions={{
                color: '#E76F51',
                weight: 2.5,
                opacity: 0.6,
                dashArray: '6, 6',
              }}
            />
          ))}

          {/* Location Risk Markers */}
          {locations.map((loc) => {
            const isSelected = loc.id === selectedLocation?.id
            const markerColor = RISK_COLORS[loc.riskCategory] || '#2A9D8F'
            const radius = isSelected ? 14 : loc.riskScore >= 70 ? 11 : 8

            return (
              <CircleMarker
                key={loc.id}
                center={[loc.lat, loc.lng]}
                radius={radius}
                pathOptions={{
                  color: isSelected ? '#0F2A3A' : markerColor,
                  fillColor: markerColor,
                  fillOpacity: isSelected ? 0.95 : 0.85,
                  weight: isSelected ? 3.5 : 2,
                }}
                eventHandlers={{
                  click: () => onSelectLocation(loc.id),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="text-xs p-0.5">
                    <p className="font-bold text-sentinel-ink">{loc.name}</p>
                    <p className="text-[11px] text-slate-600">
                      Score: <strong>{Number(loc.riskScore).toFixed(1)}</strong> · {loc.riskCategory}
                    </p>
                    {loc.clusterId && (
                      <p className="text-[10px] text-rose-600 font-semibold">
                        Cluster {loc.clusterId}
                      </p>
                    )}
                  </div>
                </Tooltip>

                <Popup>
                  <div className="p-1 text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                      <strong className="text-sm text-sentinel-ink">{loc.name}</strong>
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white uppercase" style={{ backgroundColor: markerColor }}>
                        {loc.riskCategory}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-slate-600">
                      <p>Block: <strong>{loc.block}</strong></p>
                      <p>Risk Score: <strong>{Number(loc.riskScore).toFixed(1)} / 100</strong></p>
                      <p>Cluster: <strong>{loc.clusterId ? `Group ${loc.clusterId}` : 'None'}</strong></p>
                      <p className="text-[10px] text-slate-400">Model: {loc.modelVersion}</p>
                    </div>

                    {onOpenInvestigation && (
                      <button
                        type="button"
                        onClick={() => onOpenInvestigation(loc.id)}
                        className="mt-2.5 flex w-full items-center justify-center gap-1 rounded bg-sentinel-teal px-2 py-1 text-[11px] font-bold text-white cursor-pointer hover:bg-sentinel-teal-dark"
                      >
                        <span>Investigate Village</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
    </section>
  )
}

export default HealthMap
