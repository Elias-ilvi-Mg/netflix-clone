import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getById, getCredits, getSimilar } from '../services/tmdb'
import { catalogSeriesService } from '../services/catalogSeries'
import SmartImg from '../components/SmartImg'
import Seo from '../components/Seo'
import styles from './Details.module.css'

export default function Details(){
  const { id } = useParams()
  const nav = useNavigate()
  const [item, setItem] = useState(null)
  const [cast, setCast] = useState([])
  const [similar, setSimilar] = useState([])
  const [series, setSeries] = useState(null)
  const [seasons, setSeasons] = useState({})
  const [seasonNum, setSeasonNum] = useState(null)

  useEffect(() => {
    let live = true
    setItem(null); setCast([]); setSimilar([]); setSeries(null); setSeasons({}); setSeasonNum(null)
    getById(id).then(it => { if (!live) return; setItem(it) })
    getCredits(id).then(setCast).catch(()=>{})
    getSimilar(id).then(setSimilar).catch(()=>{})
    catalogSeriesService.bySeries(id)
      .then(({ series, seasons }) => {
        setSeries(series); setSeasons(seasons || {})
        const keys = Object.keys(seasons || {})
        if (keys.length) setSeasonNum(Number(keys[0]))
      })
      .catch(()=>{})
    return () => { live = false }
  }, [id])

  const availableSeasons = useMemo(() => Object.keys(seasons).map(n => Number(n)).sort((a,b)=>a-b), [seasons])
  const episodes = useMemo(() => (seasonNum != null ? (seasons[seasonNum] || []) : []), [seasons, seasonNum])

  if (!item) return <main className="container" style={{ padding:'32px 0' }}>Loading…</main>

  return (
    <main className="container" style={{ padding:'16px 0' }}>
      <Seo title={item.title} />
      <div className={styles.hero}>
        {item.backdrop && <div className={styles.bg} style={{ backgroundImage:`url(${item.backdrop})` }} />}
        <div className={styles.fade}>
          <h1>{item.title}</h1>
          <p className={styles.overview}>{item.overview}</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <Link to={`/watch/${item.id}`} className={styles.cta}>Play</Link>
            {series?.trailerUrl && <a href={series.trailerUrl} target="_blank" rel="noreferrer" className={styles.secondary}>Watch Trailer</a>}
          </div>
        </div>
      </div>

      {/* Series panel if cataloged */}
      {series && availableSeasons.length > 0 && (
        <section style={{ marginTop:16 }}>
          <h2>Episodes</h2>
          <div style={{ display:'flex', gap:8, alignItems:'center', margin:'8px 0' }}>
            <span style={{ color:'#9ca3af' }}>Season:</span>
            <select value={seasonNum ?? ''} onChange={e=>setSeasonNum(Number(e.target.value))}
              style={{ background:'#111', color:'#fff', border:'1px solid #374151', borderRadius:6, padding:'6px 8px' }}>
              {availableSeasons.map(s => <option key={s} value={s}>S{s}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gap:10 }}>
            {episodes.map(ep => (
              <div key={ep._id} style={{ display:'grid', gridTemplateColumns:'140px 1fr auto', gap:12, alignItems:'center', border:'1px solid #262626', borderRadius:12, overflow:'hidden' }}>
                <div style={{ width:140, height:80, background:'#111' }}>
                  {ep.poster && <img src={ep.poster} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                </div>
                <div style={{ padding:'8px 0' }}>
                  <div style={{ fontWeight:700 }}>E{ep.episode} • {ep.title || 'Episode'}</div>
                  <div style={{ color:'#9ca3af', fontSize:14, marginTop:2, lineHeight:1.3 }}>{ep.overview || ''}</div>
                </div>
                <div style={{ paddingRight:12 }}>
                  <Link to={`/watch/episode/${ep._id}`} className={styles.cta}>Play</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar row (kept minimal) */}
      {similar.length > 0 && (
        <section style={{ marginTop:20 }}>
          <h2>More Like This</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12 }}>
            {similar.map(s => (
              <Link to={`/title/${s.id}`} key={s.id} className={styles.card}>
                {s.poster
                  ? <SmartImg src={s.poster} alt={s.title} />
                  : <div className={styles.fallback} />
                }
                <div className={styles.cardTitle}>{s.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
