import { NewsletterForm } from './NewsletterForm'

/** Dark editorial panel for drop notifications. */
export function NewsletterPanel() {
  return (
    <section id="newsletter" aria-labelledby="newsletter-heading" className="bg-black py-16 md:py-24">
      <h2 id="newsletter-heading" className="sr-only">
        Drop notifications
      </h2>
      <div className="container-x">
        <NewsletterForm variant="panel" />
      </div>
    </section>
  )
}
