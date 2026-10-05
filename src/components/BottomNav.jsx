import { NavLink } from 'react-router-dom'
import './BottomNav.css'

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
      >
        <span className="bottom-icon">🏠</span>
        <span className="bottom-label">Home</span>
      </NavLink>

      <NavLink
        to="/emergency"
        className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
      >
        <span className="bottom-icon">🚑</span>
        <span className="bottom-label">SOS</span>
      </NavLink>

      <NavLink
        to="/assistant"
        className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
      >
        <span className="bottom-icon">💬</span>
        <span className="bottom-label">AI</span>
      </NavLink>

      <NavLink
        to="/ambulance"
        className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
      >
        <span className="bottom-icon">🚨</span>
        <span className="bottom-label">Dispatch</span>
      </NavLink>

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