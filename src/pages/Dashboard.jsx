import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFCM } from '../hooks/useFCM'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const {
    user,
    role,
    emailVerified,
    available,
    loading,
    logout,
    checkVerification,
    resendVerification,
    updateAvailability,
  } = useAuth()

  const [checking, setChecking] = useState(false)
  const [resent, setResent] = useState(false)

  const fcm = useFCM({ user })

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <main className="dashboard-page">
        <p className="dash-loading">Loading your account...</p>
      </main>
    )
  }

  if (!user) return null

  // 🚧 Email verification gate
  if (!emailVerified) {
    return (
      <main className="dashboard-page">
        <div className="verify-card">
          <div className="verify-icon">✉️</div>
          <h1>Verify your email</h1>
          <p>
            We sent a verification link to <strong>{user.email}</strong>.
          </p>
          <p className="verify-hint">
            Click the link in that email to activate your account.
            Don't see it? Check your <strong>spam folder</strong>.
          </p>

          <button
            className="verify-primary-btn"
            onClick={async () => {
              setChecking(true)
              const ok = await checkVerification()
              setChecking(false)
              if (!ok) {
                alert(
                  "Still not verified. Please check your inbox and click the link, then try again."
                )
              }
            }}
            disabled={checking}
          >
            {checking ? 'Checking...' : "I've verified — Continue"}
          </button>

          <button
            className="verify-secondary-btn"
            onClick={async () => {
              await resendVerification()
              setResent(true)
              setTimeout(() => setResent(false), 4000)
            }}
            disabled={resent}
          >
            {resent ? '✅ Email sent!' : 'Resend verification email'}
          </button>

          <button
            className="verify-logout-btn"
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
          >
            Log out
          </button>
        </div>
      </main>
    )
  }

  // ─── Route to the right dashboard ─────────────────
  if (role === 'ambulance') {
    return (
      <>
        <NotificationBanner fcm={fcm} user={user} />
        <DriverDashboard
          user={user}
          available={available}
          onToggle={updateAvailability}
        />
      </>
    )
  }

  return (
    <>
      <NotificationBanner fcm={fcm} user={user} />
      <PatientDashboard user={user} />
    </>
  )
}

