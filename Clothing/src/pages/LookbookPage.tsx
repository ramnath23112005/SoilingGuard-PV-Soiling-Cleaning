import { useState } from 'react'
import { usePageMeta } from '../lib/seo'
import { homeContent, lookbookEntries } from '../data/site'
import { SceneImage } from '../components/imagery/Scene'
import { Lightbox, type LightboxEntry } from '../components/lookbook/Lightbox'
import { Reveal } from '../components/ui/Reveal'

const ratioClass: Record<string, string> = {
  tall: 'aspect-3/4',
  square: 'aspect-square',
  wide: 'aspect-4/3',
}

const spanClass: Record<string, string> = {
  tall: 'lg:col-span-4',
  square: 'lg:col-span-3',
  wide: 'lg:col-span-5',
}

export function LookbookPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const entries: LightboxEntry[] = lookbookEntries

  usePageMeta({
    title: 'Lookbook',
    description:
      'Outside the frame — editorial studies from VYRO Drop 001. Oversized tees, considered fits, city light.',
    path: '/lookbook',
  })

  return (
    <>
      <section className="border-b border-line py-14 md:py-20">
        <div className="container-x">
          <p className="label-xs text-muted">Lookbook / Drop 001</p>
          <h1 className="display-lg mt-4 max-w-2xl text-ink">{homeContent.lookbook.title}</h1>
          <p className="body-lg mt-6 max-w-xl text-muted">
            {homeContent.lookbook.body} Every frame below is placeholder artwork standing in for
            the campaign shoot — the crop, tone and composition are what the final images will
            follow.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
            {entries.map((entry, index) => (
              <Reveal
                key={entry.id}
                delay={(index % 3) * 90}
                className={spanClass[entry.ratio ?? 'tall'] ?? 'lg:col-span-4'}
              >
                <article id={entry.id}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="media-zoom group block w-full text-left"
                    aria-label={`Open ${entry.title} in the image viewer`}
                  >
                    <div
                      className={`relative overflow-hidden bg-stone ${ratioClass[entry.ratio ?? 'tall'] ?? 'aspect-3/4'}`}
                    >
                      <SceneImage {...entry.image} className="absolute inset-0 h-full w-full" />
                    </div>
                    <div className="mt-4 flex items-baseline justify-between gap-4">
                      <div>
                        <h2 className="label-sm text-ink">{entry.title}</h2>
                        <p className="mt-1.5 text-[13px] text-muted">{entry.caption}</p>
                      </div>
                      <span className="label-xs shrink-0 text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-1">
                        View ↗
                      </span>
                    </div>
                  </button>
                </article>
              </Reveal>
            ))}
          </div>

          <p className="mt-16 max-w-2xl text-[12px] leading-relaxed text-muted">
            No campaign credits, locations or collaborations are listed because none are confirmed
            yet. This page will be updated with the real shoot once it is delivered.
          </p>
        </div>
      </section>

      <Lightbox
        entries={entries}
        index={activeIndex}
        onClose={() => setActiveIndex(null)}
        onSelect={setActiveIndex}
      />
    </>
  )
}
