import { useState, useEffect, useRef } from 'react'
import { ref, set, onValue, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'

// Generate a short readable session ID (no confusing chars like I, O, 0, 1)
export function generateSessionId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'EMG-'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export function useEmergencySession(sessionId) {
  const [userLocation, setUserLocation] = useState(null)
  const [ambulanceLocation, setAmbulanceLocation] = useState(null)
  const [connected, setConnected] = useState(false)
  const unsubscribeRef = useRef(null)

  // Listen to the session in Firebase
  useEffect(() => {
    if (!sessionId) {
      setConnected(false)
      setUserLocation(null)
      setAmbulanceLocation(null)
      return
    }

    const sessionRef = ref(db, `emergencies/${sessionId}`)

    unsubscribeRef.current = onValue(sessionRef, (snapshot) => {
      setConnected(true)
      const data = snapshot.val() || {}
      setUserLocation(data.userLocation || null)
      setAmbulanceLocation(data.ambulanceLocation || null)
    })

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current()
    }
  }, [sessionId])

  // Write the user's location
  const updateUserLocation = async (loc) => {
    if (!loc || !sessionId) return
    await set(ref(db, `emergencies/${sessionId}/userLocation`), {
      lat: loc.lat,
      lng: loc.lng,
      accuracy: loc.accuracy,
      timestamp: serverTimestamp(),
    })
  }

  // Write the ambulance's location
  const updateAmbulanceLocation = async (loc) => {
    if (!loc || !sessionId) return
    await set(ref(db, `emergencies/${sessionId}/ambulanceLocation`), {
      lat: loc.lat,
      lng: loc.lng,
      accuracy: loc.accuracy,
      timestamp: serverTimestamp(),
    })
  }

  return {
    sessionId,
    connected,
    userLocation,
    ambulanceLocation,
    updateUserLocation,
    updateAmbulanceLocation,
  }
}