import { api } from './api'

export const listService = {
  all: () => api.get('/api/list'),
  toggle: (item) => api.post('/api/list/toggle', item),
  remove: (id) => api.del(`/api/list/${encodeURIComponent(id)}`),
}
