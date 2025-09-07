import { useState } from 'react'
import Seo from '../components/Seo'
import { authService } from '../services/auth'

export default function Forgot(){
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  async function onSubmit(e){
    e.preventDefault(); setErr('')
    try { await authService.forgot(email); setSent(true) } catch(e){ setErr(e.message || 'Failed') }
  }
  return (
    <main className="container" style={{padding:'48px 0'}}>
      <Seo title="Forgot password" />
      <h1>Forgot password</h1>
      {sent ? (
        <p>Check your email for a reset link (in dev, see backend console).</p>
      ) : (
        <form onSubmit={onSubmit} style={{display:'grid', gap:12, maxWidth:420}}>
          <input type="email" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} required />
          {err && <div style={{color:'#fca5a5'}}>{err}</div>}
          <button style={{background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'10px 14px'}}>Send reset link</button>
        </form>
      )}
    </main>
  )
}
