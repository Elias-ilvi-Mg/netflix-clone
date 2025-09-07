import mongoose from 'mongoose'


const ProgressSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
mediaId: { type: String, index: true },
t: Number, // currentTime
d: Number, // duration
}, { timestamps: true })


ProgressSchema.index({ userId: 1, mediaId: 1 }, { unique: true })


export const Progress = mongoose.model('Progress', ProgressSchema)