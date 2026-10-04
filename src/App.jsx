import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AIAssistant from './pages/AIAssistant'
import Emergency from './pages/Emergency'
import Ambulance from './pages/Ambulance'
import FirebaseTest from './pages/FirebaseTest'

import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />

      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/signup"    element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/ambulance" element={<Ambulance />} />
        <Route path="/firebase-test" element={<FirebaseTest />} />

        {/* Fallback — any unknown URL shows Home */}
        <Route path="*" element={<Home />} />
      </Routes>

      <Footer />
    </div>
  )
}

export default App