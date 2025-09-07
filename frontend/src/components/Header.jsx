import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import styles from './Header.module.css'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import ProfileSwitcher from './ProfileSwitcher'

function initials(email = '') {
  return email.split('@')[0].slice(0, 2).toUpperCase()
}

export default function Header() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [q, setQ] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const { user, logout } = useAuth() || {}
  const [welcomed, setWelcomed] = useState(false)


  function onSubmit(e) {
    e.preventDefault()
    const qq = q.trim()
    if (!qq) return
    nav(`/search?q=${encodeURIComponent(qq)}`)
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand} aria-label="Home">N</Link>

        <nav className={styles.nav} aria-label="Main">
          <Link
            to="/"
            className={pathname==='/' ? styles.active : ''}
            aria-current={pathname==='/' ? 'page' : undefined}
          >
            Home
          </Link>
          <Link
            to="/my-list"
            className={pathname.startsWith('/my-list') ? styles.active : ''}
            aria-current={pathname.startsWith('/my-list') ? 'page' : undefined}
          >
            My List
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/dashboard"
              className={pathname.startsWith('/dashboard') ? styles.active : ''}
              aria-current={pathname.startsWith('/dashboard') ? 'page' : undefined}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <form onSubmit={onSubmit} className={styles.search} role="search">
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search titles"
            aria-label="Search titles"
          />
        </form>

        <div style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* only show profile switcher when logged in to avoid 401s */}
          {user && <ProfileSwitcher />}

          {user && !welcomed && (
            <div style={{ position:'absolute', top:'100%', left:0, width:'100%', background:'#0b0b0b', borderTop:'1px solid #222' }}>
                <div className="container" style={{ padding:'8px 0', color:'#9ca3af', fontSize:14 }}>
                Welcome, <strong>{user.email}</strong> — you’re signed in to the demo.
                <button onClick={()=>setWelcomed(true)} style={{ marginLeft:10, background:'transparent', color:'#fff', border:'1px solid #333', borderRadius:6, padding:'2px 8px' }}>
                    Dismiss
                </button>
                </div>
            </div>
            )}


          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                title={user.email}
                style={{
                  width: 32, height: 32, borderRadius: 8, background: '#1f2937',
                  display: 'grid', placeItems: 'center', fontWeight: 800
                }}
              >
                {initials(user.email)}
              </div>
              <button type="button" onClick={logout} className={styles.logout}>Sign out</button>
            </div>
          ) : (
            <button type="button" onClick={() => setShowAuth(true)} className={styles.login}>Sign in</button>
          )}
        </div>
      </div>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </header>
  )
}
