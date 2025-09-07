import mongoose from 'mongoose'
const PlaybackMetricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },
  mediaId: { type: String, index: true },
  event: { type: String, index: true },
  t: Number,           // current time (sec)
  d: Number,           // duration (sec)
  detail: {},          // any extra (quality level, error message, etc.)
  ua: String,
  ip: String,
}, { timestamps: true })

export const PlaybackMetric = mongoose.model('PlaybackMetric', PlaybackMetricSchema)
