import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";

const notes = [
  {
    title: "Prototype store",
    body: "This is a design prototype. Browsing and the bag work as intended, but checkout and payments are not connected — no order is placed and no payment is taken.",
  },
  {
    title: "Concept imagery",
    body: "All photography is concept imagery selected during the design phase, pending the final VYRO ONE product shoot.",
  },
  {
    title: "Provisional specs",
    body: "Dimensions, capacity, and laptop sizing are provisional and will be confirmed after final production samples are inspected.",
  },
];

export function BeforeYouOrder() {
  return (
    <section aria-labelledby="before-heading" className="bg-chalk">
      <div className="shell py-20 md:py-28">
        <Reveal>
          <p className="label label-light">Before you order</p>
          <h2 id="before-heading" className="display display-m mt-6 max-w-[22ch]">
            Honesty, up front.
          </h2>
        </Reveal>

        <ul className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-12">
          {notes.map((note, index) => (
            <Reveal key={note.title} delay={index * 80} as="li">
              <p className="label text-olive">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 text-[1rem] font-medium">{note.title}</h3>
              <p className="body-s mt-3">{note.body}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={120}>
          <Link href="/legal" className="label link mt-12 inline-block">
            Read the full policies
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
