import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Field, isValidEmail } from '../ui/Field'
import { homeContent } from '../../data/site'
import { submitNewsletterEmail } from '../../lib/integrations'
import { cn } from '../../lib/utils'

type Status =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'invalid'; message: string }
  | { state: 'not-configured' }
  | { state: 'subscribed' }
  | { state: 'error'; message: string }

interface NewsletterFormProps {
  variant?: 'panel' | 'compact'
  className?: string
}

/* Honest form states:
   - "subscribed" is only shown after a successful backend response.
   - Without an endpoint configured, the form reports that submission is not
     connected instead of pretending the address was added to a list. */
export function NewsletterForm({ variant = 'panel', className }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const panel = homeContent.newsletter
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status.state === 'subscribed' || status.state === 'not-configured') {
      inputRef.current?.blur()
    }
  }, [status.state])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!isValidEmail(email)) {
      setStatus({ state: 'invalid', message: 'Enter a valid email address.' })
      return
    }
    setStatus({ state: 'submitting' })
    const result = await submitNewsletterEmail(email.trim())
    if (result.status === 'subscribed') {
      setStatus({ state: 'subscribed' })
      setEmail('')
    } else if (result.status === 'not-configured') {
      setStatus({ state: 'not-configured' })
    } else {
      setStatus({ state: 'error', message: result.message })
    }
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={onSubmit} className={cn('max-w-sm', className)} noValidate>
        <label htmlFor="newsletter-compact" className="sr-only">
          Email address
        </label>
        <div className="flex items-center gap-3 border-b border-ivory/30 focus-within:border-ivory">
          <input
            id="newsletter-compact"
            ref={inputRef}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (status.state === 'invalid') setStatus({ state: 'idle' })
            }}
            placeholder={panel.placeholder}
            className="h-11 w-full bg-transparent text-[14px] text-ivory placeholder:text-ivory/40 focus:outline-none"
            aria-describedby="newsletter-compact-status"
          />
          <button
            type="submit"
            disabled={status.state === 'submitting'}
            className="label-xs shrink-0 py-2 text-ivory transition-opacity hover:opacity-70 disabled:opacity-40"
          >
            {status.state === 'submitting' ? 'Sending' : 'Join →'}
          </button>
        </div>
        <p id="newsletter-compact-status" aria-live="polite" className="mt-3 text-[12px] text-ivory/60">
          <CompactStatus status={status} />
        </p>
      </form>
    )
  }

  return (
    <form onSubmit={onSubmit} className={cn('w-full', className)} noValidate>
      <div className="grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <h2 className="display-lg text-ivory">{panel.headline}</h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ivory/70">{panel.body}</p>
        </div>
        <div>
          <Field
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            name="email"
            inputRef={inputRef}
            value={email}
            placeholder={panel.placeholder}
            onChange={(event) => {
              setEmail(event.target.value)
              if (status.state === 'invalid') setStatus({ state: 'idle' })
            }}
            error={status.state === 'invalid' ? status.message : null}
            containerClassName="[&_label]:text-ivory/50 [&_input]:text-ivory [&_input]:border-ivory/30 [&_input:focus]:border-ivory [&_input::placeholder]:text-ivory/35"
          />
          <button
            type="submit"
            disabled={status.state === 'submitting'}
            className="mt-5 inline-flex h-12 items-center justify-center bg-ivory px-8 label-sm text-black transition-colors hover:bg-paper disabled:opacity-50"
          >
            {status.state === 'submitting' ? 'Sending…' : panel.cta}
          </button>
          <div aria-live="polite" className="mt-4 text-[13px] text-ivory/65">
            <PanelStatus status={status} />
          </div>
        </div>
      </div>
      <p className="mt-8 text-[12px] text-ivory/40">{panel.note}</p>
    </form>
  )
}

function CompactStatus({ status }: { status: Status }) {
  switch (status.state) {
    case 'invalid':
      return <span className="text-ivory/80">{status.message}</span>
    case 'not-configured':
      return <span>Form validated — the email service is not connected yet.</span>
    case 'subscribed':
      return <span>You’re on the list.</span>
    case 'error':
      return <span>{status.message}</span>
    case 'submitting':
      return <span>Sending…</span>
    default:
      return <span>No noise. Just the important things.</span>
  }
}

function PanelStatus({ status }: { status: Status }) {
  switch (status.state) {
    case 'invalid':
      return <p className="text-ivory">{status.message}</p>
    case 'not-configured':
      return (
        <p className="text-ivory/80">
          Your email looks good — but the newsletter service is not connected yet, so nothing was
          sent or stored. Connect an endpoint to activate this form.
        </p>
      )
    case 'subscribed':
      return <p className="text-ivory">You’re on the list. First access, straight to your inbox.</p>
    case 'error':
      return <p className="text-ivory">{status.message} Try again shortly.</p>
    case 'submitting':
      return <p>Sending…</p>
    default:
      return null
  }
}
