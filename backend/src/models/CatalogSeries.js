import mongoose from 'mongoose'

const CatalogSeriesSchema = new mongoose.Schema({
  seriesId: { type: String, required: true, unique: true, index: true }, // TMDB TV id as string
  title: { type: String, default: '' },
  overview: { type: String, default: '' },
  poster: { type: String, default: '' },
  backdrop: { type: String, default: '' },
  genres: { type: [String], default: [] },
  maturity: { type: String, default: 'TV-14' },
  kids: { type: Boolean, default: false },
  trailerUrl: { type: String, default: '' }, // optional teaser/trailer
  trailerCaptions: { type: [{ label: String, srclang: String, src: String }], default: [] },
}, { timestamps: true })

export const CatalogSeries = mongoose.model('CatalogSeries', CatalogSeriesSchema)
