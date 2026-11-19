import { usePageMeta } from '../lib/seo'
import { HeroSection } from '../components/home/HeroSection'
import { BrandValues } from '../components/home/BrandValues'
import { CollectionGrid } from '../components/home/CollectionGrid'
import { FeaturedProducts } from '../components/home/FeaturedProducts'
import { CampaignBanner } from '../components/home/CampaignBanner'
import { BrandStory } from '../components/home/BrandStory'
import { LookbookTeaser } from '../components/home/LookbookTeaser'
import { NewsletterPanel } from '../components/home/NewsletterPanel'
import { ServiceStrip } from '../components/home/ServiceStrip'

export function HomePage() {
  usePageMeta({
    title: 'VYRO',
    description:
      'VYRO is an independent streetwear label. Oversized T-shirts, considered fits and limited graphic studies. Less noise. More identity.',
    path: '/',
  })

  return (
    <>
      <HeroSection />
      <BrandValues />
      <CollectionGrid />
      <FeaturedProducts />
      <CampaignBanner />
      <BrandStory />
      <LookbookTeaser />
      <NewsletterPanel />
      <ServiceStrip />
    </>
  )
}
