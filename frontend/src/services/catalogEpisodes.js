import { api } from './api'

export const catalogEpisodesService = {
  get: (id) => api.get(`/api/catalog-episodes/episode/${encodeURIComponent(id)}`),
  list: (seriesId) => api.get(`/api/catalog-episodes/list?seriesId=${encodeURIComponent(seriesId)}`),
  create: (payload) => api.post('/api/catalog-episodes', payload),
  update: (id, patch) => api.patch(`/api/catalog-episodes/${encodeURIComponent(id)}`, patch),
  remove: (id) => api.del(`/api/catalog-episodes/${encodeURIComponent(id)}`),
}
