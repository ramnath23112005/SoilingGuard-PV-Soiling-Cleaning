import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface SectionHeadingProps {
  label?: string
  headline: string
  body?: string
  className?: string
  align?: 'left' | 'center'
  tone?: 'ink' | 'ivory'
  actions?: ReactNode
  as?: 'h1' | 'h2'
}

export function SectionHeading({
  label,
  headline,
  body,
  className,
  align = 'left',
  tone = 'ink',
  actions,
  as: Heading = 'h2',
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {label ? (
        <p className={cn('label-xs', tone === 'ink' ? 'text-muted' : 'text-ivory/55')}>{label}</p>
      ) : null}
      <Heading
        className={cn(
          'display-md mt-4',
          tone === 'ink' ? 'text-ink' : 'text-ivory',
        )}
      >
        {headline}
      </Heading>
      {body ? (
        <p
          className={cn(
            'body-lg mt-5 max-w-xl',
            align === 'center' && 'mx-auto',
            tone === 'ink' ? 'text-muted' : 'text-ivory/70',
          )}
        >
          {body}
        </p>
      ) : null}
      {actions ? <div className="mt-8 flex flex-wrap items-center gap-6">{actions}</div> : null}
    </div>
  )
}

export function TextLink({
  to,
  children,
  diagonal = false,
  tone = 'ink',
  className,
}: {
  to: string
  children: ReactNode
  diagonal?: boolean
  tone?: 'ink' | 'ivory'
  className?: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group link-line label-sm',
        tone === 'ink' ? 'text-ink' : 'text-ivory',
        className,
      )}
    >
      {children}
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5">
        {diagonal ? '↗' : '→'}
      </span>
    </Link>
  )
}
