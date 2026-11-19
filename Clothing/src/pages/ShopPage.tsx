import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePageMeta } from '../lib/seo'
import { products } from '../data/products'
import { SceneImage } from '../components/imagery/Scene'
import { ProductGrid } from '../components/product/ProductCard'
import {
  applyFilters,
  buildFilterOptions,
  CollectionFilters,
  defaultFilters,
  hasActiveFilters,
  type FilterState,
} from '../components/product/CollectionFilters'
import { Reveal } from '../components/ui/Reveal'

const categoryCopy: Record<string, { title: string; intro: string }> = {
  all: {
    title: 'The Collection',
    intro: 'Drop 001 in full — solid essentials and the first two graphic studies.',
  },
  essentials: {
    title: 'Essentials',
    intro: 'Minimal, solid-colour oversized T-shirts built as a daily uniform.',
  },
  'graphic-studies': {
    title: 'Graphic Studies',
    intro: 'Original graphic-led streetwear, released in limited runs.',
  },
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const category = categoryParam === 'essentials' || categoryParam === 'graphic-studies' ? categoryParam : 'all'

  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const scoped = useMemo(
    () =>
      category === 'all'
        ? products
        : products.filter((product) => product.category === category),
    [category],
  )

  const options = useMemo(() => buildFilterOptions(scoped), [scoped])
  const results = useMemo(() => applyFilters(products, filters, category), [filters, category])

  const copy = categoryCopy[category]

  usePageMeta({
    title: copy.title,
    description: `${copy.intro} Premium oversized T-shirts and streetwear essentials from VYRO.`,
    path: category === 'all' ? '/shop' : `/shop?category=${category}`,
  })

  const setCategory = (next: string) => {
    if (next === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: next })
    }
  }

  return (
    <>
      <section aria-label="Collection banner" className="border-b border-line">
        <div className="relative aspect-3/2 w-full overflow-hidden bg-stone md:aspect-[16/6]">
          <SceneImage
            kind="campaign"
            view="full"
            tone="stone"
            frame="wide"
            alt="Placeholder artwork — campaign frame introducing the VYRO collection"
            className="absolute inset-0 h-full w-full"
            loading="eager"
          />
        </div>
      </section>

      <section className="border-b border-line py-12 md:py-16">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
              <div className="max-w-xl">
                <p className="label-xs text-muted">The Collection / 001</p>
                <h1 className="display-lg mt-4 text-ink">{copy.title}</h1>
                <p className="body-lg mt-5 text-muted">{copy.intro}</p>
              </div>
              <nav aria-label="Collection categories">
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {(
                    [
                      ['all', 'All'],
                      ['essentials', 'Essentials'],
                      ['graphic-studies', 'Graphic Studies'],
                    ] as const
                  ).map(([value, label]) => (
                    <li key={value}>
                      <button
                        type="button"
                        onClick={() => setCategory(value)}
                        aria-current={category === value ? 'page' : undefined}
                        className={
                          category === value
                            ? 'link-line label-xs text-ink'
                            : 'label-xs text-muted transition-colors hover:text-ink'
                        }
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </Reveal>
        </div>
      </section>

      <CollectionFilters
        filters={filters}
        onChange={setFilters}
        options={options}
        resultCount={results.length}
        totalCount={scoped.length}
        open={filtersOpen}
        onToggle={() => setFiltersOpen((open) => !open)}
      />

      <section className="py-12 md:py-16">
        <div className="container-x">
          {results.length === 0 ? (
            <div className="mx-auto max-w-md py-16 text-center">
              <p className="display-sm text-ink">Nothing matches — yet.</p>
              <p className="mt-4 text-[14px] leading-relaxed text-muted">
                No products in this selection match the filters you’ve chosen. Drop 001 is a small,
                focused release.
              </p>
              {hasActiveFilters(filters) ? (
                <button
                  type="button"
                  onClick={() => setFilters(defaultFilters)}
                  className="label-sm mt-8 border-b border-ink pb-1 text-ink"
                >
                  Clear all filters
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <ProductGrid products={results} priorityCount={2} />
              <p className="mt-12 text-[12px] text-muted">
                Draft pricing applies across Drop 001. Images are placeholder artwork until the
                product shoot is delivered.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  )
}
