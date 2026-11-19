import { formatPrice } from "@/lib/site";
import { vyroOne } from "@/lib/products";

const facts = [
  { term: "Object", value: vyroOne.name },
  { term: "Colour", value: vyroOne.colour },
  { term: "Price", value: formatPrice(vyroOne.price) },
  { term: "Status", value: "First release — prototype store" },
];

export function FactStrip() {
  return (
    <section aria-label="Product summary" className="rule border-b">
      <dl className="shell grid grid-cols-2 md:grid-cols-4">
        {facts.map((fact, index) => (
          <div
            key={fact.term}
            className={`flex flex-col gap-2 py-6 md:py-7 ${
              index % 2 === 1 ? "border-l border-line pl-6 md:pl-8" : "md:border-l md:border-line md:pl-8"
            } ${index === 0 ? "md:border-l-0 md:pl-0" : ""} ${
              index === 2 ? "border-t border-line md:border-t-0" : ""
            } ${index === 3 ? "border-t border-line md:border-t-0" : ""}`}
          >
            <dt className="label label-light">{fact.term}</dt>
            <dd className="text-[0.9375rem] font-medium">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
