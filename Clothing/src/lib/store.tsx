import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product, SceneImageRef } from '../data/types'

export interface CartLine {
  /** Stable key: product + colour + size. */
  key: string
  productId: string
  slug: string
  name: string
  price: number
  pricingStatus: Product['pricingStatus']
  colorName: string
  tone: SceneImageRef['tone']
  size: string
  quantity: number
  image: SceneImageRef
}

export interface AddToCartInput {
  product: Product
  colorName: string
  tone: SceneImageRef['tone']
  size: string
  quantity?: number
}

interface StoreValue {
  lines: CartLine[]
  count: number
  subtotal: number
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  addLine: (input: AddToCartInput) => void
  removeLine: (key: string) => void
  setLineQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  wishlist: string[]
  toggleWishlist: (productId: string) => void
  isWishlisted: (productId: string) => boolean
  lastAddedKey: string | null
}

const StoreContext = createContext<StoreValue | null>(null)

const CART_KEY = 'vyro.cart.v1'
const WISHLIST_KEY = 'vyro.wishlist.v1'

function lineKey(productId: string, colorName: string, size: string): string {
  return `${productId}::${colorName}::${size}`
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readStorage<CartLine[]>(CART_KEY, []))
  const [wishlist, setWishlist] = useState<string[]>(() =>
    readStorage<string[]>(WISHLIST_KEY, []),
  )
  const [isCartOpen, setCartOpen] = useState(false)
  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(lines))
    } catch {
      /* storage may be unavailable — cart simply won't persist */
    }
  }, [lines])

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
    } catch {
      /* ignore */
    }
  }, [wishlist])

  const openCart = useCallback(() => setCartOpen(true), [])
  const closeCart = useCallback(() => setCartOpen(false), [])

  const addLine = useCallback(
    ({ product, colorName, tone, size, quantity = 1 }: AddToCartInput) => {
      const key = lineKey(product.id, colorName, size)
      setLines((current) => {
        const existing = current.find((line) => line.key === key)
        if (existing) {
          return current.map((line) =>
            line.key === key ? { ...line, quantity: Math.min(10, line.quantity + quantity) } : line,
          )
        }
        const next: CartLine = {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          pricingStatus: product.pricingStatus,
          colorName,
          tone,
          size,
          quantity,
          image: product.images[0],
        }
        return [...current, next]
      })
      setLastAddedKey(key)
      setCartOpen(true)
    },
    [],
  )

  const removeLine = useCallback((key: string) => {
    setLines((current) => current.filter((line) => line.key !== key))
  }, [])

  const setLineQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) => {
      if (quantity <= 0) return current.filter((line) => line.key !== key)
      return current.map((line) =>
        line.key === key ? { ...line, quantity: Math.min(10, quantity) } : line,
      )
    })
  }, [])

  const clearCart = useCallback(() => setLines([]), [])

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    )
  }, [])

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  )

  const count = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines])
  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [lines],
  )

  const value = useMemo<StoreValue>(
    () => ({
      lines,
      count,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      addLine,
      removeLine,
      setLineQuantity,
      clearCart,
      wishlist,
      toggleWishlist,
      isWishlisted,
      lastAddedKey,
    }),
    [
      lines,
      count,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      addLine,
      removeLine,
      setLineQuantity,
      clearCart,
      wishlist,
      toggleWishlist,
      isWishlisted,
      lastAddedKey,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used inside <StoreProvider>')
  }
  return context
}
