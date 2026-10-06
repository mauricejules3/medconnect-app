import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Medical.css'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']

function Medical() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()

  const [bloodType, setBloodType] = useState('')
  const [allergies, setAllergies] = useState('')
  const [conditions, setConditions] = useState('')
  const [medications, setMedications] = useState('')
  const [notes, setNotes] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [doctorPhone, setDoctorPhone] = useState('')

  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)

  // Load existing data
  useEffect(() => {
    if (!user?.medicalInfo) return
    const m = user.medicalInfo
    setBloodType(m.bloodType || '')
    setAllergies(m.allergies || '')
    setConditions(m.conditions || '')
    setMedications(m.medications || '')
    setNotes(m.notes || '')
    setDoctorName(m.doctorName || '')
    setDoctorPhone(m.doctorPhone || '')
  }, [user?.medicalInfo])

  if (!user) return null

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({
        medicalInfo: {
          bloodType,
          allergies,
          conditions,
          medications,
          notes,
          doctorName,
          doctorPhone,
          updatedAt: Date.now(),
        },
      })
      setSavedAt(Date.now())
      setTimeout(() => setSavedAt(null), 3000)
    } catch (err) {
      console.error(err)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="medical-page">
      <div className="settings-header">
        <button
          className="settings-back"
          onClick={() => navigate('/settings')}
        >
          ←
        </button>
        <h1>Medical info</h1>
      </div>

      <p className="medical-intro">
        This information is shown to the ambulance team during an emergency.
        It helps them treat you correctly and faster.
      </p>

      <form className="medical-form" onSubmit={handleSave}>

        {/* Blood type */}
        <div className="medical-section">
          <label className="medical-label">
            🩸 Blood type
            <select
              className="medical-select"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              disabled={saving}
            >
              <option value="">Select…</option>
              {BLOOD_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Allergies */}
        <div className="medical-section">
          <label className="medical-label">
            ⚠️ Known allergies
            <textarea
              className="medical-textarea"
              placeholder="e.g. Penicillin, peanuts, aspirin…"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              disabled={saving}
              rows={2}
            />
          </label>
          <p className="medical-help">
            List any medication, food, or substance allergies.
          </p>
        </div>

        {/* Conditions */}
        <div className="medical-section">
          <label className="medical-label">
            🏥 Medical conditions
            <textarea
              className="medical-textarea"
              placeholder="e.g. Diabetes Type 2, asthma, hypertension…"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              disabled={saving}
              rows={2}
            />
          </label>
          <p className="medical-help">
            Chronic conditions or diagnoses the ambulance should know.
          </p>
        </div>

        {/* Medications */}
        <div className="medical-section">
          <label className="medical-label">
            💊 Current medications
            <textarea
              className="medical-textarea"
              placeholder="e.g. Metformin 500mg, Ventolin inhaler…"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              disabled={saving}
              rows={2}
            />
          </label>
          <p className="medical-help">
            Medications you take regularly, with dosages if known.
          </p>
        </div>

        {/* Emergency notes */}
        <div className="medical-section">
          <label className="medical-label">
            📝 Emergency notes
            <textarea
              className="medical-textarea"
              placeholder="e.g. I have severe asthma. Inhaler is in my bag. Call my mom first."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={saving}
              rows={3}
            />
          </label>
          <p className="medical-help">
            Anything else the ambulance should know in an emergency.
          </p>
        </div>

        {/* Emergency doctor */}
        <div className="medical-section">
          <h3 className="medical-subheading">🩺 Emergency doctor (optional)</h3>

          <label className="medical-label small">
            Doctor's name
            <input
              type="text"
              className="medical-input"
              placeholder="e.g. Dr. Aline Uwase"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              disabled={saving}
            />
          </label>

          <label className="medical-label small">
            Doctor's phone
            <input
              type="tel"
              className="medical-input"
              placeholder="+250 788 123 456"
              value={doctorPhone}
              onChange={(e) => setDoctorPhone(e.target.value)}
              disabled={saving}
            />
          </label>
        </div>

        {/* Submit */}
        <div className="medical-actions">
          <button
            type="submit"
            className="medical-save-btn"
            disabled={saving}
          >
            {saving ? 'Saving…' : '💾 Save medical info'}
          </button>

          {savedAt && (
            <p className="medical-saved-msg">✅ Saved successfully</p>
          )}
        </div>
      </form>

      <p className="medical-privacy">
        🔒 Your medical info is encrypted in transit and only shared with
        ambulance teams during your emergencies.
      </p>
    </main>
  )
}

export default Medical