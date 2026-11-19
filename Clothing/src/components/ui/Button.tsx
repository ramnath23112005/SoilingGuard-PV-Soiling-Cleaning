import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

type Variant = 'solid' | 'outline' | 'ghost' | 'light' | 'light-outline'
type Size = 'sm' | 'md' | 'lg'

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 label-sm whitespace-nowrap transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-45'

const variants: Record<Variant, string> = {
  solid: 'bg-black text-ivory hover:bg-ink active:translate-y-px',
  outline:
    'border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-ivory active:translate-y-px',
  ghost: 'text-ink hover:opacity-70',
  light: 'bg-ivory text-black hover:bg-paper active:translate-y-px',
  'light-outline':
    'border border-ivory/35 text-ivory hover:bg-ivory hover:text-black active:translate-y-px',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 px-5',
  md: 'h-12 px-7',
  lg: 'h-14 px-9',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  href?: string
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'solid',
  size = 'md',
  href,
  loading = false,
  disabled,
  className,
  children,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className)

  if (href && !disabled && !loading) {
    const external = href.startsWith('http') || href.startsWith('mailto:')
    if (external) {
      return (
        <a href={href} className={classes} {...(rest as Record<string, unknown>)}>
          {children}
          <Arrow />
        </a>
      )
    }
    return (
      <Link to={href} className={classes}>
        {children}
        <Arrow />
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...rest}
    >
      {loading ? 'Please wait' : children}
      {loading ? null : <Arrow />}
    </button>
  )
}

function Arrow() {
  return (
    <span aria-hidden="true" className="transition-transform duration-200 ease-out group-hover/btn:translate-x-1">
      →
    </span>
  )
}

export interface ArrowLinkProps {
  href: string
  children: ReactNode
  className?: string
  /** Renders the diagonal outbound-style arrow instead of the horizontal one. */
  diagonal?: boolean
}

export function ArrowLink({ href, children, className, diagonal = false }: ArrowLinkProps) {
  const classes = cn('link-line label-sm text-ink', className)
  const icon = diagonal ? '↗' : '→'
  const external = href.startsWith('http') || href.startsWith('mailto:')

  if (external) {
    return (
      <a href={href} className={classes}>
        {children}
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5">
          {icon}
        </span>
      </a>
    )
  }

  return (
    <Link to={href} className={classes}>
      {children}
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5">
        {icon}
      </span>
    </Link>
  )
}
