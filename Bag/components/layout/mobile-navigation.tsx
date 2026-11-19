"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Wordmark } from "./logo";
import { mainNav } from "@/lib/site";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MobileNavigation({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
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
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      className={`fixed inset-0 z-50 flex flex-col bg-ivory transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"
      }`}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="flex h-16 items-center justify-between border-b border-line px-5 sm:px-8">
        <Link href="/" onClick={onClose} className="text-ink" tabIndex={open ? 0 : -1}>
          <Wordmark className="h-4 w-auto" title="VYRO" />
        </Link>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="-mr-2 flex h-10 w-10 items-center justify-center"
          tabIndex={open ? 0 : -1}
        >
          <X strokeWidth={1.4} className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="Mobile" className="flex flex-1 flex-col justify-between px-5 sm:px-8">
        <ul className="divide-y divide-line pt-2">
          {mainNav.map((item, index) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className="flex items-baseline justify-between py-6"
              >
                <span className="display display-s">{item.label}</span>
                <span className="label label-light">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="space-y-3 border-t border-line py-8">
          <p className="label label-light">Premium design. Everyday purpose.</p>
          <p className="body-s">
            VYRO ONE — the everyday backpack. ₹1,299.
          </p>
        </div>
      </nav>
    </div>
  );
}
