import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Minus, Plus } from 'lucide-react'
import { usePageMeta } from '../lib/seo'
import { categoryLabels, getProductBySlug, getRelatedProducts } from '../data/products'
import { useStore } from '../lib/store'
import { ProductGallery } from '../components/product/ProductGallery'
import { SizeSelector } from '../components/product/SizeSelector'
import { Price } from '../components/product/Price'
import { ProductGrid } from '../components/product/ProductCard'
import { Button } from '../components/ui/Button'
import { NotFoundPage } from './NotFoundPage'

export function ProductPage() {
  const { slug } = useParams()
  const product = slug ? getProductBySlug(slug) : undefined
  const { addLine } = useStore()

  const [selectedColor, setSelectedColor] = useState(() => product?.colors[0]?.name ?? null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [sizeError, setSizeError] = useState<string | null>(null)

  const related = useMemo(() => (product ? getRelatedProducts(product) : []), [product])

  usePageMeta({
    title: product?.name ?? 'Product not found',
    description: product?.description,
    path: product ? `/product/${product.slug}` : '/shop',
    noindex: !product,
  })

  if (!product) return <NotFoundPage />

  const comingSoon = product.availability === 'coming-soon'
  const soldOut = product.availability === 'sold-out'
  const canAdd = !comingSoon && !soldOut

  const onAdd = () => {
    if (!selectedSize) {
      setSizeError('Select a size before adding to your bag.')
      document.getElementById('sizes')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const color = product.colors.find((option) => option.name === selectedColor) ?? product.colors[0]
    if (!color) return
    setSizeError(null)
    addLine({
      product,
      colorName: color.name,
      tone: color.tone,
      size: selectedSize,
      quantity,
    })
  }

  return (
    <>
      <div className="container-x py-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
          <Link to="/" className="hover:text-ink">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-ink">
            {categoryLabels[product.category]}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      <section className="container-x pb-16 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <p className="label-xs text-muted">{categoryLabels[product.category]}</p>
              <h1 className="display-sm mt-3 text-ink">{product.name}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Price product={product} className="text-[15px]" />
                <span className="label-xs text-muted">
                  {comingSoon ? 'Coming soon' : soldOut ? 'Sold out' : 'Available'}
                </span>
              </div>

              <p className="body-lg mt-6 text-ink/80">{product.description}</p>

              {product.availabilityNote ? (
                <p className="mt-5 border border-line bg-stone/60 px-4 py-3 text-[13px] leading-relaxed text-ink">
                  {product.availabilityNote}
                </p>
              ) : null}

              <div className="mt-8">
                <p className="label-xs text-muted">Colour</p>
                <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Select a colour">
                  {product.colors.map((color) => {
                    const selected = selectedColor === color.name
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.name)}
                        aria-pressed={selected}
                        className={`inline-flex items-center gap-2 border px-3 py-2 text-[12px] transition-colors ${
                          selected ? 'border-ink text-ink' : 'border-line text-muted hover:border-ink/40'
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-ink/15"
                          style={{ backgroundColor: color.hex }}
                          aria-hidden="true"
                        />
                        {color.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-8">
                <SizeSelector
                  sizes={product.sizes}
                  value={selectedSize}
                  onChange={(size) => {
                    setSelectedSize(size)
                    setSizeError(null)
                  }}
                  error={sizeError}
                />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center border border-line" aria-label="Quantity">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex h-12 w-12 items-center justify-center text-ink transition-colors hover:bg-stone disabled:opacity-30"
                  >
                    <Minus size={14} strokeWidth={1.5} />
                  </button>
                  <span className="w-10 text-center text-[14px] tabular-nums" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                    className="flex h-12 w-12 items-center justify-center text-ink transition-colors hover:bg-stone disabled:opacity-30"
                  >
                    <Plus size={14} strokeWidth={1.5} />
                  </button>
                </div>

                {canAdd ? (
                  <Button onClick={onAdd} size="lg" className="flex-1 sm:flex-none">
                    Add to bag
                  </Button>
                ) : (
                  <Button href="/#newsletter" size="lg" variant="outline">
                    Get early access
                  </Button>
                )}
              </div>

              {comingSoon ? (
                <p className="mt-4 text-[13px] leading-relaxed text-muted">
                  This piece is not purchasable yet. Join the list and you’ll hear first when Drop
                  001 opens.
                </p>
              ) : null}

              <dl className="mt-10 divide-y divide-line border-y border-line text-[13px]">
                <div className="flex gap-6 py-4">
                  <dt className="label-xs w-28 shrink-0 text-muted">Fit</dt>
                  <dd className="text-ink/80">{product.fit}</dd>
                </div>
                <div className="flex gap-6 py-4">
                  <dt className="label-xs w-28 shrink-0 text-muted">Fabric</dt>
                  <dd className="text-muted">
                    {product.fabric ?? 'Fabric details will be published with the final drop.'}
                  </dd>
                </div>
                <div className="flex gap-6 py-4">
                  <dt className="label-xs w-28 shrink-0 text-muted">Care</dt>
                  <dd className="text-muted">
                    {product.care ?? 'Care instructions will be published with the final drop.'}
                  </dd>
                </div>
                <div className="flex gap-6 py-4">
                  <dt className="label-xs w-28 shrink-0 text-muted">Shipping</dt>
                  <dd className="text-muted">
                    <Link to="/policies/shipping" className="link-line">Shipping policy</Link>
                    {' · '}
                    <Link to="/policies/returns" className="link-line">Returns &amp; exchanges</Link>
                    {' · '}
                    <Link to="/policies/size-guide" className="link-line">Size guide</Link>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="border-t border-line py-16 md:py-20">
          <div className="container-x">
            <div className="flex items-end justify-between gap-6">
              <h2 id="related-heading" className="display-sm text-ink">
                You may also consider
              </h2>
              <Link to="/shop" className="link-line label-xs text-ink">
                All products →
              </Link>
            </div>
            <ProductGrid products={related} className="mt-10" />
          </div>
        </section>
      ) : null}
    </>
  )
}
