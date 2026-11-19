import Link from "next/link";
import { Wordmark } from "./logo";
import { NewsletterForm } from "./newsletter-form";
import { footerNav } from "@/lib/site";

async function getYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const year = await getYear();

  return (
    <footer className="border-t border-line bg-chalk">
      <div className="shell grid gap-14 py-16 md:grid-cols-12 md:gap-10 md:py-20">
        <div className="md:col-span-4">
          <Link href="/" aria-label="VYRO — home" className="inline-block text-ink">
            <Wordmark className="h-5 w-auto" />
          </Link>
          <p className="label mt-6 text-ink">Premium design. Everyday purpose.</p>
          <p className="mt-3 max-w-[34ch] text-[0.875rem] leading-relaxed text-graphite">
            Thoughtfully designed everyday essentials, balancing purposeful details with
            a clean, timeless form.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-5">
          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="label label-light">{group.title}</h2>
              <ul className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-[0.875rem] text-ink/80 transition-colors hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div id="the-vyro-letter" className="scroll-mt-24 md:col-span-3">
          <h2 className="label">The VYRO Letter</h2>
          <p className="mt-5 max-w-[32ch] text-[0.875rem] leading-relaxed text-graphite">
            Notes on design, everyday objects, and what&apos;s next.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="shell border-t border-line py-6">
        <div className="flex flex-col gap-3 text-[0.6875rem] leading-relaxed text-graphite sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} VYRO. All product photography is concept imagery, pending the final
            VYRO ONE shoot.
          </p>
          <p>Prototype store — no orders are processed on this site.</p>
        </div>
      </div>
    </footer>
  );
}
