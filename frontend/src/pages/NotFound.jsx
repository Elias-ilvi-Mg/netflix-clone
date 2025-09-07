// src/pages/NotFound.jsx
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function NotFound(){
  return (
    <main className="container" style={{ padding: '64px 0' }}>
      <Seo title="404 – Not Found" />
      <h1 style={{ marginTop: 0 }}>404 – Page Not Found</h1>
      <p>The page you are looking for doesn’t exist.</p>
      <Link to="/" style={{ background: 'var(--accent)', color: '#fff', padding: '10px 16px', borderRadius: 8 }}>
        Go Home
      </Link>
    </main>
  )
}
