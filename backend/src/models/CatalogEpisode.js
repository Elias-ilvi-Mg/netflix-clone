import mongoose from 'mongoose'

const CaptionSchema = new mongoose.Schema({
  label: String,
  srclang: String,
  src: String,
}, { _id: false })

const CatalogEpisodeSchema = new mongoose.Schema({
  seriesId: { type: String, required: true, index: true }, // TMDB TV id
  season: { type: Number, required: true, index: true },
  episode: { type: Number, required: true, index: true },
  title: { type: String, default: '' },
  overview: { type: String, default: '' },
  runtimeSec: { type: Number, default: 0 },
  streamUrl: { type: String, required: true },
  captions: { type: [CaptionSchema], default: [] },
  poster: { type: String, default: '' },
  backdrop: { type: String, default: '' },
  // Skip windows (seconds); optional
  introStartSec: { type: Number, default: 0 },
  introEndSec: { type: Number, default: 0 },
  creditsStartSec: { type: Number, default: 0 },
}, { timestamps: true })

CatalogEpisodeSchema.index({ seriesId: 1, season: 1, episode: 1 }, { unique: true })

export const CatalogEpisode = mongoose.model('CatalogEpisode', CatalogEpisodeSchema)
