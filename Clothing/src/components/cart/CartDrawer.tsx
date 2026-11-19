import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, X } from 'lucide-react'
import { useStore } from '../../lib/store'
import { formatINR, lockBodyScroll, unlockBodyScroll } from '../../lib/utils'
import { SceneImage } from '../imagery/Scene'
import { requestCheckout } from '../../lib/integrations'

export function CartDrawer() {
  const { isCartOpen, closeCart, lines, subtotal, count, removeLine, setLineQuantity } = useStore()
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [checkoutState, setCheckoutState] = useState<
    { status: 'idle' } | { status: 'checking' } | { status: 'not-configured' } | { status: 'error'; message: string }
  >({ status: 'idle' })

  useEffect(() => {
    if (!isCartOpen) return undefined
    lockBodyScroll()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart()
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('button')?.focus()
    }, 30)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
      unlockBodyScroll()
    }
  }, [isCartOpen, closeCart])

  const onCheckout = async () => {
    setCheckoutState({ status: 'checking' })
    const result = await requestCheckout()
    if (result.status === 'not-configured') {
      setCheckoutState({ status: 'not-configured' })
    } else if (result.status === 'failed') {
      setCheckoutState({ status: 'error', message: result.message })
    } else {
      setCheckoutState({ status: 'idle' })
    }
  }

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <button
        type="button"
        aria-label="Close bag"
        onClick={closeCart}
        className="absolute inset-0 bg-black/35"
        style={{ animation: 'vyro-fade-in 220ms ease-out' }}
      />
      <div
        ref={panelRef}
        className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-ivory shadow-[0_0_60px_rgba(8,8,8,0.18)]"
        style={{ animation: 'vyro-drawer-in 280ms cubic-bezier(0.22,0.61,0.36,1)' }}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="label-sm text-ink">
            Your bag {count > 0 ? `(${count})` : ''}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="p-2 -mr-2 text-ink transition-opacity hover:opacity-60"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-start justify-center gap-4 py-16">
              <p className="display-sm text-ink">Your bag is empty.</p>
              <p className="max-w-xs text-[14px] leading-relaxed text-muted">
                Drop 001 is loading. Start with the essentials — they’re built to be worn on repeat.
              </p>
              <Link
                to="/shop"
                onClick={closeCart}
                className="label-sm border-b border-ink pb-1 text-ink"
              >
                CONTINUE SHOPPING →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-5">
                  <Link
                    to={`/product/${line.slug}`}
                    onClick={closeCart}
                    className="block h-28 w-24 shrink-0 overflow-hidden bg-stone"
                    aria-label={line.name}
                  >
                    <SceneImage
                      kind={line.image.kind}
                      view={line.image.view}
                      tone={line.tone}
                      graphic={line.image.graphic}
                      alt=""
                      showMark={false}
                      className="h-full w-full"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/product/${line.slug}`}
                        onClick={closeCart}
                        className="text-[13px] leading-snug text-ink link-line"
                      >
                        {line.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="label-xs shrink-0 text-muted underline-offset-4 hover:text-ink hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="mt-1 text-[12px] text-muted">
                      {line.colorName} / {line.size}
                    </p>
                    <p className="mt-1 text-[13px] text-ink tabular-nums">
                      {formatINR(line.price)}
                      {line.pricingStatus === 'draft' ? (
                        <span className="ml-2 label-xs text-olive">Draft price</span>
                      ) : null}
                    </p>
                    <div className="mt-auto flex items-center gap-4 pt-3">
                      <QuantityStepper
                        quantity={line.quantity}
                        onChange={(next) => setLineQuantity(line.key, next)}
                        name={line.name}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 ? (
          <footer className="border-t border-line px-6 py-6">
            <div className="flex items-baseline justify-between">
              <span className="label-xs text-muted">Subtotal</span>
              <span className="text-[17px] text-ink tabular-nums">{formatINR(subtotal)}</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              Shipping and taxes are not configured yet and are not included. Prices shown are
              draft values for Drop 001.
            </p>
            <button
              type="button"
              onClick={onCheckout}
              disabled={checkoutState.status === 'checking'}
              className="mt-5 inline-flex h-13 w-full items-center justify-center bg-black px-8 py-4 label-sm text-ivory transition-colors hover:bg-ink disabled:opacity-50"
            >
              {checkoutState.status === 'checking' ? 'Checking…' : 'CHECKOUT'}
            </button>
            {checkoutState.status === 'not-configured' ? (
              <p role="status" className="mt-3 text-[12px] leading-relaxed text-ink">
                Checkout isn’t connected yet — no order has been placed. Your bag is saved in this
                browser. Connect a payment provider to activate purchases.
              </p>
            ) : checkoutState.status === 'error' ? (
              <p role="status" className="mt-3 text-[12px] leading-relaxed text-ink">
                {checkoutState.message}
              </p>
            ) : null}
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  closeCart()
                  navigate('/cart')
                }}
                className="label-xs text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                View bag
              </button>
              <button
                type="button"
                onClick={closeCart}
                className="label-xs text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Continue shopping
              </button>
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  )
}

function QuantityStepper({
  quantity,
  onChange,
  name,
}: {
  quantity: number
  onChange: (next: number) => void
  name: string
}) {
  return (
    <div className="inline-flex items-center border border-line">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label={`Decrease quantity of ${name}`}
        className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-stone disabled:opacity-30"
        disabled={quantity <= 1}
      >
        <Minus size={13} strokeWidth={1.5} />
      </button>
      <span className="w-8 text-center text-[13px] tabular-nums" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        aria-label={`Increase quantity of ${name}`}
        disabled={quantity >= 10}
        className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-stone disabled:opacity-30"
      >
        <Plus size={13} strokeWidth={1.5} />
      </button>
    </div>
  )
}
