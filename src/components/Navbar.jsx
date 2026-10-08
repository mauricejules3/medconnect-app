import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const { role, logout } = useAuth()

  const isPatient = role === 'patient' || !role
  const isAmbulance = role === 'ambulance'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">✚</span>
        <span>MedConnect</span>
      </Link>

      <nav>
        <Link to="/dashboard">Home</Link>

        {isPatient && (
          <>
            <Link to="/emergency">Emergency</Link>
            <Link to="/assistant">AI Assistant</Link>
          </>
        )}

        {isAmbulance && (
          <Link to="/dispatcher">Dispatch</Link>
        )}

        <Link to="/profile">Profile</Link>
      </nav>

      <button onClick={handleLogout} className="login-btn">
        Log out
      </button>
    </header>
  )
}

export default Navbar