// ═══════════════════════════════════════════════════════
// 🔔 NOTIFICATION PERMISSION BANNER
// ═══════════════════════════════════════════════════════
function NotificationBanner({ fcm }) {
  const [dismissed, setDismissed] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  if (typeof Notification === 'undefined') return null
  if (fcm.permission === 'granted') return null
  if (dismissed) return null

  const handleEnable = async () => {
    await fcm.requestPermission()
  }

  // ─── Denied state ────────────────────────────────────
  if (fcm.permission === 'denied') {
    return (
      <div className="notif-banner notif-banner-denied">
        <div className="notif-banner-content">
          <span className="notif-banner-icon">🔔</span>
          <div className="notif-banner-text">
            <strong>Turn on notifications</strong>
            <span>
              Enable notifications to receive emergency alerts. If the
              browser doesn't respond, tap "How to enable" for manual steps.
            </span>
          </div>
        </div>

        <div className="notif-banner-actions">
          <button
            className="notif-banner-enable"
            onClick={handleEnable}
            disabled={fcm.saving}
          >
            {fcm.saving ? 'Enabling…' : 'Enable notifications'}
          </button>
          <button
            className="notif-banner-help"
            onClick={() => setShowHelp((v) => !v)}
          >
            {showHelp ? 'Hide steps' : 'How to enable'}
          </button>
          <button
            className="notif-banner-dismiss"
            onClick={() => setDismissed(true)}
          >
            Dismiss
          </button>
        </div>

        {showHelp && (
          <div className="notif-banner-steps">
            <p>
              <strong>On Chrome / Edge (desktop):</strong>
            </p>
            <ol>
              <li>Click the 🔒 lock icon next to the URL</li>
              <li>Find "Notifications"</li>
              <li>Change it to "Allow"</li>
              <li>Reload this page</li>
            </ol>

            <p>
              <strong>On Android Chrome:</strong>
            </p>
            <ol>
              <li>Tap ⋮ menu → Settings → Site settings → Notifications</li>
              <li>Find this site in the blocked list</li>
              <li>Remove it from the blocked list</li>
              <li>Reload and try again</li>
            </ol>
          </div>
        )}
      </div>
    )
  }

  // ─── Default (never asked) state ─────────────────────
  return (
    <div className="notif-banner">
      <div className="notif-banner-content">
        <span className="notif-banner-icon">🔔</span>
        <div className="notif-banner-text">
          <strong>Your safety network needs this</strong>
          <span>
            When someone you trust triggers an emergency, we can only alert
            you instantly if notifications are enabled. Without it, you'll
            only find out when they manage to call you.
          </span>
        </div>
      </div>

      <div className="notif-banner-actions">
        <button
          className="notif-banner-enable"
          onClick={handleEnable}
          disabled={fcm.saving}
        >
          {fcm.saving ? 'Enabling…' : 'Turn on notifications'}
        </button>
        <button
          className="notif-banner-dismiss"
          onClick={() => setDismissed(true)}
        >
          Maybe later
        </button>
      </div>

      {fcm.error && <p className="notif-banner-error">{fcm.error}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// 👤 PATIENT DASHBOARD
// ═══════════════════════════════════════════════════════
function PatientDashboard({ user }) {
  const contactsCount = (user.trustedContacts || []).length
  const hasMedicalInfo = !!user.medicalInfo?.bloodType

  return (
    <main className="dashboard-page">
      <div className="dash-header">
        <div>
          <span className="dash-tagline">PATIENT PORTAL</span>
          <h1>Welcome, {user.name || user.email}</h1>
          <p className="dash-sub">
            Need help? Start an emergency or ask the AI assistant.
          </p>
        </div>
      </div>

      <h2 className="dash-section-title">Quick actions</h2>

      <div className="patient-hero-action">
        <Link to="/emergency" className="hero-action-card">
          <div className="hero-action-icon">🚑</div>
          <div>
            <h3>Get Help Now</h3>
            <p>Request emergency assistance in one tap</p>
          </div>
        </Link>
      </div>

      <div className="patient-secondary-actions">
        <Link to="/assistant" className="secondary-action">
          <span className="secondary-action-icon">💬</span>
          <div>
            <h4>AI Assistant</h4>
            <p>Ask health questions</p>
          </div>
        </Link>

        <Link to="/settings/contacts" className="secondary-action">
          <span className="secondary-action-icon">👥</span>
          <div>
            <h4>Trusted contacts</h4>
            <p>
              {contactsCount > 0
                ? `${contactsCount} saved`
                : 'Add people to notify'}
            </p>
          </div>
        </Link>

        <Link to="/settings/medical" className="secondary-action">
          <span className="secondary-action-icon">🏥</span>
          <div>
            <h4>Medical info</h4>
            <p>
              {hasMedicalInfo
                ? `Blood type ${user.medicalInfo.bloodType}`
                : 'Blood type, allergies…'}
            </p>
          </div>
        </Link>
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">Your account</h2>
        <div className="dash-account-info">
          <p>
            <strong>Email:</strong> {user.email} ✅
          </p>
          <p>
            <strong>Role:</strong> 👤 Patient
          </p>
        </div>
      </div>
    </main>
  )
}

// ═══════════════════════════════════════════════════════
// 🚑 AMBULANCE DRIVER DASHBOARD
// ═══════════════════════════════════════════════════════
function DriverDashboard({ user, available, onToggle }) {
  return (
    <main className="dashboard-page">
      <div className="dash-header">
        <div>
          <span className="dash-tagline">AMBULANCE PORTAL</span>
          <h1>Welcome, {user.name || user.email}</h1>
          <p className="dash-sub">
            Your dispatcher dashboard — stay available to receive emergencies.
          </p>
        </div>
      </div>

      {/* Availability toggle */}
      <div className={`availability-card ${available ? 'online' : 'offline'}`}>
        <div className="availability-status">
          <span className="availability-dot" />
          <div>
            <span className="availability-label">Current status</span>
            <span className="availability-value">
              {available ? '🟢 Available' : '⚫ Offline'}
            </span>
          </div>
        </div>
        <button
          className={`availability-btn ${available ? 'go-offline' : 'go-online'}`}
          onClick={() => onToggle(!available)}
        >
          {available ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      <h2 className="dash-section-title">Today's stats</h2>

      <div className="dash-stats">
        <div className="stat-card">
          <span className="stat-icon red">🚨</span>
          <div>
            <p className="stat-number">0</p>
            <p className="stat-label">Today's dispatches</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon green">✅</span>
          <div>
            <p className="stat-number">0</p>
            <p className="stat-label">Completed runs</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon blue">⏱️</span>
          <div>
            <p className="stat-number">—</p>
            <p className="stat-label">Avg response time</p>
          </div>
        </div>
      </div>

      <h2 className="dash-section-title">Quick action</h2>

      <div className="dash-actions">
        <Link to="/ambulance" className="action-card">
          <div className="action-icon red">🚨</div>
          <div>
            <h3>Open Dispatcher</h3>
            <p>See incoming emergencies and manage sessions.</p>
          </div>
        </Link>
      </div>

      <div className="dash-account-info">
        <h3>Driver account</h3>
        <p>
          <strong>Email:</strong> {user.email} ✅
        </p>
        <p>
          <strong>Role:</strong> 🚑 Ambulance Driver
        </p>
      </div>
    </main>
  )
}

export default Dashboard