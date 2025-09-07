import { Router } from 'express'
import { CatalogItem } from '../models/CatalogItem.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { CatalogCreateSchema, CatalogUpdateSchema } from '../utils/validators.js'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

export const catalog = Router()

// infer kids mode from active profile (shared logic with titles)
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

// Public: lookup by TMDB media id (respects kids flag)
catalog.get('/by-media/:mediaId', async (req, res) => {
  const kids = await isKidsMode(req)
  const mediaId = String(req.params.mediaId)
  const item = await CatalogItem.findOne({ mediaId }).lean()
  if (!item) return res.status(404).json({ error: 'Not found' })
  if (kids && !item.kids) return res.status(403).json({ error: 'Blocked for kids profile' })
  return res.json({ item })
})

// Admin list (simple)
catalog.get('/list', requireAuth, requireAdmin, async (_req, res) => {
  const items = await CatalogItem.find({}).sort({ updatedAt: -1 }).lean()
  res.json({ items })
})

// Admin create
catalog.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = CatalogCreateSchema.parse(req.body)
    const exists = await CatalogItem.findOne({ mediaId: data.mediaId })
    if (exists) return res.status(409).json({ error: 'Catalog item already exists' })
    const created = await CatalogItem.create(data)
    res.status(201).json({ item: { id: created._id, ...data } })
  } catch (e) {
    res.status(400).json({ error: 'Invalid input' })
  }
})

// Admin update
catalog.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const patch = CatalogUpdateSchema.parse(req.body)
    const updated = await CatalogItem.findByIdAndUpdate(req.params.id, patch, { new: true }).lean()
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json({ item: updated })
  } catch {
    res.status(400).json({ error: 'Invalid input' })
  }
})

// Admin delete
catalog.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await CatalogItem.deleteOne({ _id: req.params.id })
  res.json({ ok: true })
})

export default catalog
