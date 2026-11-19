"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { X, Minus, Plus, ArrowRight } from "lucide-react";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/site";

export function CartDrawer() {
  const { lines, count, subtotal, isOpen, close, setQuantity, removeLine } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, close]);

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-charcoal/40 transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        tabIndex={-1}
        className={`absolute top-0 right-0 flex h-full w-full max-w-[28.5rem] flex-col bg-ivory transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5 sm:px-8">
          <p className="label">
            Your bag <span className="text-graphite">({count})</span>
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close bag"
            className="-mr-2 flex h-9 w-9 items-center justify-center text-ink transition-opacity hover:opacity-60"
          >
            <X strokeWidth={1.4} className="h-5 w-5" />
          </button>
        </header>

        {count === 0 ? (
          <div className="flex flex-1 flex-col justify-between px-6 py-10 sm:px-8">
            <div className="space-y-4">
              <p className="display display-s">Your bag is empty.</p>
              <p className="body-s max-w-[26ch]">
                One object, made for every day. Start with VYRO ONE.
              </p>
            </div>
            <div className="space-y-4">
              <Link
                href="/products/vyro-one"
                onClick={close}
                className="btn w-full"
                tabIndex={isOpen ? 0 : -1}
              >
                Discover VYRO ONE
                <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
              </Link>
              <Link
                href="/shop"
                onClick={close}
                className="btn btn-outline w-full"
                tabIndex={isOpen ? 0 : -1}
              >
                Continue shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6 sm:px-8">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4 py-6">
                  <Link
                    href={line.href}
                    onClick={close}
                    className="relative block h-28 w-24 shrink-0 overflow-hidden bg-chalk"
                    tabIndex={isOpen ? 0 : -1}
                  >
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="label">{line.name}</p>
                        <p className="mt-1 text-[0.8125rem] text-graphite">
                          {line.subtitle}
                        </p>
                        <p className="mt-0.5 text-[0.8125rem] text-graphite">{line.colour}</p>
                      </div>
                      <p className="text-[0.875rem] font-medium">
                        {formatPrice(line.price * line.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${line.name}`}
                          onClick={() => setQuantity(line.id, line.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-chalk"
                          tabIndex={isOpen ? 0 : -1}
                        >
                          <Minus strokeWidth={1.5} className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-[0.8125rem] tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${line.name}`}
                          onClick={() => setQuantity(line.id, line.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-chalk"
                          tabIndex={isOpen ? 0 : -1}
                        >
                          <Plus strokeWidth={1.5} className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-graphite transition-colors hover:text-ink"
                        tabIndex={isOpen ? 0 : -1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-6 py-6 sm:px-8">
              <div className="flex items-baseline justify-between">
                <p className="label">Subtotal</p>
                <p className="text-[1.0625rem] font-medium tabular-nums">
                  {formatPrice(subtotal)}
                </p>
              </div>
              <p className="mt-3 text-[0.75rem] leading-relaxed text-graphite">
                Prototype cart — checkout and payments are not connected yet. No order is
                placed and no payment is taken on this site.
              </p>
              <button type="button" className="btn mt-5 w-full" disabled aria-disabled="true">
                Checkout — coming soon
              </button>
              <Link
                href="/products/vyro-one"
                onClick={close}
                className="mt-4 block text-center text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-graphite transition-colors hover:text-ink"
                tabIndex={isOpen ? 0 : -1}
              >
                Continue shopping
              </Link>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
