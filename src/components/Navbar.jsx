import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
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

      <Link to="/login" className="login-btn">
        Get Started
      </Link>
    </header>
  )
}

export default Navbar