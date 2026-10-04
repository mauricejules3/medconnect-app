import { useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  reload,
} from 'firebase/auth'
import { ref, set, get } from 'firebase/database'
import { auth, db } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [emailVerified, setEmailVerified] = useState(false)
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
          }
        } catch (err) {
          console.error('Failed to load profile:', err)
        }
      } else {
        setUser(null)
        setRole(null)
        setEmailVerified(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signup = async ({ name, email, password, role }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    const uid = credential.user.uid

    await set(ref(db, `users/${uid}`), {
      name,
      email,
      role,
      createdAt: Date.now(),
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

  return {
    user,
    role,
    emailVerified,
    loading,
    signup,
    login,
    logout,
    checkVerification,
    resendVerification,
  }
}