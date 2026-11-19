import { homeContent } from '../../data/site'
import { SceneImage } from '../imagery/Scene'
import { Reveal } from '../ui/Reveal'
import { TextLink } from '../ui/SectionHeading'

/** Asymmetric editorial block — image off-centre, text holding the quiet side. */
export function BrandStory() {
  const story = homeContent.story

  return (
    <section aria-labelledby="story-heading" className="border-b border-line bg-stone py-16 md:py-24">
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7 lg:col-start-1">
            <div className="relative aspect-4/5 overflow-hidden bg-ivory sm:aspect-3/2 lg:aspect-4/5">
              <SceneImage
                {...story.image}
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-4 lg:col-start-9">
            <p className="label-xs text-muted">{story.label}</p>
            <h2 id="story-heading" className="display-md mt-5 text-ink">
              {story.headline}
            </h2>
            <p className="body-lg mt-6 text-ink/75">{story.body}</p>
            <div className="mt-8">
              <TextLink to={story.cta.href} diagonal>
                {story.cta.label}
              </TextLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
