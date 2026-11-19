import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { vyroOne } from "@/lib/products";

export function SpecPreview() {
  return (
    <section aria-labelledby="spec-heading" className="shell py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <p className="label label-light">Specifications</p>
          <h2 id="spec-heading" className="display display-m mt-6">
            The shape of it.
          </h2>
          <p className="body-s mt-6 max-w-[34ch]">
            Provisional figures, pending final production samples. Full details sit on the
            product page.
          </p>
          <Link
            href="/products/vyro-one"
            className="label link mt-10 inline-flex items-center gap-2"
          >
            Full specifications
            <ArrowRight strokeWidth={1.5} className="h-3.5 w-3.5" />
          </Link>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-7">
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
          <p className="mt-6 text-[0.75rem] leading-relaxed text-graphite">
            {vyroOne.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
