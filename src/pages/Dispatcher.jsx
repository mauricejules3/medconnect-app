import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAmbulanceDispatch } from '../hooks/useDispatch'
import './Dispatcher.css'

function Dispatcher() {
  const navigate = useNavigate()
  const { user, role, available, updateAvailability } = useAuth()

  const driverInfo = {
    uid: user?.uid,
    name: user?.name || user?.email || 'Ambulance',
  }

  const {
    pendingList,
    loading,
    error,
    acceptedSessionId,
    acceptEmergency,
  } = useAmbulanceDispatch(driverInfo)

  const [acceptingId, setAcceptingId] = useState(null)
  const [localError, setLocalError] = useState('')

  // If we won an emergency, redirect to the session
  useEffect(() => {
    if (acceptedSessionId) {
      navigate(`/ambulance/${acceptedSessionId}`)
    }
  }, [acceptedSessionId, navigate])

  // Only ambulance drivers should see this page
  if (role !== 'ambulance') {
    return (
      <main className="dispatcher-page">
        <div className="dispatcher-empty">
          <div className="dispatcher-empty-icon">🚫</div>
          <h2>Not available</h2>
          <p>This page is for ambulance drivers only.</p>
        </div>
      </main>
    )
  }

  const handleAccept = async (sessionId) => {
    setAcceptingId(sessionId)
    setLocalError('')
    const ok = await acceptEmergency(sessionId)
    if (!ok) {
      setAcceptingId(null)
    }
    // If ok, we're redirected by the useEffect above
  }

  const timeAgo = (timestamp) => {
    if (!timestamp) return 'just now'
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 10) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min ago`
    return `${Math.floor(minutes / 60)} hr ago`
  }

  return (
    <main className="dispatcher-page">

      {/* Header */}
      <div className="dispatcher-header">
        <div>
          <span className="dispatcher-tagline">🚑 AMBULANCE DISPATCHER</span>
          <h1>
            {available ? 'You are available' : 'You are offline'}
          </h1>
          <p className="dispatcher-sub">
            {available
              ? 'New emergencies will appear here in real time.'
              : 'Go online to receive emergency requests.'}
          </p>
        </div>

        <button
          className={`dispatcher-status-btn ${available ? 'online' : 'offline'}`}
          onClick={() => updateAvailability(!available)}
        >
          <span className="dispatcher-status-dot" />
          {available ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* Errors */}
      {(error || localError) && (
        <div className="dispatcher-error">{localError || error}</div>
      )}

      {/* Pending list */}
      {loading && (
        <div className="dispatcher-loading">
          <div className="dispatcher-spinner"></div>
          <p>Connecting to the dispatch network...</p>
        </div>
      )}

      {!loading && pendingList.length === 0 && (
        <div className="dispatcher-empty">
          <div className="dispatcher-empty-icon">🌐</div>
          <h2>No emergencies right now</h2>
          <p>
            {available
              ? "You'll see an alert here the moment someone needs help."
              : 'Go online to be notified when emergencies happen.'}
          </p>
        </div>
      )}

      {!loading && pendingList.length > 0 && (
        <div className="dispatcher-list">
          <h2 className="dispatcher-list-title">
            {pendingList.length} pending{' '}
            {pendingList.length === 1 ? 'emergency' : 'emergencies'}
          </h2>

          {pendingList.map((emergency) => (
            <div key={emergency.id} className="emergency-card">
              <div className="emergency-card-head">
                <div className="emergency-card-icon">🚨</div>
                <div className="emergency-card-info">
                  <h3>{emergency.patient?.name || 'Unknown patient'}</h3>
                  <p className="emergency-card-session">
                    Session: <strong>{emergency.id}</strong>
                  </p>
                </div>
                <span className="emergency-card-time">
                  {timeAgo(emergency.createdAt)}
                </span>
              </div>

              <div className="emergency-card-location">
                {emergency.patient?.lat && emergency.patient?.lng ? (
                  <>
                    <span className="emergency-loc-label">📍 Location</span>
                    <span className="emergency-loc-value">
                      {emergency.patient.lat.toFixed(4)},{' '}
                      {emergency.patient.lng.toFixed(4)}
                    </span>
                  </>
                ) : (
                  <span className="emergency-loc-value">
                    Location not yet available
                  </span>
                )}
              </div>

              <div className="emergency-card-actions">
                <button
                  className="emergency-skip-btn"
                  onClick={() =>
                    setLocalError(
                      'You skipped this emergency. It stays available for others.'
                    )
                  }
                  disabled={acceptingId === emergency.id}
                >
                  Skip
                </button>

                <button
                  className="emergency-accept-btn"
                  onClick={() => handleAccept(emergency.id)}
                  disabled={acceptingId === emergency.id}
                >
                  {acceptingId === emergency.id
                    ? 'Accepting…'
                    : 'Accept Emergency'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="dispatcher-footer">
        First ambulance to accept gets the emergency. Others are dismissed
        automatically.
      </p>

    </main>
  )
}

export default Dispatcher