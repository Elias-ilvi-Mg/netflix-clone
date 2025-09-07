import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { env } from '../config/env.js'

export async function ensureDemoUser(){
  if (!env.demoMode || !env.demoEmail || !env.demoPassword) return
  const exists = await User.findOne({ email: env.demoEmail })
  if (exists) {
    console.log(`👤 Demo user exists: ${env.demoEmail}`)
    return
  }
  const passwordHash = await bcrypt.hash(env.demoPassword, 10)
  await User.create({
    email: env.demoEmail,
    passwordHash,
    role: 'admin',        
    verified: true
  })
  console.log(`✅ Created demo user ${env.demoEmail} / ${env.demoPassword}`)
}
