import { useEffect, useState } from 'react'
import { profileService } from '../services/profiles'
import styles from './ProfileSwitcher.module.css'


export default function ProfileSwitcher(){
const [open, setOpen] = useState(false)
const [profiles, setProfiles] = useState([])
const [activeId, setActiveId] = useState(null)


useEffect(() => {
profileService.all().then(({ profiles, activeProfileId }) => {
setProfiles(profiles); setActiveId(activeProfileId || profiles[0]?.id || null)
}).catch(()=>{})
}, [])


async function activate(id){
await profileService.setActive(id)
setActiveId(id); setOpen(false)
}


return (
<div className={styles.wrap}>
<button className={styles.btn} onClick={()=>setOpen(v=>!v)}>
{profiles.find(p=>p.id===activeId)?.name || 'Profile'}
</button>
{open && (
<div className={styles.menu}>
{profiles.map(p => (
<button key={p.id} onClick={()=>activate(p.id)} className={p.id===activeId?styles.active:''}>{p.name}{p.kids?' • Kids':''}</button>
))}
<button onClick={()=>profileService.create('Guest').then(({ profile })=> setProfiles(x=>[...x, profile]))}>+ Add Profile</button>
</div>
)}
</div>
)
}