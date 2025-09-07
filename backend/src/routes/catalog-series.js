import { Router } from 'express'
import { CatalogSeries } from '../models/CatalogSeries.js'
import { CatalogEpisode } from '../models/CatalogEpisode.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { CatalogSeriesCreateSchema, CatalogSeriesUpdateSchema } from '../utils/validators.js'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

export const catalogSeries = Router()

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

// Public: series with episodes grouped by season (kids gate)
catalogSeries.get('/by-series/:seriesId', async (req, res) => {
  const kids = await isKidsMode(req)
  const seriesId = String(req.params.seriesId)
  const series = await CatalogSeries.findOne({ seriesId }).lean()
  if (!series) return res.status(404).json({ error: 'Not found' })
  if (kids && !series.kids) return res.status(403).json({ error: 'Blocked for kids profile' })
  const eps = await CatalogEpisode.find({ seriesId }).sort({ season: 1, episode: 1 }).lean()
  const seasons = {}
  for (const e of eps) {
    if (!seasons[e.season]) seasons[e.season] = []
    seasons[e.season].push(e)
  }
  res.json({ series, seasons })
})

// Admin list/create/update/delete
catalogSeries.get('/list', requireAuth, requireAdmin, async (_req, res) => {
  const items = await CatalogSeries.find({}).sort({ updatedAt: -1 }).lean()
  res.json({ items })
})

catalogSeries.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const payload = CatalogSeriesCreateSchema.parse(req.body)
    const exists = await CatalogSeries.findOne({ seriesId: payload.seriesId })
    if (exists) return res.status(409).json({ error: 'Series already exists' })
    const created = await CatalogSeries.create(payload)
    res.status(201).json({ item: created })
  } catch {
    res.status(400).json({ error: 'Invalid input' })
  }
})

catalogSeries.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const patch = CatalogSeriesUpdateSchema.parse(req.body)
    const updated = await CatalogSeries.findByIdAndUpdate(req.params.id, patch, { new: true }).lean()
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json({ item: updated })
  } catch {
    res.status(400).json({ error: 'Invalid input' })
  }
})

catalogSeries.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const doc = await CatalogSeries.findById(req.params.id).lean()
  if (doc) await CatalogEpisode.deleteMany({ seriesId: doc.seriesId })
  await CatalogSeries.deleteOne({ _id: req.params.id })
  res.json({ ok: true })
})

export default catalogSeries
