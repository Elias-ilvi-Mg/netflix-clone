import mongoose from 'mongoose'

const VerifyTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  token: { type: String, index: true, unique: true },
  purpose: { type: String, enum: ['verify','reset'], index: true },
  expiresAt: { type: Date, index: true },
}, { timestamps: true })

// auto-delete when expired
VerifyTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const VerifyToken = mongoose.model('VerifyToken', VerifyTokenSchema)
