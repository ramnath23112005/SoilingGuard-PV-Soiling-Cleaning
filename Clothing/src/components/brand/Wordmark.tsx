import { cn } from '../../lib/utils'

interface WordmarkProps {
  className?: string
  /** Larger editorial lockup for the footer and lookbook. */
  size?: 'sm' | 'lg'
  as?: 'span' | 'div'
}

/** Typographic VYRO wordmark. No icon, no ornament — the letters are the mark. */
export function Wordmark({ className, size = 'sm', as: Tag = 'span' }: WordmarkProps) {
  return (
    <Tag
      className={cn(
        'select-none font-sans font-semibold leading-none text-current',
        size === 'sm' ? 'text-[15px] tracking-[0.34em]' : 'text-[clamp(2.5rem,7vw,4.5rem)] tracking-[0.22em]',
        className,
      )}
      aria-label="VYRO"
    >
      <span aria-hidden="true">VYRO</span>
    </Tag>
  )
}

/** Compact monogram — used on the hangtag/label asset sheet, not as the logo. */
export function Monogram({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center border border-current text-[13px] font-semibold tracking-[0.1em]',
        className,
      )}
      aria-hidden="true"
    >
      V
    </span>
  )
}
