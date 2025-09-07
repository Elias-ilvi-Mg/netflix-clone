import { Router } from 'express'
import axios from 'axios'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { CatalogItem } from '../models/CatalogItem.js'
import { CatalogSeries } from '../models/CatalogSeries.js'

export const home = Router()

// tiny TMDB helper
const http = axios.create({ baseURL: 'https://api.themoviedb.org/3' })
async function tmdb(path) {
  const join = path.includes('?') ? '&' : '?'
  const { data } = await http.get(`${path}${join}api_key=${env.tmdbKey || ''}`)
  return data
}
function mapTmdb(x) {
  const type = x.media_type || (x.first_air_date ? 'tv' : 'movie')
  return {
    id: String(x.id),
    type,
    title: x.title || x.name || '',
    poster: x.poster_path ? `https://image.tmdb.org/t/p/w342${x.poster_path}` : '',
    backdrop: x.backdrop_path ? `https://image.tmdb.org/t/p/w780${x.backdrop_path}` : '',
    year: (x.release_date || x.first_air_date || '').slice(0, 4),
    rating: x.vote_average || 0,
    overview: x.overview || '',
  }
}
async function isKidsMode(req) {
  try {
    const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '')
    if (!token) return false
    // we only need the user doc to resolve the active profile
    const user = await User.findOne({}).where('_id').equals(JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).uid).lean()
    const p = (user?.profiles || []).find(pr => pr.id === user?.activeProfileId)
    return !!p?.kids
  } catch { return false }
}

// GET /api/home
home.get('/', async (req, res) => {
  try {
    const kids = await isKidsMode(req)

    // 1) Always include Trending (TMDB)
    let trending = []
    try {
      const data = await tmdb('/trending/all/week')
      trending = (data.results || []).slice(0, 18).map(mapTmdb)
    } catch { trending = [] }

    // 2) Catalog (movies & series) — filter for kids if needed
    const catFilter = kids ? { kids: true } : {}
    const [catMovies, catSeries] = await Promise.all([
      CatalogItem.find(catFilter).sort({ updatedAt: -1 }).limit(24).lean(),
      CatalogSeries.find(catFilter).sort({ updatedAt: -1 }).limit(24).lean(),
    ])
    const catalogNormalized = [
      ...catMovies.map(m => ({
        id: String(m.mediaId),
        type: m.type || 'movie',
        title: m.title || '',
        poster: m.poster || '',
        backdrop: m.backdrop || '',
        year: '',
        rating: 0,
        overview: '',
        _catalog: true,
      })),
      ...catSeries.map(s => ({
        id: String(s.seriesId),
        type: 'tv',
        title: s.title || '',
        poster: s.poster || '',
        backdrop: s.backdrop || '',
        year: '',
        rating: 0,
        overview: '',
        _catalog: true,
      })),
    ]

    // 3) “Because you watched” — seed from catalog or trending
    let seed = catalogNormalized[0] || trending[0]
    let similar = []
    if (seed) {
      try {
        const path = seed.type === 'tv'
          ? `/tv/${seed.id}/similar`
          : `/movie/${seed.id}/similar`
        const data = await tmdb(path)
        similar = (data.results || []).slice(0, 18).map(mapTmdb)
      } catch { similar = [] }
    }

    const rows = []
    if (trending.length) rows.push({ key: 'trending', title: 'Trending Now', items: trending })
    if (catalogNormalized.length) rows.push({ key: 'catalog', title: kids ? 'For Kids (Demo Catalog)' : 'From Our Catalog', items: catalogNormalized })
    if (similar.length) rows.push({ key: 'because', title: `Because you watched ${seed?.title || ''}`.trim(), items: similar })

    // fallback if everything empty
    if (!rows.length) rows.push({ key: 'empty', title: 'Popular', items: trending })

    res.json({ rows })
  } catch (e) {
    console.error('home error:', e?.message || e)
    res.status(200).json({ rows: [] })
  }
})
