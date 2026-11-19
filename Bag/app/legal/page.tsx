import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Support & policies",
  description:
    "Shipping, returns, privacy, and terms for VYRO — including prototype store disclosures.",
};

const sections = [
  {
    id: "support",
    title: "Support",
    lead: "This store is a design prototype. Here is exactly what that means, and where each policy stands.",
    body: [
      "Browsing, the product pages, and the bag work as intended. Checkout and payments are not connected, so no order can be placed and no payment can be taken on this site.",
      "Policies below are written to be honest about that. Each will be finalized and re-published before real orders go live.",
    ],
  },
  {
    id: "shipping",
    title: "Shipping",
    lead: "Shipping policy — to be confirmed before launch.",
    body: [
      "We ship within India. Final rates, delivery estimates, and pin-code coverage will be published here once fulfilment logistics are confirmed with our production and courier partners.",
      "Nothing on this prototype site constitutes a shipping promise.",
    ],
  },
  {
    id: "returns",
    title: "Returns",
    lead: "Returns policy — to be confirmed before launch.",
    body: [
      "A returns window, condition requirements, and the return process will be published here before orders go live.",
      "Because this prototype cannot process orders, no return can currently be initiated from this site.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    lead: "Contact details will be published at launch.",
    body: [
      "Customer support contact information will appear on this page before the first real order is accepted. We are not listing placeholder email addresses or phone numbers.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy policy",
    lead: "What this prototype stores, and what it does not.",
    body: [
      "Your bag is stored locally in your browser (localStorage). It stays on your device and is not sent to any server.",
      "The VYRO Letter form on this site is a prototype: it validates your input and shows a confirmation, but no email address is stored or transmitted until a mailing provider is connected.",
      "No analytics, advertising trackers, or third-party cookies are included in this prototype. A full privacy policy will be published before launch, covering any services added at that time.",
    ],
  },
  {
    id: "terms",
    title: "Terms & conditions",
    lead: "Terms of use for this prototype site.",
    body: [
      "This website is a design prototype demonstrating the intended VYRO storefront. Product information, including dimensions, capacity, and laptop compatibility, is provisional and subject to change after final production samples are inspected.",
      "All photography is concept imagery, pending the final VYRO ONE product shoot. Prices shown in INR are indicative for the prototype and will be confirmed before orders go live.",
      "No contract of sale is formed through this site, and no obligation to supply goods is created by anything displayed here.",
    ],
  },
];

export default function LegalPage() {
  return (
    <div className="shell py-14 md:py-20">
      <Reveal>
        <p className="label label-light">Support</p>
        <h1 className="display display-l mt-6 max-w-[18ch]">
          Policies, in plain words.
        </h1>
        <p className="body-s mt-8 max-w-[52ch]">
          Everything below reflects the current state of this prototype store. Sections
          marked &ldquo;to be confirmed&rdquo; will be completed before real orders go
          live.
        </p>
      </Reveal>

      <nav aria-label="On this page" className="rule mt-14 pt-8">
        <ul className="flex flex-wrap gap-x-8 gap-y-3">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="label link">
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-16 space-y-20 md:space-y-24">
        {sections.map((section) => (
          <Reveal key={section.id}>
            <section id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-28">
              <h2 id={`${section.id}-heading`} className="display display-s">
                {section.title}
              </h2>
              <p className="mt-4 max-w-[58ch] text-[1rem] font-medium leading-relaxed">
                {section.lead}
              </p>
              <div className="mt-6 max-w-[62ch] space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="body-s">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="rule mt-20 flex flex-col items-start justify-between gap-6 pt-12 md:flex-row md:items-center">
          <p className="display display-s max-w-[24ch]">
            Questions before launch?
          </p>
          <Link href="/products/vyro-one" className="btn btn-outline">
            Back to VYRO ONE
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
