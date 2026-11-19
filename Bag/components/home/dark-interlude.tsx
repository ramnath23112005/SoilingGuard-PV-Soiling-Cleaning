import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { PRODUCT_IMAGES } from "@/lib/products";

export function DarkInterlude() {
  return (
    <section
      aria-labelledby="interlude-heading"
      className="theme-dark relative bg-charcoal text-ivory"
    >
      <div className="relative min-h-[36rem] overflow-hidden">
        <Image
          src={PRODUCT_IMAGES.commute.src}
          alt="A commuter walking through the city wearing the VYRO ONE backpack"
          width={PRODUCT_IMAGES.commute.width}
          height={PRODUCT_IMAGES.commute.height}
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover object-[center_30%] opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/70 to-charcoal/20" />

        <div className="shell relative flex min-h-[36rem] items-center py-20">
          <Reveal className="max-w-[34rem]">
            <p className="label text-ivory/60">In transit</p>
            <h2
              id="interlude-heading"
              className="display display-l mt-6 text-ivory"
            >
              Purposeful details.
              <br />
              <span className="italic">Quiet form.</span>
            </h2>
            <p className="mt-8 max-w-[40ch] text-[1rem] leading-relaxed text-ivory/75">
              From the first coffee to the last train, VYRO ONE keeps a low profile and a
              steady centre — a bag that disappears into the day.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
