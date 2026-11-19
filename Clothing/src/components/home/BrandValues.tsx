import { homeContent } from '../../data/site'
import { Reveal } from '../ui/Reveal'

/** Three brand ideas, separated by fine dividers. Compact stack on mobile. */
export function BrandValues() {
  const values = homeContent.values

  return (
    <section aria-label="Brand values" className="border-b border-line bg-ivory">
      <div className="container-x">
        <ul className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {values.map((value, index) => (
            <li key={value.label} className="py-8 md:px-8 md:py-10 md:first:pl-0 md:last:pr-0">
              <Reveal delay={index * 80}>
                <div className="flex items-baseline gap-4">
                  <span className="label-xs text-olive" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <div>
                    <h2 className="label-sm text-ink">{value.label}</h2>
                    <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted">
                      {value.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
