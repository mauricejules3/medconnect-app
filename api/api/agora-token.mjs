// Vercel Serverless Function — Agora token generator
// GET /api/agora-token.mjs?channel=EMG-XXXXX&uid=0

import { RtcTokenBuilder, RtcRole } from 'agora-token'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { channel, uid = '0' } = req.query

  if (!channel) {
    return res.status(400).json({ error: 'Missing channel name' })
  }

  const appId = process.env.VITE_AGORA_APP_ID
  const appCertificate = process.env.AGORA_APP_CERTIFICATE

  if (!appId) {
    return res.status(500).json({ error: 'Missing VITE_AGORA_APP_ID on server' })
  }

  if (!appCertificate) {
    return res.status(500).json({
      error: 'Missing AGORA_APP_CERTIFICATE on server',
    })
  }

  try {
    const role = RtcRole.PUBLISHER
    const expirationTimeInSeconds = 3600
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    const uidNumber = parseInt(uid, 10) || 0

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channel,
      uidNumber,
      role,
      privilegeExpiredTs
    )

    return res.status(200).json({ token, uid: uidNumber, channel })
  } catch (err) {
    console.error('[agora-token] Failed to generate token:', err)
    return res.status(500).json({ error: 'Token generation failed' })
  }
}