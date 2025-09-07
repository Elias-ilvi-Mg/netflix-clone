import { useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { searchAll } from '../services/tmdb'
import MediaCard from '../components/MediaCard'

export default function Search(){
const [params] = useSearchParams()
const raw = params.get('q') || ''
const [q, setQ] = useState(raw)
const [items, setItems] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')


// reflect URL changes to local state
useEffect(()=>{ setQ(raw) }, [raw])


// debounce search
useEffect(()=>{
if (!q) { setItems([]); setError(''); return }
setLoading(true); setError('')
const t = setTimeout(() => {
searchAll(q)
.then(res => { setItems(res || []) })
.catch(()=> setError('Something went wrong. Please try again.'))
.finally(()=> setLoading(false))
}, 300)
return () => clearTimeout(t)
}, [q])


const heading = useMemo(() => q ? `Search: ${q}` : 'Search', [q])


return (
<main className="container" style={{padding:'24px 0'}}>
<h1 style={{marginTop:0}}>{heading}</h1>
{loading && <div style={{color:'#9ca3af'}}>Searching…</div>}
{!!error && <div style={{color:'#fca5a5'}} role="alert">{error}</div>}
{!loading && !error && q && items.length === 0 && (
<div style={{color:'#9ca3af'}}>No results for "{q}".</div>
)}
<div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12}}>
{items.map(item => <MediaCard key={item.id} item={item} />)}
</div>
</main>
)
}