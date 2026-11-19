import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/seo'
import { site, homeContent } from '../data/site'
import { SceneImage } from '../components/imagery/Scene'
import { Reveal } from '../components/ui/Reveal'
import { Button } from '../components/ui/Button'

export function StoryPage() {
  usePageMeta({
    title: 'Our Story',
    description:
      'VYRO is built around the pieces you return to. Thoughtful silhouettes, restrained design, and room to make every look your own.',
    path: '/our-story',
  })

  return (
    <>
      <section className="border-b border-line py-16 md:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <p className="label-xs text-muted">The VYRO point of view</p>
            <h1 className="display-xl mt-6 text-ink">{site.campaignLine}</h1>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-5 lg:col-start-8 lg:pt-16">
            <p className="body-lg text-ink/80">{homeContent.story.body}</p>
            <p className="body-lg mt-6 text-muted">
              We’re starting small on purpose: a focused first drop, honest information, and a site
              that says only what it can stand behind.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="relative aspect-3/2 w-full overflow-hidden bg-stone md:aspect-[21/9]">
          <SceneImage
            kind="campaign"
            view="full"
            tone="charcoal"
            frame="wide"
            alt="Placeholder campaign artwork — model in charcoal VYRO streetwear against concrete architecture"
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="label-xs text-muted">What we’re making</p>
            <h2 className="display-sm mt-4 text-ink">Considered essentials, limited studies.</h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="space-y-8">
              {[
                {
                  title: 'Everyday uniform',
                  body: 'Oversized T-shirts cut with intention — the piece you reach for without thinking, in colours that work together.',
                },
                {
                  title: 'Graphic studies',
                  body: 'Small runs of original graphics. Restrained on the front, expressive where it counts.',
                },
                {
                  title: 'A quieter internet',
                  body: 'No fake urgency, no invented reviews, no claims we can’t back. What you read here is what’s true.',
                },
              ].map((item) => (
                <Reveal key={item.title} className="border-t border-line pt-6">
                  <h3 className="label-sm text-ink">{item.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{item.body}</p>
                </Reveal>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-6">
              <Button href="/shop" size="lg">
                SHOP THE DROP
              </Button>
              <Link to="/lookbook" className="link-line label-sm text-ink">
                EXPLORE THE LOOKBOOK ↗
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
