import { useState } from 'react'
import { X } from 'lucide-react'
import type { ProductSizeOption } from '../../data/types'
import { sizeGuide } from '../../data/products'
import { cn } from '../../lib/utils'

interface SizeSelectorProps {
  sizes: ProductSizeOption[]
  value: string | null
  onChange: (size: string) => void
  error?: string | null
}

export function SizeSelector({ sizes, value, onChange, error }: SizeSelectorProps) {
  return (
    <div id="sizes">
      <div className="flex items-baseline justify-between gap-4">
        <p className="label-xs text-muted">Size</p>
        <SizeGuideToggle />
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Select a size">
        {sizes.map((size) => {
          const selected = value === size.label
          return (
            <button
              key={size.label}
              type="button"
              onClick={() => size.available && onChange(size.label)}
              disabled={!size.available}
              aria-pressed={selected}
              aria-label={
                size.available
                  ? `Size ${size.label}${selected ? ', selected' : ''}`
                  : `Size ${size.label}, unavailable${size.note ? ` — ${size.note}` : ''}`
              }
              className={cn(
                'relative flex h-12 min-w-14 items-center justify-center border px-4 text-[13px] tracking-[0.06em] transition-all duration-200',
                selected
                  ? 'border-ink bg-black text-ivory'
                  : size.available
                    ? 'border-line text-ink hover:border-ink/50'
                    : 'cursor-not-allowed border-line/60 text-muted/60',
              )}
            >
              {size.label}
              {!size.available ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 rotate-[-18deg] bg-muted/40"
                />
              ) : null}
            </button>
          )
        })}
      </div>
      {sizes.some((size) => !size.available) ? (
        <p className="mt-3 text-[12px] text-muted">
          {sizes
            .filter((size) => !size.available)
            .map((size) => `${size.label}: ${size.note ?? 'Unavailable'}`)
            .join(' · ')}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-[12px] text-ink">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function SizeGuideToggle() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="label-xs text-ink underline-offset-4 hover:underline"
      >
        Size guide
      </button>
      {open ? <SizeGuideDialog onClose={() => setOpen(false)} /> : null}
    </>
  )
}

export function SizeGuideDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Size guide"
    >
      <button
        type="button"
        aria-label="Close size guide"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        style={{ animation: 'vyro-fade-in 180ms ease-out' }}
      />
      <div
        className="relative max-h-[86vh] w-full max-w-2xl overflow-y-auto bg-ivory p-6 sm:p-10"
        style={{ animation: 'vyro-toast-in 240ms cubic-bezier(0.22,0.61,0.36,1)' }}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="label-xs text-muted">Fit</p>
            <h2 className="display-sm mt-3 text-ink">Size guide</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="p-2 -mr-2 text-ink transition-opacity hover:opacity-60"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <p className="mt-5 text-[14px] leading-relaxed text-muted">
          VYRO uses an oversized, relaxed block across Drop 001. Measurements below are garment
          measurements in centimetres.
        </p>

        {sizeGuide.status === 'draft' ? (
          <p className="mt-4 border border-olive/40 bg-olive/8 px-3 py-2 text-[12px] text-ink">
            Draft measurements — to be confirmed against production samples before launch.
          </p>
        ) : null}

        <table className="mt-6 w-full border-collapse text-left text-[13px]">
          <caption className="sr-only">Garment measurements by size, in centimetres</caption>
          <thead>
            <tr className="border-b border-ink/20">
              <th scope="col" className="py-3 pr-4 font-medium">Size</th>
              <th scope="col" className="py-3 pr-4 font-medium">Chest</th>
              <th scope="col" className="py-3 pr-4 font-medium">Length</th>
              <th scope="col" className="py-3 pr-4 font-medium">Shoulder</th>
              <th scope="col" className="py-3 font-medium">Sleeve</th>
            </tr>
          </thead>
          <tbody>
            {sizeGuide.rows.map((row) => (
              <tr key={row.size} className="border-b border-line">
                <th scope="row" className="py-3 pr-4 font-medium text-ink">{row.size}</th>
                <td className="py-3 pr-4 tabular-nums text-muted">{row.chest}</td>
                <td className="py-3 pr-4 tabular-nums text-muted">{row.length}</td>
                <td className="py-3 pr-4 tabular-nums text-muted">{row.shoulder}</td>
                <td className="py-3 tabular-nums text-muted">{row.sleeve}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="mt-6 space-y-2 text-[12px] leading-relaxed text-muted">
          {sizeGuide.notes.map((note) => (
            <li key={note}>— {note}</li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="label-sm mt-8 inline-flex h-12 items-center bg-black px-8 text-ivory transition-colors hover:bg-ink"
        >
          Close
        </button>
      </div>
    </div>
  )
}
