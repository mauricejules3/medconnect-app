import { useState, useEffect } from 'react'
import { ref, set, onValue } from 'firebase/database'
import { db } from '../firebase'
import './FirebaseTest.css'

function FirebaseTest() {
  const [tabId] = useState(() => Math.random().toString(36).slice(2, 7).toUpperCase())
  const [myMessage, setMyMessage] = useState('')
  const [remoteMessage, setRemoteMessage] = useState('(waiting for data...)')
  const [connectionStatus, setConnectionStatus] = useState('connecting')

  // Listen to Firebase in real-time
  useEffect(() => {
    const testRef = ref(db, 'test')

    const unsubscribe = onValue(
      testRef,
      (snapshot) => {
        setConnectionStatus('connected')
        const data = snapshot.val()
        setRemoteMessage(data ? data.message : '(nothing yet)')
      },
      (error) => {
        setConnectionStatus('error')
        console.error('Firebase error:', error)
      }
    )

    return () => unsubscribe()
  }, [])

  const sendToFirebase = async () => {
    if (!myMessage.trim()) return
    try {
      await set(ref(db, 'test'), {
        message: myMessage,
        fromTab: tabId,
        timestamp: Date.now(),
      })
      setMyMessage('')
    } catch (err) {
      console.error('Write failed:', err)
      alert('Failed to write to Firebase. Check the console.')
    }
  }

  return (
    <main className="firebase-test-page">
      <div className="firebase-test-card">
        <h1>🔥 Firebase Real-Time Test</h1>

        <div className="status-row">
          <span className={`status-dot-big ${connectionStatus}`}></span>
          <span>
            Connection: <strong>{connectionStatus}</strong>
          </span>
        </div>

        <div className="test-section">
          <div className="test-block">
            <h3>📤 This tab sends</h3>
            <p className="test-hint">Your tab ID: <code>{tabId}</code></p>
            <input
              type="text"
              placeholder="Type a message..."
              value={myMessage}
              onChange={(e) => setMyMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendToFirebase()}
            />
            <button onClick={sendToFirebase}>Send to Firebase</button>
          </div>

          <div className="test-block receive">
            <h3>📥 This tab receives</h3>
            <p className="test-hint">
              Latest message from <strong>any</strong> tab:
            </p>
            <div className="received-message">
              {remoteMessage}
            </div>
          </div>
        </div>

        <div className="test-instructions">
          <h4>🧪 How to test</h4>
          <ol>
            <li>Open this page in <strong>another tab</strong> (duplicate the tab or open a new one)</li>
            <li>Type something in the first tab → Send</li>
            <li>Watch the second tab update <strong>instantly</strong> without refreshing</li>
            <li>Type in the second tab → Send → watch the first tab update</li>
          </ol>
        </div>
      </div>
    </main>
  )
}

export default FirebaseTest