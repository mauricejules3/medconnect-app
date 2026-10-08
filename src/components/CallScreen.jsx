import { useEffect, useRef, useState } from 'react'
import { useAgora } from '../hooks/useAgora'
import './CallScreen.css'

function CallScreen({
  sessionId,
  role,
  autoStart = false,
  incomingCall = false,
  onClose,
  remoteName = 'Caller',
}) {
  const {
    joined,
    micMuted,
    cameraOn,
    remoteUsers,
    error,
    join,
    leave,
    toggleMic,
    enableCamera,
    disableCamera,
    localVideoTrack,
  } = useAgora()

  const localVideoRef = useRef(null)
  const [seconds, setSeconds] = useState(0)

  // Auto-join when requested
  useEffect(() => {
    if (autoStart && !joined) {
      join(sessionId, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart])

  // Attach local video track
  useEffect(() => {
    if (cameraOn && localVideoRef.current && localVideoTrack.current) {
      localVideoTrack.current.play(localVideoRef.current)
    }
  }, [cameraOn, localVideoTrack])

  // Duration timer
  useEffect(() => {
    if (!joined) {
      setSeconds(0)
      return
    }
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [joined])

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const isAmbulance = role === 'ambulance'

  const handleEnd = async () => {
    await leave()
    onClose?.()
  }

  const handleAccept = async () => {
    await join(sessionId, false)
  }

  // ─── Incoming call screen ────────────────────────────
  if (incomingCall && !joined) {
    return (
      <div className="call-overlay">
        <div className="incoming-call">
          <div className="incoming-avatar">
            {isAmbulance ? '👤' : '🚑'}
          </div>
          <h2 className="incoming-name">{remoteName}</h2>
          <p className="incoming-label">Incoming emergency call…</p>

          <div className="incoming-actions">
            <button className="call-decline-btn" onClick={onClose}>
              <span className="call-btn-icon">✕</span>
              <span className="call-btn-label">Decline</span>
            </button>

            <button className="call-accept-btn" onClick={handleAccept}>
              <span className="call-btn-icon">📞</span>
              <span className="call-btn-label">Accept</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Active call screen ──────────────────────────────
  return (
    <div className="call-overlay">
      <div className="call-screen">

        {cameraOn && (
          <div className="call-video-area">
            {remoteUsers.map((user) =>
              user.videoTrack ? (
                <div key={user.uid} className="call-video-remote">
                  <RemoteVideo track={user.videoTrack} />
                  <span className="call-video-label">{remoteName}</span>
                </div>
              ) : null
            )}

            <div className="call-video-local">
              <div ref={localVideoRef} className="call-local-video-el" />
              <span className="call-video-label">You</span>
            </div>
          </div>
        )}

        {!cameraOn && (
          <div className="call-audio-area">
            <div className="call-audio-avatar">
              {isAmbulance ? '👤' : '🚑'}
            </div>
            <h2 className="call-audio-name">{remoteName}</h2>
            <p className="call-audio-status">
              {joined ? 'Connected' : 'Connecting…'}
            </p>
            <p className="call-audio-time">{formatTime(seconds)}</p>
          </div>
        )}

        {error && <p className="call-error">{error}</p>}

        <div className="call-controls">
          <button
            className={`call-control-btn ${micMuted ? 'active' : ''}`}
            onClick={toggleMic}
            title={micMuted ? 'Unmute' : 'Mute'}
          >
            {micMuted ? '🔇' : '🎤'}
          </button>

          {isAmbulance && (
            <button
              className={`call-control-btn ${cameraOn ? 'active' : ''}`}
              onClick={cameraOn ? disableCamera : enableCamera}
              title={cameraOn ? 'Turn off camera' : 'Switch to video'}
            >
              {cameraOn ? '📹' : '📷'}
            </button>
          )}

          {!isAmbulance && cameraOn && (
            <button
              className="call-control-btn"
              onClick={disableCamera}
              title="Turn off camera"
            >
              📹
            </button>
          )}

          <button
            className="call-control-btn end"
            onClick={handleEnd}
            title="End call"
          >
            ❌
          </button>
        </div>

        {isAmbulance && !cameraOn && joined && (
          <p className="call-hint">
            Tap <strong>📷</strong> to switch to video if you need to see the
            patient.
          </p>
        )}

      </div>
    </div>
  )
}

function RemoteVideo({ track }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && track) {
      track.play(ref.current)
    }
  }, [track])

  return <div ref={ref} className="call-video-el" />
}

export default CallScreen