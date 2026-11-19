import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { AddToBagButton } from "@/components/product/add-to-bag-button";
import { PRODUCT_IMAGES, vyroOne } from "@/lib/products";

export function CtaBand() {
  return (
    <section aria-labelledby="cta-heading" className="shell py-20 md:py-28">
      <div className="rule grid items-center gap-12 pt-20 md:pt-28 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <p className="label label-light">VYRO ONE — Carbon Black</p>
          <h2 id="cta-heading" className="display display-l mt-6">
            Carry your world.
          </h2>
          <p className="mt-8 max-w-[38ch] text-[1.0625rem] leading-relaxed text-graphite">
            The everyday backpack, designed around a clean silhouette and practical
            utility. First release, limited quantities.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <AddToBagButton
              productId={vyroOne.slug}
              name={vyroOne.name}
              subtitle={vyroOne.subtitle}
              colour={vyroOne.colour}
              price={vyroOne.price}
              image={PRODUCT_IMAGES.front.src}
              href={vyroOne.href}
            />
            <Link href="/products/vyro-one" className="btn btn-outline">
              View details
              <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-5">
          <figure className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-chalk">
              <Image
                src={PRODUCT_IMAGES.plinth.src}
                alt="VYRO ONE backpack on a plinth beside a shopfront, photographed in soft afternoon light"
                width={PRODUCT_IMAGES.plinth.width}
                height={PRODUCT_IMAGES.plinth.height}
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="object-cover object-center"
              />
            </div>
            <figcaption className="label label-light mt-4">
              Concept imagery — final shoot to follow
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
