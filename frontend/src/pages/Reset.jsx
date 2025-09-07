import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { authService } from '../services/auth'

export default function Reset(){
  const [sp] = useSearchParams()
  const token = sp.get('token') || ''
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  async function onSubmit(e){
    e.preventDefault(); setErr('')
    try { await authService.reset(token, password); setDone(true) } catch(e){ setErr(e.message || 'Failed') }
  }
  return (
    <main className="container" style={{padding:'48px 0'}}>
      <Seo title="Reset password" />
      <h1>Reset password</h1>
      {done ? (
        <p>Password updated. <Link to="/">Go sign in</Link>.</p>
      ) : (
        <form onSubmit={onSubmit} style={{display:'grid', gap:12, maxWidth:420}}>
          <input type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} required />
          {err && <div style={{color:'#fca5a5'}}>{err}</div>}
          <button style={{background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'10px 14px'}}>Update</button>
        </form>
      )}
    </main>
  )
}
