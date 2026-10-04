import { useState, useEffect } from 'react'
import { useGeolocation } from '../hooks/useGeolocation'
import { useEmergencySession } from '../hooks/useEmergencySession'
import LiveMap from '../components/LiveMap'
import './Ambulance.css'

function Ambulance() {
  const [sharing, setSharing] = useState(false)

  const { location, error, fetchLocation } = useGeolocation({
    watch: sharing,
    intervalMs: 5000,
  })

  const {
    sessionId,
    connected,
    userLocation,
    updateAmbulanceLocation,
  } = useEmergencySession()

  useEffect(() => {
    if (sharing && location) {
      updateAmbulanceLocation(location)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharing, location])

  const toggleSharing = async () => {
    if (sharing) {
      setSharing(false)
    } else {
      setSharing(true)
      if (!location) {
        await fetchLocation()
      }
    }
  }

  const openInMaps = (loc) => {
    if (!loc) return
    window.open(`https://www.google.com/maps?q=${loc.lat},${loc.lng}`, '_blank')
  }

  return (
    <main className="ambulance-page">
      <div className="ambulance-header">
        <div className="ambulance-badge">🚑</div>
        <div>
          <h1>Ambulance Dispatcher</h1>
          <p>Live view of the emergency session</p>
        </div>
      </div>

      <div className="ambulance-status-row">
        <div>
          <span className="loc-label">Session</span>
          <span className="loc-value">{sessionId}</span>
        </div>
        <div>
          <span className="loc-label">Connection</span>
          <span className="loc-value">
            {connected ? '🟢 Live' : '🟡 Connecting...'}
          </span>
        </div>
        <button
          className={`loc-btn ${sharing ? 'sharing' : ''}`}
          onClick={toggleSharing}
        >
          {sharing ? '🟢 Broadcasting — Tap to stop' : 'Start broadcasting my location'}
        </button>
      </div>

      {/* Patient location */}
      <section className="dispatch-card patient-card">
        <div className="card-head">
          <h2>📍 Patient Location</h2>
          {userLocation && (
            <button
              className="map-link"
              onClick={() => openInMaps(userLocation)}
            >
              Open in Maps →
            </button>
          )}
        </div>

        {userLocation ? (
          <div className="loc-grid">
            <div>
              <span className="loc-label">Latitude</span>
              <span className="loc-value">{userLocation.lat.toFixed(6)}</span>
            </div>
            <div>
              <span className="loc-label">Longitude</span>
              <span className="loc-value">{userLocation.lng.toFixed(6)}</span>
            </div>
            <div>
              <span className="loc-label">Accuracy</span>
              <span className="loc-value">± {userLocation.accuracy} m</span>
            </div>
          </div>
        ) : (
          <p className="waiting-text">
            Waiting for patient to share their location...
          </p>
        )}
      </section>

      {/* My location */}
      <section className="dispatch-card my-card">
        <div className="card-head">
          <h2>🚑 My Location</h2>
          {location && (
            <button
              className="map-link"
              onClick={() => openInMaps(location)}
            >
              Open in Maps →
            </button>
          )}
        </div>

        {location ? (
          <div className="loc-grid">
            <div>
              <span className="loc-label">Latitude</span>
              <span className="loc-value">{location.lat.toFixed(6)}</span>
            </div>
            <div>
              <span className="loc-label">Longitude</span>
              <span className="loc-value">{location.lng.toFixed(6)}</span>
            </div>
            <div>
              <span className="loc-label">Accuracy</span>
              <span className="loc-value">± {location.accuracy} m</span>
            </div>
          </div>
        ) : (
          <p className="waiting-text">
            Click "Start broadcasting" to share your location.
          </p>
        )}

        {error && <p className="location-error">{error}</p>}
      </section>

      {/* Live map */}
      <section className="ambulance-map-section">
        <h2>Live map</h2>
        <p className="map-subtitle">
          Your position and the patient's position, updating live.
        </p>
        <LiveMap
          userLocation={userLocation}
          ambulanceLocation={location}
        />
      </section>
    </main>
  )
}

export default Ambulance