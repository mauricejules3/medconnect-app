import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGeolocation } from '../hooks/useGeolocation'
import { useEmergencySession, generateSessionId } from '../hooks/useEmergencySession'
import LiveMap from '../components/LiveMap'
import './Emergency.css'

const CONTACTS = [
  { name: 'Ambulance',      number: '112', icon: '🚑' },
  { name: 'Police',         number: '112', icon: '🚓' },
  { name: 'Fire Service',   number: '112', icon: '🚒' },
  { name: 'Poison Control', number: '112', icon: '☎️' },
]

const DISPATCH_TIMEOUT_SECONDS = 20

function Emergency() {
  const [sharing, setSharing] = useState(false)
  const [sessionId] = useState(() => generateSessionId())
  const [copied, setCopied] = useState(false)

  // Dispatch flow: 'idle' → 'waiting' → 'failed'
  const [dispatchStage, setDispatchStage] = useState('idle')
  const [countdown, setCountdown] = useState(DISPATCH_TIMEOUT_SECONDS)

  const { location, error, fetchLocation } = useGeolocation({
    watch: sharing,
    intervalMs: 5000,
  })

  const {
    connected,
    ambulanceLocation,
    updateUserLocation,
  } = useEmergencySession(sessionId)

  // Push the user's location to Firebase whenever it changes (while sharing)
  useEffect(() => {
    if (sharing && location) {
      updateUserLocation(location)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharing, location])

  // Countdown timer for the Lumo dispatch
  useEffect(() => {
    if (dispatchStage !== 'waiting') return

    if (countdown <= 0) {
      setDispatchStage('failed')
      return
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [dispatchStage, countdown])

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

  const copySessionId = async () => {
    try {
      await navigator.clipboard.writeText(sessionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert(`Session ID: ${sessionId}`)
    }
  }

  // Start the Lumo dispatch
  const startDispatch = () => {
    setCountdown(DISPATCH_TIMEOUT_SECONDS)
    setDispatchStage('waiting')
    // Auto-start location sharing so the ambulance can see us
    if (!sharing) {
      setSharing(true)
      if (!location) fetchLocation()
    }
  }

  // Cancel and reset
  const cancelDispatch = () => {
    setDispatchStage('idle')
    setCountdown(DISPATCH_TIMEOUT_SECONDS)
  }

  return (
    <main className="emergency-page">

      <div className="emergency-header">
        <span className="emergency-tagline">⚠ EMERGENCY ASSISTANCE</span>
        <h1>In an emergency, act fast.</h1>
        <p>
          Get help now — we'll try the fastest option first, then fall back
          to the national emergency service if needed.
        </p>
      </div>

      {/* ─── Dispatch block ────────────────────────────── */}
      <section className="emergency-call-block">

        {/* IDLE — show the big button */}
        {dispatchStage === 'idle' && (
          <>
            <button
              className="emergency-primary-btn"
              onClick={startDispatch}
            >
              <span className="emergency-btn-icon">🚑</span>
              <span className="emergency-btn-text">
                <strong>Get Help Now</strong>
                <small>Connects you with a Lumo ambulance</small>
              </span>
            </button>

            <p className="emergency-hint">
              We'll try Lumo ambulances first. If none respond in{' '}
              {DISPATCH_TIMEOUT_SECONDS} seconds, we'll connect you to 112.
            </p>
          </>
        )}

        {/* WAITING — countdown */}
        {dispatchStage === 'waiting' && (
          <div className="dispatch-card waiting">
            <div className="dispatch-spinner"></div>
            <h2>Finding the nearest Lumo ambulance...</h2>
            <p className="dispatch-sub">
              We're notifying ambulances near you. Please stay on this screen.
            </p>

            <div className="dispatch-countdown">
              <span className="countdown-number">{countdown}</span>
              <span className="countdown-label">seconds</span>
            </div>

            <p className="dispatch-hint-small">
              If no ambulance responds within {DISPATCH_TIMEOUT_SECONDS} seconds,
              we'll automatically offer to call 112.
            </p>

            <button className="dispatch-cancel-btn" onClick={cancelDispatch}>
              Cancel
            </button>
          </div>
        )}

        {/* FAILED — no ambulance responded */}
        {dispatchStage === 'failed' && (
          <div className="dispatch-card failed">
            <div className="dispatch-failed-icon">❌</div>
            <h2>No Lumo ambulance responded</h2>
            <p className="dispatch-sub">
              No ambulance accepted your request within {DISPATCH_TIMEOUT_SECONDS} seconds.
              Please call the national emergency service now.
            </p>

            <a
              href="tel:112"
              className="emergency-secondary-btn"
            >
              <span className="emergency-btn-icon">🚨</span>
              <span className="emergency-btn-text">
                <strong>Call 112 Now</strong>
                <small>Direct line to national emergency service</small>
              </span>
            </a>

            <button className="dispatch-cancel-btn" onClick={cancelDispatch}>
              Try Lumo again
            </button>
          </div>
        )}

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

        {/* Session ID display */}
        <div className="session-share-block">
          <div className="session-share-head">
            <div>
              <span className="loc-label">Your session ID</span>
              <span className="session-id-display">{sessionId}</span>
            </div>
            <button className="copy-session-btn" onClick={copySessionId}>
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
          <p className="session-share-hint">
            Share this ID with your ambulance so they can join your session.
          </p>
        </div>

        <div className="session-info">
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
              Waiting for ambulance to come online...
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