import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Gallery } from "@/components/product/gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { MobilePurchaseBar } from "@/components/product/mobile-purchase-bar";
import { Accordion } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import { PRODUCT_IMAGES, vyroOne } from "@/lib/products";
import { SITE_URL, formatPrice } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${vyroOne.name} — ${vyroOne.subtitle}`,
    description: `${vyroOne.description} ${formatPrice(vyroOne.price)} in ${vyroOne.colour}.`,
    openGraph: {
      title: `${vyroOne.name} — ${vyroOne.subtitle}`,
      description: vyroOne.description,
      images: [
        {
          url: vyroOne.images[0].src,
          width: vyroOne.images[0].width,
          height: vyroOne.images[0].height,
          alt: vyroOne.images[0].alt,
        },
      ],
    },
  };
}

const faq = [
  {
    title: "What fits inside?",
    content:
      "VYRO ONE is sized for a typical daily load — a laptop, a notebook or two, a light layer, a bottle, and small essentials. Final capacity figures will be confirmed after production samples are inspected.",
  },
  {
    title: "Which laptop sizes fit?",
    content:
      "The laptop compartment is designed to fit selected laptop sizes. Exact compatibility will be confirmed with final production samples and published before orders go live.",
  },
  {
    title: "How should I care for it?",
    content:
      "Spot clean with a damp cloth and mild soap. Avoid machine washing, bleach, and tumble drying. Full care instructions will ship with the final product.",
  },
  {
    title: "Is this a real store?",
    content:
      "This is a design prototype. The bag and product pages work as intended, but checkout and payments are not connected — no order is placed and no payment is taken on this site.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: vyroOne.name,
  description: vyroOne.description,
  image: vyroOne.images.map((image) => `${SITE_URL}${image.src}`),
  brand: { "@type": "Brand", name: "VYRO" },
  color: vyroOne.colour,
  offers: {
    "@type": "Offer",
    price: vyroOne.price,
    priceCurrency: "INR",
    availability: "https://schema.org/PreOrder",
    url: `${SITE_URL}${vyroOne.href}`,
  },
};

export default async function ProductPage({ params }: Props) {
  await params;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="shell">
        <nav aria-label="Breadcrumb" className="py-6">
          <ol className="label label-light flex items-center gap-3">
            <li>
              <Link href="/" className="link">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink">{vyroOne.name}</li>
          </ol>
        </nav>

        <div className="grid gap-12 pb-20 lg:grid-cols-12 lg:gap-16 lg:pb-28">
          <div className="lg:col-span-7">
            <Gallery images={vyroOne.images} />
          </div>
          <div className="lg:col-span-5">
            <PurchasePanel product={vyroOne} />
          </div>
        </div>
      </div>

      <section aria-labelledby="story-heading" className="rule">
        <div className="shell grid items-center gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="label label-light">The idea</p>
            <h2 id="story-heading" className="display display-m mt-6">
              Built around the day.
            </h2>
            <div className="mt-8 space-y-5 text-[1rem] leading-relaxed text-graphite">
              <p>{vyroOne.longDescription}</p>
              <p>
                The shell is a durable woven exterior in Carbon Black. Storage is simple:
                one main compartment, everyday pockets, and a side pocket sized for a
                bottle.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-7">
            <div className="relative aspect-[3/2] w-full overflow-hidden bg-chalk">
              <Image
                src={PRODUCT_IMAGES.context.src}
                alt="VYRO ONE backpack worn on a city street in soft daylight"
                width={PRODUCT_IMAGES.context.width}
                height={PRODUCT_IMAGES.context.height}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-[center_62%]"
              />
            </div>
            <p className="label label-light mt-4">Carbon Black — concept imagery</p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="specs-heading" className="bg-chalk">
        <div className="shell grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="label label-light">Specifications</p>
            <h2 id="specs-heading" className="display display-m mt-6">
              The details.
            </h2>
            <p className="body-s mt-6 max-w-[32ch]">{vyroOne.note}</p>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-8">
            <dl className="border-t border-line">
              {vyroOne.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-8 border-b border-line py-5"
                >
                  <dt className="label label-light shrink-0">{spec.label}</dt>
                  <dd className="text-right text-[0.9375rem]">{spec.value}</dd>
                </div>
              ))}
            </dl>

            <h3 className="display display-s mt-16">Questions</h3>
            <div className="mt-8">
              <Accordion items={faq} />
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-label="Lifestyle imagery" className="shell py-20 pb-32 md:py-28 lg:pb-28">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-chalk">
              <Image
                src={PRODUCT_IMAGES.bridge.src}
                alt="Crossing the city bridge with the VYRO ONE backpack"
                width={PRODUCT_IMAGES.bridge.width}
                height={PRODUCT_IMAGES.bridge.height}
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover object-center"
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-chalk">
              <Image
                src={PRODUCT_IMAGES.commute.src}
                alt="Commute through the city with the VYRO ONE backpack"
                width={PRODUCT_IMAGES.commute.width}
                height={PRODUCT_IMAGES.commute.height}
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover object-center"
              />
            </div>
          </Reveal>
        </div>

        <Reveal delay={60}>
          <div className="rule mt-16 flex flex-col items-start justify-between gap-6 pt-12 md:flex-row md:items-center">
            <p className="display display-s max-w-[24ch]">
              One bag, made for every day.
            </p>
            <Link href="/shop" className="btn btn-outline">
              Continue shopping
            </Link>
          </div>
        </Reveal>
      </section>

      <MobilePurchaseBar product={vyroOne} />
    </>
  );
}
