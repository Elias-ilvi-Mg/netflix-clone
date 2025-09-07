import { useRef, useState, useEffect, useCallback } from 'react'
import styles from './Row.module.css'
import MediaCard from './MediaCard'

export default function Row({ title, items = [] }) {
  const ref = useRef(null)
  const [can, setCan] = useState({ left: false, right: false })

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCan({
      left: el.scrollLeft > 0,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    })
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update); ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [update])

  const nudge = (dir) => {
    const el = ref.current; if (!el) return
    const amt = Math.round(el.clientWidth * 0.9)
    el.scrollBy({ left: dir * amt, behavior: 'smooth' })
  }

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1) }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); nudge(-1) }
  }

  return (
    <section className={styles.wrap} aria-label={title}>
      <div className="container">
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.row}>
          {can.left && (
            <button className={`${styles.nav} ${styles.left}`} aria-label="Scroll left" onClick={() => nudge(-1)}>‹</button>
          )}
          <div className={styles.scroller} ref={ref} tabIndex={0} onKeyDown={onKey}>
            {items.map(item => <MediaCard key={item.id} item={item} />)}
          </div>
          {can.right && (
            <button className={`${styles.nav} ${styles.right}`} aria-label="Scroll right" onClick={() => nudge(1)}>›</button>
          )}
        </div>
      </div>
    </section>
  )
}
