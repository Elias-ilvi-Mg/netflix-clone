// netflix-backend/src/routes/metrics.js
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { PlaybackMetric } from '../models/PlaybackMetric.js'

export const metrics = Router()


metrics.use((req, res, next) => {
  const devOnly = env.nodeEnv === 'development' && !env.demoMode
  if (!devOnly) {
    // swallow POSTs to avoid frontend errors, block reads
    if (req.method === 'POST') return res.status(204).end()
    return res.status(403).json({ error: 'Metrics disabled in this environment' })
  }
  next()
})

metrics.post('/playback', async (req, res) => {
  try {
    const { mediaId, event, t, d, detail } = req.body || {}
    let userId = null
    try {
      const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '')
      if (token) { const { uid } = jwt.verify(token, env.jwtSecret); userId = uid }
    } catch {}
    await PlaybackMetric.create({
      userId, mediaId: String(mediaId || ''), event: String(event || ''),
      t: Number(t || 0), d: Number(d || 0), detail: detail || {},
      ua: req.get('user-agent') || '', ip: req.ip
    })
    res.json({ ok: true })
  } catch (e) {
    console.error('metrics error', e?.message || e)
    res.status(400).json({ error: 'Invalid metric' })
  }
})


metrics.post('/playback', async (req, res) => {
  try {
    const { mediaId, event, t, d, detail } = req.body || {}
    let userId = null
    try {
      const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '')
      if (token) { const { uid } = jwt.verify(token, env.jwtSecret); userId = uid }
    } catch {}
    await PlaybackMetric.create({
      userId, mediaId: String(mediaId || ''), event: String(event || ''),
      t: Number(t || 0), d: Number(d || 0), detail: detail || {},
      ua: req.get('user-agent') || '', ip: req.ip
    })
    res.json({ ok: true })
  } catch (e) {
    console.error('metrics error', e?.message || e)
    res.status(400).json({ error: 'Invalid metric' })
  }
})


metrics.get('/summary', async (req, res) => {
  const days = Math.max(1, Math.min(90, Number(req.query.days || 7)))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const rows = await PlaybackMetric.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: 1 },
        plays: { $sum: { $cond: [{ $eq: ["$event", "play"] }, 1, 0] } },
        pauses: { $sum: { $cond: [{ $eq: ["$event", "pause"] }, 1, 0] } },
        ends: { $sum: { $cond: [{ $eq: ["$event", "ended"] }, 1, 0] } },
        errors: { $sum: { $cond: [{ $eq: ["$event", "error"] }, 1, 0] } },
      }
    },
    { $sort: { _id: 1 } }
  ])

  res.json({ days, rows })
})

metrics.get('/top', async (req, res) => {
  const limit = Math.max(1, Math.min(20, Number(req.query.limit || 10)))
  const rows = await PlaybackMetric.aggregate([
    { $match: { event: 'play' } },
    { $group: { _id: "$mediaId", plays: { $sum: 1 }, last: { $max: "$createdAt" } } },
    { $sort: { plays: -1, last: -1 } },
    { $limit: limit }
  ])
  res.json({ items: rows.map(r => ({ mediaId: r._id, plays: r.plays, last: r.last })) })
})
