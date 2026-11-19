import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { Wordmark } from '../brand/Wordmark'
import { nav, site } from '../../data/site'
import { searchProducts } from '../../data/products'
import { useStore } from '../../lib/store'
import { cn, formatINR, lockBodyScroll, unlockBodyScroll } from '../../lib/utils'
import { SceneImage } from '../imagery/Scene'

export function AnnouncementBar() {
  const { enabled, text } = site.announcement
  if (!enabled) return null
  return (
    <div className="bg-black text-ivory">
      <div className="container-x flex h-9 items-center justify-center">
        <p className="label-xs text-ivory/85">{text}</p>
      </div>
    </div>
  )
}

export function SiteHeader() {
  const { count, openCart } = useStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-ivory/92 backdrop-blur-[6px] transition-[border-color,box-shadow] duration-300',
        scrolled ? 'border-b border-line' : 'border-b border-transparent',
      )}
    >
      <AnnouncementBar />
      <div className="container-x">
        <div className="flex h-16 items-center justify-between gap-6 md:h-[72px]">
          {/* mobile menu */}
          <button
            type="button"
            className="-ml-1 p-2 text-ink transition-opacity hover:opacity-60 lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>

          <Link to="/" className="text-ink" aria-label="VYRO — home">
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {nav.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'link-underline-static label-xs py-1 text-ink/80 transition-colors hover:text-ink',
                        isActive && 'text-ink',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={searchOpen ? 'Close search' : 'Search'}
              aria-expanded={searchOpen}
              className="p-2 text-ink transition-opacity hover:opacity-60"
            >
              {searchOpen ? <X size={19} strokeWidth={1.5} /> : <Search size={19} strokeWidth={1.5} />}
            </button>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`}
              className="relative p-2 text-ink transition-opacity hover:opacity-60"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium tabular-nums transition-opacity',
                  count > 0 ? 'bg-black text-ivory opacity-100' : 'opacity-0',
                )}
              >
                {count}
              </span>
            </button>
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileNavigation open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}

/* ------------------------------ search overlay ---------------------------- */

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const results = searchProducts(query)

  useEffect(() => {
    if (open) {
      lockBodyScroll()
      const timer = window.setTimeout(() => inputRef.current?.focus(), 40)
      return () => {
        window.clearTimeout(timer)
        unlockBodyScroll()
      }
    }
    return undefined
  }, [open])

  if (!open) return null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (results.length > 0) {
      navigate(`/product/${results[0].slug}`)
      onClose()
      setQuery('')
    }
  }

  return (
    <div className="absolute inset-x-0 top-full border-b border-line bg-ivory" style={{ animation: 'vyro-fade-in 180ms ease-out' }}>
      <div className="container-x py-8 md:py-10">
        <form onSubmit={submit} role="search" className="max-w-3xl">
          <label htmlFor="site-search" className="label-xs text-muted">
            Search the store
          </label>
          <div className="mt-3 flex items-center gap-3 border-b border-ink/25 focus-within:border-ink">
            <Search size={18} strokeWidth={1.5} className="text-muted" aria-hidden="true" />
            <input
              id="site-search"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try “essential tee”, “bone”, “graphic”"
              className="h-12 w-full bg-transparent text-[17px] placeholder:text-muted/70 focus:outline-none"
              autoComplete="off"
            />
            <button type="button" onClick={onClose} className="label-xs py-2 text-muted hover:text-ink">
              Close
            </button>
          </div>
        </form>

        <div className="mt-6" aria-live="polite">
          {query.trim() === '' ? (
            <p className="text-[13px] text-muted">
              Search by product name, colour or category. Results update as you type.
            </p>
          ) : results.length === 0 ? (
            <p className="text-[13px] text-ink">
              No products match “{query.trim()}”.{' '}
              <Link to="/shop" className="link-line label-xs" onClick={onClose}>
                Browse the collection
              </Link>
            </p>
          ) : (
            <>
              <p className="label-xs mb-4 text-muted">
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={() => {
                        onClose()
                        setQuery('')
                      }}
                      className="group flex items-center gap-4 border border-line bg-paper p-3 transition-colors hover:border-ink/30"
                    >
                      <SceneImage
                        {...product.images[0]}
                        className="h-20 w-16 shrink-0"
                        showMark={false}
                        alt=""
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] text-ink">{product.name}</span>
                        <span className="mt-1 block text-[12px] text-muted">{formatINR(product.price)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------- mobile navigation --------------------------- */

function MobileNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return undefined
    lockBodyScroll()
    const node = panelRef.current
    const previous = document.activeElement as HTMLElement | null
    const first = node?.querySelector<HTMLElement>('a, button')
    first?.focus()

    return () => {
      unlockBodyScroll()
      previous?.focus?.()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      id="mobile-navigation"
      className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-ivory lg:hidden"
      style={{ animation: 'vyro-fade-in 200ms ease-out' }}
    >
      <nav aria-label="Mobile" className="container-x py-8">
        <ul className="space-y-1">
          {nav.map((item, index) => (
            <li key={item.label} style={{ animationDelay: `${index * 40}ms` }} className="border-b border-line">
              <Link
                to={item.href}
                onClick={onClose}
                className="flex items-center justify-between py-5 text-ink"
              >
                <span className="display-sm">{item.label}</span>
                <span aria-hidden="true" className="label-xs text-muted">
                  0{index + 1}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-6">
          <Link to="/shop" onClick={onClose} className="label-sm text-ink">
            SHOP ALL →
          </Link>
          <Link to="/policies/size-guide" onClick={onClose} className="label-sm text-muted">
            SIZE GUIDE
          </Link>
          <Link to="/policies/contact" onClick={onClose} className="label-sm text-muted">
            CONTACT
          </Link>
        </div>

        <p className="mt-12 max-w-xs text-[13px] leading-relaxed text-muted">{site.tagline}</p>
      </nav>
    </div>
  )
}
