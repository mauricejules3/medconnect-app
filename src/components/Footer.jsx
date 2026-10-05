import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo-icon">✚</span>
          <span className="footer-logo-text">MedConnect</span>
        </div>

        <p className="footer-tagline">
          Connected care, when it matters.
        </p>

        <p className="footer-quote">
          "Every second counts."
        </p>

        <div className="footer-divider" />

        <p className="footer-credit">
          <span className="footer-year">© 2026 MedConnect</span>
          <span className="footer-dot">·</span>
          <span className="footer-author">
            Built by <strong>mr_baller</strong>
          </span>
        </p>
      </div>
    </footer>
  )
}

export default Footer