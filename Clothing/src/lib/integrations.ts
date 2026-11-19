/* Integration boundaries.
   Nothing here pretends to be connected. Each service must be configured via
   environment variables before it is described to customers as live.

   VITE_NEWSLETTER_ENDPOINT  — POST endpoint accepting { email } JSON.
   VITE_CHECKOUT_ENDPOINT    — POST endpoint accepting the cart payload for
                               order creation (payment provider not wired).

   Until those exist, the UI shows honest "not connected" states. */

export const integrations = {
  newsletterEndpoint: import.meta.env.VITE_NEWSLETTER_ENDPOINT as string | undefined,
  checkoutEndpoint: import.meta.env.VITE_CHECKOUT_ENDPOINT as string | undefined,
  siteUrl: import.meta.env.VITE_SITE_URL as string | undefined,
}

export type SubmitResult =
  | { status: 'subscribed' }
  | { status: 'not-configured' }
  | { status: 'failed'; message: string }

export async function submitNewsletterEmail(email: string): Promise<SubmitResult> {
  const endpoint = integrations.newsletterEndpoint
  if (!endpoint) {
    return { status: 'not-configured' }
  }
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'vyro-site-newsletter' }),
    })
    if (!response.ok) {
      return { status: 'failed', message: `The list service responded with ${response.status}.` }
    }
    return { status: 'subscribed' }
  } catch {
    return { status: 'failed', message: 'The list service could not be reached.' }
  }
}

export type CheckoutResult =
  | { status: 'ready' }
  | { status: 'not-configured' }
  | { status: 'failed'; message: string }

/** Checkout is intentionally unconnected — no order is ever fabricated. */
export async function requestCheckout(): Promise<CheckoutResult> {
  const endpoint = integrations.checkoutEndpoint
  if (!endpoint) {
    return { status: 'not-configured' }
  }
  try {
    const response = await fetch(endpoint, { method: 'POST' })
    if (!response.ok) {
      return { status: 'failed', message: `Checkout service responded with ${response.status}.` }
    }
    return { status: 'ready' }
  } catch {
    return { status: 'failed', message: 'Checkout service could not be reached.' }
  }
}

export function absoluteUrl(path = '/'): string {
  const base = integrations.siteUrl ?? ''
  if (!base) return path
  return `${base.replace(/\/$/, '')}${path}`
}
