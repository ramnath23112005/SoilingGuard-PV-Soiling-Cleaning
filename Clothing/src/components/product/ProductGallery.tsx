import { useRef, useState } from 'react'
import type { SceneImageRef } from '../../data/types'
import { SceneImage } from '../imagery/Scene'
import { cn } from '../../lib/utils'

interface ProductGalleryProps {
  images: SceneImageRef[]
  productName: string
}

/** Main image with a thumbnail rail. Mobile can swipe the main image; desktop
    gets discreet prev/next controls in the corner. */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const touchStart = useRef<number | null>(null)
  const current = images[active] ?? images[0]

  const go = (index: number) => {
    setActive(Math.min(images.length - 1, Math.max(0, index)))
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-4/5 w-full touch-pan-y overflow-hidden bg-white"
        onTouchStart={(event) => {
          touchStart.current = event.changedTouches[0].clientX
        }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return
          const delta = event.changedTouches[0].clientX - touchStart.current
          if (Math.abs(delta) > 42) go(active + (delta < 0 ? 1 : -1))
          touchStart.current = null
        }}
      >
        <SceneImage
          {...current}
          alt={`${productName} — ${current.alt}`}
          className="absolute inset-0 h-full w-full"
          loading="eager"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            aria-label="Previous image"
            className="flex h-10 w-10 items-center justify-center bg-ivory/85 text-ink transition-colors hover:bg-ivory disabled:opacity-35"
          >
            ←
          </button>
          <span className="label-xs bg-ivory/85 px-2 py-2.5 text-ink/70 tabular-nums" aria-live="polite">
            {active + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={() => go(active + 1)}
            disabled={active === images.length - 1}
            aria-label="Next image"
            className="flex h-10 w-10 items-center justify-center bg-ivory/85 text-ink transition-colors hover:bg-ivory disabled:opacity-35"
          >
            →
          </button>
        </div>
      </div>

      <ul className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <li key={`${image.view}-${index}`}>
            <button
              type="button"
              onClick={() => go(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={active === index}
              className={cn(
                'relative aspect-4/5 w-full overflow-hidden border bg-white transition-colors',
                active === index ? 'border-ink' : 'border-transparent hover:border-line',
              )}
            >
              <SceneImage {...image} alt="" showMark={false} className="absolute inset-0 h-full w-full" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
