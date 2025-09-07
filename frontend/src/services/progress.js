import { api } from './api'

export const progressService = {
  all: () => api.get('/api/progress'),
  save: (mediaId, t, d) => api.post('/api/progress', { mediaId, t, d }),
  clear: (mediaId) => api.del(`/api/progress/${encodeURIComponent(mediaId)}`),
}
