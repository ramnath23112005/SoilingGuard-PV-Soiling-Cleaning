import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Product, ProductStatus } from '../../data/types'
import { cn } from '../../lib/utils'

export type SortOption = 'featured' | 'price-asc' | 'price-desc'

export interface FilterState {
  sizes: string[]
  colors: string[]
  availability: ProductStatus | 'all'
  sort: SortOption
}

export const defaultFilters: FilterState = {
  sizes: [],
  colors: [],
  availability: 'all',
  sort: 'featured',
}

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.availability !== 'all' ||
    filters.sort !== 'featured'
  )
}

/** Builds filter option lists from the actual catalogue — no empty filters. */
export function buildFilterOptions(products: Product[]) {
  const sizes = new Map<string, number>()
  const colors = new Map<string, { hex: string; count: number }>()

  products.forEach((product) => {
    product.sizes.forEach((size) => {
      sizes.set(size.label, (sizes.get(size.label) ?? 0) + 1)
    })
    product.colors.forEach((color) => {
      const existing = colors.get(color.name)
      colors.set(color.name, { hex: color.hex, count: (existing?.count ?? 0) + 1 })
    })
  })

  return {
    sizes: Array.from(sizes.entries())
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
      .map(([label]) => label),
    colors: Array.from(colors.entries()).map(([name, value]) => ({ name, hex: value.hex })),
    availability: (['all', 'available', 'coming-soon'] as const).filter((value) => {
      if (value === 'all') return true
      return products.some((product) => product.availability === value)
    }),
  }
}

export function applyFilters(products: Product[], filters: FilterState, category: string | null) {
  let result = products.slice()

  if (category === 'essentials' || category === 'graphic-studies') {
    result = result.filter((product) => product.category === category)
  }
  if (filters.sizes.length > 0) {
    result = result.filter((product) =>
      product.sizes.some((size) => size.available && filters.sizes.includes(size.label)),
    )
  }
  if (filters.colors.length > 0) {
    result = result.filter((product) =>
      product.colors.some((color) => filters.colors.includes(color.name)),
    )
  }
  if (filters.availability !== 'all') {
    result = result.filter((product) => product.availability === filters.availability)
  }

  switch (filters.sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    default:
      break
  }

  return result
}

interface CollectionFiltersProps {
  filters: FilterState
  onChange: (next: FilterState) => void
  options: ReturnType<typeof buildFilterOptions>
  resultCount: number
  totalCount: number
  open: boolean
  onToggle: () => void
}

export function CollectionFilters({
  filters,
  onChange,
  options,
  resultCount,
  totalCount,
  open,
  onToggle,
}: CollectionFiltersProps) {
  const toggleSize = (size: string) => {
    onChange({
      ...filters,
      sizes: filters.sizes.includes(size)
        ? filters.sizes.filter((item) => item !== size)
        : [...filters.sizes, size],
    })
  }

  const toggleColor = (color: string) => {
    onChange({
      ...filters,
      colors: filters.colors.includes(color)
        ? filters.colors.filter((item) => item !== color)
        : [...filters.colors, color],
    })
  }

  return (
    <div className="border-y border-line bg-ivory">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <p className="label-xs text-muted" aria-live="polite">
            {resultCount} of {totalCount} products
          </p>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="label-xs text-muted">Sort</span>
              <span className="relative inline-flex items-center">
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    onChange({ ...filters, sort: event.target.value as SortOption })
                  }
                  className="appearance-none border-b border-ink/25 bg-transparent py-1 pr-6 text-[13px] text-ink focus:border-ink focus:outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price — low to high</option>
                  <option value="price-desc">Price — high to low</option>
                </select>
                <ChevronDown
                  size={13}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 text-muted"
                />
              </span>
            </label>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              aria-controls="collection-filters"
              className="label-xs border-b border-ink/25 py-1 text-ink transition-colors hover:border-ink"
            >
              {open ? 'Hide filters' : 'Filters'}
              {activeCount(filters) > 0 ? ` (${activeCount(filters)})` : ''}
            </button>
          </div>
        </div>

        {open ? (
          <div id="collection-filters" className="grid gap-8 border-t border-line py-8 md:grid-cols-3">
            <fieldset>
              <legend className="label-xs text-muted">Size</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {options.sizes.map((size) => {
                  const active = filters.sizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      aria-pressed={active}
                      className={cn(
                        'flex h-10 min-w-12 items-center justify-center border px-3 text-[12px] tracking-[0.08em] transition-colors',
                        active
                          ? 'border-ink bg-black text-ivory'
                          : 'border-line text-ink hover:border-ink/40',
                      )}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label-xs text-muted">Colour</legend>
              <div className="mt-4 flex flex-wrap gap-3">
                {options.colors.map((color) => {
                  const active = filters.colors.includes(color.name)
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => toggleColor(color.name)}
                      aria-pressed={active}
                      className={cn(
                        'flex items-center gap-2 border px-3 py-2 text-[12px] transition-colors',
                        active ? 'border-ink text-ink' : 'border-line text-muted hover:border-ink/40',
                      )}
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
            </fieldset>

            <fieldset>
              <legend className="label-xs text-muted">Availability</legend>
              <div className="mt-4 flex flex-wrap gap-3">
                {options.availability.map((value) => {
                  const active = filters.availability === value
                  const label =
                    value === 'all' ? 'All' : value === 'available' ? 'Available' : 'Coming soon'
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onChange({ ...filters, availability: value })}
                      aria-pressed={active}
                      className={cn(
                        'border px-3 py-2 text-[12px] transition-colors',
                        active ? 'border-ink bg-black text-ivory' : 'border-line text-ink hover:border-ink/40',
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          </div>
        ) : null}

        {activeCount(filters) > 0 ? (
          <div className="flex flex-wrap items-center gap-3 border-t border-line py-4">
            {filters.sizes.map((size) => (
              <Chip key={`size-${size}`} onRemove={() => toggleSize(size)}>
                Size {size}
              </Chip>
            ))}
            {filters.colors.map((color) => (
              <Chip key={`color-${color}`} onRemove={() => toggleColor(color)}>
                {color}
              </Chip>
            ))}
            {filters.availability !== 'all' ? (
              <Chip onRemove={() => onChange({ ...filters, availability: 'all' })}>
                {filters.availability === 'available' ? 'Available' : 'Coming soon'}
              </Chip>
            ) : null}
            {filters.sort !== 'featured' ? (
              <Chip
                onRemove={() => onChange({ ...filters, sort: 'featured' })}
              >
                {filters.sort === 'price-asc' ? 'Price ↑' : 'Price ↓'}
              </Chip>
            ) : null}
            <button
              type="button"
              onClick={() => onChange(defaultFilters)}
              className="label-xs text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function activeCount(filters: FilterState): number {
  return (
    filters.sizes.length +
    filters.colors.length +
    (filters.availability !== 'all' ? 1 : 0) +
    (filters.sort !== 'featured' ? 1 : 0)
  )
}

function Chip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 border border-ink/20 px-3 py-1.5 text-[12px] text-ink">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${typeof children === 'string' ? children : ''}`}
        className="text-muted transition-colors hover:text-ink"
      >
        ×
      </button>
    </span>
  )
}
