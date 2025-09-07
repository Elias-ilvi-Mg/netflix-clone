import SkeletonCard from './SkeletonCard'


export default function SkeletonRow({ count = 10, title = 'Loading' }){
return (
<section style={{ padding: '12px 0 20px' }}>
<div className="container">
<h2 style={{ margin: '12px 0', fontSize: 18, color: '#9ca3af' }}>{title}</h2>
<div style={{ display: 'grid', gridAutoFlow: 'column', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
{Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
</div>
</div>
</section>
)
}