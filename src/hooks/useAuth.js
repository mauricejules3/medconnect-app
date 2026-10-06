import { useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  reload,
} from 'firebase/auth'
import { ref, set, get, update } from 'firebase/database'
import { auth, db } from '../firebase'

// Firebase keys can't contain . # $ [ ] / — encode emails for use as keys
function encodeKey(email) {
  return email.replace(/\./g, '_dot_').replace(/@/g, '_at_')
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [emailVerified, setEmailVerified] = useState(false)
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        })
        setEmailVerified(firebaseUser.emailVerified)

        try {
          const snapshot = await get(ref(db, `users/${firebaseUser.uid}`))
          const profile = snapshot.val()
          if (profile) {
            setUser((prev) => ({ ...prev, ...profile }))
            setRole(profile.role || 'patient')
            setAvailable(profile.available || false)

            // Auto-migrate: ensure this user is in the email index
            const normalizedEmail = (profile.email || firebaseUser.email || '')
              .toLowerCase()
              .trim()

            if (normalizedEmail) {
              const indexKey = encodeKey(normalizedEmail)
              const indexRef = ref(db, `users-by-email/${indexKey}`)
              const indexSnapshot = await get(indexRef)

              if (!indexSnapshot.exists()) {
                await set(indexRef, {
                  uid: firebaseUser.uid,
                  name: profile.name || 'MedConnect user',
                  email: normalizedEmail,
                })
              }
            }
          }
        } catch (err) {
          console.error('Failed to load profile:', err)
        }
      } else {
        setUser(null)
        setRole(null)
        setEmailVerified(false)
        setAvailable(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signup = async ({ name, email, password, role }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    const uid = credential.user.uid
    const normalizedEmail = email.toLowerCase().trim()

    // Save the user's profile
    await set(ref(db, `users/${uid}`), {
      name,
      email: normalizedEmail,
      role,
      createdAt: Date.now(),
    })

    // Save to email lookup index (so others can find this user by email)
    await set(ref(db, `users-by-email/${encodeKey(normalizedEmail)}`), {
      uid,
      name,
      email: normalizedEmail,
    })

    // Send the verification email
    await sendEmailVerification(credential.user)

    return credential.user
  }

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    await signOut(auth)
  }

  // Re-check whether the user has verified their email
  const checkVerification = async () => {
    if (!auth.currentUser) return false
    await reload(auth.currentUser)
    const verified = auth.currentUser.emailVerified
    setEmailVerified(verified)
    return verified
  }

  // Send the verification email again
  const resendVerification = async () => {
    if (!auth.currentUser) return
    await sendEmailVerification(auth.currentUser)
  }

  // Update ambulance driver availability (online / offline)
  const updateAvailability = async (isAvailable) => {
    if (!auth.currentUser) return
    try {
      await set(ref(db, `users/${auth.currentUser.uid}/available`), isAvailable)
      setAvailable(isAvailable)
    } catch (err) {
      console.error('Failed to update availability:', err)
    }
  }

  // Update any field on the user's profile (contacts, address, vehicle, etc.)
  const updateProfile = async (fields) => {
    if (!auth.currentUser) return
    try {
      await update(ref(db, `users/${auth.currentUser.uid}`), fields)
      setUser((prev) => ({ ...prev, ...fields }))
    } catch (err) {
      console.error('Failed to update profile:', err)
      throw err
    }
  }

  return {
    user,
    role,
    emailVerified,
    available,
    loading,
    signup,
    login,
    logout,
    checkVerification,
    resendVerification,
    updateAvailability,
    updateProfile,
  }
}