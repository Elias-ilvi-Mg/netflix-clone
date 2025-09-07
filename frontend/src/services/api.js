const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001'

async function request(path, opts = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    log = true,      // log server errors by default
    ok404 = false,   // treat 404 as a valid (empty) response
  } = opts

  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const ct = res.headers.get('content-type') || ''
  const isJson = ct.includes('application/json')
  const data = isJson ? await res.json().catch(() => ({})) : undefined

  if (!res.ok) {
    if (ok404 && res.status === 404) return data || {}
    const msg = (data && (data.error || data.message)) || res.statusText
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    // only log 5xx unless explicitly told otherwise
    if (log && res.status >= 500) {
      console.error('API error', res.status, path, msg)
    }
    throw err
  }
  return data
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}
