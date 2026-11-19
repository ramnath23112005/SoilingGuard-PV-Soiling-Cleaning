"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import type { ProductImage } from "@/lib/products";

export function Gallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const current = images[active];

  const step = useCallback(
    (direction: number) => {
      setActive((index) => (index + direction + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKeyDown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [lightbox, step]);

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-chalk">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          priority={active === 0}
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover object-center"
        />
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Enlarge image"
          className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center bg-ivory/90 text-ink transition-colors hover:bg-ivory"
        >
          <Maximize2 strokeWidth={1.4} className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="label label-light">
          {current.caption} — {String(active + 1).padStart(2, "0")}/
          {String(images.length).padStart(2, "0")}
        </p>
        <p className="label label-light hidden sm:block">Concept imagery</p>
      </div>

      <ul className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {images.map((image, index) => (
          <li key={image.src}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${image.caption}`}
              aria-current={index === active}
              className={`relative aspect-[3/4] w-full overflow-hidden bg-chalk transition-opacity ${
                index === active ? "ring-1 ring-ink ring-offset-2 ring-offset-ivory" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </button>
          </li>
        ))}
      </ul>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product image viewer"
          className="fixed inset-0 z-50 flex flex-col bg-charcoal/96"
        >
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <p className="label text-ivory/70">
              {String(active + 1).padStart(2, "0")}/
              {String(images.length).padStart(2, "0")} — {current.caption}
            </p>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close viewer"
              autoFocus
              className="-mr-2 flex h-10 w-10 items-center justify-center text-ivory"
            >
              <X strokeWidth={1.4} className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
            <Image
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="90vw"
              className="max-h-[78vh] w-auto max-w-[92vw] object-contain"
            />
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-2 flex h-12 w-12 items-center justify-center text-ivory transition-opacity hover:opacity-70 sm:left-6"
            >
              <ChevronLeft strokeWidth={1.2} className="h-7 w-7" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-2 flex h-12 w-12 items-center justify-center text-ivory transition-opacity hover:opacity-70 sm:right-6"
            >
              <ChevronRight strokeWidth={1.2} className="h-7 w-7" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
