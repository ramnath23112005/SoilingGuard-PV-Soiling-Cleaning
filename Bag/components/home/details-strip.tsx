import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { PRODUCT_IMAGES } from "@/lib/products";

const details = [
  {
    src: PRODUCT_IMAGES.detailTop.src,
    alt: "Close-up of the top handle and flap construction of the VYRO ONE backpack",
    width: PRODUCT_IMAGES.detailTop.width,
    height: PRODUCT_IMAGES.detailTop.height,
    label: "Top handle",
    note: "Grab-and-go construction",
  },
  {
    src: PRODUCT_IMAGES.detailBuckle.src,
    alt: "Macro photograph of webbing and buckle hardware on the VYRO ONE backpack",
    width: PRODUCT_IMAGES.detailBuckle.width,
    height: PRODUCT_IMAGES.detailBuckle.height,
    label: "Hardware",
    note: "Webbing and fastenings",
  },
  {
    src: PRODUCT_IMAGES.detailFabric.src,
    alt: "Macro photograph of the woven shell fabric and stitching on the VYRO ONE flap",
    width: PRODUCT_IMAGES.detailFabric.width,
    height: PRODUCT_IMAGES.detailFabric.height,
    label: "Shell fabric",
    note: "Durable woven exterior",
  },
];

export function DetailsStrip() {
  return (
    <section aria-labelledby="details-heading" className="rule">
      <div className="shell py-20 md:py-28">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="label label-light">Details</p>
            <h2 id="details-heading" className="display display-m mt-6 max-w-[16ch]">
              The details stay quiet.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="body-s max-w-[34ch]">
              Purposeful details over decoration — every seam, fastening, and panel is
              there because it earns its place.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-3 md:gap-6">
          {details.map((detail, index) => (
            <Reveal key={detail.label} delay={index * 100}>
              <figure>
                <div
                  className={`relative w-full overflow-hidden bg-chalk ${
                    index === 1 ? "aspect-[4/3]" : "aspect-[3/2]"
                  }`}
                >
                  <Image
                    src={detail.src}
                    alt={detail.alt}
                    width={detail.width}
                    height={detail.height}
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-cover object-center"
                  />
                </div>
                <figcaption className="mt-4 flex items-baseline justify-between gap-4">
                  <span className="label">{detail.label}</span>
                  <span className="text-[0.8125rem] text-graphite">{detail.note}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
