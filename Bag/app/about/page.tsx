import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { PRODUCT_IMAGES } from "@/lib/products";

export const metadata: Metadata = {
  title: "Our philosophy",
  description:
    "VYRO makes thoughtfully designed everyday essentials — premium design, everyday purpose.",
};

const principles = [
  {
    title: "Purpose first",
    body: "Every detail has to earn its place. If it does not serve the day, it does not make the bag.",
  },
  {
    title: "Quiet form",
    body: "We design for longevity, not novelty — clean silhouettes that stay out of the way and age well.",
  },
  {
    title: "Honest launches",
    body: "We publish what we know and label what we don't. Provisional figures stay provisional until they are confirmed.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <div className="shell py-14 md:py-20">
        <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="label label-light">Our philosophy</p>
            <h1 className="display display-l mt-6 max-w-[14ch]">
              Premium design.
              <br />
              <span className="italic">Everyday purpose.</span>
            </h1>
            <div className="mt-10 space-y-5 text-[1rem] leading-relaxed text-graphite">
              <p>
                VYRO makes thoughtfully designed everyday essentials — balancing
                purposeful details with a clean, timeless form.
              </p>
              <p>
                We started with one question: what does a person actually need to carry
                through a day? The answer was not more compartments. It was better
                proportions, quieter materials, and the discipline to leave things out.
              </p>
              <p>
                VYRO ONE is the first object from that thinking — a minimalist everyday
                backpack in Carbon Black, designed to disappear into the day.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-chalk">
              <Image
                src={PRODUCT_IMAGES.footbridge.src}
                alt="VYRO ONE backpack resting on a canal bridge in the city"
                width={PRODUCT_IMAGES.footbridge.width}
                height={PRODUCT_IMAGES.footbridge.height}
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="object-cover object-center"
                priority
              />
            </div>
            <p className="label label-light mt-4">Carbon Black — concept imagery</p>
          </Reveal>
        </div>
      </div>

      <section aria-labelledby="principles-heading" className="bg-chalk">
        <div className="shell py-20 md:py-28">
          <Reveal>
            <p className="label label-light">How we work</p>
            <h2 id="principles-heading" className="display display-m mt-6 max-w-[20ch]">
              Three principles.
            </h2>
          </Reveal>

          <ul className="mt-12 grid gap-px border border-line bg-line md:mt-16 md:grid-cols-3">
            {principles.map((principle, index) => (
              <li key={principle.title} className="bg-chalk">
                <Reveal delay={index * 80} className="h-full p-8 md:p-10">
                  <p className="label text-olive">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="display display-s mt-6">{principle.title}</h3>
                  <p className="body-s mt-4">{principle.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell py-20 md:py-28">
        <Reveal>
          <div className="rule flex flex-col items-start justify-between gap-6 pt-16 md:flex-row md:items-center">
            <p className="display display-s max-w-[22ch]">
              The first object is ready.
            </p>
            <Link href="/products/vyro-one" className="btn">
              Discover VYRO ONE
              <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
