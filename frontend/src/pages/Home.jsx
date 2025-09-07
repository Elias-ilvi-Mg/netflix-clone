import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { homeService } from '../services/home'
import { getTrending } from '../services/tmdb'
import { catalogSeriesService } from '../services/catalogSeries'
import { getStreamFor } from '../data/demoStream'
import Seo from '../components/Seo'
import SmartImg from '../components/SmartImg'

/* -------------------------- Featured hero w/ preview -------------------------- */
function Featured({ item }) {
  const [trailerUrl, setTrailerUrl] = useState('')
  const [fallbackPoster, setFallbackPoster] = useState(item?.backdrop || item?.poster || '')
  const videoRef = useRef(null)

  const previewUrl = useMemo(() => {
    if (trailerUrl) return trailerUrl
    const s = item ? getStreamFor(item) : null
    return s?.src || ''
  }, [item, trailerUrl])

  // Try to fetch a trailer for TV series that exist in our catalog
  useEffect(() => {
    let live = true
    async function load() {
      if (!item || item.type !== 'tv') return
      try {
        const { series } = await catalogSeriesService.bySeries(item.id)
        if (!live) return
        if (series?.trailerUrl) setTrailerUrl(series.trailerUrl)
        setFallbackPoster(series?.backdrop || series?.poster || fallbackPoster)
      } catch { /* fine, fallback to poster/demo stream */ }
    }
    load()
    return () => { live = false }
  }, [item])

  // Autoplay (muted) when ready
  useEffect(() => {
    const v = videoRef.current
    if (!v || !previewUrl) return
    const start = () => { v.muted = true; v.play().catch(()=>{}) }
    v.addEventListener('canplay', start, { once: true })
    return () => v.removeEventListener('canplay', start)
  }, [previewUrl])

  if (!item) return null
  const supportsVideo = previewUrl && (previewUrl.endsWith('.mp4') || previewUrl.endsWith('.m3u8'))

  return (
    <section
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #1f1f1f',
        background: '#0b0b0b',
        isolation: 'isolate',
        /* Taller hero so the pushed-down content never clips */
        minHeight: 'clamp(420px, 52vw, 720px)',
        marginBottom: 18
      }}
    >
      {/* Background image */}
      {fallbackPoster && (
        <div
          aria-hidden
          style={{
            position:'absolute', inset:0,
            backgroundImage:`url(${fallbackPoster})`,
            backgroundSize:'cover',
            backgroundPosition:'center',
            filter:'brightness(.5) saturate(1.05)',
            transform:'scale(1.02)',
            zIndex:0
          }}
        />
      )}

      {/* Video preview */}
      {supportsVideo && (
        <video
          ref={videoRef}
          src={previewUrl}
          playsInline
          muted
          loop
          preload="metadata"
          poster={fallbackPoster || undefined}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', zIndex:0 }}
        />
      )}

      {/* ⬇️ DETAILS BLOCK — pushed down, responsive, centered */}
      <div
        style={{
          position:'relative',
          zIndex:1,
          background:'linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.65) 70%, rgba(0,0,0,.75) 100%)',
          display:'grid',
          placeItems:'center',
          padding:'22px 16px',
          /* target -57vh, but allow flex for tiny and huge screens */
          bottom: 'clamp(-64vh, -57vh, -36vh)',
          textAlign:'center'
        }}
      >
        <div style={{ maxWidth:'min(92%, 1100px)' }}>
          <h1 style={{ margin:0, fontSize:'clamp(22px, 3.2vw, 36px)' }}>{item.title}</h1>
          <p style={{
            margin:'8px auto 14px',
            color:'#d1d5db',
            fontSize:'clamp(13px, 1.4vw, 16px)',
            lineHeight:1.6,
            maxWidth:'80ch'
          }}>
            {item.overview}
          </p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
            <Link
              to={`/title/${item.id}`}
              style={{
                display:'inline-grid', placeItems:'center',
                padding:'10px 14px', borderRadius:10, fontWeight:700,
                background:'var(--accent, #e50914)', color:'#fff', textDecoration:'none'
              }}
            >
              Play
            </Link>
            <Link
              to={`/title/${item.id}`}
              style={{
                display:'inline-grid', placeItems:'center',
                padding:'10px 14px', borderRadius:10, fontWeight:700,
                background:'#101010', border:'1px solid #2a2a2a', color:'#e5e7eb', textDecoration:'none'
              }}
            >
              More info
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- Rows grid -------------------------------- */
function Row({ title, items = [] }) {
  return (
    <section style={{ marginBottom: 18 }}>
      <h2 style={{ margin:'0 0 8px', textAlign:'center' }}>{title}</h2>
      <div style={{
        display:'grid',
        gridAutoFlow:'column',
        gridAutoColumns:'minmax(150px, 1fr)',
        gap:10,
        overflowX:'auto',
        paddingBottom:6
      }}>
        {items.map(it => (
          <Link
            key={`${it.type}-${it.id}`}
            to={`/title/${it.id}`}
            style={{ display:'grid', gap:6, textDecoration:'none', color:'#fff', position:'relative' }}
          >
            {it._catalog && (
              <span style={{
                position:'absolute', top:6, left:6, fontSize:11,
                background:'rgba(0,0,0,.6)', padding:'2px 6px', borderRadius:6,
                border:'1px solid #222'
              }}>Catalog</span>
            )}
            {it.poster
              ? <SmartImg src={it.poster} alt={it.title} />
              : <div style={{ background:'#111', border:'1px solid #222', borderRadius:12, height:220 }} />
            }
            <div style={{
              fontSize:13, color:'#d1d5db',
              whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden',
              textAlign:'center'
            }}>
              {it.title}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* --------------------------------- Page ---------------------------------- */
export default function Home(){
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let live = true
    async function load(){
      try {
        const { rows } = await homeService.get()
        if (!live) return
        if (rows && rows.length) {
          setRows(rows)
        } else {
          const items = await getTrending()
          if (!live) return
          setRows([{ key:'trending', title:'Trending Now', items }])
        }
      } finally {
        if (live) setLoading(false)
      }
    }
    load()
    return () => { live = false }
  }, [])

  const featured = useMemo(() => {
    const catalogRow = rows.find(r => r.key === 'catalog') || rows[0]
    return catalogRow?.items?.[0] || null
  }, [rows])

  return (
    <main className="container" style={{ padding:'16px 0' }}>
      <Seo title="Home" />
      {featured && <Featured item={featured} />}
      {loading && <div style={{ textAlign:'center' }}>Loading…</div>}
      {!loading && rows.map(r => <Row key={r.key} title={r.title} items={r.items} />)}
      {!loading && rows.length === 0 && <div style={{ color:'#9ca3af', textAlign:'center' }}>Nothing to show yet.</div>}
    </main>
  )
}
