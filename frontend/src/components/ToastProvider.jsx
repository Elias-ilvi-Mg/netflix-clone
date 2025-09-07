import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg, ms = 3000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ms)
  }, [])
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div style={{
        position:'fixed', right:16, bottom:16, display:'grid', gap:8, zIndex:9999
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background:'rgba(17,17,17,.9)', color:'#fff', border:'1px solid #333',
            padding:'10px 12px', borderRadius:10, boxShadow:'0 6px 20px rgba(0,0,0,.35)'
          }}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)
