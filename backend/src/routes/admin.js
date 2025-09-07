import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { Progress } from '../models/Progress.js'
import { RegisterSchema } from '../utils/validators.js'

export const admin = Router()
admin.use(requireAuth, requireAdmin)

// GET /api/admin/users
admin.get('/users', async (_req, res) => {
  const rows = await User.find({}, { email: 1, role: 1, createdAt: 1, profiles: 1 }).sort({ createdAt: -1 }).lean()
  res.json({
    users: rows.map(u => ({
      id: u._id, email: u.email, role: u.role,
      profiles: (u.profiles || []).length,
      createdAt: u.createdAt
    }))
  })
})

// POST /api/admin/users
admin.post('/users', async (req, res) => {
  const { email, password } = RegisterSchema.parse(req.body)
  const exists = await User.findOne({ email })
  if (exists) return res.status(409).json({ error: 'Email already registered' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, passwordHash, role: 'user' })
  res.status(201).json({ id: user._id, email: user.email, role: user.role })
})

// DELETE /api/admin/users/:id
admin.delete('/users/:id', async (req, res) => {
  const id = req.params.id
  if (String(req.user.id) === String(id)) return res.status(400).json({ error: 'Cannot delete your own account' })
  await Progress.deleteMany({ userId: id })
  await User.deleteOne({ _id: id })
  res.json({ ok: true })
})

// PATCH /api/admin/users/:id/role  { role: "user" | "admin" }
admin.patch('/users/:id/role', async (req, res) => {
  const id = req.params.id
  const role = String(req.body.role || '').toLowerCase()
  if (!['user','admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' })
  // prevent locking yourself out accidentally
  if (String(req.user.id) === String(id) && role !== 'admin') {
    return res.status(400).json({ error: 'Cannot demote your own account' })
  }
  const user = await User.findByIdAndUpdate(id, { role }, { new: true })
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json({ id: user._id, email: user.email, role: user.role })
})
