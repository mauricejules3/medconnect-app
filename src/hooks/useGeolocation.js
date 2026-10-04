import { useState, useEffect, useRef } from 'react'

export function useGeolocation({ watch = false, intervalMs = 5000 } = {}) {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')
  const intervalRef = useRef(null)

  const getOnce = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: pos.timestamp,
        }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      )
    })

  const fetchLocation = async () => {
    setStatus('loading')
    setError('')
    try {
      const loc = await getOnce()
      setLocation(loc)
      setStatus('done')
      return loc
    } catch (err) {
      setStatus('error')
      setError(
        err.code === 1
          ? 'Location permission denied.'
          : err.code === 2
          ? 'Location unavailable.'
          : err.code === 3
          ? 'Location timed out.'
          : 'Could not get location.'
      )
      return null
    }
  }

  useEffect(() => {
    if (!watch) return

    fetchLocation()

    intervalRef.current = setInterval(fetchLocation, intervalMs)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, intervalMs])

  return { location, error, status, fetchLocation }
}