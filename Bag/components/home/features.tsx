import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    title: "Clean silhouette",
    body: "A minimalist form that reads the same from a meeting room to a morning train.",
  },
  {
    title: "Everyday capacity",
    body: "Approximately 20–22 litres — sized for a laptop, a layer, and the rest of the day.",
  },
  {
    title: "Padded carry",
    body: "Padded shoulder straps and a structured back panel for comfort that lasts the commute.",
  },
  {
    title: "Practical storage",
    body: "A main compartment with everyday pockets — including a side pocket sized for a bottle.",
  },
];

export function Features() {
  return (
    <section aria-labelledby="features-heading" className="bg-chalk">
      <div className="shell py-20 md:py-28">
        <Reveal>
          <p className="label label-light">Built for the everyday</p>
          <h2 id="features-heading" className="display display-m mt-6 max-w-[18ch]">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
        </Reveal>

        <ul className="mt-12 grid gap-px border border-line bg-line md:mt-16 md:grid-cols-2">
          {features.map((feature, index) => (
            <li key={feature.title} className="bg-chalk">
              <Reveal delay={index * 60} className="h-full p-8 md:p-10">
                <p className="label label-light">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="display display-s mt-6">{feature.title}</h3>
                <p className="body-s mt-4 max-w-[40ch]">{feature.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
