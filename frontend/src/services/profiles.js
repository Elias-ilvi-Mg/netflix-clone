import { api } from './api'

export const profileService = {
  all: () => api.get('/api/profiles'),
  create: (name, kids=false) => api.post('/api/profiles', { name, kids }),
  update: (id, data) => api.post(`/api/profiles/${id}?_method=PATCH`, data),
  remove: (id) => api.del(`/api/profiles/${id}`),
  setActive: (id) => api.post('/api/profiles/active', { id }),
}
