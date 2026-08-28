import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Activity, AlertTriangle, ChevronRight, Layers } from 'lucide-react'

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom SVG Icons for markers
function createMarkerIcon(color, hasAlert) {
  const alertDot = hasAlert ? `<circle cx="16" cy="4" r="4" fill="#ef4444" stroke="white" stroke-width="1.5" />` : ''
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36">
      <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="3.5" fill="white"/>
      ${alertDot}
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-icon',
    iconSize: [28, 36],
    iconAnchor: [14, 32],
    popupAnchor: [0, -32],
  })
}

const icons = {
  high: { normal: createMarkerIcon('#dc2626', false), alert: createMarkerIcon('#dc2626', true) },
  watch: { normal: createMarkerIcon('#d97706', false), alert: createMarkerIcon('#d97706', true) },
  low: { normal: createMarkerIcon('#2a9d8f', false), alert: createMarkerIcon('#2a9d8f', true) },
}

function riskLevel(score) {
  if (score >= 70) return 'high'
  if (score >= 40) return 'watch'
  return 'low'
}

function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true, duration: 1.0 })
    }
  }, [center, map])
  return null
}

function HealthMap({ locations, risks, selectedId, onSelectLocation }) {
  const mapRef = useRef(null)

  // Default center if no locations or selection
  const center = { lat: 26.5, lng: 80.3 }

  // Group into clusters based on cluster_id
  const clusters = {}
  risks.forEach(risk => {
    if (risk.cluster_id) {
      if (!clusters[risk.cluster_id]) clusters[risk.cluster_id] = []
      const loc = locations.find(l => l.location_id === risk.location_id)
      if (loc) clusters[risk.cluster_id].push({ risk, loc })
    }
  })

  const selectedLoc = locations.find(l => l.location_id === selectedId)
  const mapCenter = selectedLoc ? { lat: selectedLoc.latitude, lng: selectedLoc.longitude } : center

  return (
    <div className="h-[450px] w-full relative">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={11}
        className="h-full w-full z-0"
        ref={mapRef}
      >
        <MapController center={mapCenter} />
        {/* Light tile layer that looks good in dark mode too */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Draw cluster regions */}
        {Object.entries(clusters).map(([clusterId, items]) => {
          if (items.length < 2) return null
          // Average position for the cluster circle
          const lat = items.reduce((sum, item) => sum + item.loc.latitude, 0) / items.length
          const lng = items.reduce((sum, item) => sum + item.loc.longitude, 0) / items.length
          return (
            <CircleMarker
              key={`cluster-${clusterId}`}
              center={[lat, lng]}
              radius={35}
              pathOptions={{ fillColor: '#dc2626', fillOpacity: 0.15, color: '#dc2626', weight: 2, dashArray: '4,4' }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm text-slate-800">Cluster Detected</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {items.length} nearby villages show unusual health signals.
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

        {/* Draw individual villages */}
        {locations.map(loc => {
          const risk = risks.find(r => r.location_id === loc.location_id)
          if (!risk) return null

          const level = riskLevel(risk.score_0_100)
          const hasAlert = risk.score_0_100 >= 70 // Simulate alert presence based on score for map display
          const icon = icons[level][hasAlert ? 'alert' : 'normal']

          return (
            <Marker
              key={loc.location_id}
              position={[loc.latitude, loc.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectLocation(loc.location_id),
              }}
            >
              <Popup className="swasthya-popup">
                <div className="w-56 p-1">
                  <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-sm text-slate-800">{loc.name}</h3>
                    <span className="text-xs font-bold text-slate-500">{loc.block}</span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Risk Score:</span>
                      <span className={`font-bold ${level === 'high' ? 'text-red-600' : level === 'watch' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {Math.round(risk.score_0_100)} / 100
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Main Signal:</span>
                      <span className="font-medium text-slate-800">{risk.main_signal || 'General'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectLocation(loc.location_id)}
                    className="w-full flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-700 text-white rounded px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    View Village Details <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Overlaid Legend */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white border border-slate-200 rounded-lg shadow-sm p-3 pointer-events-auto">
        <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">Risk Levels</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-red-600 border border-red-200" /> High (70-100)
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-200" /> Watch (40-69)
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-200" /> Low (0-39)
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthMap
