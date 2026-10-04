import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo-icon">✚</span>
          <span className="footer-logo-text">MedConnect</span>
          <p>Connected care, when it matters.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>App</h4>
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
          </div>
          <div>
            <h4>Features</h4>
            <a href="#assistant">AI Assistant</a>
            <a href="#emergency">Emergency</a>
            <a href="#gps">GPS Locator</a>
          </div>
          <div>
            <h4>Account</h4>
            <a href="#login">Login</a>
            <a href="#signup">Sign Up</a>
            <a href="#dashboard">Dashboard</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 MedConnect | Healthcare Support Platform</p>
        <p className="footer-disclaimer">
          MedConnect does not replace professional medical diagnosis or treatment.
        </p>
      </div>
    </footer>
  )
}

export default Footer