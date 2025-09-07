import { api } from './api'

export const catalogSeriesService = {
  bySeries: (seriesId) =>
    api.get(`/api/catalog-series/by-series/${encodeURIComponent(seriesId)}`, {
      log: false,   // don’t console.error on non-5xx
      ok404: true,  // 404 → return {}
    }),
  list: () => api.get('/api/catalog-series/list'),
  create: (payload) => api.post('/api/catalog-series', payload),
  update: (id, patch) => api.patch(`/api/catalog-series/${encodeURIComponent(id)}`, patch),
  remove: (id) => api.del(`/api/catalog-series/${encodeURIComponent(id)}`),
}
