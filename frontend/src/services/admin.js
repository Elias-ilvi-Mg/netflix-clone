import { api } from './api'

export const adminService = {
  users: () => api.get('/api/admin/users'),
  addUser: (email, password) => api.post('/api/admin/users', { email, password }),
  deleteUser: (id) => api.del(`/api/admin/users/${encodeURIComponent(id)}`),
  setRole: (id, role) => api.post(`/api/admin/users/${encodeURIComponent(id)}/role?_method=PATCH`, { role }),
}
