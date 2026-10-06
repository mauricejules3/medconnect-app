import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import './Login.css'
import './ForgotPassword.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const clean = email.trim().toLowerCase()

    if (!clean) {
      setError('Please enter your email.')
      return
    }

    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, clean)
      setSent(true)
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/user-not-found') {
        // For security, don't reveal whether the email exists.
        setSent(true)
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else {
        setError('Could not send reset email. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── Success state ────────────────────────────────────
  if (sent) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-icon">✉️</div>
          <h1>Check your email</h1>
          <p className="auth-subtitle">
            If an account exists for <strong>{email}</strong>, we've sent a
            password reset link.
          </p>
          <p className="auth-hint">
            Don't see it? Check your <strong>spam folder</strong>. The link
            expires in 1 hour.
          </p>

          <Link to="/login" className="auth-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Back to login
          </Link>

          <p className="auth-switch">
            <button
              className="auth-link-btn"
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
            >
              Didn't receive it? Try again
            </button>
          </p>
        </div>
      </main>
    )
  }

  // ─── Form state ───────────────────────────────────────
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">🔑</div>

        <h1>Forgot password?</h1>
        <p className="auth-subtitle">
          Enter your email and we'll send you a link to reset it.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  )
}

export default ForgotPassword