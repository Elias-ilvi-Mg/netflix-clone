import { useState, useEffect } from 'react'
import styles from './AuthModal.module.css'
import { useAuth } from '../context/AuthContext'
import { useToast } from './ToastProvider'
import { Link } from 'react-router-dom'

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || 'demo@example.com'
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'demo1234'

export default function AuthModal({ open, onClose }){
  const { login } = useAuth()
  const { push } = useToast()
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [error, setError] = useState('')
  if (!open) return null

  async function onSubmit(e){
    e.preventDefault(); setError('')
    try {
      const u = await login(email, password)
      push(`Signed in as ${u.email}`)
      onClose?.()
    } catch (e) { setError(e.message || 'Failed') }
  }

  async function loginDemo(){
    try {
      const u = await login(DEMO_EMAIL, DEMO_PASSWORD)
      push(`Signed in as ${u.email}`)
      onClose?.()
    } catch (e) { setError(e.message || 'Demo login failed') }
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal>
      <div className={styles.modal}>
        <div className={styles.header}>
          <strong>Sign in</strong>
          <button onClick={onClose} aria-label="Close">×</button>
        </div>

        <div style={{ padding: '10px 14px', borderBottom: '1px solid #262626', background:'#0d0d0d' }}>
          <div style={{ color:'#9ca3af', fontSize:14 }}>
            Demo login — use:
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'6px 10px', alignItems:'center', marginTop:6, fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            <div style={{ color:'#9ca3af' }}>Email</div><div>{DEMO_EMAIL}</div>
            <div style={{ color:'#9ca3af' }}>Password</div><div>{DEMO_PASSWORD}</div>
          </div>
          <div style={{ marginTop:8 }}>
            <button onClick={loginDemo} className={styles.primary} style={{ width:'100%' }}>Sign in as demo</button>
          </div>
        </div>

        <form onSubmit={onSubmit} className={styles.body}>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <div style={{display:'flex', justifyContent:'space-between', fontSize:14}}>
            <span />
            <Link to="/forgot">Forgot password?</Link>
          </div>
          {!!error && <div className={styles.error}>{error}</div>}
          <button className={styles.primary} type="submit">Sign in</button>

          <div style={{ color:'#9ca3af', fontSize:13 }}>
            Registration is <strong>disabled</strong> in demo.
          </div>
        </form>
      </div>
    </div>
  )
}
