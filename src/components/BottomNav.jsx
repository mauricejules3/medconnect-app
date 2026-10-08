import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './BottomNav.css'

function BottomNav() {
  const { role } = useAuth()

  const isPatient = role === 'patient' || !role
  const isAmbulance = role === 'ambulance'

  return (
    <nav className={`bottom-nav ${isAmbulance ? 'three-tabs' : ''}`}>

      {/* Home — shown to everyone */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
      >
        <span className="bottom-icon">🏠</span>
        <span className="bottom-label">Home</span>
      </NavLink>

      {/* SOS — shown only to patients */}
      {isPatient && (
        <NavLink
          to="/emergency"
          className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-icon">🚑</span>
          <span className="bottom-label">SOS</span>
        </NavLink>
      )}

      {/* AI — shown only to patients */}
      {isPatient && (
        <NavLink
          to="/assistant"
          className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-icon">💬</span>
          <span className="bottom-label">AI</span>
        </NavLink>
      )}

      {/* Dispatch — shown only to ambulance drivers */}
      {isAmbulance && (
        <NavLink
          to="/dispatcher"
          className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-icon">🚨</span>
          <span className="bottom-label">Dispatch</span>
        </NavLink>
      )}

      {/* Profile — shown to everyone */}
      <NavLink
        to="/profile"
        className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
      >
        <span className="bottom-icon">👤</span>
        <span className="bottom-label">Profile</span>
      </NavLink>

    </nav>
  )
}

export default BottomNav