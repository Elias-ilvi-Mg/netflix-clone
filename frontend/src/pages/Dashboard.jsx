import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { adminService } from '../services/admin'
import { profileService } from '../services/profiles'
import { metricsService } from '../services/metrics'
import { catalogService } from '../services/catalog'
import { catalogSeriesService } from '../services/catalogSeries'
import { catalogEpisodesService } from '../services/catalogEpisodes'
import Seo from '../components/Seo'

/* -------------------------- USERS (admin only) -------------------------- */
function UsersTab() {
  const { user: me } = useAuth() || {}
  const [rows, setRows] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true); setError('')
    try {
      const { users } = await adminService.users()
      setRows(users || [])
    } catch (e) {
      setError(e.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function onAdd(e) {
    e.preventDefault()
    setError('')
    try {
      await adminService.addUser(email, password)
      setEmail(''); setPassword(''); load()
    } catch (e) {
      setError(e.message || 'Failed to add user')
    }
  }

  async function onDelete(id) {
    if (String(me?.id) === String(id)) { setError('You cannot delete your own account'); return }
    if (!confirm('Delete this user?')) return
    try { await adminService.deleteUser(id); load() } catch (e) { setError(e.message || 'Delete failed') }
  }

  async function onRoleChange(id, role) {
    if (String(me?.id) === String(id) && role !== 'admin') { setError('You cannot demote your own account'); return }
    try { await adminService.setRole(id, role); load() } catch (e) { setError(e.message || 'Role update failed') }
  }

  return (
    <div>
      <h2>Users</h2>

      <form onSubmit={onAdd} style={{ display:'grid', gap:10, maxWidth:420 }}>
        <input type="email" placeholder="New user email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Temp password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <div style={{ color:'#fca5a5' }}>{error}</div>}
        <button type="submit" style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'10px 14px' }}>
          Add user
        </button>
      </form>

      <div style={{ marginTop:20, overflowX:'auto' }}>
        {loading ? (
          <div style={{ color:'#9ca3af' }}>Loading users…</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th align="left">Email</th>
                <th align="left">Role</th>
                <th align="left">Profiles</th>
                <th align="left">Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map(u => (
                <tr key={u.id} style={{ borderTop:'1px solid #262626' }}>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e)=>onRoleChange(u.id, e.target.value)}
                      disabled={String(me?.id) === String(u.id)}
                      style={{ background:'#111', color:'#fff', border:'1px solid #374151', borderRadius:6, padding:'6px 8px' }}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>{u.profiles}</td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      type="button"
                      onClick={()=>onDelete(u.id)}
                      disabled={String(me?.id) === String(u.id)}
                      style={{ background:'#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'6px 10px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} style={{ color:'#9ca3af', padding:'12px 0' }}>No users.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

/* ------------------------------ PROFILES ------------------------------ */
function ProfilesTab() {
  const [profiles, setProfiles] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [name, setName] = useState('')

  async function load() {
    const { profiles: list, activeProfileId } = await profileService.all()
    setProfiles(list || [])
    setActiveId(activeProfileId || list?.[0]?.id || null)
  }
  useEffect(() => { load() }, [])

  async function addProfile(e) {
    e.preventDefault()
    const { profile } = await profileService.create(name || 'Guest', false)
    setName(''); setProfiles(x=>[...x, profile])
  }
  async function rename(id, next) {
    await profileService.update(id, { name: next })
    setProfiles(x => x.map(p => p.id===id ? { ...p, name: next } : p))
  }
  async function toggleKids(id, v) {
    await profileService.update(id, { kids: v })
    setProfiles(x => x.map(p => p.id===id ? { ...p, kids: v } : p))
  }
  async function remove(id) {
    if (!confirm('Delete this profile?')) return
    await profileService.remove(id)
    setProfiles(x => x.filter(p => p.id !== id))
    if (activeId === id) setActiveId(null)
  }
  async function setActive(id) {
    await profileService.setActive(id)
    setActiveId(id)
  }

  return (
    <div>
      <h2>Profiles</h2>
      <form onSubmit={addProfile} style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10, maxWidth:420 }}>
        <input placeholder="Profile name" value={name} onChange={e=>setName(e.target.value)} />
        <button type="submit" style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'10px 14px' }}>Add</button>
      </form>

      <div style={{ display:'grid', gap:12, marginTop:16 }}>
        {profiles.map(p => (
          <div key={p.id} style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:10, alignItems:'center', border:'1px solid #262626', borderRadius:12, padding:12 }}>
            <input value={p.name} onChange={e=>rename(p.id, e.target.value)} style={{ background:'#111', border:'1px solid #262626', color:'#fff', padding:'8px 10px', borderRadius:8 }} />
            <label style={{ display:'flex', alignItems:'center', gap:6 }}>
              <input type="checkbox" checked={p.kids} onChange={e=>toggleKids(p.id, e.target.checked)} />
              Kids
            </label>
            <button type="button" onClick={()=>setActive(p.id)} style={{ background: activeId===p.id ? 'var(--accent)' : '#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'8px 12px' }}>
              {activeId===p.id ? 'Active' : 'Set Active'}
            </button>
            <button type="button" onClick={()=>remove(p.id)} style={{ background:'#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'8px 12px' }}>Delete</button>
          </div>
        ))}
        {profiles.length === 0 && <div style={{ color:'#9ca3af' }}>No profiles yet.</div>}
      </div>
    </div>
  )
}

/* ------------------------------ METRICS ------------------------------ */
function BarChart({ data = [], labelKey = 'date', valueKey = 'total' }) {
  const max = Math.max(1, ...data.map(d => d[valueKey] || 0))
  return (
    <div style={{ display:'grid', gridAutoFlow:'column', gap:8, alignItems:'end', height:160 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display:'grid', gridTemplateRows:'1fr auto', gap:6, minWidth:30, textAlign:'center' }}>
          <div title={`${d[labelKey]}: ${d[valueKey]}`} style={{ background:'#1f2937', border:'1px solid #374151', borderRadius:6, height:`${(100 * (d[valueKey]||0) / max).toFixed(2)}%` }} />
          <div style={{ fontSize:12, color:'#9ca3af' }}>{String(d[labelKey]).slice(5)}</div>
        </div>
      ))}
    </div>
  )
}
function StatCard({ title, value }) {
  return (
    <div style={{ border:'1px solid #262626', background:'#171717', borderRadius:12, padding:12 }}>
      <div style={{ color:'#9ca3af', fontSize:13 }}>{title}</div>
      <div style={{ fontSize:22, fontWeight:700 }}>{value}</div>
    </div>
  )
}
function MetricsTab() {
  const [days, setDays] = useState(7)
  const [summary, setSummary] = useState([])
  const [top, setTop] = useState([])

  useEffect(() => {
    let live = true
    metricsService.summary(days).then(({ rows }) => { if (live) setSummary(rows.map(r => ({ date: r._id, ...r }))) })
    metricsService.top(10).then(({ items }) => { if (live) setTop(items) })
    return () => { live = false }
  }, [days])

  return (
    <div>
      <h2>Playback Metrics</h2>
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
        <span style={{ color:'#9ca3af' }}>Range:</span>
        <select value={days} onChange={e=>setDays(Number(e.target.value))}
          style={{ background:'#111', color:'#fff', border:'1px solid #374151', borderRadius:6, padding:'6px 8px' }}>
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      <div style={{ marginTop:8 }}>
        <div style={{ marginBottom:6, color:'#9ca3af' }}>Total events</div>
        <BarChart data={summary} labelKey="date" valueKey="total" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:10, marginTop:16 }}>
        <StatCard title="Plays" value={summary.reduce((a,b)=>a+(b.plays||0),0)} />
        <StatCard title="Pauses" value={summary.reduce((a,b)=>a+(b.pauses||0),0)} />
        <StatCard title="Completions" value={summary.reduce((a,b)=>a+(b.ends||0),0)} />
        <StatCard title="Errors" value={summary.reduce((a,b)=>a+(b.errors||0),0)} />
      </div>

      <h3 style={{ marginTop:20 }}>Top titles (by plays)</h3>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr><th align="left">Media ID</th><th align="left">Plays</th><th align="left">Last</th></tr></thead>
          <tbody>
            {top.map(t => (
              <tr key={t.mediaId} style={{ borderTop:'1px solid #262626' }}>
                <td>{t.mediaId}</td>
                <td>{t.plays}</td>
                <td>{new Date(t.last).toLocaleString()}</td>
              </tr>
            ))}
            {top.length === 0 && <tr><td colSpan={3} style={{ color:'#9ca3af' }}>No data yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ------------------------------ CATALOG (movies) ------------------------------ */
function CatalogTab() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({
    mediaId: '', type: 'movie', title: '',
    streamUrl: '', poster: '', backdrop: '',
    maturity: 'PG-13', kids: false, captions: [{ label:'English', srclang:'en', src:'/captions/en.vtt' }]
  })
  const [error, setError] = useState('')

  async function load(){ try { const { items } = await catalogService.list(); setRows(items) } catch(e){ setError(e.message || 'Load failed') } }
  useEffect(() => { load() }, [])

  const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function onCreate(e){
    e.preventDefault(); setError('')
    try { await catalogService.create(form); setForm({ ...form, mediaId:'', title:'', streamUrl:'' }); load() }
    catch(e){ setError(e.message || 'Create failed') }
  }
  async function onDelete(id){
    if (!confirm('Delete catalog item?')) return
    try { await catalogService.remove(id); load() } catch(e){ setError(e.message || 'Delete failed') }
  }

  return (
    <div>
      <h2>Catalog</h2>
      <form onSubmit={onCreate} style={{ display:'grid', gap:10, gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', alignItems:'end' }}>
        <input placeholder="TMDB mediaId" value={form.mediaId} onChange={e=>onChange('mediaId', e.target.value)} required />
        <select value={form.type} onChange={e=>onChange('type', e.target.value)}>
          <option value="movie">movie</option><option value="tv">tv</option>
        </select>
        <input placeholder="Title (optional)" value={form.title} onChange={e=>onChange('title', e.target.value)} />
        <input placeholder="Stream URL (HLS/DASH)" value={form.streamUrl} onChange={e=>onChange('streamUrl', e.target.value)} required />
        <input placeholder="Poster URL (optional)" value={form.poster} onChange={e=>onChange('poster', e.target.value)} />
        <input placeholder="Backdrop URL (optional)" value={form.backdrop} onChange={e=>onChange('backdrop', e.target.value)} />
        <select value={form.maturity} onChange={e=>onChange('maturity', e.target.value)}>
          <option>G</option><option>PG</option><option>PG-13</option><option>R</option><option>TV-Y</option><option>TV-PG</option><option>TV-14</option><option>TV-MA</option>
        </select>
        <label style={{ display:'flex', alignItems:'center', gap:6 }}>
          <input type="checkbox" checked={form.kids} onChange={e=>onChange('kids', e.target.checked)} /> Kids-allowed
        </label>
        <button type="submit" style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'10px 14px' }}>Add/Update</button>
      </form>
      {error && <div style={{ color:'#fca5a5', marginTop:8 }}>{error}</div>}

      <div style={{ marginTop:16, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr><th align="left">mediaId</th><th align="left">title</th><th align="left">kids</th><th align="left">maturity</th><th align="left">updated</th><th/></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} style={{ borderTop:'1px solid #262626' }}>
                <td>{r.mediaId}</td>
                <td>{r.title || '—'}</td>
                <td>{r.kids ? 'yes' : 'no'}</td>
                <td>{r.maturity}</td>
                <td>{new Date(r.updatedAt).toLocaleString()}</td>
                <td><button type="button" onClick={()=>onDelete(r._id)} style={{ background:'#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'6px 10px' }}>Delete</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} style={{ color:'#9ca3af' }}>No catalog items.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ------------------------------ SERIES (admin) ------------------------------ */
function SeriesTab() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    seriesId: '', title: '', overview: '',
    poster: '', backdrop: '',
    maturity: 'TV-14', kids: false,
    trailerUrl: '', trailerCaptions: [{ label:'English', srclang:'en', src:'/captions/en.vtt' }]
  })

  async function load(){ try { const { items } = await catalogSeriesService.list(); setRows(items || []) } catch(e){ setError(e.message || 'Load failed') } }
  useEffect(() => { load() }, [])

  const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function onCreate(e){
    e.preventDefault(); setError('')
    try { await catalogSeriesService.create(form); setForm({ ...form, seriesId:'', title:'', overview:'', trailerUrl:'' }); load() }
    catch(e){ setError(e.message || 'Create failed') }
  }

  async function onDelete(id){
    if (!confirm('Delete series (and its episodes)?')) return
    try { await catalogSeriesService.remove(id); load() } catch(e){ setError(e.message || 'Delete failed') }
  }

  return (
    <div>
      <h2>Series</h2>
      <form onSubmit={onCreate} style={{ display:'grid', gap:10, gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', alignItems:'end' }}>
        <input placeholder="TMDB seriesId (tv id)" value={form.seriesId} onChange={e=>onChange('seriesId', e.target.value)} required />
        <input placeholder="Title" value={form.title} onChange={e=>onChange('title', e.target.value)} />
        <input placeholder="Trailer URL (optional)" value={form.trailerUrl} onChange={e=>onChange('trailerUrl', e.target.value)} />
        <input placeholder="Poster URL" value={form.poster} onChange={e=>onChange('poster', e.target.value)} />
        <input placeholder="Backdrop URL" value={form.backdrop} onChange={e=>onChange('backdrop', e.target.value)} />
        <select value={form.maturity} onChange={e=>onChange('maturity', e.target.value)}>
          <option>TV-Y</option><option>TV-PG</option><option>TV-14</option><option>TV-MA</option>
        </select>
        <label style={{ display:'flex', alignItems:'center', gap:6 }}>
          <input type="checkbox" checked={form.kids} onChange={e=>onChange('kids', e.target.checked)} /> Kids-allowed
        </label>
        <button type="submit" style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'10px 14px' }}>Add Series</button>
      </form>
      {error && <div style={{ color:'#fca5a5', marginTop:8 }}>{error}</div>}

      <div style={{ marginTop:16, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr><th align="left">seriesId</th><th align="left">title</th><th align="left">kids</th><th align="left">maturity</th><th align="left">updated</th><th/></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} style={{ borderTop:'1px solid #262626' }}>
                <td>{r.seriesId}</td>
                <td>{r.title || '—'}</td>
                <td>{r.kids ? 'yes' : 'no'}</td>
                <td>{r.maturity}</td>
                <td>{new Date(r.updatedAt).toLocaleString()}</td>
                <td><button type="button" onClick={()=>onDelete(r._id)} style={{ background:'#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'6px 10px' }}>Delete</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} style={{ color:'#9ca3af' }}>No series.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ------------------------------ EPISODES (admin) ------------------------------ */
function EpisodesTab() {
  const [seriesId, setSeriesId] = useState('')
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({
    seriesId: '', season: 1, episode: 1,
    title: '', overview: '',
    streamUrl: '', runtimeSec: 0,
    introStartSec: 0, introEndSec: 0, creditsStartSec: 0,
    captions: [{ label: 'English', srclang:'en', src:'/captions/en.vtt' }]
  })
  const [error, setError] = useState('')

  async function load(){
    setError('')
    try {
      if (!seriesId) { setRows([]); return }
      const { items } = await catalogEpisodesService.list(seriesId)
      setRows(items || [])
    } catch(e){ setError(e.message || 'Load failed') }
  }
  useEffect(() => { load() }, [seriesId])

  async function onCreate(e){
    e.preventDefault()
    try { await catalogEpisodesService.create({ ...form, seriesId }); setForm(f => ({ ...f, title:'', overview:'', streamUrl:'' })); load() }
    catch(e){ setError(e.message || 'Create failed') }
  }
  async function onDelete(id){
    if (!confirm('Delete episode?')) return
    try { await catalogEpisodesService.remove(id); load() } catch(e){ setError(e.message || 'Delete failed') }
  }

  return (
    <div>
      <h2>Episodes</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'end', marginBottom:10 }}>
        <input placeholder="TMDB seriesId (tv id)" value={seriesId} onChange={e=>setSeriesId(e.target.value)} />
        <button type="button" onClick={load} style={{ background:'#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'8px 12px' }}>Load</button>
      </div>

      <form onSubmit={onCreate} style={{ display:'grid', gap:10, gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))' }}>
        <input type="number" min={0} placeholder="Season" value={form.season} onChange={e=>setForm(f=>({ ...f, season: Number(e.target.value) }))} />
        <input type="number" min={1} placeholder="Episode" value={form.episode} onChange={e=>setForm(f=>({ ...f, episode: Number(e.target.value) }))} />
        <input placeholder="Title" value={form.title} onChange={e=>setForm(f=>({ ...f, title: e.target.value }))} />
        <input placeholder="Stream URL" value={form.streamUrl} onChange={e=>setForm(f=>({ ...f, streamUrl: e.target.value }))} required />
        <input type="number" min={0} placeholder="Runtime (sec)" value={form.runtimeSec} onChange={e=>setForm(f=>({ ...f, runtimeSec: Number(e.target.value) }))} />
        <input type="number" min={0} placeholder="Intro start (sec)" value={form.introStartSec} onChange={e=>setForm(f=>({ ...f, introStartSec: Number(e.target.value) }))} />
        <input type="number" min={0} placeholder="Intro end (sec)" value={form.introEndSec} onChange={e=>setForm(f=>({ ...f, introEndSec: Number(e.target.value) }))} />
        <input type="number" min={0} placeholder="Credits start (sec)" value={form.creditsStartSec} onChange={e=>setForm(f=>({ ...f, creditsStartSec: Number(e.target.value) }))} />
        <button type="submit" style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, padding:'10px 14px' }}>Add episode</button>
      </form>

      {error && <div style={{ color:'#fca5a5', marginTop:8 }}>{error}</div>}

      <div style={{ marginTop:16, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr><th align="left">S</th><th align="left">E</th><th align="left">Title</th><th align="left">Runtime</th><th align="left">Intro</th><th align="left">Credits</th><th/></tr></thead>
          <tbody>
            {rows.sort((a,b)=>a.season-b.season||a.episode-b.episode).map(r => (
              <tr key={r._id} style={{ borderTop:'1px solid #262626' }}>
                <td>{r.season}</td>
                <td>{r.episode}</td>
                <td>{r.title || '—'}</td>
                <td>{r.runtimeSec ? `${Math.round(r.runtimeSec/60)}m` : '—'}</td>
                <td>{r.introStartSec}-{r.introEndSec}</td>
                <td>{r.creditsStartSec || '—'}</td>
                <td><button type="button" onClick={()=>onDelete(r._id)} style={{ background:'#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'6px 10px' }}>Delete</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} style={{ color:'#9ca3af' }}>No episodes.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ------------------------------ PAGE WRAPPER ------------------------------ */
export default function Dashboard(){
  const { user } = useAuth() || {}
  const [tab, setTab] = useState('profiles')
  const isAdmin = useMemo(() => user?.role === 'admin', [user])

  const METRICS_TAB_ON =
    import.meta.env.MODE === 'development' &&
    String(import.meta.env.VITE_DEMO_MODE).toLowerCase() !== 'true'

  useEffect(() => {
    if (isAdmin) setTab('users')
  }, [isAdmin])

  if (!user) {
    return (
      <main className="container" style={{ padding:'24px 0' }}>
        <Seo title="Dashboard" />
        <h1 style={{ marginTop: 0 }}>Dashboard</h1>
        <p>Please sign in to access the dashboard.</p>
      </main>
    )
  }

  return (
    <main className="container" style={{ padding:'24px 0' }}>
      <Seo title="Dashboard" />
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>

      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {isAdmin && (
          <>
            <button type="button" onClick={()=>setTab('users')}
              style={{ background: tab==='users'?'var(--accent)':'#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'8px 12px' }}>
              Users
            </button>
            <button type="button" onClick={()=>setTab('catalog')}
              style={{ background: tab==='catalog'?'var(--accent)':'#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'8px 12px' }}>
              Catalog
            </button>
            <button type="button" onClick={()=>setTab('series')}
              style={{ background: tab==='series'?'var(--accent)':'#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'8px 12px' }}>
              Series
            </button>
            <button type="button" onClick={()=>setTab('episodes')}
              style={{ background: tab==='episodes'?'var(--accent)':'#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'8px 12px' }}>
              Episodes
            </button>
            {METRICS_TAB_ON && (
              <button type="button" onClick={()=>setTab('metrics')}
                style={{ background: tab==='metrics'?'var(--accent)':'#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'8px 12px' }}>
                Metrics
              </button>
            )}
          </>
        )}
        <button type="button" onClick={()=>setTab('profiles')}
          style={{ background: tab==='profiles'?'var(--accent)':'#1f2937', color:'#fff', border:'1px solid #374151', borderRadius:8, padding:'8px 12px' }}>
          Profiles
        </button>
      </div>

      {tab === 'users' && isAdmin ? <UsersTab /> :
       tab === 'catalog' && isAdmin ? <CatalogTab /> :
       tab === 'series' && isAdmin ? <SeriesTab /> :
       tab === 'episodes' && isAdmin ? <EpisodesTab /> :
       tab === 'metrics' && isAdmin && METRICS_TAB_ON ? <MetricsTab /> :
       <ProfilesTab />}
    </main>
  )
}
