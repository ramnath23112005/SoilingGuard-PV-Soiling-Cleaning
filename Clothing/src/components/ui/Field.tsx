import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'
import { cn } from '../../lib/utils'

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  error?: string | null
  hint?: ReactNode
  containerClassName?: string
  inputRef?: Ref<HTMLInputElement>
}

export function Field({
  label,
  error,
  hint,
  containerClassName,
  className,
  inputRef,
  ...rest
}: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={cn('w-full', containerClassName)}>
      <label htmlFor={id} className="label-xs mb-2 block text-muted">
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'h-12 w-full border-b bg-transparent px-0 text-[15px] text-ink placeholder:text-muted/70 transition-colors duration-200',
          'focus:outline-none focus:border-ink',
          error ? 'border-ink' : 'border-line hover:border-muted',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-[12px] text-ink">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-[12px] text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}
