import { products } from '../../data/products'
import { homeContent } from '../../data/site'
import { ProductGrid } from '../product/ProductCard'
import { Reveal } from '../ui/Reveal'
import { SectionHeading, TextLink } from '../ui/SectionHeading'

export function FeaturedProducts() {
  const featured = products.slice(0, 4)

  return (
    <section aria-labelledby="featured-heading" className="border-b border-line py-16 md:py-24">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              label={homeContent.featured.label}
              headline={homeContent.featured.headline}
              body={homeContent.featured.body}
            />
            <TextLink to="/shop" className="mb-2">
              View all products
            </TextLink>
          </div>
        </Reveal>

        <Reveal delay={80} className="mt-12 md:mt-16">
          <ProductGrid products={featured} priorityCount={2} />
        </Reveal>

        <p className="mt-10 text-[12px] leading-relaxed text-muted">
          Prices are draft values for Drop 001 and are marked accordingly. Product photography on
          this page is placeholder artwork pending the campaign shoot.
        </p>
      </div>
    </section>
  )
}
