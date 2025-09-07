import { useMemo } from 'react'



export default function SmartImg({ src = '', kind = 'poster', sizes, alt = '', className, priority = false }) {
  const { srcSet, base, computedSizes } = useMemo(() => {
    if (!src.includes('image.tmdb.org')) {
      return { srcSet: undefined, base: src, computedSizes: sizes }
    }
    const m = src.match(/image\.tmdb\.org\/t\/p\/[^/]+(\/.+)$/)
    const file = m?.[1] || ''
    const w = kind === 'backdrop'
      ? [300, 780, 1280, 1920]
      : [92, 154, 185, 342, 500, 780]
    const srcSet = w.map(px => `https://image.tmdb.org/t/p/w${px}${file} ${px}w`).join(', ')
    const base = kind === 'backdrop'
      ? `https://image.tmdb.org/t/p/w780${file}`
      : `https://image.tmdb.org/t/p/w342${file}`
    const computedSizes = sizes || (kind === 'backdrop'
      ? '(min-width:1280px) 100vw, 100vw'
      : '(min-width:1280px) 180px, (min-width:768px) 160px, 45vw')
    return { srcSet, base, computedSizes }
  }, [src, kind, sizes])

return (
  <img
    src={base}
    srcSet={srcSet}
    sizes={computedSizes}
    alt={alt}
    className={className}
    loading={priority ? 'eager' : 'lazy'}
    fetchPriority={priority ? 'high' : 'auto'}  
    decoding="async"
  />
)
}
