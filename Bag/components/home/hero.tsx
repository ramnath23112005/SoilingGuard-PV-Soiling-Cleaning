import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { PRODUCT_IMAGES, vyroOne } from "@/lib/products";
import { formatPrice } from "@/lib/site";

export function Hero() {
  return (
    <section aria-label="Introduction" className="relative overflow-hidden">
      <div className="shell grid min-h-[calc(100svh-8rem)] grid-cols-1 items-center gap-12 py-14 lg:grid-cols-12 lg:gap-10 lg:py-0">
        <div className="lg:col-span-6 xl:col-span-5">
          <Reveal>
            <p className="label label-light">Introducing VYRO ONE</p>
            <h1 className="display display-xl mt-6">
              Carry
              <br />
              your world.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 max-w-[38ch] text-[1.0625rem] leading-relaxed text-graphite">
              A minimalist everyday backpack — designed around a clean silhouette and
              practical utility. Premium design. Everyday purpose.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/products/vyro-one" className="btn">
                Discover VYRO ONE
                <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
              </Link>
              <Link href="/shop" className="btn btn-outline">
                Shop all bags
              </Link>
            </div>
            <p className="label label-light mt-10">
              {vyroOne.colour} — {formatPrice(vyroOne.price)}
            </p>
          </Reveal>
        </div>

        <div className="relative lg:col-span-6 lg:col-start-7 xl:col-span-6 xl:col-start-7">
          <figure className="relative">
            <div className="hero-image relative aspect-[4/5] w-full overflow-hidden bg-chalk sm:aspect-[3/4] lg:aspect-[3/4]">
              <Image
                src={PRODUCT_IMAGES.hero.src}
                alt="VYRO ONE everyday backpack standing on a weathered stone plinth on a quiet city street"
                width={PRODUCT_IMAGES.hero.width}
                height={PRODUCT_IMAGES.hero.height}
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="hero-image-inner object-cover object-[center_38%]"
              />
            </div>
            <figcaption className="label label-light mt-4 flex items-center justify-between">
              <span>VYRO ONE — Carbon Black</span>
              <span className="hidden sm:inline">Concept imagery</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
