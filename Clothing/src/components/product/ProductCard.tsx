import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../data/types'
import { SceneImage } from '../imagery/Scene'
import { useStore } from '../../lib/store'
import { cn } from '../../lib/utils'
import { Price } from './Price'

export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: Product
  className?: string
  priority?: boolean
}) {
  const { isWishlisted, toggleWishlist } = useStore()
  const wished = isWishlisted(product.id)
  const [primary, secondary] = product.images
  const comingSoon = product.availability === 'coming-soon'
  const soldOut = product.availability === 'sold-out'
  const firstAvailableSize = product.sizes.find((size) => size.available)

  return (
    <article className={cn('group/product relative flex flex-col', className)}>
      <div className="relative">
        <Link
          to={`/product/${product.slug}`}
          className="media-zoom block aspect-4/5 overflow-hidden bg-white"
          aria-label={`${product.name} — view product`}
        >
          <SceneImage
            {...primary}
            className="absolute inset-0 h-full w-full"
            loading={priority ? 'eager' : 'lazy'}
          />
          {secondary ? (
            <SceneImage
              {...secondary}
              className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500 ease-out group-hover/product:opacity-100"
              alt=""
            />
          ) : null}
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span>
            {comingSoon ? (
              <span className="label-xs bg-ivory/85 px-2 py-1.5 text-ink">Coming soon</span>
            ) : soldOut ? (
              <span className="label-xs bg-ivory/85 px-2 py-1.5 text-ink">Sold out</span>
            ) : null}
          </span>
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-pressed={wished}
            aria-label={wished ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center bg-ivory/85 text-ink transition-colors hover:bg-ivory"
          >
            <Heart
              size={15}
              strokeWidth={1.5}
              className={cn('transition-colors', wished ? 'fill-ink text-ink' : 'text-ink')}
            />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-1.5">
        <Link
          to={`/product/${product.slug}`}
          className="link-line self-start text-[13px] leading-snug text-ink"
        >
          {product.name}
        </Link>
        <Price product={product} />
        <div className="mt-1 flex items-center gap-2">
          {product.colors.map((color) => (
            <span
              key={color.name}
              title={color.name}
              className="h-3 w-3 rounded-full border border-ink/15"
              style={{ backgroundColor: color.hex }}
            />
          ))}
          <span className="sr-only">
            {product.colors.map((color) => color.name).join(', ')}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2">
          {comingSoon ? (
            <span className="label-xs text-muted">
              {product.availabilityNote ?? 'Join the list for first access'}
            </span>
          ) : soldOut ? (
            <span className="label-xs text-muted">Sold out</span>
          ) : (
            <Link
              to={`/product/${product.slug}#sizes`}
              className="label-xs text-ink underline-offset-4 hover:underline"
            >
              Select size{firstAvailableSize ? ` — from ${firstAvailableSize.label}` : ''}
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

export function ProductGrid({
  products,
  className,
  priorityCount = 0,
}: {
  products: Product[]
  className?: string
  priorityCount?: number
}) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4', className)}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
        />
      ))}
    </div>
  )
}
