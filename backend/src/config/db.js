import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB() {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI is not set. Add it to netflix-backend/.env')
  }

  mongoose.set('strictQuery', true)

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  })

  mongoose.connection.on('error', (err) => {
    console.error('Mongo connection error:', err?.message || err)
  })
  mongoose.connection.on('disconnected', () => {
    console.warn('Mongo disconnected')
  })
}
