import { Minus, Plus } from "lucide-react";

export type AccordionItem = {
  title: string;
  content: string;
};

export function Accordion({
  items,
  defaultOpen = -1,
}: {
  items: AccordionItem[];
  defaultOpen?: number;
}) {
  return (
    <div className="border-t border-line">
      {items.map((item, index) => (
        <details key={item.title} open={index === defaultOpen} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 marker:hidden">
            <span className="text-[0.9375rem] font-medium">{item.title}</span>
            <span className="relative flex h-6 w-6 shrink-0 items-center justify-center text-graphite">
              <Plus
                strokeWidth={1.4}
                className="absolute h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-90 group-open:opacity-0"
              />
              <Minus
                strokeWidth={1.4}
                className="absolute h-4 w-4 opacity-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-90 group-open:opacity-100"
              />
            </span>
          </summary>
          <p className="body-s max-w-[54ch] pb-6 pr-10">{item.content}</p>
        </details>
      ))}
    </div>
  );
}
