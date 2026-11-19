"use client";

import { useCart } from "@/components/cart/cart-provider";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/site";

export function MobilePurchaseBar({ product }: { product: Product }) {
  const { open, count } = useCart();

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory/95 px-5 py-3 backdrop-blur-sm lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="label">{product.name}</p>
          <p className="mt-1 text-[0.8125rem] tabular-nums text-graphite">
            {formatPrice(product.price)}
          </p>
        </div>
        <button
          type="button"
          onClick={open}
          className="btn"
          aria-label={`Open bag, ${count} items`}
        >
          {count > 0 ? `Bag (${count})` : "Bag"}
        </button>
      </div>
    </div>
  );
}
