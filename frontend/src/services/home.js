import { api } from './api'
export const homeService = {
  get: () => api.get('/api/home'),
}
