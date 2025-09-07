import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getById } from '../services/tmdb'
import Player from '../components/Player'
import { getStreamFor } from '../data/demoStream'
import { catalogService } from '../services/catalog'
import Seo from '../components/Seo'

export default function Watch(){
  const { id } = useParams()
  const nav = useNavigate()
  const [item, setItem] = useState(null)
  const [catalog, setCatalog] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    setItem(null); setCatalog(null); setError('')
    getById(id).then(x => { if (live) setItem(x) })
    catalogService.byMedia(id)
      .then(({ item }) => { if (live) setCatalog(item) })
      .catch(e => {
        // 403 means kids profile blocked; bounce to details/home with message
        if (e?.status === 403) { setError('This title is blocked for Kids profile'); setTimeout(()=>nav('/'), 1500) }
      })
    return () => { live = false }
  }, [id])

  if (!item) return <main className="container" style={{ padding:'32px 0' }}>Loading…</main>

  const stream = catalog
    ? { src: catalog.streamUrl, poster: catalog.backdrop || catalog.poster || item.backdrop || item.poster, captions: catalog.captions || [] }
    : getStreamFor(item)

  return (
    <main className="container" style={{ padding:'16px 0' }}>
      <Seo title={`Watch • ${item.title}`} />
      <h1 style={{ margin:'8px 0 12px' }}>{item.title}</h1>
      {error && <div style={{ color:'#fca5a5', marginBottom:12 }}>{error}</div>}
      <Player
        src={stream.src}
        poster={stream.poster}
        captions={stream.captions}
        mediaId={item.id}
      />
      <p style={{ color:'#9ca3af', marginTop:12 }}>{item.overview}</p>
    </main>
  )
}
