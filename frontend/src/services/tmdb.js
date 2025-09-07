import axios from 'axios'
import mock from '../data/movies.json'

const KEY = import.meta.env.VITE_TMDB_API_KEY
const hasKey = Boolean(KEY)
const http = axios.create({ baseURL: 'https://api.themoviedb.org/3' })

export async function getTrending() {
  if (!hasKey) return mock.trending
  const { data } = await http.get(`/trending/all/week?api_key=${KEY}`)
  return data.results.map(mapTmdb)
}

export async function searchAll(q) {
  if (!hasKey) {
    const qq = (q || '').toLowerCase()
    return mock.trending.filter(x => x.title?.toLowerCase().includes(qq))
  }
  const { data } = await http.get(`/search/multi?api_key=${KEY}&query=${encodeURIComponent(q)}`)
  return data.results.map(mapTmdb)
}

export async function getById(id, type = 'movie') {
  if (!hasKey) return mock.trending.find(x => String(x.id) === String(id))
  // Try the provided type first; fall back to TV if not found
  try {
    const { data } = await http.get(`/${type}/${id}?api_key=${KEY}`)
    return mapTmdb(data)
  } catch {
    try {
      const { data } = await http.get(`/tv/${id}?api_key=${KEY}`)
      return mapTmdb(data)
    } catch (e) {
      throw e
    }
  }
}

export async function getCredits(id, type = 'movie') {
  if (!hasKey) return []
  try {
    const { data } = await http.get(`/${type}/${id}/credits?api_key=${KEY}`)
    return (data.cast || []).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : '',
    }))
  } catch {
    const { data } = await http.get(`/tv/${id}/credits?api_key=${KEY}`)
    return (data.cast || []).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : '',
    }))
  }
}

export async function getSimilar(id, type = 'movie') {
  if (!hasKey) return []
  try {
    const { data } = await http.get(`/${type}/${id}/similar?api_key=${KEY}`)
    return (data.results || []).map(mapTmdb)
  } catch {
    try {
      const { data } = await http.get(`/tv/${id}/similar?api_key=${KEY}`)
      return (data.results || []).map(mapTmdb)
    } catch {
      return []
    }
  }
}

function mapTmdb(x) {
  return {
    id: x.id,
    title: x.title || x.name,
    overview: x.overview,
    poster: x.poster_path ? `https://image.tmdb.org/t/p/w500${x.poster_path}` : '',
    backdrop: x.backdrop_path ? `https://image.tmdb.org/t/p/original${x.backdrop_path}` : '',
    vote: x.vote_average,
    year: (x.release_date || x.first_air_date || '').slice(0, 4),
    type: x.title ? 'movie' : 'tv',
  }
}
