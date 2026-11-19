import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/utils'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Stagger in milliseconds when several reveals share a parent. */
  delay?: number
  as?: ElementType
  id?: string
}

/** Fades content in when it enters the viewport. Degrades to a no-op without JS
    or when the user prefers reduced motion. */
export function Reveal({ children, className, delay = 0, as: Tag = 'div', id }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '0px 0px 12% 0px', threshold: 0.04 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      id={id}
      ref={ref}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
      className={cn('reveal', visible && 'is-visible', className)}
    >
      {children}
    </Tag>
  )
}
