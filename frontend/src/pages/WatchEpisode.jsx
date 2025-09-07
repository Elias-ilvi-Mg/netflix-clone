import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Player from '../components/Player'
import SkipControls from '../components/SkipControls'
import Seo from '../components/Seo'
import { catalogEpisodesService } from '../services/catalogEpisodes'
import { catalogSeriesService } from '../services/catalogSeries'

export default function WatchEpisode(){
  const { id } = useParams()            // episode _id (Mongo)
  const nav = useNavigate()
  const [episode, setEpisode] = useState(null)
  const [series, setSeries] = useState(null)
  const [siblings, setSiblings] = useState([]) // all episodes for series (ordered)
  const timeRef = useRef({ t: 0, d: 0, video: null })

  useEffect(() => {
    let live = true
    setEpisode(null); setSeries(null); setSiblings([])
    catalogEpisodesService.get(id).then(({ episode, series }) => {
      if (!live) return
      setEpisode(episode); setSeries(series)
      // load siblings
      catalogEpisodesService.list(episode.seriesId).then(({ items }) => {
        if (!live) return
        const ordered = items.sort((a,b) => a.season - b.season || a.episode - b.episode)
        setSiblings(ordered)
      })
    }).catch(e => {
      if (e?.status === 403) return nav('/', { replace: true })
      nav('/404', { replace: true })
    })
    return () => { live = false }
  }, [id])

  const idx = useMemo(() => siblings.findIndex(x => x._id === id), [siblings, id])
  const nextEp = useMemo(() => idx >= 0 ? siblings[idx + 1] : null, [idx, siblings])

  function handleNext(){
    if (nextEp) nav(`/watch/episode/${nextEp._id}`)
  }

  return (
    <main className="container" style={{ padding:'16px 0' }}>
      <Seo title={episode ? `S${episode.season}E${episode.episode} • ${series?.title || ''}` : 'Watch'} />
      {!episode ? (
        <div>Loading…</div>
      ) : (
        <div style={{ position:'relative' }}>
          <Player
            src={episode.streamUrl}
            poster={episode.backdrop || episode.poster || series?.backdrop || ''}
            captions={episode.captions || []}
            mediaId={`${episode.seriesId}-S${episode.season}E${episode.episode}`}
            onTime={(x) => { timeRef.current = x }}
          />
          <SkipControls
            t={timeRef.current.t}
            d={timeRef.current.d}
            introStartSec={episode.introStartSec || 0}
            introEndSec={episode.introEndSec || 0}
            creditsStartSec={episode.creditsStartSec || 0}
            onSeek={(to) => { const v = timeRef.current.video; if (v) v.currentTime = to }}
            onNext={handleNext}
          />
        </div>
      )}
      {episode && (
        <div style={{ marginTop:12 }}>
          <h1 style={{ margin:'8px 0 4px' }}>{series?.title} — S{episode.season}E{episode.episode}: {episode.title}</h1>
          <p style={{ color:'#9ca3af' }}>{episode.overview}</p>
          {nextEp && (
            <button onClick={handleNext} style={{ marginTop:10, background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'10px 14px' }}>
              Play Next: S{nextEp.season}E{nextEp.episode} — {nextEp.title}
            </button>
          )}
        </div>
      )}
    </main>
  )
}
