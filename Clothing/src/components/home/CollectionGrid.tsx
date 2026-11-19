import { Link } from 'react-router-dom'
import { collections, homeContent } from '../../data/site'
import { SceneImage } from '../imagery/Scene'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

/** Three image-led collection tiles — no icon grid, no filler categories. */
export function CollectionGrid() {
  return (
    <section aria-labelledby="collection-heading" className="border-b border-line py-16 md:py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            label={homeContent.collection.label}
            headline={homeContent.collection.headline}
            body={homeContent.collection.body}
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-5">
          {collections.map((collection, index) => (
            <Reveal key={collection.id} delay={index * 90}>
              <Link to={collection.href} className="group block">
                <div className="media-zoom relative aspect-3/4 overflow-hidden bg-stone">
                  <SceneImage
                    {...collection.image}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="label-sm text-ink">{collection.title}</h3>
                    <p className="mt-2 max-w-[26ch] text-[13px] leading-relaxed text-muted">
                      {collection.blurb}
                    </p>
                  </div>
                  <span className="label-xs mt-0.5 shrink-0 text-ink transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5">
                    Explore ↗
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
