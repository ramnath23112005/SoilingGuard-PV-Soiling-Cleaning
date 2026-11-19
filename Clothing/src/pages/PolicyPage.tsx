import { Link, useParams } from 'react-router-dom'
import { usePageMeta } from '../lib/seo'
import { policies } from '../data/site'
import { sizeGuide } from '../data/products'
import { NotFoundPage } from './NotFoundPage'

export function PolicyPage() {
  const { slug } = useParams()
  const policy = slug ? policies[slug] : undefined

  usePageMeta({
    title: policy?.title ?? 'Page not found',
    description: policy?.intro,
    path: `/policies/${slug ?? ''}`,
    noindex: true,
  })

  if (!policy) return <NotFoundPage />

  return (
    <article className="container-x py-14 md:py-20">
      <div className="grid gap-10 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <p className="label-xs text-muted">Information</p>
          <h1 className="display-md mt-4 text-ink">{policy.title}</h1>
          <p className="body-lg mt-6 max-w-sm text-muted">{policy.intro}</p>
          <nav className="mt-10" aria-label="Policy pages">
            <ul className="space-y-2.5">
              {Object.entries(policies).map(([key, entry]) => (
                <li key={key}>
                  <Link
                    to={`/policies/${key}`}
                    className={
                      key === slug
                        ? 'link-line label-xs text-ink'
                        : 'label-xs text-muted transition-colors hover:text-ink'
                    }
                    aria-current={key === slug ? 'page' : undefined}
                  >
                    {entry.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div className="lg:col-span-7 lg:col-start-6">
          {slug === 'size-guide' ? (
            <section className="mb-10 border-t border-line pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="label-sm text-ink">Garment measurements</h2>
                <span className="label-xs text-olive">Draft — cm</span>
              </div>
              <table className="mt-5 w-full border-collapse text-left text-[13px]">
                <caption className="sr-only">
                  Garment measurements by size in centimetres, draft values
                </caption>
                <thead>
                  <tr className="border-b border-ink/20">
                    <th scope="col" className="py-3 pr-4 font-medium">Size</th>
                    <th scope="col" className="py-3 pr-4 font-medium">Chest</th>
                    <th scope="col" className="py-3 pr-4 font-medium">Length</th>
                    <th scope="col" className="py-3 pr-4 font-medium">Shoulder</th>
                    <th scope="col" className="py-3 font-medium">Sleeve</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeGuide.rows.map((row) => (
                    <tr key={row.size} className="border-b border-line">
                      <th scope="row" className="py-3 pr-4 font-medium text-ink">{row.size}</th>
                      <td className="py-3 pr-4 tabular-nums text-muted">{row.chest}</td>
                      <td className="py-3 pr-4 tabular-nums text-muted">{row.length}</td>
                      <td className="py-3 pr-4 tabular-nums text-muted">{row.shoulder}</td>
                      <td className="py-3 tabular-nums text-muted">{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="mt-5 space-y-2 text-[12px] leading-relaxed text-muted">
                {sizeGuide.notes.map((note) => (
                  <li key={note}>— {note}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="space-y-10">
            {policy.sections.map((section) => (
              <section key={section.heading} className="border-t border-line pt-6">
                <h2 className="label-sm text-ink">{section.heading}</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-ink/80">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
