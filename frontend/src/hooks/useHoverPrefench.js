import { useRef } from 'react'
import { getById } from '../services/tmdb'

export function useHoverPrefetch(id) {
  const t = useRef(null)
  function onMouseEnter() {
    clearTimeout(t.current)
    t.current = setTimeout(() => { getById(id).catch(()=>{}) }, 180)
  }
  function onMouseLeave() {
    clearTimeout(t.current)
  }
  return { onMouseEnter, onMouseLeave }
}
