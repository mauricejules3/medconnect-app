import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Splash from './Splash'
import Navbar from './Navbar'
import Footer from './Footer'
import Dashboard from '../pages/Dashboard'
import AIAssistant from '../pages/AIAssistant'
import Emergency from '../pages/Emergency'
import Ambulance from '../pages/Ambulance'
import FirebaseTest from '../pages/FirebaseTest'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Home from '../pages/Home'

function AppGate() {
  const { user, loading } = useAuth()
  const [minSplashDone, setMinSplashDone] = useState(false)

  // Keep the splash visible for at least 1.6 seconds
  useEffect(() => {
    const timer = setTimeout(() => setMinSplashDone(true), 1600)
    return () => clearTimeout(timer)
  }, [])

  // Show splash while: auth loading OR splash time not yet elapsed
  if (loading || !minSplashDone) {
    return <Splash />
  }

  // ─── NOT LOGGED IN ─────────────────────────────────────
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/welcome" element={<Home />} />
        {/* Any other URL → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // ─── LOGGED IN ─────────────────────────────────────────
  return (
    <div className="app">
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/ambulance" element={<Ambulance />} />
        <Route path="/firebase-test" element={<FirebaseTest />} />
        <Route path="/welcome" element={<Home />} />
        {/* Fallback → dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Footer />
    </div>
  )
}

export default AppGate