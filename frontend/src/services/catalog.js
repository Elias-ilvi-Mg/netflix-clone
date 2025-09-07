import { api } from './api'

export const catalogService = {
  byMedia: (mediaId) => api.get(`/api/catalog/by-media/${encodeURIComponent(mediaId)}`),
  list: () => api.get('/api/catalog/list'),
  create: (payload) => api.post('/api/catalog', payload),
  update: (id, patch) => api.patch(`/api/catalog/${encodeURIComponent(id)}`, patch),
  remove: (id) => api.del(`/api/catalog/${encodeURIComponent(id)}`),
}
