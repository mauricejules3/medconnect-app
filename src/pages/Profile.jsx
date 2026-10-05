import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()
  const { user, role, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <main className="profile-page">

      <div className="profile-header">
        <div className="profile-avatar">
          {role === 'ambulance' ? '🚑' : '👤'}
        </div>
        <h1>{user.name || 'User'}</h1>
        <p className="profile-email">{user.email}</p>
        <span className={`profile-role ${role}`}>
          {role === 'ambulance' ? '🚑 Ambulance Driver' : '👤 Patient'}
        </span>
      </div>

      <div className="profile-section">
        <h2>Account</h2>

        <div className="profile-row">
          <span className="profile-row-label">Email</span>
          <span className="profile-row-value">{user.email}</span>
        </div>

        <div className="profile-row">
          <span className="profile-row-label">Role</span>
          <span className="profile-row-value">
            {role === 'ambulance' ? 'Ambulance Driver' : 'Patient'}
          </span>
        </div>

        <div className="profile-row">
          <span className="profile-row-label">User ID</span>
          <span className="profile-row-value profile-row-code">
            {user.uid?.slice(0, 12)}...
          </span>
        </div>
      </div>

      <div className="profile-section">
        <h2>Quick links</h2>

        <button
          className="profile-link"
          onClick={() => navigate('/dashboard')}
        >
          📊 Dashboard
        </button>

        <button
          className="profile-link"
          onClick={() => navigate('/emergency')}
        >
          🚑 Emergency
        </button>

        <button
          className="profile-link"
          onClick={() => navigate('/ambulance')}
        >
          🚨 Dispatcher
        </button>
      </div>

      <button className="profile-logout" onClick={handleLogout}>
        🚪 Log out
      </button>

      <p className="profile-credit">Lumo · Built by mr_baller</p>

    </main>
  )
}

export default Profile