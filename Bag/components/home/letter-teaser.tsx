import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export function LetterTeaser() {
  return (
    <section aria-labelledby="letter-heading" className="rule">
      <div className="shell flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center md:py-20">
        <Reveal>
          <p className="label label-light">The VYRO Letter</p>
          <h2 id="letter-heading" className="display display-s mt-4 max-w-[28ch]">
            Notes on design, everyday objects, and what&apos;s next.
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <Link href="/#the-vyro-letter" className="btn btn-outline">
            Subscribe
            <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
