import { Router } from 'express'
import { CatalogEpisode } from '../models/CatalogEpisode.js'
import { CatalogSeries } from '../models/CatalogSeries.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { CatalogEpisodeCreateSchema, CatalogEpisodeUpdateSchema } from '../utils/validators.js'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

export const catalogEpisodes = Router()

async function isKidsMode(req){
  try {
    const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '')
    if (!token) return false
    const { uid } = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(uid).lean()
    const p = (user?.profiles || []).find(pr => pr.id === user?.activeProfileId)
    return !!p?.kids
  } catch { return false }
}

// Public: fetch single episode (kids gate via series)
catalogEpisodes.get('/episode/:id', async (req, res) => {
  const ep = await CatalogEpisode.findById(req.params.id).lean()
  if (!ep) return res.status(404).json({ error: 'Not found' })
  const series = await CatalogSeries.findOne({ seriesId: ep.seriesId }).lean()
  const kids = await isKidsMode(req)
  if (kids && series && !series.kids) return res.status(403).json({ error: 'Blocked for kids profile' })
  res.json({ episode: ep, series })
})

// Admin: list by series
catalogEpisodes.get('/list', requireAuth, requireAdmin, async (req, res) => {
  const seriesId = String(req.query.seriesId || '')
  const q = seriesId ? { seriesId } : {}
  const items = await CatalogEpisode.find(q).sort({ seriesId: 1, season: 1, episode: 1 }).lean()
  res.json({ items })
})

catalogEpisodes.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const payload = CatalogEpisodeCreateSchema.parse(req.body)
    const exists = await CatalogEpisode.findOne({ seriesId: payload.seriesId, season: payload.season, episode: payload.episode })
    if (exists) return res.status(409).json({ error: 'Episode already exists' })
    const created = await CatalogEpisode.create(payload)
    res.status(201).json({ item: created })
  } catch {
    res.status(400).json({ error: 'Invalid input' })
  }
})

catalogEpisodes.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const patch = CatalogEpisodeUpdateSchema.parse(req.body)
    const updated = await CatalogEpisode.findByIdAndUpdate(req.params.id, patch, { new: true }).lean()
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json({ item: updated })
  } catch {
    res.status(400).json({ error: 'Invalid input' })
  }
})

catalogEpisodes.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await CatalogEpisode.deleteOne({ _id: req.params.id })
  res.json({ ok: true })
})

export default catalogEpisodes
