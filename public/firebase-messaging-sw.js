// Firebase Cloud Messaging service worker
// Handles push notifications even when the app is closed

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// Firebase config — must match your app's .env values
// ⚠️ These are public values (safe to include in the service worker)
firebase.initializeApp({
  apiKey: 'AIzaSyAOzgUB5CYNPKYO879FNlkeM7tNxczWEZk',
  authDomain: 'medconnect-1118a.firebaseapp.com',
  databaseURL: 'https://medconnect-1118a-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'medconnect-1118a',
  storageBucket: 'medconnect-1118a.firebasestorage.app',
  messagingSenderId: '642168554091',
  appId: '1:642168554091:web:671d3c6f63163b1b56e72e',
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Received background message:', payload)

  const notificationTitle =
    payload.notification?.title || 'MedConnect'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.sessionId || 'medconnect-notification',
    data: payload.data || {},
    requireInteraction: true, // notifications stay until user interacts
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM SW] Notification clicked:', event.notification.data)
  event.notification.close()

  const sessionId = event.notification.data?.sessionId
  const urlToOpen = sessionId
    ? `${self.location.origin}/ambulance/${sessionId}`
    : self.location.origin

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen)
          return client.focus()
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})