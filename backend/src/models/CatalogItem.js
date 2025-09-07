import mongoose from 'mongoose'

const CaptionSchema = new mongoose.Schema({
  label: String,
  srclang: String,
  src: String,
}, { _id: false })

const CatalogItemSchema = new mongoose.Schema({
  mediaId: { type: String, required: true, unique: true, index: true }, // TMDB id as string
  type: { type: String, enum: ['movie','tv'], default: 'movie' },
  title: { type: String, default: '' },
  streamUrl: { type: String, required: true },        // HLS/DASH URL
  poster: { type: String, default: '' },              // optional overrides
  backdrop: { type: String, default: '' },
  captions: { type: [CaptionSchema], default: [] },
  maturity: { type: String, default: 'PG-13' },       // freeform for demo
  kids: { type: Boolean, default: false },            // quick kids flag
  featured: { type: Boolean, default: false },        // for hero rows later
}, { timestamps: true })

export const CatalogItem = mongoose.model('CatalogItem', CatalogItemSchema)
