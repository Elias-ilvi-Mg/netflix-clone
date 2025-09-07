// src/components/Player.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import Hls from 'hls.js'
import { api } from '../services/api'

function useThrottle(fn, delay = 5000) {
  const last = useRef(0)
  return (...args) => {
    if (!METRICS_ON) return // 🚫 disabled outside dev
    const now = Date.now()
    if (now - last.current >= delay) { last.current = now; fn(...args) }
  }
}

export default function Player({ src, poster, captions = [], mediaId, onTime }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [levels, setLevels] = useState([])
  const [level, setLevel] = useState(-1) // -1 = auto
  const [error, setError] = useState('')
  const METRICS_ON =
  import.meta.env.MODE === 'development' &&
  String(import.meta.env.VITE_DEMO_MODE).toLowerCase() !== 'true'


  const send = useThrottle(async (payload) => {
    try { await api.post('/api/metrics/playback', payload) } catch {}
  }, 5000)

  // init HLS/native
  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    // clean previous
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }

    setError('')
    setLevels([]); setLevel(-1)

    const onBasic = () => {
      const t = video.currentTime, d = video.duration
      send({ event: 'time', mediaId, t, d })
      try { onTime?.({ t, d, video }) } catch { /* noop */ }
    }
    const onPlay = () => send({ event: 'play', mediaId, t: video.currentTime, d: video.duration })
    const onPause = () => send({ event: 'pause', mediaId, t: video.currentTime, d: video.duration })
    const onEnded = () => send({ event: 'ended', mediaId, t: video.currentTime, d: video.duration })
    const onError = (e) => { setError('Playback error'); send({ event: 'error', mediaId, detail: String(e?.message || e) }) }

    video.addEventListener('timeupdate', onBasic)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    video.addEventListener('error', onError)

    if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 30, enableWorker: true })
      hlsRef.current = hls
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hls.levels || [])
        setLevel(hls.currentLevel ?? -1)
        video.play().catch(()=>{})
      })
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setLevel(data.level ?? -1)
        send({ event: 'quality', mediaId, detail: { level: data.level } })
      })
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data?.fatal) setError('Fatal playback error')
      })
      hls.loadSource(src)
      hls.attachMedia(video)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native
      video.src = src
      video.addEventListener('loadedmetadata', () => video.play().catch(()=>{}), { once: true })
    } else {
      setError('HLS not supported in this browser')
    }

    return () => {
      video.removeEventListener('timeupdate', onBasic)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('error', onError)
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, mediaId])

  // quality change
  function changeLevel(idx) {
    const hls = hlsRef.current
    if (!hls) return
    hls.currentLevel = Number(idx)
  }

  // keyboard controls
  function onKeyDown(e) {
    const v = videoRef.current; if (!v) return
    if (e.key === ' ') { e.preventDefault(); v.paused ? v.play() : v.pause() }
    if (e.key === 'ArrowRight') { v.currentTime = Math.min((v.currentTime || 0) + 5, v.duration || 0) }
    if (e.key === 'ArrowLeft') { v.currentTime = Math.max((v.currentTime || 0) - 5, 0) }
    if (e.key.toLowerCase() === 'm') { v.muted = !v.muted }
    if (e.key.toLowerCase() === 'f') {
      if (document.fullscreenElement) document.exitFullscreen()
      else v.requestFullscreen?.()
    }
  }

  return (
    <div style={{ position:'relative', background:'#000', borderRadius:12, overflow:'hidden' }}>
      <video
        ref={videoRef}
        poster={poster || ''}
        controls
        playsInline
        preload="metadata"
        onKeyDown={onKeyDown}
        style={{ width:'100%', height:'auto', display:'block', outline:'none' }}
      >
        {captions.map((c, i) => (
          <track key={i} kind="subtitles" srcLang={c.srclang} label={c.label} src={c.src} default={i===0} />
        ))}
      </video>

      {/* quality menu */}
      {levels.length > 0 && (
        <div style={{
          position:'absolute', right:12, top:12,
          background:'rgba(0,0,0,.6)', border:'1px solid #333', borderRadius:8, padding:'6px 8px', color:'#fff'
        }}>
          <label style={{ fontSize:12, marginRight:6 }}>Quality</label>
          <select
            value={level}
            onChange={(e)=>changeLevel(e.target.value)}
            style={{ background:'transparent', color:'#fff', border:'1px solid #444', borderRadius:6, padding:'4px 6px' }}
          >
            <option value={-1}>Auto</option>
            {levels.map((L, idx) => (
              <option key={idx} value={idx}>{L.height ? `${L.height}p` : `${Math.round(L.bitrate/1000)}kbps`}</option>
            ))}
          </select>
        </div>
      )}

      {!!error && (
        <div style={{
          position:'absolute', left:12, bottom:12,
          background:'rgba(220,38,38,.9)', color:'#fff', borderRadius:8, padding:'8px 10px'
        }}>{error}</div>
      )}
    </div>
  )
}
