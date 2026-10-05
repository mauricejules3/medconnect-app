import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGeolocation } from '../hooks/useGeolocation'
import { useEmergencySession } from '../hooks/useEmergencySession'
import LiveMap from '../components/LiveMap'
import './Ambulance.css'

function Ambulance() {
  const { sessionId: urlSessionId } = useParams()
  const navigate = useNavigate()

  const [sessionId, setSessionId] = useState(urlSessionId || '')
  const [inputId, setInputId] = useState('')
  const [joinError, setJoinError] = useState('')
  const [sharing, setSharing] = useState(false)

  // If URL changes (e.g., from a deep link), sync the session ID
  useEffect(() => {
    if (urlSessionId) {
      setSessionId(urlSessionId)
    }
  }, [urlSessionId])

  const { location, error, fetchLocation } = useGeolocation({
    watch: sharing,
    intervalMs: 5000,
  })

  const {
    connected,
    userLocation,
    updateAmbulanceLocation,
  } = useEmergencySession(sessionId || null)

  // Broadcast ambulance location while sharing
  useEffect(() => {
    if (sharing && location && sessionId) {
      updateAmbulanceLocation(location)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharing, location, sessionId])

  const handleJoin = (e) => {
    e.preventDefault()
    const trimmed = inputId.trim().toUpperCase()

    if (!trimmed) {
      setJoinError('Please enter a session ID.')
      return
    }

    if (!trimmed.startsWith('EMG-') || trimmed.length < 9) {
      setJoinError('Session IDs look like EMG-A3F2B. Please check the format.')
      return
    }

    setJoinError('')
    navigate(`/ambulance/${trimmed}`)
  }

  const handleLeave = () => {
    setSharing(false)
    setSessionId('')
    setInputId('')
    navigate('/ambulance')
  }

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

  // ─── NO SESSION — Show join screen ──────────────────
  if (!sessionId) {
    return (
      <main className="ambulance-page">
        <div className="join-screen">
          <div className="join-icon">🚑</div>
          <h1>Join an emergency session</h1>
          <p className="join-sub">
            Enter the patient's session ID to connect with them.
          </p>

          <form onSubmit={handleJoin} className="join-form">
            <label className="join-label">
              Session ID
              <input
                type="text"
                placeholder="EMG-A3F2B"
                value={inputId}
                onChange={(e) => {
                  setInputId(e.target.value)
                  setJoinError('')
                }}
                className="join-input"
                autoFocus
                autoCapitalize="characters"
              />
            </label>

            {joinError && <p className="join-error">{joinError}</p>}

            <button type="submit" className="join-btn">
              Join Session
            </button>
          </form>

          <p className="join-hint">
            Ask the patient to share their session ID from their Lumo
            Emergency screen. In the future, this will be sent to you
            automatically via push notification.
          </p>
        </div>
      </main>
    )
  }

  // ─── JOINED — Dispatcher view ───────────────────────
  return (
    <main className="ambulance-page">
      <div className="ambulance-header">
        <div className="ambulance-badge">🚑</div>
        <div>
          <h1>Ambulance Dispatcher</h1>
          <p>Session: <strong>{sessionId}</strong></p>
        </div>
        <button className="leave-btn" onClick={handleLeave}>
          Leave
        </button>
      </div>

      <div className="ambulance-status-row">
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