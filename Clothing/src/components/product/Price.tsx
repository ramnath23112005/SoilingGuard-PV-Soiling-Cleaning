import { formatINR } from '../../lib/utils'
import type { Product } from '../../data/types'
import { cn } from '../../lib/utils'

interface PriceProps {
  product: Product
  className?: string
  /** Show the small draft marker. Disable in tight layouts. */
  showDraftNote?: boolean
}

/** Renders INR pricing. Draft prices are clearly marked until the brand
    confirms final values — see data/products.ts. */
export function Price({ product, className, showDraftNote = true }: PriceProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span className="text-[13px] tabular-nums text-ink">{formatINR(product.price)}</span>
      {product.compareAtPrice ? (
        <span className="text-[12px] text-muted line-through tabular-nums">
          {formatINR(product.compareAtPrice)}
        </span>
      ) : null}
      {product.pricingStatus === 'draft' && showDraftNote ? (
        <span className="label-xs text-olive" title="Draft pricing — not final">
          Draft
        </span>
      ) : null}
    </span>
  )
}
