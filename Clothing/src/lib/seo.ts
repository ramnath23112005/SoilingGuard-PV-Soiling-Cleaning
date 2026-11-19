import { useEffect } from 'react'
import { absoluteUrl } from './integrations'

interface PageMeta {
  title: string
  description?: string
  path?: string
  /** When true, the page is excluded from the index (pre-launch drafts, 404). */
  noindex?: boolean
}

/** Sets document title, meta description, canonical and basic Open Graph tags. */
export function usePageMeta({ title, description, path = '/', noindex }: PageMeta): void {
  useEffect(() => {
    const fullTitle = title === 'VYRO' ? 'VYRO — Premium Streetwear & Elevated Essentials' : `${title} — VYRO`
    const previousTitle = document.title
    document.title = fullTitle

    const previousMeta: { el: HTMLMetaElement; content: string }[] = []

    const upsertMeta = (selector: string, attrs: Record<string, string>, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector)
      if (!el) {
        el = document.createElement('meta')
        Object.entries(attrs).forEach(([key, value]) => el!.setAttribute(key, value))
        document.head.appendChild(el)
      } else {
        previousMeta.push({ el, content: el.getAttribute('content') ?? '' })
      }
      el.setAttribute('content', content)
    }

    if (description) {
      upsertMeta('meta[name="description"]', { name: 'description' }, description)
      upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description)
    }
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, fullTitle)
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'website')

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', absoluteUrl(path))

    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const previousRobots = robots?.getAttribute('content') ?? null
    if (robots) {
      robots.setAttribute('content', noindex ? 'noindex,nofollow' : 'index,follow')
    }

    return () => {
      document.title = previousTitle
      previousMeta.forEach(({ el, content }) => el.setAttribute('content', content))
      if (robots && previousRobots !== null) robots.setAttribute('content', previousRobots)
    }
  }, [title, description, path, noindex])
}
