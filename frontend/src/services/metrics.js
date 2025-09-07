import { api } from './api'

export const metricsService = {
  summary: async (days = 7) => {
    try {
      return await api.get(`/api/metrics/summary?days=${days}`, { log: false })
    } catch (e) {
      if (e.status === 403) return { rows: [] }  // demo or blocked → silent empty
      throw e
    }
  },
  top: async (limit = 10) => {
    try {
      return await api.get(`/api/metrics/top?limit=${limit}`, { log: false })
    } catch (e) {
      if (e.status === 403) return { items: [] } // demo or blocked → silent empty
      throw e
    }
  },
}
