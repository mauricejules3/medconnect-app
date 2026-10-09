import { useEffect, useRef } from 'react'

/**
 * useRingSound — plays a looping sound while `playing` is true
 *
 * Props:
 *   src      — path to the sound file (e.g., '/sounds/ringback.mp3')
 *   playing  — boolean, when true the sound plays on loop
 *   volume   — 0 to 1 (default 1.0)
 *   vibrate  — if true, also vibrates the phone (Android only)
 */
export function useRingSound({ src, playing, volume = 1.0, vibrate = false }) {
  const audioRef = useRef(null)

  // Create the audio element once
  useEffect(() => {
    if (!src) return
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = volume
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [src, volume])

  // Play/pause when `playing` changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      // Try to play. If the browser blocks it (no user interaction yet),
      // we silently ignore and the sound will play on next interaction.
      audio.play().catch((err) => {
        console.log('[Sound] Play blocked by browser:', err.message)
      })

      // Vibrate on Android while ringing (pattern: vibrate 1s, pause 0.5s)
      if (vibrate && 'vibrate' in navigator) {
        const pattern = [1000, 500, 1000, 500]
        const vibrateLoop = setInterval(() => {
          navigator.vibrate(pattern)
        }, 3000)
        navigator.vibrate(pattern)

        return () => {
          clearInterval(vibrateLoop)
          navigator.vibrate(0) // stop vibration
        }
      }
    } else {
      audio.pause()
      audio.currentTime = 0
      if ('vibrate' in navigator) {
        navigator.vibrate(0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  return audioRef
}