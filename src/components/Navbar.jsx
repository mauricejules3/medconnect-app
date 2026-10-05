import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const { logout } = useAuth()

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
        <Link to="/">Home</Link>
        <Link to="/assistant">AI Assistant</Link>
        <Link to="/emergency">Emergency</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <button onClick={handleLogout} className="login-btn">
        Log out
      </button>
    </header>
  )
}

export default Navbar