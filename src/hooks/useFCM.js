import { useEffect, useState } from 'react'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { ref, set, remove } from 'firebase/database'
import { app, db } from '../firebase'

export function useFCM({ user, enabled = false }) {
  const [permission, setPermission] = useState('default') // 'default' | 'granted' | 'denied'
  const [token, setToken] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Detect current permission on mount
  useEffect(() => {
    if (typeof Notification === 'undefined') return
    setPermission(Notification.permission)
  }, [])

  // Request permission and get token
  const requestPermission = async () => {
    setError('')

    if (typeof Notification === 'undefined') {
      setError('Notifications are not supported on this browser.')
      return null
    }

    try {
      setSaving(true)

      // Ask the user
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        setError('You need to allow notifications to receive emergency alerts.')
        setSaving(false)
        return null
      }

      // Register the FCM service worker
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/' }
      )

      // Get messaging instance
      const messaging = getMessaging(app)

      // Get the VAPID key from env
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

      if (!vapidKey) {
        setError('Missing VAPID key. Check your .env file.')
        setSaving(false)
        return null
      }

      // Get the device token
      const fcmToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      })

      if (!fcmToken) {
        setError('Could not get a notification token. Try again later.')
        setSaving(false)
        return null
      }

      setToken(fcmToken)

      // Save the token to Firebase (under the user's profile)
      if (user?.uid) {
        await set(ref(db, `users/${user.uid}/fcmToken`), fcmToken)
      }

      setSaving(false)
      return fcmToken
    } catch (err) {
      console.error('[FCM] Permission error:', err)
      setError('Failed to enable notifications. Please try again.')
      setSaving(false)
      return null
    }
  }

  // Remove the token on logout (so we don't notify a logged-out device)
  const removeToken = async () => {
    try {
      if (user?.uid) {
        await remove(ref(db, `users/${user.uid}/fcmToken`))
      }
      setToken(null)
    } catch (err) {
      console.error('[FCM] Remove token error:', err)
    }
  }

  // Listen for foreground messages (when app is open)
  useEffect(() => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return
    if (!user?.uid) return

    try {
      const messaging = getMessaging(app)
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground message:', payload)

        // Show a browser notification
        if (payload.notification) {
          new Notification(payload.notification.title || 'MedConnect', {
            body: payload.notification.body,
            icon: '/icon-192.png',
            tag: payload.data?.sessionId || 'fcm-foreground',
          })
        }
      })

      return () => unsubscribe()
    } catch (err) {
      console.error('[FCM] onMessage setup error:', err)
    }
  }, [user?.uid])

  return {
    permission,
    token,
    saving,
    error,
    requestPermission,
    removeToken,
  }
}