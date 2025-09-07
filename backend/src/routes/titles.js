import { Router } from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

const http = axios.create({ baseURL: 'https://api.themoviedb.org/3' })


const cache = new Map()
function key(path){ return `tmdb:${path}` }
async function cachedGet(path, ttlMs = 5 * 60 * 1000) {
  const k = key(path)
  const now = Date.now()
  const hit = cache.get(k)
  if (hit && (now - hit.t) < hit.ttl) return hit.data
const data = await cachedGet(`/trending/all/week?api_key=${env.tmdbKey}`)
  cache.set(k, { t: now, ttl: ttlMs, data })
  return data
}


function mapTmdb(x){
  return {
    id: String(x.id),
    title: x.title || x.name,
    overview: x.overview,
    poster: x.poster_path ? `https://image.tmdb.org/t/p/w500${x.poster_path}` : '',
    backdrop: x.backdrop_path ? `https://image.tmdb.org/t/p/original${x.backdrop_path}` : '',
    vote: x.vote_average,
    year: (x.release_date || x.first_air_date || '').slice(0,4),
    type: x.title ? 'movie' : 'tv',
    adult: !!x.adult,
  }
}

async function isKidsMode(req){
  // explicit query wins (useful for testing without login)
  if (req.query.kids === '1' || req.query.kids === 'true') return true
  // If logged in, infer from active profile
  try {
    const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '')
    if (!token) return false
    const { uid } = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(uid).lean()
    if (!user) return false
    const id = user.activeProfileId
    const p = (user.profiles || []).find(pr => pr.id === id)
    return !!p?.kids
  } catch {
    return false
  }
}

export const titles = Router()

// GET /api/titles/trending
titles.get('/trending', async (req, res) => {
  const kids = await isKidsMode(req)
  try {
    const { data } = await http.get(`/trending/all/week?api_key=${env.tmdbKey}`)
    let items = (data.results || []).map(mapTmdb)
    if (kids) items = items.filter(x => !x.adult)
    res.json({ items })
  } catch {
    res.status(500).json({ error: 'TMDB error' })
  }
})

// GET /api/titles/search?q=...
titles.get('/search', async (req, res) => {
  const kids = await isKidsMode(req)
  const q = req.query.q || ''
  if (!q) return res.json({ items: [] })
  try {
    const { data } = await http.get(`/search/multi?api_key=${env.tmdbKey}&query=${encodeURIComponent(q)}&include_adult=${kids ? 'false' : 'true'}`)
    let items = (data.results || []).map(mapTmdb)
    if (kids) items = items.filter(x => !x.adult)
    res.json({ items })
  } catch {
    res.status(500).json({ error: 'TMDB error' })
  }
})

// GET /api/titles/:id
titles.get('/:id', async (req, res) => {
  const kids = await isKidsMode(req)
  const id = req.params.id
  async function fetchMovie(){ return http.get(`/movie/${id}?api_key=${env.tmdbKey}`).then(r => r.data) }
  async function fetchTV(){ return http.get(`/tv/${id}?api_key=${env.tmdbKey}`).then(r => r.data) }

  try {
    const data = await fetchMovie().catch(fetchTV)
    const item = mapTmdb(data)
    if (kids && item.adult) return res.status(404).json({ error: 'Not found' })
    return res.json({ item })
  } catch {
    return res.status(404).json({ error: 'Not found' })
  }
})

// GET /api/titles/:id/credits
titles.get('/:id/credits', async (req, res) => {
  const id = req.params.id
  const pick = (data) => (data.cast || []).map(c => ({
    id: String(c.id), name: c.name, character: c.character,
    profile: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : ''
  }))
  try {
    const { data } = await http.get(`/movie/${id}/credits?api_key=${env.tmdbKey}`)
    return res.json({ items: pick(data) })
  } catch {
    try {
      const { data } = await http.get(`/tv/${id}/credits?api_key=${env.tmdbKey}`)
      return res.json({ items: pick(data) })
    } catch { return res.json({ items: [] }) }
  }
})

// GET /api/titles/:id/similar
titles.get('/:id/similar', async (req, res) => {
  const kids = await isKidsMode(req)
  const id = req.params.id
  async function fetchMovie(){ return http.get(`/movie/${id}/similar?api_key=${env.tmdbKey}`).then(r => r.data) }
  async function fetchTV(){ return http.get(`/tv/${id}/similar?api_key=${env.tmdbKey}`).then(r => r.data) }

  try {
    const data = await fetchMovie().catch(fetchTV)
    let items = (data.results || []).map(mapTmdb)
    if (kids) items = items.filter(x => !x.adult)
    return res.json({ items })
  } catch {
    return res.json({ items: [] })
  }
})

export default titles
