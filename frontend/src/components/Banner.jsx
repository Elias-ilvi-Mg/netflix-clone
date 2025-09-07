import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import styles from './Banner.module.css'

export default function Banner({ item, teaserSrc }) {
  const videoRef = useRef(null)
  const [canPlay, setCanPlay] = useState(false)
  const [muted, setMuted] = useState(true)
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  useEffect(() => {
    if (!teaserSrc || prefersReduced) return
    const v = videoRef.current; if (!v) return
    const onCanPlay = () => { setCanPlay(true); v.play().catch(()=>{}) }
    v.addEventListener('canplay', onCanPlay)
    return () => v.removeEventListener('canplay', onCanPlay)
  }, [teaserSrc, prefersReduced])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const ob = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) v.pause()
      else if (canPlay && muted && !prefersReduced) v.play().catch(()=>{})
    }, { threshold: 0.25 })
    ob.observe(v)
    return () => ob.disconnect()
  }, [canPlay, muted, prefersReduced])

  if (!item) return null

  return (
    <section className={styles.wrap}>
      <div className={styles.bg} style={{ backgroundImage: item.backdrop ? `url(${item.backdrop})` : 'none' }} />
      {teaserSrc && !prefersReduced && (
        <video
          ref={videoRef}
          className={styles.teaser}
          src={teaserSrc}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
      )}
      <div className={styles.fade}>
        <div className={`container ${styles.inner}`}>
          <h1 className={styles.title}>{item.title}</h1>
          <p className={styles.overview}>{item.overview}</p>
          <div className={styles.cta}>
            <Link to={`/watch/${item.id}`} className={styles.play}>Play</Link>
            <Link to={`/title/${item.id}`} className={styles.more}>More Info</Link>
            {teaserSrc && !prefersReduced && (
              <button className={styles.mute} onClick={() => {
                const v = videoRef.current; if (!v) return
                v.muted = !v.muted; setMuted(v.muted)
              }}>
                {muted ? '🔇' : '🔊'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
