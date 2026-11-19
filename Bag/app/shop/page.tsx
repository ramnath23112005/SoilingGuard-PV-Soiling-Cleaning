import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { products } from "@/lib/products";
import { formatPrice } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop VYRO bags. Currently: VYRO ONE, a minimalist everyday backpack in Carbon Black — ₹1,299.",
};

export default function ShopPage() {
  return (
    <div className="shell py-14 md:py-20">
      <Reveal>
        <p className="label label-light">Shop</p>
        <h1 className="display display-l mt-6 max-w-[16ch]">
          The bags.
        </h1>
        <p className="body-s mt-8 max-w-[44ch]">
          One object, made for every day. More from VYRO will follow — for now, the
          collection begins with VYRO ONE.
        </p>
      </Reveal>

      <ul className="mt-16 grid gap-14 md:mt-20 md:grid-cols-2 md:gap-10 lg:gap-16">
        {products.map((product, index) => (
          <Reveal key={product.id} delay={index * 100} as="li">
            <Link href={product.href} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-chalk">
                <Image
                  src={product.images[0].src}
                  alt={product.images[0].alt}
                  width={product.images[0].width}
                  height={product.images[0].height}
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                />
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-6">
                <div>
                  <h2 className="text-[1.0625rem] font-medium">{product.name}</h2>
                  <p className="mt-1 text-[0.875rem] text-graphite">
                    {product.subtitle} — {product.colour}
                  </p>
                </div>
                <p className="text-[0.9375rem] font-medium tabular-nums">
                  {formatPrice(product.price)}
                </p>
              </div>
              <span className="label link mt-5 inline-flex items-center gap-2">
                View product
                <ArrowRight strokeWidth={1.5} className="h-3.5 w-3.5" />
              </span>
            </Link>
          </Reveal>
        ))}

        <Reveal delay={100} as="li" className="flex flex-col justify-center border border-line p-10">
          <p className="label label-light">Next</p>
          <p className="display display-s mt-6 max-w-[18ch]">
            More objects are in the studio.
          </p>
          <p className="body-s mt-4 max-w-[34ch]">
            VYRO is built slowly. New pieces will appear here when they are ready — not
            before.
          </p>
          <Link href="/#the-vyro-letter" className="label link mt-8 inline-flex items-center gap-2 self-start">
            Get the VYRO Letter
            <ArrowRight strokeWidth={1.5} className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </ul>
    </div>
  );
}
