import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, X } from 'lucide-react'
import { usePageMeta } from '../lib/seo'
import { useStore } from '../lib/store'
import { formatINR } from '../lib/utils'
import { SceneImage } from '../components/imagery/Scene'
import { requestCheckout } from '../lib/integrations'

export function CartPage() {
  const { lines, subtotal, count, removeLine, setLineQuantity, clearCart } = useStore()
  const [checkoutState, setCheckoutState] = useState<
    | { status: 'idle' }
    | { status: 'checking' }
    | { status: 'not-configured' }
    | { status: 'error'; message: string }
  >({ status: 'idle' })

  usePageMeta({
    title: 'Your bag',
    description: 'Review the pieces in your VYRO bag.',
    path: '/cart',
    noindex: true,
  })

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

  return (
    <section className="container-x py-12 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="label-xs text-muted">Bag</p>
          <h1 className="display-md mt-3 text-ink">Your bag</h1>
        </div>
        <p className="text-[13px] text-muted" aria-live="polite">
          {count} {count === 1 ? 'item' : 'items'}
        </p>
      </header>

      {lines.length === 0 ? (
        <div className="mx-auto max-w-md py-20 text-center">
          <p className="display-sm text-ink">Nothing here yet.</p>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">
            Your bag is empty. Drop 001 opens soon — start with the essentials.
          </p>
          <Link to="/shop" className="label-sm mt-8 inline-block border-b border-ink pb-1 text-ink">
            CONTINUE SHOPPING →
          </Link>
        </div>
      ) : (
        <div className="grid gap-12 pt-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ul className="divide-y divide-line">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-5 py-6">
                  <Link
                    to={`/product/${line.slug}`}
                    className="block h-36 w-28 shrink-0 overflow-hidden bg-white"
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
                    <div className="flex items-start justify-between gap-4">
                      <Link to={`/product/${line.slug}`} className="text-[14px] text-ink link-line">
                        {line.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        aria-label={`Remove ${line.name} from bag`}
                        className="p-1 text-muted transition-colors hover:text-ink"
                      >
                        <X size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="mt-1 text-[12px] text-muted">
                      {line.colorName} / {line.size}
                    </p>
                    <p className="mt-1 text-[13px] tabular-nums text-ink">
                      {formatINR(line.price)}
                      {line.pricingStatus === 'draft' ? (
                        <span className="ml-2 label-xs text-olive">Draft price</span>
                      ) : null}
                    </p>
                    <div className="mt-auto flex items-center gap-5 pt-4">
                      <div className="inline-flex items-center border border-line">
                        <button
                          type="button"
                          onClick={() => setLineQuantity(line.key, line.quantity - 1)}
                          disabled={line.quantity <= 1}
                          aria-label={`Decrease quantity of ${line.name}`}
                          className="flex h-10 w-10 items-center justify-center text-ink transition-colors hover:bg-stone disabled:opacity-30"
                        >
                          <Minus size={13} strokeWidth={1.5} />
                        </button>
                        <span className="w-8 text-center text-[13px] tabular-nums">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setLineQuantity(line.key, line.quantity + 1)}
                          disabled={line.quantity >= 10}
                          aria-label={`Increase quantity of ${line.name}`}
                          className="flex h-10 w-10 items-center justify-center text-ink transition-colors hover:bg-stone disabled:opacity-30"
                        >
                          <Plus size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="label-xs text-muted underline-offset-4 hover:text-ink hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <Link to="/shop" className="label-xs text-muted underline-offset-4 hover:text-ink hover:underline">
                ← Continue shopping
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="label-xs text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Empty bag
              </button>
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="border border-line bg-stone/50 p-6">
              <h2 className="label-sm text-ink">Summary</h2>
              <dl className="mt-5 space-y-3 text-[13px]">
                <div className="flex items-baseline justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="tabular-nums text-ink">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-muted">Shipping</dt>
                  <dd className="text-muted">Not configured</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <dt className="label-xs text-ink">Total</dt>
                  <dd className="tabular-nums text-[15px] text-ink">{formatINR(subtotal)}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={onCheckout}
                disabled={checkoutState.status === 'checking'}
                className="mt-6 inline-flex h-12 w-full items-center justify-center bg-black px-8 label-sm text-ivory transition-colors hover:bg-ink disabled:opacity-50"
              >
                {checkoutState.status === 'checking' ? 'Checking…' : 'CHECKOUT'}
              </button>

              {checkoutState.status === 'not-configured' ? (
                <p role="status" className="mt-4 text-[12px] leading-relaxed text-ink">
                  Checkout is not connected yet, so no order was placed and no payment was taken.
                  Your bag is stored in this browser only. A payment provider must be integrated
                  before this button can complete a purchase.
                </p>
              ) : checkoutState.status === 'error' ? (
                <p role="status" className="mt-4 text-[12px] leading-relaxed text-ink">
                  {checkoutState.message}
                </p>
              ) : null}

              <p className="mt-4 text-[12px] leading-relaxed text-muted">
                All prices are draft values for Drop 001. Review our{' '}
                <Link to="/policies/shipping" className="link-line">shipping</Link> and{' '}
                <Link to="/policies/returns" className="link-line">returns</Link> pages for the
                current status of store policies.
              </p>
            </div>
          </aside>
        </div>
      )}
    </section>
  )
}
