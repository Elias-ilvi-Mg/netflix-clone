// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/auth'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authService.me()
      .then(({ user }) => setUser(user))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const u = await authService.login(email, password)
    setUser(u)
    return u
  }
  const register = async (email, password) => {
    const u = await authService.register(email, password)
    setUser(u)
    return u
  }
  const logout = async () => { await authService.logout(); setUser(null) }

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}
export const useAuth = () => useContext(AuthCtx)
