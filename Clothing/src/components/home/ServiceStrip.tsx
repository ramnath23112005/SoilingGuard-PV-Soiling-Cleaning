import { Link } from 'react-router-dom'
import { serviceStrip } from '../../data/site'

/** Compact reassurance strip. Every item points to a policy page — no
    unsubstantiated delivery, return or payment promises. */
export function ServiceStrip() {
  return (
    <section aria-label="Customer information" className="border-b border-line bg-ivory">
      <div className="container-x">
        <ul className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x md:grid-cols-4 md:divide-y-0">
          {serviceStrip.map((item) => (
            <li key={item.label} className="py-6 md:px-6 md:first:pl-0 md:last:pr-0">
              <Link to={item.href} className="group block">
                <p className="label-xs text-ink">{item.label}</p>
                <p className="mt-2 text-[13px] text-muted transition-colors group-hover:text-ink">
                  {item.detail} →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
