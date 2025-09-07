import { Router } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { VerifyToken } from '../models/VerifyToken.js'
import { sendMail, appUrl } from '../utils/mailer.js'

export const authExtra = Router()

function newToken() { return crypto.randomBytes(32).toString('hex') }

authExtra.post('/forgot', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const user = await User.findOne({ email })
  if (user) {
    const token = await VerifyToken.create({
      userId: user._id, token: newToken(), purpose: 'reset',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60) // 1h
    })
    const link = appUrl(`/reset?token=${token.token}`)
    await sendMail(user.email, 'Reset your password',
      `<p>Reset your password: <a href="${link}">${link}</a></p>`,
      `Reset your password: ${link}`)
  }
  // Always 200 to avoid user enumeration
  res.json({ ok: true })
})

authExtra.post('/reset', async (req, res) => {
  const { token, password } = req.body || {}
  const row = await VerifyToken.findOne({ token, purpose: 'reset' })
  if (!row || row.expiresAt < new Date()) return res.status(400).json({ error: 'Invalid or expired token' })
  const user = await User.findById(row.userId)
  if (!user) return res.status(400).json({ error: 'Invalid token' })
  user.passwordHash = await bcrypt.hash(String(password), 10)
  await user.save()
  await VerifyToken.deleteMany({ userId: user._id, purpose: 'reset' })
  res.json({ ok: true })
})

authExtra.get('/verify/:token', async (req, res) => {
  const token = await VerifyToken.findOne({ token: req.params.token, purpose: 'verify' })
  if (!token || token.expiresAt < new Date()) return res.status(400).json({ error: 'Invalid or expired token' })
  const user = await User.findById(token.userId)
  if (!user) return res.status(400).json({ error: 'Invalid token' })
  user.verified = true
  await user.save()
  await VerifyToken.deleteMany({ userId: user._id, purpose: 'verify' })
  res.json({ ok: true })
})
