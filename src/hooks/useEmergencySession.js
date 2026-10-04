import { useState, useEffect, useRef } from 'react'
import { ref, set, onValue, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'

const SESSION_ID = 'demo-session'  // hardcoded for now — will be dynamic later

export function useEmergencySession() {
  const [userLocation, setUserLocation] = useState(null)
  const [ambulanceLocation, setAmbulanceLocation] = useState(null)
  const [connected, setConnected] = useState(false)
  const unsubscribeRef = useRef(null)

  // Listen to the entire session
  useEffect(() => {
    const sessionRef = ref(db, `emergencies/${SESSION_ID}`)

    unsubscribeRef.current = onValue(sessionRef, (snapshot) => {
      setConnected(true)
      const data = snapshot.val() || {}
      setUserLocation(data.userLocation || null)
      setAmbulanceLocation(data.ambulanceLocation || null)
    })

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current()
    }
  }, [])

  // Write the user's location
  const updateUserLocation = async (loc) => {
    if (!loc) return
    await set(ref(db, `emergencies/${SESSION_ID}/userLocation`), {
      lat: loc.lat,
      lng: loc.lng,
      accuracy: loc.accuracy,
      timestamp: serverTimestamp(),
    })
  }

  // Write the ambulance's location
  const updateAmbulanceLocation = async (loc) => {
    if (!loc) return
    await set(ref(db, `emergencies/${SESSION_ID}/ambulanceLocation`), {
      lat: loc.lat,
      lng: loc.lng,
      accuracy: loc.accuracy,
      timestamp: serverTimestamp(),
    })
  }

  return {
    sessionId: SESSION_ID,
    connected,
    userLocation,
    ambulanceLocation,
    updateUserLocation,
    updateAmbulanceLocation,
  }
}