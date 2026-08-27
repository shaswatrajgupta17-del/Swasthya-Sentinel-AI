import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { DEMO_DISTRICT_CENTER } from '../data/locationData'

const RISK_COLORS = { Low: '#2a9d8f', Watch: '#e9c46a', High: '#e76f51' }

function SelectedLocationView({ location }) {
  const map = useMap()

  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], 14, { duration: 0.7 })
  }, [location, map])

  return null
}

function HealthMap({ locations, selectedLocation, onSelectLocation }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-sentinel-card shadow-sm" aria-label="Synthetic district risk map">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 pb-3">
        <div>
          <h2 className="text-base font-semibold text-sentinel-ink">District risk map</h2>
          <p className="text-xs text-slate-500">Synthetic village coordinates · risk is not a diagnosis</p>
        </div>
        <div className="flex gap-3 text-xs" aria-label="Risk map legend">
          {Object.entries(RISK_COLORS).map(([label, color]) => (
            <span className="inline-flex items-center gap-1.5" key={label}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="h-[390px]">
        <MapContainer center={DEMO_DISTRICT_CENTER} zoom={13} scrollWheelZoom className="h-full w-full" aria-label="Demo district map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <SelectedLocationView location={selectedLocation} />
          {locations.map((location) => {
            const selected = location.id === selectedLocation?.id
            return (
              <CircleMarker
                key={location.id}
                center={[location.lat, location.lng]}
                radius={selected ? 12 : 9}
                pathOptions={{ color: selected ? '#0f2a3a' : RISK_COLORS[location.riskCategory], fillColor: RISK_COLORS[location.riskCategory], fillOpacity: 0.9, weight: selected ? 3 : 2 }}
                eventHandlers={{ click: () => onSelectLocation(location.id) }}
              >
                <Tooltip direction="top" offset={[0, -8]}>{location.name}</Tooltip>
                <Popup>
                  <strong>{location.name}</strong><br />
                  Risk {location.riskScore}/100 · {location.riskCategory}<br />
                  <span>{location.syndrome} signals (synthetic)</span>
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
