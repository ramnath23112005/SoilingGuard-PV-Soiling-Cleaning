"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type CartLine = {
  id: string;
  name: string;
  subtitle: string;
  colour: string;
  price: number;
  image: string;
  href: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  announcement: string;
  open: () => void;
  close: () => void;
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeLine: (id: string) => void;
};

const STORAGE_KEY = "vyro.cart.v1";
const EMPTY_SNAPSHOT = "[]";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function readSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

function serverSnapshot(): string {
  return EMPTY_SNAPSHOT;
}

function parseLines(raw: string): CartLine[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

function persist(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* storage unavailable — cart stays in memory */
  }
  emitChange();
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readSnapshot, serverSnapshot);
  const lines = useMemo(() => parseLines(raw), [raw]);
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) emitChange();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => () => {
    if (openTimer.current) clearTimeout(openTimer.current);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const addLine = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) => {
      const current = parseLines(readSnapshot());
      const existing = current.find((item) => item.id === line.id);
      const next = existing
        ? current.map((item) =>
            item.id === line.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
              : item,
          )
        : [...current, { ...line, quantity }];
      persist(next);
      setAnnouncement(`${line.name} added to your bag.`);
      if (openTimer.current) clearTimeout(openTimer.current);
      openTimer.current = setTimeout(() => setIsOpen(true), 320);
    },
    [],
  );

  const setQuantity = useCallback((id: string, quantity: number) => {
    const current = parseLines(readSnapshot());
    persist(
      current.flatMap((item) =>
        item.id === id
          ? quantity <= 0
            ? []
            : [{ ...item, quantity: Math.min(quantity, 99) }]
          : [item],
      ),
    );
  }, []);

  const removeLine = useCallback((id: string) => {
    persist(parseLines(readSnapshot()).filter((item) => item.id !== id));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    return {
      lines,
      count,
      subtotal,
      isOpen,
      announcement,
      open,
      close,
      addLine,
      setQuantity,
      removeLine,
    };
  }, [
    lines,
    isOpen,
    announcement,
    open,
    close,
    addLine,
    setQuantity,
    removeLine,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
