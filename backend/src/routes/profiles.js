import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { User } from '../models/User.js'


export const profiles = Router()
profiles.use(requireAuth)


profiles.get('/', async (req, res) => {
const u = await User.findById(req.user.id).lean()
res.json({ profiles: u.profiles || [], activeProfileId: u.activeProfileId })
})


profiles.post('/', async (req, res) => {
const { name, kids = false } = req.body || {}
if (!name) return res.status(400).json({ error: 'Name required' })
const u = await User.findById(req.user.id)
const p = { id: String(Date.now()), name, kids: !!kids }
u.profiles.push(p)
await u.save()
res.status(201).json({ profile: p })
})


profiles.patch('/:id', async (req, res) => {
const { id } = req.params
const { name, kids } = req.body || {}
const u = await User.findById(req.user.id)
const p = u.profiles.find(x => x.id === id)
if (!p) return res.status(404).json({ error: 'Not found' })
if (typeof name === 'string') p.name = name
if (typeof kids === 'boolean') p.kids = kids
await u.save()
res.json({ profile: p })
})


profiles.delete('/:id', async (req, res) => {
const { id } = req.params
const u = await User.findById(req.user.id)
u.profiles = u.profiles.filter(x => x.id !== id)
if (u.activeProfileId === id) u.activeProfileId = null
await u.save()
res.json({ ok: true })
})


profiles.post('/active', async (req, res) => {
const { id } = req.body || {}
const u = await User.findById(req.user.id)
if (id && !u.profiles.some(p => p.id === id)) return res.status(400).json({ error: 'Invalid profile' })
u.activeProfileId = id || null
await u.save()
res.json({ activeProfileId: u.activeProfileId })
})