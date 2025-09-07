import { create } from 'zustand'


export const useStore = create((set, get) => ({
user: null,
myList: JSON.parse(localStorage.getItem('myList') || '[]'),


login: (email) => set({ user: { email } }),
logout: () => set({ user: null }),


toggleMyList: (item) => {
const list = get().myList
const exists = list.find(x => x.id === item.id)
const next = exists ? list.filter(x => x.id !== item.id) : [...list, item]
localStorage.setItem('myList', JSON.stringify(next))
set({ myList: next })
},


// --- Continue Watching state helpers ---
saveProgress: ({ id, t, d }) => {
try { localStorage.setItem(`cw:${id}`, JSON.stringify({ id, t, d, updatedAt: Date.now() })) } catch {}
},
getProgress: (id) => {
try { return JSON.parse(localStorage.getItem(`cw:${id}`) || 'null') } catch { return null }
},
clearProgress: (id) => { try { localStorage.removeItem(`cw:${id}`) } catch {} },
listProgress: () => {
const keys = Object.keys(localStorage).filter(k => k.startsWith('cw:'))
const items = keys.map(k => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }).filter(Boolean)
return items.sort((a,b) => b.updatedAt - a.updatedAt)
},
}))