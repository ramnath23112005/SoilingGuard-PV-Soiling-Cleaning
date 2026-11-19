import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { PRODUCT_IMAGES } from "@/lib/products";

export function TheObject() {
  return (
    <section aria-labelledby="the-object-heading" className="shell py-20 md:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <figure className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-chalk sm:aspect-[3/2]">
              <Image
                src={PRODUCT_IMAGES.bench.src}
                alt="VYRO ONE backpack resting on a concrete bench in soft daylight"
                width={PRODUCT_IMAGES.bench.width}
                height={PRODUCT_IMAGES.bench.height}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center"
              />
            </div>
            <figcaption className="label label-light mt-4">
              VYRO ONE — first release
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-5">
          <p className="label label-light">The object</p>
          <h2 id="the-object-heading" className="display display-m mt-6">
            One bag.
            <br />
            <span className="italic">Every day.</span>
          </h2>
          <div className="mt-8 space-y-5 text-[1rem] leading-relaxed text-graphite">
            <p>
              VYRO ONE carries the things a day asks for — a laptop, notebooks, layers, a
              bottle — without announcing itself.
            </p>
            <p>
              The silhouette stays quiet, the proportions stay deliberate, and everything
              unnecessary was left out.
            </p>
          </div>
          <Link href="/products/vyro-one" className="label link mt-10 inline-flex items-center gap-2">
            View the VYRO ONE
            <ArrowRight strokeWidth={1.5} className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
