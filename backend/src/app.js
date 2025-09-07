import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import methodOverride from 'method-override'
import compression from 'compression'
import { metrics } from './routes/metrics.js'

import { env } from './config/env.js'
import { auth } from './routes/auth.js'
import { authExtra } from './routes/auth-extra.js'
import { list } from './routes/list.js'
import { progress } from './routes/progress.js'
import { titles } from './routes/titles.js'
import { profiles } from './routes/profiles.js'
import { admin } from './routes/admin.js'
import { catalog } from './routes/catalog.js'
import { catalogSeries } from './routes/catalog-series.js'
import { catalogEpisodes } from './routes/catalog-episodes.js'
import { home } from './routes/home.js'




export function createApp () {
  const app = express()
  app.set('trust proxy', 1)

  // CORS early
  app.use(cors({
    origin: (origin, cb) => {
      const allow = [env.clientOrigin].filter(Boolean)
      if (!origin || allow.includes(origin)) return cb(null, true)
      return cb(null, false)
    },
    credentials: true
  }))

  app.use(helmet({
    // don’t block cross-origin media (images/HLS) if you ever serve them
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }))
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.use(compression())

  // Support POST + ?_method=PATCH/DELETE used by the frontend
  app.use(methodOverride((req) => {
    const m = req.query?._method
    return typeof m === 'string' ? m.toUpperCase() : false
  }))

  // Basic API rate limit
  const limiter = rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false })
  app.use('/api', limiter)

  // Health
  app.get('/health', (_req, res) => res.json({ ok: true }))

  // Routes
  app.use('/api/auth', auth)
  app.use('/api/auth', authExtra)
  app.use('/api/list', list)
  app.use('/api/titles', titles)
  app.use('/api/progress', progress)
  app.use('/api/profiles', profiles)
  app.use('/api/admin', admin)
  app.use('/api/metrics', metrics)
  app.use('/api/catalog', catalog)
  app.use('/api/catalog-series', catalogSeries)
  app.use('/api/catalog-episodes', catalogEpisodes)
  app.use('/api/home', home)





  // 404
  app.use((req, res) => res.status(404).json({ error: 'Not found' }))

  // Error handler (last)
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(err.status || 500).json({ error: 'Server error' })
  })

  return app
}
