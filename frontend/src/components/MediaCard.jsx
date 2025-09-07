import { Link } from 'react-router-dom'
import styles from './MediaCard.module.css'
import { useStore } from '../store/useStore'
import SmartImg from './SmartImg'
import { useHoverPrefetch } from '../hooks/useHoverPrefench'



export default function MediaCard({ item }) {
const { myList, toggleMyList } = useStore()
const inList = myList.some(x => x.id === item.id)
const { onMouseEnter, onMouseLeave } = useHoverPrefetch(item.id)


return (
  <article className={styles.card} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
{item.progress && (
    <div style={{height:4, background:'#111'}}>
    <div style={{height:4, width:`${Math.min(100, Math.round((item.progress.t/item.progress.d)*100))}%`}}/>
    </div>
)}
{/* <Link to={`/title/${item.id}`} className={styles.thumb}>
{item.poster ? <img src={item.poster} alt={item.title} loading="lazy"/> : <div className={styles.fallback} />}
</Link> */}
<Link to={`/title/${item.id}`} className={styles.thumb}>
  {item.poster
    ? <SmartImg src={item.poster} alt={item.title} kind="poster" />
    : <div className={styles.fallback} />
  }
</Link>

<div className={styles.meta}>
<h3 title={item.title} className={styles.title}>{item.title}</h3>
<div className={styles.row}>
<span className={styles.badge}>{item.year || '—'}</span>
<span className={styles.badge}>★ {item.vote?.toFixed?.(1) || '—'}</span>
<button className={styles.btn} onClick={() => toggleMyList(item)} aria-pressed={inList}>
{inList ? '✓ In My List' : '+ My List'}
</button>
</div>
</div>
</article>
)
}