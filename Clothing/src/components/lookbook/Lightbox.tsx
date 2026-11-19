import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { SceneImageRef } from '../../data/types'
import { SceneImage } from '../imagery/Scene'
import { lockBodyScroll, unlockBodyScroll } from '../../lib/utils'

export interface LightboxEntry {
  id: string
  title: string
  caption?: string
  image: SceneImageRef
  ratio?: 'tall' | 'wide' | 'square'
}

interface LightboxProps {
  entries: LightboxEntry[]
  /** null when closed */
  index: number | null
  onClose: () => void
  onSelect: (index: number) => void
}

/** Minimal, keyboard-friendly image viewer. */
export function Lightbox({ entries, index, onClose, onSelect }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const open = index !== null

  useEffect(() => {
    if (!open) return undefined
    lockBodyScroll()
    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight' && index !== null) onSelect((index + 1) % entries.length)
      if (event.key === 'ArrowLeft' && index !== null)
        onSelect((index - 1 + entries.length) % entries.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      unlockBodyScroll()
    }
  }, [open, index, entries.length, onClose, onSelect])

  if (index === null) return null
  const entry = entries[index]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-label={`${entry.title} — image viewer`}
      style={{ animation: 'vyro-fade-in 180ms ease-out' }}
    >
      <button
        type="button"
        ref={closeRef}
        onClick={onClose}
        aria-label="Close viewer"
        className="absolute right-4 top-4 p-3 text-ivory transition-opacity hover:opacity-70 md:right-8 md:top-8"
      >
        <X size={22} strokeWidth={1.4} />
      </button>

      <figure className="flex max-h-full w-full max-w-4xl flex-col items-center">
        <div className="relative w-full max-h-[76vh] overflow-hidden bg-stone">
          <SceneImage
            {...entry.image}
            className="max-h-[76vh] w-full"
            loading="eager"
          />
        </div>
        <figcaption className="mt-5 flex w-full items-start justify-between gap-6 text-ivory">
          <div>
            <p className="label-sm">{entry.title}</p>
            {entry.caption ? (
              <p className="mt-2 max-w-md text-[13px] text-ivory/65">{entry.caption}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onSelect((index - 1 + entries.length) % entries.length)}
              className="label-xs text-ivory/70 transition-colors hover:text-ivory"
            >
              ← Prev
            </button>
            <span className="label-xs text-ivory/40 tabular-nums">
              {index + 1} / {entries.length}
            </span>
            <button
              type="button"
              onClick={() => onSelect((index + 1) % entries.length)}
              className="label-xs text-ivory/70 transition-colors hover:text-ivory"
            >
              Next →
            </button>
          </div>
        </figcaption>
      </figure>
    </div>
  )
}
