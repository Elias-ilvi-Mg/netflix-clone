import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { env } from '../config/env.js'
import { setAuthCookie } from '../middleware/auth.js'
import { RegisterSchema, LoginSchema } from '../utils/validators.js'

export const auth = Router()

auth.post('/register', async (req, res) => {
  if (env.demoMode) return res.status(403).json({ error: 'Registration is disabled in the demo' })
  try {
    const { email, password } = RegisterSchema.parse(req.body)
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ error: 'Email already registered' })
    const passwordHash = await bcrypt.hash(password, 10)
    const count = await User.countDocuments()
    const role = count === 0 ? 'admin' : 'user'
    const user = await User.create({ email, passwordHash, role })
    const token = jwt.sign({ uid: user._id }, env.jwtSecret, { expiresIn: env.jwtExpires })
    setAuthCookie(res, token)
    res.status(201).json({ id: user._id, email: user.email, role: user.role })
  } catch {
    res.status(400).json({ error: 'Invalid input' })
  }
})

auth.post('/login', async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body)
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ uid: user._id }, env.jwtSecret, { expiresIn: env.jwtExpires })
    setAuthCookie(res, token)
    return res.json({ id: user._id, email: user.email, role: user.role })
  } catch (e) {
    console.error('login error:', e?.message || e)
    return res.status(400).json({ error: 'Invalid input' })
  }
})

auth.post('/logout', async (_req, res) => {
  res.clearCookie('token', { path: '/' })
  res.json({ ok: true })
})

auth.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '')
    if (!token) return res.json({ user: null })
    const { uid } = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(uid).lean()
    if (!user) return res.json({ user: null })
    res.json({ user: { id: user._id, email: user.email, role: user.role } })
  } catch {
    res.json({ user: null })
  }
})

export default auth
