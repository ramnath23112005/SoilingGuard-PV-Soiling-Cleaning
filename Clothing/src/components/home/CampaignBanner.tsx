import { homeContent } from '../../data/site'
import { SceneImage } from '../imagery/Scene'
import { Button } from '../ui/Button'

/** Full-bleed campaign panel. Text sits in the calm half of the frame so the
    garment is never covered. */
export function CampaignBanner() {
  const campaign = homeContent.campaign

  return (
    <section aria-label="VYRO campaign" className="relative isolate overflow-hidden bg-black">
      <div className="absolute inset-0">
        <SceneImage {...campaign.image} frame="wide" className="h-full w-full" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent md:hidden"
      />

      <div className="container-x relative flex min-h-[72vh] items-end py-14 md:min-h-[78vh] md:items-center md:py-20">
        <div className="max-w-xl">
          <h2 className="display-lg text-ivory">{campaign.headline}</h2>
          <p className="body-lg mt-5 max-w-sm text-ivory/75">{campaign.body}</p>
          <div className="mt-9">
            <Button href={campaign.cta.href} variant="light" size="lg">
              {campaign.cta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
