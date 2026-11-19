import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { Wordmark } from '../brand/Wordmark'
import { footerLinks, site } from '../../data/site'
import { NewsletterForm } from '../home/NewsletterForm'

export function SiteFooter() {
  const year = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-black text-ivory">
      <div className="container-x py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Wordmark size="lg" className="text-ivory" />
            <p className="mt-6 max-w-xs text-[14px] leading-relaxed text-ivory/70">
              {site.tagline}
            </p>
            <div className="mt-8">
              <p className="label-xs text-ivory/50">Social</p>
              <ul className="mt-3 space-y-1.5 text-[13px] text-ivory/70">
                {site.socialPending.map((handle) => (
                  <li key={handle}>
                    {handle} <span className="text-ivory/40">— link coming soon</span>
                  </li>
                ))}
                {site.social.length === 0 ? null : site.social.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="link-line" rel="noreferrer noopener" target="_blank">
                      {item.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="label-xs text-ivory/50">Shop</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-ivory/80">
              {footerLinks.shop.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="link-line">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="label-xs text-ivory/50">Support</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-ivory/80">
              {footerLinks.support.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="link-line">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="label-xs text-ivory/50">Brand</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-ivory/80">
              {footerLinks.brand.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="link-line">
                    {item.label}
                  </Link>
                </li>
              ))}
              {footerLinks.legal.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="link-line">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="label-xs text-ivory/50">Newsletter</p>
            <p className="mt-4 text-[13px] leading-relaxed text-ivory/70">
              First access to Drop 001.
            </p>
            <NewsletterForm variant="compact" className="mt-5" />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-ivory/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-ivory/50">
            © {year} VYRO. All rights reserved. Pre-launch configuration — prices, policies and
            availability are subject to change.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-2 self-start label-xs text-ivory/70 transition-colors hover:text-ivory"
          >
            Back to top
            <ArrowUp
              size={14}
              strokeWidth={1.5}
              className="transition-transform duration-200 group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </footer>
  )
}
