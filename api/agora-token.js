// ═══════════════════════════════════════════════════════════
// Vercel Serverless Function — Generate Agora RTC tokens
//
// GET /api/agora-token?channel=EMG-XXXXX&uid=0
// Returns: { token: "007eJx..." }
//
// The Agora certificate is stored as an environment variable
// and NEVER sent to the browser.
// ═══════════════════════════════════════════════════════════

import { RtcTokenBuilder, RtcRole } from 'agora-token'

export default async function handler(req, res) {
  // Allow cross-origin from the same app
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { channel, uid = '0' } = req.query

  // ─── Validate inputs ─────────────────────────────────
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

  // ─── Generate the token ──────────────────────────────
  try {
    const role = RtcRole.PUBLISHER // user can publish (broadcast)
    const expirationTimeInSeconds = 3600 // token valid for 1 hour
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