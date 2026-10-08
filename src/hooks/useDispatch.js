import { useState, useEffect, useRef } from 'react'
import { ref, set, onValue, update, remove, serverTimestamp, get } from 'firebase/database'
import { db } from '../firebase'

/**
 * useDispatch — manages the emergency dispatch pool
 *
 * Patient side:
 *   - startDispatch() → marks session as pending
 *   - cancelDispatch() → removes the flag
 *
 * Ambulance side:
 *   - pendingList → all pending emergencies
 *   - acceptEmergency(sessionId) → first-to-accept wins
 */

// ═══════════════════════════════════════════════════════════
// PATIENT HOOK — creates an emergency and waits for acceptance
// ═══════════════════════════════════════════════════════════
export function usePatientDispatch(sessionId, patientInfo) {
  const [status, setStatus] = useState('idle') // idle | pending | accepted
  const [assignedAmbulance, setAssignedAmbulance] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) return

    const dispatchRef = ref(db, `emergencies/${sessionId}/dispatch`)
    const unsubscribe = onValue(dispatchRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setStatus('idle')
        setAssignedAmbulance(null)
        return
      }

      setStatus(data.status || 'idle')

      if (data.status === 'accepted' && data.acceptedBy) {
        setAssignedAmbulance({
          uid: data.acceptedBy,
          name: data.acceptedByName || 'Ambulance',
          at: data.acceptedAt,
        })
      } else {
        setAssignedAmbulance(null)
      }
    })

    return () => unsubscribe()
  }, [sessionId])

  const startDispatch = async () => {
    if (!sessionId) return
    try {
      setError('')
      await set(ref(db, `emergencies/${sessionId}/dispatch`), {
        status: 'pending',
        acceptedBy: null,
        acceptedAt: null,
        createdAt: serverTimestamp(),
        patient: patientInfo || {},
      })
      setStatus('pending')
    } catch (err) {
      console.error('Failed to start dispatch:', err)
      setError('Could not broadcast emergency.')
    }
  }

  const cancelDispatch = async () => {
    if (!sessionId) return
    try {
      await remove(ref(db, `emergencies/${sessionId}/dispatch`))
      setStatus('idle')
      setAssignedAmbulance(null)
    } catch (err) {
      console.error('Failed to cancel dispatch:', err)
    }
  }

  return {
    status,
    assignedAmbulance,
    error,
    startDispatch,
    cancelDispatch,
  }
}

// ═══════════════════════════════════════════════════════════
// AMBULANCE HOOK — sees all pending, accepts one
// ═══════════════════════════════════════════════════════════
export function useAmbulanceDispatch(driverInfo) {
  const [pendingList, setPendingList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [acceptedSessionId, setAcceptedSessionId] = useState(null)

  useEffect(() => {
    const emergenciesRef = ref(db, 'emergencies')

    const unsubscribe = onValue(emergenciesRef, (snapshot) => {
      setLoading(false)
      const data = snapshot.val() || {}

      const pending = Object.entries(data)
        .filter(([_, session]) => session?.dispatch?.status === 'pending')
        .map(([id, session]) => ({
          id,
          patient: session.dispatch?.patient || {},
          createdAt: session.dispatch?.createdAt || 0,
        }))
        .sort((a, b) => b.createdAt - a.createdAt)

      setPendingList(pending)
    })

    return () => unsubscribe()
  }, [])

  const acceptEmergency = async (sessionId) => {
    if (!driverInfo?.uid) {
      setError('Not logged in')
      return false
    }

    try {
      setError('')

      const dispatchRef = ref(db, `emergencies/${sessionId}/dispatch`)
      const snapshot = await get(dispatchRef)
      const data = snapshot.val()

      if (!data || data.status !== 'pending') {
        setError('This emergency has already been taken.')
        return false
      }

      // Try to claim
      await update(dispatchRef, {
        status: 'accepted',
        acceptedBy: driverInfo.uid,
        acceptedByName: driverInfo.name || 'Ambulance',
        acceptedAt: Date.now(),
      })

      // Double-check we won
      const afterSnapshot = await get(dispatchRef)
      const afterData = afterSnapshot.val()

      if (afterData?.acceptedBy !== driverInfo.uid) {
        setError('Another ambulance accepted first.')
        return false
      }

      setAcceptedSessionId(sessionId)
      return true
    } catch (err) {
      console.error('Failed to accept emergency:', err)
      setError('Could not accept. Try again.')
      return false
    }
  }

  return {
    pendingList,
    loading,
    error,
    acceptedSessionId,
    acceptEmergency,
  }
}