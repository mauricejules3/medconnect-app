import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <main id="home">

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <span className="tagline">YOUR HEALTH, OUR PRIORITY</span>

          <h1>
            Healthcare assistance,
            <span> whenever you need it.</span>
          </h1>

          <p>
            MedConnect brings together AI-powered health guidance,
            GPS location services, and emergency contact features
            to help you access assistance more easily.
          </p>

          <div className="hero-buttons">
            <Link to="/emergency" className="emergency-btn">
              ✚ Emergency Assistance
            </Link>

            <a href="#services" className="learn-btn">
              Explore Services
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="medical-card">
            <div className="medical-icon">✚</div>
            <h2>MedConnect</h2>
            <p>Connected care, when it matters.</p>

            <div className="status">
              <span className="status-dot"></span>
              Your health companion
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services" id="services">
        <div className="section-heading">
          <span>OUR SERVICES</span>
          <h2>How MedConnect helps you</h2>
          <p>Access essential healthcare support through one simple platform.</p>
        </div>

        <div className="service-grid">

          <div className="service-card">
            <div className="service-icon blue">✚</div>
            <h3>AI Medical Assistant</h3>
            <p>
              Access basic health information and first-aid guidance
              while seeking professional medical care.
            </p>
            <Link to="/assistant" className="service-link">
              Explore Assistant →
            </Link>
          </div>

          <div className="service-card">
            <div className="service-icon red">⌖</div>
            <h3>Emergency Assistance</h3>
            <p>
              Access emergency calling features and prepare your
              location information when help is needed.
            </p>
            <Link to="/emergency" className="service-link">
              Get Assistance →
            </Link>
          </div>

          <div className="service-card">
            <div className="service-icon green">◎</div>
            <h3>GPS Location</h3>
            <p>
              Detect your current geographical coordinates to make
              location sharing easier.
            </p>
            <Link to="/emergency" className="service-link">
              Find My Location →
            </Link>
          </div>

        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <h2>About MedConnect</h2>
        <p>
          A healthcare technology project designed to support faster
          access to basic medical guidance and emergency communication.
        </p>
      </section>

    </main>
  )
}

export default Home