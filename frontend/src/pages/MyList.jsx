import MediaCard from '../components/MediaCard'
import { useStore } from '../store/useStore'

export default function MyList(){
const myList = useStore(s => s.myList)


return (
<main className="container" style={{padding:'24px 0'}}>
<h1 style={{marginTop:0}}>My List</h1>
{myList.length === 0 ? (
<div style={{color:'#9ca3af'}}>Your list is empty. Browse titles and click <strong>+ My List</strong> to save them here.</div>
) : (
<div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12}}>
{myList.map(item => <MediaCard key={item.id} item={item} />)}
</div>
)}
</main>
)
}