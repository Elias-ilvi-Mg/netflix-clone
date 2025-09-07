import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

export async function requireAuth(req, res, next){
  try {
    const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const payload = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(payload.uid).lean()
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    req.user = { id: user._id, email: user.email, role: user.role } // ⬅️ include role
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

export function requireAdmin(req, res, next){
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  next()
}

export function setAuthCookie(res, token){
  const isProd = (env.nodeEnv === 'production')
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
  })
}
