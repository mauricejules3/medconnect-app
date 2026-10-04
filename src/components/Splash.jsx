import './Splash.css'

function Splash() {
  return (
    <div className="splash">
      <div className="splash-content">
        <div className="splash-logo">✚</div>
        <h1 className="splash-title">MedConnect</h1>
        <p className="splash-tagline">Connected care, when it matters.</p>

        <div className="splash-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="splash-credit">
        <span className="credit-label">Built by</span>
        <span className="credit-name">mr_baller</span>
      </div>
    </div>
  )
}

export default Splash