import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { PRODUCT_IMAGES } from "@/lib/products";

const contexts = [
  {
    src: PRODUCT_IMAGES.bridge.src,
    alt: "A person crossing a city bridge wearing the VYRO ONE backpack",
    caption: "On the move",
    note: "Across the bridge, first light",
  },
  {
    src: PRODUCT_IMAGES.angle.src,
    alt: "VYRO ONE backpack resting against a plinth beside a shopfront",
    caption: "At rest",
    note: "Between destinations",
  },
];

export function InContext() {
  return (
    <section aria-labelledby="context-heading" className="rule">
      <div className="shell py-20 md:py-28">
        <Reveal>
          <p className="label label-light">In context</p>
          <h2 id="context-heading" className="display display-m mt-6 max-w-[20ch]">
            Wherever the day goes.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-2 md:gap-6">
          {contexts.map((item, index) => (
            <Reveal key={item.caption} delay={index * 100}>
              <figure>
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-chalk">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={1500}
                    height={2250}
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="object-cover object-center"
                  />
                </div>
                <figcaption className="mt-4 flex items-baseline justify-between gap-4">
                  <span className="label">{item.caption}</span>
                  <span className="text-[0.8125rem] text-graphite">{item.note}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
