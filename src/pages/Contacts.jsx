import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref, get } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import './Contacts.css'

const MAX_CONTACTS = 5

function encodeKey(email) {
  return email.replace(/\./g, '_dot_').replace(/@/g, '_at_')
}

function Contacts() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [contactType, setContactType] = useState('medconnect') // 'medconnect' or 'phone'

  // For MedConnect contacts
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchStatus, setSearchStatus] = useState('idle') // idle | searching | found | notfound

  // For Phone contacts
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const contacts = user.trustedContacts || []

  const resetForm = () => {
    setFormOpen(false)
    setEditing(null)
    setContactType('medconnect')
    setSearchEmail('')
    setSearchResult(null)
    setSearchStatus('idle')
    setName('')
    setPhone('')
    setError('')
  }

  const openAdd = () => {
    resetForm()
    setFormOpen(true)
  }

  const openEdit = (index) => {
    const c = contacts[index]
    setEditing(index)
    setFormOpen(true)

    if (c.type === 'medconnect') {
      setContactType('medconnect')
      setSearchEmail(c.email || '')
      setSearchResult({ uid: c.userId, name: c.name, email: c.email })
      setSearchStatus('found')
    } else {
      setContactType('phone')
      setName(c.name)
      setPhone(c.phone)
    }
  }

  const searchUser = async (e) => {
    e.preventDefault()
    setError('')
    const clean = searchEmail.toLowerCase().trim()

    if (!clean) {
      setError('Please enter an email.')
      return
    }

    if (clean === user.email?.toLowerCase()) {
      setError("You can't add yourself as a contact.")
      return
    }

    // Check if this email is already in contacts
    const already = contacts.some(
      (c) =>
        c.type === 'medconnect' &&
        c.email?.toLowerCase() === clean &&
        (editing === null ||
          contacts[editing]?.email?.toLowerCase() !== clean)
    )
    if (already) {
      setError('This person is already in your contacts.')
      return
    }

    setSearchStatus('searching')
    try {
      const snapshot = await get(
        ref(db, `users-by-email/${encodeKey(clean)}`)
      )
      const found = snapshot.val()

      if (found) {
        setSearchResult(found)
        setSearchStatus('found')
      } else {
        setSearchResult(null)
        setSearchStatus('notfound')
      }
    } catch (err) {
      console.error(err)
      setError('Search failed. Please try again.')
      setSearchStatus('idle')
    }
  }

  const saveMedconnectContact = async () => {
    if (!searchResult) return
    setSaving(true)
    try {
      const newContact = {
        name: searchResult.name || searchResult.email,
        type: 'medconnect',
        email: searchResult.email,
        userId: searchResult.uid,
      }
      let updated
      if (editing !== null) {
        updated = contacts.map((c, i) => (i === editing ? newContact : c))
      } else {
        if (contacts.length >= MAX_CONTACTS) {
          setError(`You can only save up to ${MAX_CONTACTS} contacts.`)
          setSaving(false)
          return
        }
        updated = [...contacts, newContact]
      }
      await updateProfile({ trustedContacts: updated })
      resetForm()
    } catch (err) {
      console.error(err)
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const savePhoneContact = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedName) {
      setError('Please enter a name.')
      return
    }
    if (!trimmedPhone) {
      setError('Please enter a phone number.')
      return
    }
    if (trimmedPhone.replace(/\D/g, '').length < 6) {
      setError('Please enter a valid phone number.')
      return
    }

    setSaving(true)
    try {
      const newContact = {
        name: trimmedName,
        type: 'phone',
        phone: trimmedPhone,
      }
      let updated
      if (editing !== null) {
        updated = contacts.map((c, i) => (i === editing ? newContact : c))
      } else {
        if (contacts.length >= MAX_CONTACTS) {
          setError(`You can only save up to ${MAX_CONTACTS} contacts.`)
          setSaving(false)
          return
        }
        updated = [...contacts, newContact]
      }
      await updateProfile({ trustedContacts: updated })
      resetForm()
    } catch (err) {
      console.error(err)
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (index) => {
    if (!window.confirm('Remove this contact?')) return
    const updated = contacts.filter((_, i) => i !== index)
    try {
      await updateProfile({ trustedContacts: updated })
    } catch (err) {
      console.error(err)
      alert('Failed to remove contact.')
    }
  }

  return (
    <main className="contacts-page">
      <div className="settings-header">
        <button
          className="settings-back"
          onClick={() => navigate('/settings')}
        >
          ←
        </button>
        <h1>Trusted contacts</h1>
      </div>

      <p className="contacts-intro">
        Add people who will be notified during an emergency.
        MedConnect users get push notifications, and phone contacts get
        one-tap call buttons.
      </p>

      {/* Empty state */}
      {contacts.length === 0 && !formOpen && (
        <div className="contacts-empty">
          <div className="contacts-empty-icon">👥</div>
          <p>No trusted contacts yet</p>
          <span>Add someone you trust — like family or a close friend.</span>
        </div>
      )}

      {/* Contact list */}
      <div className="contacts-list">
        {contacts.map((c, i) => (
          <div key={i} className="contact-item">
            <div
              className={`contact-item-avatar ${
                c.type === 'medconnect' ? 'medconnect' : 'phone'
              }`}
            >
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="contact-item-info">
              <span className="contact-item-name">{c.name}</span>
              <span className="contact-item-sub">
                {c.type === 'medconnect' ? (
                  <>🔔 {c.email}</>
                ) : (
                  <>📞 {c.phone}</>
                )}
              </span>
            </div>
            <div className="contact-item-actions">
              <button
                className="contact-icon-btn"
                onClick={() => openEdit(i)}
                title="Edit"
              >
                ✏️
              </button>
              <button
                className="contact-icon-btn danger"
                onClick={() => handleDelete(i)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      {!formOpen && contacts.length < MAX_CONTACTS && (
        <button className="contacts-add-btn" onClick={openAdd}>
          + Add contact
        </button>
      )}

      {!formOpen && contacts.length >= MAX_CONTACTS && (
        <p className="contacts-limit">
          You've reached the limit of {MAX_CONTACTS} contacts.
        </p>
      )}

      {/* Form */}
      {formOpen && (
        <div className="contacts-form">
          <h2>{editing !== null ? 'Edit contact' : 'Add trusted contact'}</h2>

          {/* Type selector — only on add, not edit */}
          {editing === null && (
            <div className="contact-type-selector">
              <button
                type="button"
                className={`type-option ${
                  contactType === 'medconnect' ? 'active' : ''
                }`}
                onClick={() => {
                  setContactType('medconnect')
                  setError('')
                }}
              >
                <span className="type-icon">👤</span>
                <div>
                  <strong>MedConnect user</strong>
                  <small>Gets push notifications</small>
                </div>
              </button>

              <button
                type="button"
                className={`type-option ${
                  contactType === 'phone' ? 'active' : ''
                }`}
                onClick={() => {
                  setContactType('phone')
                  setError('')
                }}
              >
                <span className="type-icon">📞</span>
                <div>
                  <strong>Phone contact</strong>
                  <small>One-tap call button</small>
                </div>
              </button>
            </div>
          )}

          {/* MedConnect form */}
          {contactType === 'medconnect' && (
            <>
              <label>
                Their MedConnect email
                <input
                  type="email"
                  placeholder="mom@example.com"
                  value={searchEmail}
                  onChange={(e) => {
                    setSearchEmail(e.target.value)
                    setSearchResult(null)
                    setSearchStatus('idle')
                    setError('')
                  }}
                  disabled={saving || searchStatus === 'found'}
                />
              </label>

              {searchStatus !== 'found' && (
                <button
                  type="button"
                  className="search-btn"
                  onClick={searchUser}
                  disabled={searchStatus === 'searching'}
                >
                  {searchStatus === 'searching' ? 'Searching...' : '🔍 Search'}
                </button>
              )}

              {searchStatus === 'found' && searchResult && (
                <div className="search-result found">
                  <div className="search-result-avatar">
                    {(searchResult.name || searchResult.email)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="search-result-info">
                    <strong>{searchResult.name || 'MedConnect user'}</strong>
                    <small>{searchResult.email}</small>
                  </div>
                  <span className="search-result-badge">✅ Found</span>
                </div>
              )}

              {searchStatus === 'notfound' && (
                <div className="search-result notfound">
                  <p>
                    <strong>Not found on MedConnect.</strong>
                  </p>
                  <p className="notfound-hint">
                    This email isn't registered. You can add them as a phone
                    contact instead — they'll get a call button, but not push
                    notifications.
                  </p>
                  <button
                    type="button"
                    className="switch-type-btn"
                    onClick={() => {
                      setContactType('phone')
                      setError('')
                    }}
                  >
                    Add as phone contact →
                  </button>
                </div>
              )}
            </>
          )}

          {/* Phone form */}
          {contactType === 'phone' && (
            <>
              <label>
                Name
                <input
                  type="text"
                  placeholder="e.g. Uncle John"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                />
              </label>

              <label>
                Phone number
                <input
                  type="tel"
                  placeholder="+250 788 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={saving}
                />
              </label>
            </>
          )}

          {error && <p className="contacts-error">{error}</p>}

          <div className="contacts-form-actions">
            <button
              type="button"
              className="contacts-cancel-btn"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="contacts-save-btn"
              disabled={
                saving ||
                (contactType === 'medconnect' && searchStatus !== 'found')
              }
              onClick={
                contactType === 'medconnect'
                  ? saveMedconnectContact
                  : savePhoneContact
              }
            >
              {saving ? 'Saving...' : editing !== null ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default Contacts