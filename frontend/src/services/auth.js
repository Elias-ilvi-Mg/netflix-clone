import { api } from './api'

export const authService = {
  register: (email, password) =>
    api.post('/api/auth/register', { email, password }),
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
logout: () => api.post('/api/auth/logout', {}),
forgot: (email) => api.post('/api/auth/forgot', { email }),
reset: (token, password) => api.post('/api/auth/reset', { token, password }),

  me: () => api.get('/api/auth/me'),
}
