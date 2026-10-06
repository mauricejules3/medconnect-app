import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Settings.css'

function Settings() {
  const navigate = useNavigate()
  const { user, role } = useAuth()

  if (!user) return null

  const isPatient = role === 'patient' || !role
  const isAmbulance = role === 'ambulance'

  const contactsCount = (user.trustedContacts || []).length
  const hasMedicalInfo = !!user.medicalInfo?.bloodType
  const hasVehicle = !!user.vehicle?.plate

  return (
    <main className="settings-page">
      <div className="settings-header">
        <button className="settings-back" onClick={() => navigate('/profile')}>
          ←
        </button>
        <h1>Settings</h1>
      </div>

      <div className="settings-section">
        <h2>Preferences</h2>

        {isPatient && (
          <>
            <button
              className="settings-row"
              onClick={() => navigate('/settings/medical')}
            >
              <span className="settings-row-icon">🏥</span>
              <div className="settings-row-text">
                <span className="settings-row-title">Medical info</span>
                <span className="settings-row-sub">
                  {hasMedicalInfo
                    ? `Blood type ${user.medicalInfo.bloodType} · Updated`
                    : 'Blood type, allergies, conditions'}
                </span>
              </div>
              <span className="settings-row-arrow">→</span>
            </button>

            <button
              className="settings-row"
              onClick={() => navigate('/settings/contacts')}
            >
              <span className="settings-row-icon">👥</span>
              <div className="settings-row-text">
                <span className="settings-row-title">Trusted contacts</span>
                <span className="settings-row-sub">
                  {contactsCount > 0
                    ? `${contactsCount} contact${contactsCount > 1 ? 's' : ''} saved`
                    : 'Add people to notify in emergencies'}
                </span>
              </div>
              <span className="settings-row-arrow">→</span>
            </button>
          </>
        )}

        {isAmbulance && (
          <button
            className="settings-row"
            onClick={() => navigate('/settings/vehicle')}
          >
            <span className="settings-row-icon">🚑</span>
            <div className="settings-row-text">
              <span className="settings-row-title">Vehicle info</span>
              <span className="settings-row-sub">
                {hasVehicle
                  ? `${user.vehicle.plate} · ${user.vehicle.type}`
                  : 'Add your ambulance details'}
              </span>
            </div>
            <span className="settings-row-arrow">→</span>
          </button>
        )}
      </div>

      <div className="settings-section">
        <h2>Account</h2>
        <div className="settings-info-row">
          <span>Email</span>
          <strong>{user.email}</strong>
        </div>
        <div className="settings-info-row">
          <span>Role</span>
          <strong>{isAmbulance ? '🚑 Ambulance' : '👤 Patient'}</strong>
        </div>
      </div>

      <p className="settings-credit">MedConnect · Built by mr_baller</p>
    </main>
  )
}

export default Settings