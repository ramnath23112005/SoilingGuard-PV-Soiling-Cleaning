"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Wordmark } from "./logo";
import { MobileNavigation } from "./mobile-navigation";
import { primaryNav } from "@/lib/site";

export function SiteHeader() {
  const { count, open: openCart, announcement } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-ivory">
        <div className="shell hidden h-[4.75rem] grid-cols-3 items-center md:grid">
          <nav aria-label="Primary" className="flex items-center gap-8">
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} className="label link">
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            aria-label="VYRO — home"
            className="justify-self-center text-ink transition-opacity hover:opacity-70"
          >
            <Wordmark className="h-[1.05rem] w-auto md:h-[1.15rem]" />
          </Link>

          <nav aria-label="Secondary" className="flex items-center justify-end gap-8">
            <Link href="/about" className="label link">
              About
            </Link>
            <button type="button" onClick={openCart} className="label link">
              Bag <span className="tabular-nums">({count})</span>
            </button>
          </nav>
        </div>

        <div className="flex h-16 items-center justify-between px-5 sm:px-8 md:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            className="-ml-2 flex h-10 w-10 items-center justify-center"
          >
            <Menu strokeWidth={1.4} className="h-5 w-5" />
          </button>

          <Link
            href="/"
            aria-label="VYRO — home"
            className="absolute left-1/2 -translate-x-1/2 text-ink"
          >
            <Wordmark className="h-4 w-auto" />
          </Link>

          <button type="button" onClick={openCart} className="label -mr-2 flex h-10 items-center">
            Bag <span className="ml-1 tabular-nums">({count})</span>
          </button>
        </div>
      </header>

      <MobileNavigation open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </>
  );
}
