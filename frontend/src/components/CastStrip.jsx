import styles from './CastStrip.module.css'


export default function CastStrip({ cast = [] }){
if (!cast.length) return null
return (
<section className={styles.wrap}>
<div className="container">
<h2 className={styles.title}>Cast</h2>
<div className={styles.scroller}>
{cast.slice(0, 12).map(p => (
<div key={p.id} className={styles.person}>
<div className={styles.avatar}>
{p.profile ? (
<img src={p.profile} alt={p.name} loading="lazy"/>
) : (
<div className={styles.fallback}/>
)}
</div>
<div className={styles.name} title={p.name}>{p.name}</div>
<div className={styles.role} title={p.character}>{p.character}</div>
</div>
))}
</div>
</div>
</section>
)
}