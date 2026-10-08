import { useState, useRef, useCallback } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'

const APP_ID = import.meta.env.VITE_AGORA_APP_ID

export function useAgora() {
  const [joined, setJoined] = useState(false)
  const [micMuted, setMicMuted] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [remoteUsers, setRemoteUsers] = useState([])
  const [error, setError] = useState('')

  const clientRef = useRef(null)
  const localAudioRef = useRef(null)
  const localVideoRef = useRef(null)

  // ─── Join a channel ──────────────────────────────────
  const join = useCallback(async (channelName, withVideo = false) => {
    if (!APP_ID) {
      setError('Agora App ID missing. Check your .env file.')
      return
    }
    if (joined) return

    try {
      setError('')

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      clientRef.current = client

      // Listen for remote users
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType)

        if (mediaType === 'audio') {
          user.audioTrack?.play()
        }

        setRemoteUsers((prev) => {
          const others = prev.filter((u) => u.uid !== user.uid)
          return [...others, user]
        })
      })

      client.on('user-unpublished', (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
      })

      client.on('user-left', (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
      })

      // Join the channel
      await client.join(APP_ID, channelName, null, null)

      // Create and publish local tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
      localAudioRef.current = audioTrack

      const tracks = [audioTrack]

      if (withVideo) {
        const videoTrack = await AgoraRTC.createCameraVideoTrack()
        localVideoRef.current = videoTrack
        tracks.push(videoTrack)
        setCameraOn(true)
      }

      await client.publish(tracks)
      setJoined(true)
    } catch (err) {
      console.error('[Agora] Join failed:', err)
      setError('Failed to join the call. Please try again.')
    }
  }, [joined])

  // ─── Leave the channel ───────────────────────────────
  const leave = useCallback(async () => {
    try {
      localAudioRef.current?.close()
      localVideoRef.current?.close()
      localAudioRef.current = null
      localVideoRef.current = null

      await clientRef.current?.leave()
      clientRef.current = null

      setJoined(false)
      setRemoteUsers([])
      setMicMuted(false)
      setCameraOn(false)
    } catch (err) {
      console.error('[Agora] Leave failed:', err)
    }
  }, [])

  // ─── Toggle microphone ───────────────────────────────
  const toggleMic = useCallback(async () => {
    if (!localAudioRef.current) return
    const next = !micMuted
    await localAudioRef.current.setEnabled(!next)
    setMicMuted(next)
  }, [micMuted])

  // ─── Enable camera mid-call ──────────────────────────
  const enableCamera = useCallback(async () => {
    if (!clientRef.current || cameraOn) return
    try {
      const videoTrack = await AgoraRTC.createCameraVideoTrack()
      localVideoRef.current = videoTrack
      await clientRef.current.publish([videoTrack])
      setCameraOn(true)
    } catch (err) {
      console.error('[Agora] Camera enable failed:', err)
      setError('Could not enable camera.')
    }
  }, [cameraOn])

  // ─── Disable camera ──────────────────────────────────
  const disableCamera = useCallback(async () => {
    if (!clientRef.current || !localVideoRef.current) return
    try {
      await clientRef.current.unpublish([localVideoRef.current])
      localVideoRef.current.close()
      localVideoRef.current = null
      setCameraOn(false)
    } catch (err) {
      console.error('[Agora] Camera disable failed:', err)
    }
  }, [])

  return {
    joined,
    micMuted,
    cameraOn,
    remoteUsers,
    error,
    join,
    leave,
    toggleMic,
    enableCamera,
    disableCamera,
    localVideoTrack: localVideoRef,
  }
}