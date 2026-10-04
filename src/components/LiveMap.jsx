import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './LiveMap.css'

// Fix Leaflet's default icon paths (bundler issue)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom colored icons
const blueIcon = new L.DivIcon({
  className: 'custom-pin',
  html: '<div class="pin pin-blue">👤</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
})

const redIcon = new L.DivIcon({
  className: 'custom-pin',
  html: '<div class="pin pin-red">🚑</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
})

// Helper component to fit the map to both markers
function FitBounds({ userLoc, ambulanceLoc }) {
  const map = useMap()

  useEffect(() => {
    const points = []
    if (userLoc) points.push([userLoc.lat, userLoc.lng])
    if (ambulanceLoc) points.push([ambulanceLoc.lat, ambulanceLoc.lng])

    if (points.length === 2) {
      map.fitBounds(points, { padding: [50, 50] })
    } else if (points.length === 1) {
      map.setView(points[0], 15)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoc?.lat, userLoc?.lng, ambulanceLoc?.lat, ambulanceLoc?.lng])

  return null
}

function LiveMap({ userLocation, ambulanceLocation }) {
  // Default center (Kigali) if no locations yet
  const defaultCenter = [-1.9441, 30.0619]
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter

  const hasBoth =
    userLocation?.lat && userLocation?.lng &&
    ambulanceLocation?.lat && ambulanceLocation?.lng

  // Distance calculation (Haversine formula)
  const distance =
    hasBoth
      ? (() => {
          const R = 6371 // km
          const dLat =
            ((ambulanceLocation.lat - userLocation.lat) * Math.PI) / 180
          const dLon =
            ((ambulanceLocation.lng - userLocation.lng) * Math.PI) / 180
          const lat1 = (userLocation.lat * Math.PI) / 180
          const lat2 = (ambulanceLocation.lat * Math.PI) / 180
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          return R * c
        })()
      : null

  // Rough ETA (assumes average 30 km/h in city traffic)
  const eta = distance ? Math.round((distance / 30) * 60) : null

  return (
    <div className="livemap-wrapper">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="livemap-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds
          userLoc={userLocation}
          ambulanceLoc={ambulanceLocation}
        />

        {userLocation?.lat && userLocation?.lng && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={blueIcon}
          >
            <Popup>👤 Patient location</Popup>
          </Marker>
        )}

        {ambulanceLocation?.lat && ambulanceLocation?.lng && (
          <Marker
            position={[ambulanceLocation.lat, ambulanceLocation.lng]}
            icon={redIcon}
          >
            <Popup>🚑 Ambulance location</Popup>
          </Marker>
        )}

        {hasBoth && (
          <Polyline
            positions={[
              [userLocation.lat, userLocation.lng],
              [ambulanceLocation.lat, ambulanceLocation.lng],
            ]}
            color="#0878d1"
            weight={3}
            dashArray="8 6"
          />
        )}
      </MapContainer>

      {hasBoth && (
        <div className="livemap-info">
          <div>
            <span className="info-label">Distance</span>
            <span className="info-value">
              {distance < 1
                ? `${Math.round(distance * 1000)} m`
                : `${distance.toFixed(2)} km`}
            </span>
          </div>
          <div>
            <span className="info-label">ETA (approx.)</span>
            <span className="info-value">
              {eta < 60 ? `${eta} min` : `${Math.round(eta / 60)} hr`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveMap