"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AddToBagButton } from "./add-to-bag-button";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/site";

export function PurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants[0];

  return (
    <div className="lg:sticky lg:top-28">
      <p className="label label-light">{product.subtitle}</p>
      <h1 className="display display-m mt-4">{product.name}</h1>
      <p className="mt-4 text-[1.0625rem] font-medium tabular-nums">
        {formatPrice(product.price)}
      </p>
      <p className="body-s mt-6 max-w-[42ch]">{product.description}</p>

      <div className="mt-8 flex items-center justify-between border-y border-line py-5">
        <div>
          <p className="label label-light">Colour</p>
          <p className="mt-2 flex items-center gap-3 text-[0.9375rem]">
            <span
              aria-hidden
              className="inline-block h-4 w-4 rounded-full border border-line"
              style={{ backgroundColor: variant.swatch }}
            />
            {variant.name}
          </p>
        </div>

        <div>
          <p className="label label-light text-right">Quantity</p>
          <div className="mt-2 flex items-center border border-line">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-chalk"
            >
              <Minus strokeWidth={1.5} className="h-3.5 w-3.5" />
            </button>
            <span
              aria-live="polite"
              className="w-10 text-center text-[0.9375rem] tabular-nums"
            >
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((value) => Math.min(99, value + 1))}
              className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-chalk"
            >
              <Plus strokeWidth={1.5} className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <AddToBagButton
          productId={product.slug}
          name={product.name}
          subtitle={product.subtitle}
          colour={variant.name}
          price={product.price}
          image={product.images[0].src}
          href={product.href}
          className="w-full"
        />
        <p className="mt-4 text-[0.75rem] leading-relaxed text-graphite">
          Prototype store — checkout and payments are not connected. Add to bag to try
          the cart experience.
        </p>
      </div>

      <dl className="mt-10 space-y-3 border-t border-line pt-6 text-[0.8125rem]">
        <div className="flex justify-between gap-6">
          <dt className="text-graphite">Availability</dt>
          <dd>First release — Carbon Black</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-graphite">Shipping</dt>
          <dd>
            <a href="/legal#shipping" className="link">
              Policy to be confirmed
            </a>
          </dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-graphite">Returns</dt>
          <dd>
            <a href="/legal#returns" className="link">
              Policy to be confirmed
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}
