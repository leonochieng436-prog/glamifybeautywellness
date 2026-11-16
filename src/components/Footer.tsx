import Link from "next/link";
import { ArrowUp, Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { ProductCategory, StoreSettings } from "@prisma/client";
import Newsletter from "@/components/Newsletter";
import CookieConsentManager from "@/components/CookieConsentManager";
import { getSocialUrls } from "@/lib/socials";
import Logo from "@/components/Logo";
import type { Brand } from "@/lib/brand";
import { buildWhatsAppGreetingUrl } from "@/lib/whatsapp";

const CUSTOMER_CARE_LINKS = [
  ["How to order", "/how-to-order"],
  ["FAQ", "/faq"],
  ["Delivery and payment", "/delivery-and-payment"],
  ["Return Policy", "/return-policy"],
] as const;

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5H17V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.5v3.2h2.8V21h3.2Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer({
  settings,
  categories,
  brand,
}: {
  settings: StoreSettings | null;
  categories: Pick<ProductCategory, "name" | "slug">[];
  brand: Brand;
}) {
  const businessName = brand.name;
  const whatsappNumber = settings?.whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = whatsappNumber ? buildWhatsAppGreetingUrl(whatsappNumber, brand.name) : null;
  const phone = settings?.phone?.trim();
  const phoneUrl = phone?.replace(/[^\d+]/g, "");
  const socials = getSocialUrls(settings?.socials);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black pb-28 pt-10 text-white sm:pb-24 sm:pt-12 lg:pb-20">
      <div className="mx-auto max-w-6xl px-5">
        <section className="grid gap-5 border-b border-white/20 pb-8 sm:grid-cols-[minmax(0,1fr)_minmax(20rem,1.2fr)] sm:items-center">
          <div>
            <h2 className="type-h3 text-white">{brand.name} updates</h2>
            <p className="mt-2 text-sm text-white/80">{brand.tagline} Newsletter signup is optional.</p>
          </div>
          <Newsletter brandName={brand.name} />
        </section>

        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <section aria-labelledby="footer-brand">
            <h2 id="footer-brand" className="sr-only">About {businessName}</h2>
            <Link href="/" aria-label={`${businessName} home`} className="inline-flex min-h-11 items-center">
              <Logo brand={brand} variant="dark" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/80">
              {brand.ctaText}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/shop" className="inline-flex min-h-11 items-center justify-center bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
                Shop {brand.name}
              </Link>
              {whatsappUrl && (
                <a href={whatsappUrl} className="inline-flex min-h-11 items-center gap-2 border border-white/50 px-4 text-sm font-semibold text-white hover:border-primary-light hover:bg-primary hover:text-white">
                  <MessageCircle aria-hidden="true" size={17} />
                  Order on WhatsApp
                </a>
              )}
            </div>
          </section>

          <nav aria-label="Shop">
            <h2 className="mb-3 text-base font-semibold text-white">Shop</h2>
            <ul className="space-y-0.5 text-sm">
              <li><Link className="flex min-h-11 items-center text-white/80 hover:text-primary-light" href="/shop">All products</Link></li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link className="flex min-h-11 items-center text-white/80 hover:text-primary-light" href={`/shop?category=${encodeURIComponent(category.slug)}`}>
                    {category.name}
                  </Link>
                </li>
              ))}
              <li><Link className="flex min-h-11 items-center text-white/80 hover:text-primary-light" href="/wishlist">Wishlist</Link></li>
              <li><Link className="flex min-h-11 items-center text-white/80 hover:text-primary-light" href="/cart">Cart</Link></li>
            </ul>
          </nav>

          <nav aria-label="Customer care">
            <h2 className="mb-3 text-base font-semibold text-white">Customer care</h2>
            <ul className="space-y-0.5 text-sm">
              {CUSTOMER_CARE_LINKS.map(([label, href]) => (
                <li key={href}>
                  <Link className="flex min-h-11 items-center text-white/80 hover:text-primary-light" href={href}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact" className="mb-3 text-base font-semibold text-white">Contact and location</h2>
            <address className="space-y-1 not-italic text-sm text-white/80">
              {settings?.location && (
                <p className="flex min-h-11 items-center gap-3">
                  <MapPin aria-hidden="true" size={17} className="shrink-0 text-primary-light" />
                  <span>{settings.location}</span>
                </p>
              )}
              {phone && phoneUrl && (
                <a className="flex min-h-11 items-center gap-3 hover:text-primary-light" href={`tel:${phoneUrl}`}>
                  <Phone aria-hidden="true" size={17} className="shrink-0 text-primary-light" />
                  <span>{phone}</span>
                </a>
              )}
              {whatsappUrl && (
                <a className="flex min-h-11 items-center gap-3 hover:text-primary-light" href={whatsappUrl}>
                  <MessageCircle aria-hidden="true" size={17} className="shrink-0 text-primary-light" />
                  <span>WhatsApp us</span>
                </a>
              )}
              {settings?.email && (
                <a className="flex min-h-11 items-center gap-3 break-all hover:text-primary-light" href={`mailto:${settings.email}`}>
                  <Mail aria-hidden="true" size={17} className="shrink-0 text-primary-light" />
                  <span>{settings.email}</span>
                </a>
              )}
              <Link className="flex min-h-11 items-center gap-3 hover:text-primary-light" href="/contact">
                <Mail aria-hidden="true" size={17} className="shrink-0 text-primary-light" />
                <span>Send us a message</span>
              </Link>
              {settings?.businessHours && (
                <p className="flex min-h-11 items-center gap-3">
                  <Clock3 aria-hidden="true" size={17} className="shrink-0 text-primary-light" />
                  <span>{settings.businessHours}</span>
                </p>
              )}
            </address>
            {(socials.facebook || socials.instagram) && (
              <div className="mt-4 flex gap-3">
                {socials.facebook && (
                  <a href={socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Visit us on Facebook" className="flex h-11 w-11 items-center justify-center border border-white/40 text-white hover:border-primary hover:bg-primary">
                    <FacebookIcon />
                  </a>
                )}
                {socials.instagram && (
                  <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Visit us on Instagram" className="flex h-11 w-11 items-center justify-center border border-white/40 text-white hover:border-primary hover:bg-primary">
                    <InstagramIcon />
                  </a>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="border-t border-white/20 py-6">
          <div className="flex flex-col gap-5 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">Payment methods</p>
              <ul className="mt-2 flex flex-wrap gap-2" aria-label="Accepted payment methods">
                {["M-Pesa", "Cash on delivery", "Bank transfer"].map((method) => (
                  <li key={method} className="border border-white/30 px-3 py-1.5 text-xs text-white/85">{method}</li>
                ))}
              </ul>
            </div>
            <p className="max-w-md text-white/80">Orders are confirmed by our team on WhatsApp before dispatch.</p>
          </div>
          
        </div>

        <div className="flex flex-col gap-3 border-t border-white/20 pt-5 text-xs text-white/75 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {businessName}. All rights reserved.</p>
          <nav aria-label="Legal links" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link className="inline-flex min-h-11 items-center hover:text-primary-light" href="/privacy-policy">Privacy Policy</Link>
            <Link className="inline-flex min-h-11 items-center hover:text-primary-light" href="/terms-and-conditions">Terms of Service</Link>
            <Link className="inline-flex min-h-11 items-center hover:text-primary-light" href="/cookie-policy">Cookie Policy</Link>
            <CookieConsentManager />
            <a className="inline-flex min-h-11 items-center gap-1 hover:text-primary-light" href="#top">
              Back to top <ArrowUp aria-hidden="true" size={14} />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
