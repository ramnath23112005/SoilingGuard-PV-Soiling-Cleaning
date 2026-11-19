import { homeContent } from '../../data/site'
import { SceneImage } from '../imagery/Scene'
import { Button } from '../ui/Button'
import { TextLink } from '../ui/SectionHeading'

export function HeroSection() {
  const hero = homeContent.hero

  return (
    <section aria-label="VYRO Drop 001" className="border-b border-line">
      <div className="container-x">
        <div className="grid items-stretch gap-10 py-10 lg:grid-cols-12 lg:gap-12 lg:py-16">
          <div className="order-2 flex flex-col justify-center lg:order-1 lg:col-span-5 lg:py-8">
            <p className="hero-reveal label-xs text-muted">{hero.eyebrow}</p>
            <h1 className="hero-reveal display-xl mt-6 text-ink">{hero.headline}</h1>
            <p className="hero-reveal-delay body-lg mt-7 max-w-md text-muted">{hero.body}</p>
            <div className="hero-reveal-delay mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Button href={hero.primaryCta.href} size="lg">
                {hero.primaryCta.label}
              </Button>
              <TextLink to={hero.secondaryCta.href} diagonal>
                {hero.secondaryCta.label}
              </TextLink>
            </div>
            <div className="hero-reveal-delay mt-12 border-t border-line pt-5">
              <p className="label-xs text-muted">{hero.utility}</p>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-7">
            <div className="relative aspect-4/5 w-full overflow-hidden bg-stone sm:aspect-3/4 lg:aspect-4/5">
              <SceneImage
                {...hero.image}
                className="absolute inset-0 h-full w-full"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
