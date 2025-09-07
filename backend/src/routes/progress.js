import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { Progress } from '../models/Progress.js'
import { ProgressSchema } from '../utils/validators.js'


export const progress = Router()


progress.use(requireAuth)


progress.get('/', async (req, res) => {
const rows = await Progress.find({ userId: req.user.id }).sort({ updatedAt: -1 }).limit(50).lean()
res.json({ items: rows })
})


progress.post('/', async (req, res) => {
const { mediaId, t, d } = ProgressSchema.parse(req.body)
const upsert = await Progress.findOneAndUpdate(
{ userId: req.user.id, mediaId },
{ $set: { t, d } },
{ upsert: true, new: true }
).lean()
res.json({ item: upsert })
})


progress.delete('/:mediaId', async (req, res) => {
await Progress.deleteOne({ userId: req.user.id, mediaId: req.params.mediaId })
res.json({ ok: true })
})