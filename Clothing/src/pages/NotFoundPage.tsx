import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/seo'

export function NotFoundPage() {
  usePageMeta({
    title: 'Page not found',
    description: 'This page does not exist on the VYRO site.',
    path: '/404',
    noindex: true,
  })

  return (
    <section className="container-x py-24 md:py-32">
      <div className="max-w-lg">
        <p className="label-xs text-muted">404</p>
        <h1 className="display-lg mt-5 text-ink">This page doesn’t exist.</h1>
        <p className="body-lg mt-6 text-muted">
          The link may be old, or the page may not be part of Drop 001. Everything we’ve published
          so far lives in the shop and lookbook.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            to="/shop"
            className="inline-flex h-12 items-center bg-black px-8 label-sm text-ivory transition-colors hover:bg-ink"
          >
            SHOP ALL →
          </Link>
          <Link to="/lookbook" className="link-line label-sm text-ink">
            OPEN THE LOOKBOOK ↗
          </Link>
        </div>
      </div>
    </section>
  )
}
