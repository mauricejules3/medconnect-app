import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const {
    user,
    role,
    emailVerified,
    loading,
    logout,
    checkVerification,
    resendVerification,
  } = useAuth()

  const [checking, setChecking] = useState(false)
  const [resent, setResent] = useState(false)

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

  // ✅ Verified — normal dashboard
  return (
    <main className="dashboard-page">
      <div className="dash-header">
        <div>
          <span className="dash-tagline">
            {role === 'ambulance' ? 'AMBULANCE PORTAL' : 'PATIENT PORTAL'}
          </span>
          <h1>Welcome, {user.name || user.email}</h1>
          <p className="dash-sub">
            Here's an overview of your MedConnect account.
          </p>
        </div>
      </div>

      <div className="dash-stats">
        <div className="stat-card">
          <span className="stat-icon blue">◎</span>
          <div>
            <p className="stat-number">0</p>
            <p className="stat-label">Upcoming Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon green">✚</span>
          <div>
            <p className="stat-number">0</p>
            <p className="stat-label">Health Records</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon red">⌖</span>
          <div>
            <p className="stat-number">—</p>
            <p className="stat-label">Emergency Contacts</p>
          </div>
        </div>
      </div>

      <h2 className="dash-section-title">Quick actions</h2>

      <div className="dash-actions">
        {role === 'ambulance' ? (
          <Link to="/ambulance" className="action-card">
            <div className="action-icon red">🚑</div>
            <div>
              <h3>Ambulance Dispatcher</h3>
              <p>See incoming emergency requests in real time.</p>
            </div>
          </Link>
        ) : (
          <Link to="/emergency" className="action-card">
            <div className="action-icon red">⌖</div>
            <div>
              <h3>Emergency</h3>
              <p>Request immediate help and share your location.</p>
            </div>
          </Link>
        )}

        <Link to="/assistant" className="action-card">
          <div className="action-icon blue">✚</div>
          <div>
            <h3>AI Medical Assistant</h3>
            <p>Ask basic health questions and get guidance.</p>
          </div>
        </Link>

        <div className="action-card disabled">
          <div className="action-icon green">◎</div>
          <div>
            <h3>Book Appointment</h3>
            <p>Coming soon — find a doctor and book a slot.</p>
          </div>
        </div>
      </div>

      <div className="dash-account-info">
        <h3>Account details</h3>
        <p>
          <strong>Email:</strong> {user.email} ✅
        </p>
        <p>
          <strong>Role:</strong>{' '}
          {role === 'ambulance' ? '🚑 Ambulance Driver' : '👤 Patient'}
        </p>
        <p>
          <strong>User ID:</strong> <code>{user.uid}</code>
        </p>
      </div>
    </main>
  )
}

export default Dashboard