import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGeolocation } from '../hooks/useGeolocation'
import { useEmergencySession } from '../hooks/useEmergencySession'
import LiveMap from '../components/LiveMap'
import './Emergency.css'

const CONTACTS = [
  { name: 'Ambulance',      number: '112', icon: '🚑' },
  { name: 'Police',         number: '112', icon: '🚓' },
  { name: 'Fire Service',   number: '112', icon: '🚒' },
  { name: 'Poison Control', number: '112', icon: '☎️' },
]

function Emergency() {
  const [calling, setCalling] = useState(false)
  const [sharing, setSharing] = useState(false)

  const { location, error, status, fetchLocation } = useGeolocation({
    watch: sharing,
    intervalMs: 5000,
  })

  const {
    sessionId,
    connected,
    ambulanceLocation,
    updateUserLocation,
  } = useEmergencySession()

  // Push the user's location to Firebase whenever it changes (while sharing)
  useEffect(() => {
    if (sharing && location) {
      updateUserLocation(location)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharing, location])

  const handleCall = () => {
    setCalling(true)
    setTimeout(() => setCalling(false), 3000)
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

  return (
    <main className="emergency-page">

      <div className="emergency-header">
        <span className="emergency-tagline">⚠ EMERGENCY ASSISTANCE</span>
        <h1>In an emergency, act fast.</h1>
        <p>
          Call for help, share your location, and stay calm. If you are in
          immediate danger, contact your local emergency number directly.
        </p>
      </div>

      {/* Big Call button */}
      <section className="emergency-call-block">
        <button
          className={`big-call-btn ${calling ? 'calling' : ''}`}
          onClick={handleCall}
          disabled={calling}
        >
          {calling ? (
            <>
              <span className="pulse-dot"></span>
              Calling emergency services...
            </>
          ) : (
            <>✚ Emergency Call</>
          )}
        </button>

        <p className="emergency-note">
          Demo only — this button doesn't actually dial yet.
        </p>
      </section>

      {/* Live sharing panel */}
      <section className="emergency-location">
        <div className="location-head">
          <div>
            <h2>Live location sharing</h2>
            <p>Let the ambulance see your position in real time.</p>
          </div>

          <button
            className={`loc-btn ${sharing ? 'sharing' : ''}`}
            onClick={toggleSharing}
          >
            {sharing ? '🟢 Sharing — Tap to stop' : 'Start sharing'}
          </button>
        </div>

        <div className="session-info">
          <div>
            <span className="loc-label">Session</span>
            <span className="loc-value">{sessionId}</span>
          </div>
          <div>
            <span className="loc-label">Status</span>
            <span className="loc-value">
              {connected ? '🟢 Connected' : '🟡 Connecting...'}
            </span>
          </div>
        </div>

        {location && (
          <div className="location-result">
            <div className="loc-grid">
              <div>
                <span className="loc-label">Your Latitude</span>
                <span className="loc-value">{location.lat.toFixed(6)}</span>
              </div>
              <div>
                <span className="loc-label">Your Longitude</span>
                <span className="loc-value">{location.lng.toFixed(6)}</span>
              </div>
              <div>
                <span className="loc-label">Accuracy</span>
                <span className="loc-value">± {location.accuracy} m</span>
              </div>
            </div>
          </div>
        )}

        {error && <p className="location-error">{error}</p>}

        {/* Ambulance tracker */}
        <div className="ambulance-tracker">
          <h3>🚑 Ambulance status</h3>
          {ambulanceLocation ? (
            <div className="loc-grid">
              <div>
                <span className="loc-label">Latitude</span>
                <span className="loc-value">{ambulanceLocation.lat.toFixed(6)}</span>
              </div>
              <div>
                <span className="loc-label">Longitude</span>
                <span className="loc-value">{ambulanceLocation.lng.toFixed(6)}</span>
              </div>
              <div>
                <span className="loc-label">Accuracy</span>
                <span className="loc-value">± {ambulanceLocation.accuracy} m</span>
              </div>
            </div>
          ) : (
            <p className="waiting-text">
              Waiting for ambulance to come online... Open{' '}
              <Link to="/ambulance">/ambulance</Link> in another tab to simulate.
            </p>
          )}
        </div>
      </section>

      {/* Live map */}
      <section className="emergency-map-section">
        <h2>Live map</h2>
        <p className="map-subtitle">
          Both you and the ambulance appear here in real time.
        </p>
        <LiveMap
          userLocation={location}
          ambulanceLocation={ambulanceLocation}
        />
      </section>

      {/* Contacts */}
      <section className="emergency-contacts">
        <h2>Emergency contacts</h2>
        <div className="contacts-grid">
          {CONTACTS.map((c) => (
            <div key={c.name} className="contact-card">
              <div className="contact-icon">{c.icon}</div>
              <div>
                <h3>{c.name}</h3>
                <p>{c.number}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      
    </main>
  )
}
export default Emergency