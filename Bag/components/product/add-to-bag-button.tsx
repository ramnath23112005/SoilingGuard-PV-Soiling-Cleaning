"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/site";

type Props = {
  productId: string;
  name: string;
  subtitle: string;
  colour: string;
  price: number;
  image: string;
  href: string;
  className?: string;
};

export function AddToBagButton({
  productId,
  name,
  subtitle,
  colour,
  price,
  image,
  href,
  className = "",
}: Props) {
  const { addLine } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addLine({ id: productId, name, subtitle, colour, price, image, href });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 2000);
      }}
      className={`btn w-full sm:w-auto ${className}`}
    >
      {added ? (
        <>
          <Check strokeWidth={1.6} className="h-4 w-4" />
          Added to bag
        </>
      ) : (
        <>Add to bag — {formatPrice(price)}</>
      )}
    </button>
  );
}
