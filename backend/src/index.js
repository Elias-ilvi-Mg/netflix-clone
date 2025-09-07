import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import { createApp } from './app.js'
import { ensureDemoUser } from './utils/ensureDemoUser.js'

const app = createApp()
await connectDB()
await ensureDemoUser()

;(async () => {
  try {
    await connectDB()
    console.log('✅ Mongo connected')
    await ensureDemoUser()
  } catch (e) {
    console.error('⚠️  Mongo connection failed:', e?.message || e)
  }
  app.listen(env.port, () => console.log(`🚀 API on http://localhost:${env.port}`))
})()
