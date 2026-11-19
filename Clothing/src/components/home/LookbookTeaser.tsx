import { useState } from 'react'
import { homeContent, lookbookEntries } from '../../data/site'
import { SceneImage } from '../imagery/Scene'
import { Lightbox, type LightboxEntry } from '../lookbook/Lightbox'
import { Reveal } from '../ui/Reveal'
import { TextLink } from '../ui/SectionHeading'

const spanClasses = [
  'lg:col-span-5 lg:row-span-2',
  'lg:col-span-3 lg:mt-20',
  'lg:col-span-4 lg:mt-10',
]

const ratioClasses = ['aspect-3/4', 'aspect-square', 'aspect-4/5']

/** Magazine-style gallery — mixed proportions, click to enlarge. */
export function LookbookTeaser() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const entries: LightboxEntry[] = lookbookEntries.slice(0, 3)

  return (
    <section aria-labelledby="lookbook-heading" className="border-b border-line py-16 md:py-24">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="label-xs text-muted">Lookbook</p>
              <h2 id="lookbook-heading" className="display-md mt-4 text-ink">
                {homeContent.lookbook.title}
              </h2>
              <p className="body-lg mt-5 text-muted">{homeContent.lookbook.body}</p>
            </div>
            <TextLink to="/lookbook" diagonal className="mb-2">
              Open the lookbook
            </TextLink>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          {entries.map((entry, index) => (
            <Reveal key={entry.id} delay={index * 90} className={spanClasses[index]}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className="media-zoom group block w-full text-left"
                aria-label={`Open ${entry.title} in the image viewer`}
              >
                <div className={`relative overflow-hidden bg-stone ${ratioClasses[index]}`}>
                  <SceneImage {...entry.image} className="absolute inset-0 h-full w-full" />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <div>
                    <p className="label-sm text-ink">{entry.title}</p>
                    <p className="mt-1.5 text-[13px] text-muted">{entry.caption}</p>
                  </div>
                  <span className="label-xs shrink-0 text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-1">
                    View ↗
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Lightbox
        entries={entries}
        index={activeIndex}
        onClose={() => setActiveIndex(null)}
        onSelect={setActiveIndex}
      />
    </section>
  )
}
