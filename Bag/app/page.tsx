import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { FactStrip } from "@/components/home/fact-strip";
import { TheObject } from "@/components/home/the-object";
import { DetailsStrip } from "@/components/home/details-strip";
import { Features } from "@/components/home/features";
import { DarkInterlude } from "@/components/home/dark-interlude";
import { SpecPreview } from "@/components/home/spec-preview";
import { InContext } from "@/components/home/in-context";
import { BeforeYouOrder } from "@/components/home/before-you-order";
import { CtaBand } from "@/components/home/cta-band";
import { LetterTeaser } from "@/components/home/letter-teaser";

export const metadata: Metadata = {
  title: "VYRO — Premium design. Everyday purpose.",
  description:
    "VYRO makes thoughtfully designed everyday essentials. Discover VYRO ONE, a minimalist everyday backpack in Carbon Black — ₹1,299.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <FactStrip />
      <TheObject />
      <DetailsStrip />
      <Features />
      <DarkInterlude />
      <SpecPreview />
      <InContext />
      <BeforeYouOrder />
      <CtaBand />
      <LetterTeaser />
    </>
  );
}
