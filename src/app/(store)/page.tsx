import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import CardList from "@/components/CardList";
import HeroSlider from "@/components/HeroSlider";
import { DEFAULT_INTRO_SLIDE, normalizeHeroSlide } from "@/lib/hero-slides";
import { getBrand } from "@/lib/brand";

export const dynamic = "force-dynamic";
const inc = { inventory: true, images: { orderBy: { position: "asc" as const }, take: 1 } };

export default async function Home() {
  const where = { isArchived: false };
  const [featured, best, fresh, banner, ts, faqs, heroSlides, brand] = await Promise.all([
    db.product.findMany({ where: { ...where, isFeatured: true }, include: inc, take: 4 }),
    db.product.findMany({ where: { ...where, isBestSeller: true }, include: inc, take: 4 }),
    db.product.findMany({ where, orderBy: { createdAt: "desc" }, include: inc, take: 4 }),
    db.promotionalBanner.findFirst({ where: { active: true }, orderBy: { position: "asc" } }),
    db.testimonial.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
    db.faq.findMany({ orderBy: { position: "asc" } }),
    db.heroSlide.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
    getBrand(),
  ]);
  const slides = heroSlides.length
    ? heroSlides.map(normalizeHeroSlide)
    : [{ ...DEFAULT_INTRO_SLIDE, eyebrow: brand.tagline, primaryLabel: `Shop ${brand.name}` }];
  const Row = ({ title, products }: { title: string; products: typeof featured }) =>
    products.length ? (
      <section className="mt-16">
        <h2 className="type-h2 mb-6">{title}</h2>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">{products.map((product) => <ProductCard key={product.id} p={product} />)}</div>
      </section>
    ) : null;

  return (
    <main id="main-content">
      {banner && (
        <div className="bg-black px-5 py-3 text-center text-sm text-white sm:px-8">
          {banner.href
            ? <Link href={banner.href} className="font-semibold underline decoration-primary-light underline-offset-4 hover:text-primary-light">{banner.title}{banner.subtitle ? ` — ${banner.subtitle}` : ""}</Link>
            : <p className="mx-auto text-white">{banner.title}{banner.subtitle ? ` — ${banner.subtitle}` : ""}</p>}
        </div>
      )}
      <HeroSlider slides={slides} ctaText={brand.ctaText} />
      <div id="home-content" className="mx-auto max-w-6xl px-5 pb-20">
        <Row title="Featured" products={featured} />
        <Row title="Best sellers" products={best} />
        <Row title="New arrivals" products={fresh} />
        <CardList source="recent" title="Recently viewed" />
        {ts.length > 0 && (
          <section className="mt-16">
            <h2 className="type-h2 mb-6">What customers say</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {ts.map((testimonial) => (
                <figure key={testimonial.id} className="border border-line bg-primary-soft p-6">
                  <blockquote>{testimonial.body}</blockquote>
                  <figcaption className="mt-3 text-sm text-muted">{testimonial.name}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
        {faqs.length > 0 && (
          <section className="mt-16 max-w-2xl">
            <h2 className="type-h2 mb-6">Questions</h2>
            {faqs.map((faq) => (
              <details key={faq.id} className="border-b border-line py-3">
                <summary className="cursor-pointer font-semibold hover:text-primary">{faq.question}</summary>
                <p className="mt-2 text-muted">{faq.answer}</p>
              </details>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
