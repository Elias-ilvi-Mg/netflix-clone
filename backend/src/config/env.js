import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5183',

  mongoUri: process.env.MONGO_URI || '',

  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  jwtExpires: process.env.JWT_EXPIRES || '7d',

  tmdbKey: process.env.TMDB_API_KEY || '',

  demoMode: process.env.DEMO_MODE === 'true',
  demoEmail: process.env.DEMO_EMAIL || '',
  demoPassword: process.env.DEMO_PASSWORD || '',
}
