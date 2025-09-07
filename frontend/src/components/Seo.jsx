import { useEffect } from 'react'

function setMeta(nameOrProp, content, isProperty = false) {
  if (!content) return
  const selector = isProperty ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    if (isProperty) el.setAttribute('property', nameOrProp)
    else el.setAttribute('name', nameOrProp)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function Seo({ title, description, image, url }) {
  const t = title ? `${title} • NClone` : 'NClone – Stream better'
  const d = description || 'A Netflix-style streaming demo built with React + Vite.'
  const u = url || (typeof window !== 'undefined' ? window.location.href : '')
  const img = image || '/og-image.png'

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.title = t
    setMeta('description', d)
    setMeta('og:title', t, true)
    setMeta('og:description', d, true)
    setMeta('og:image', img, true)
    setMeta('og:url', u, true)
    setMeta('twitter:card', 'summary_large_image')
    setLink('canonical', u)
  }, [t, d, img, u])

  return null
}
