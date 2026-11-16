import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import RecentTracker from "@/components/RecentTracker";
import ReviewForm from "@/components/ReviewForm";
import WishlistButton from "@/components/WishlistButton";
import GoBack from "@/components/GoBack";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await db.product.findUnique({ where: { slug: (await params).slug }, include: { images: { take: 1, orderBy: { position: "asc" } } } });
  return p ? { title: p.name, description: p.shortDescription, alternates: { canonical: `/product/${p.slug}` }, openGraph: { title: p.name, description: p.shortDescription, images: p.images[0] ? [p.images[0].url] : [] } } : {};
}
export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const p = await db.product.findUnique({ where: { slug: (await params).slug }, include: { inventory: true, category: true, images: { orderBy: { position: "asc" } }, reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } } } });
  if (!p || p.isArchived) notFound();
  const related = await db.product.findMany({ where: { categoryId: p.categoryId, id: { not: p.id }, isArchived: false }, include: { inventory: true, images: { take: 1, orderBy: { position: "asc" } } }, take: 4 });
  const price = p.discountPriceKes ?? p.priceKes; const stock = p.inventory?.quantity ?? 0; const avg = p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0;
  const ld = { "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.shortDescription, image: p.images.map((i) => i.url), offers: { "@type": "Offer", priceCurrency: "KES", price, availability: stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }, ...(p.reviews.length && { aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: p.reviews.length } }) };
  return (<div className="pt-6"><GoBack /><RecentTracker id={p.id} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    <div className="grid gap-10 md:grid-cols-2"><div className="space-y-3"><div className="aspect-square overflow-hidden border border-line bg-primary-soft">{p.images[0] && <img src={p.images[0].url} alt={p.images[0].alt} className="h-full w-full object-cover" />}</div>
      <div className="flex gap-3">{p.images.slice(1).map((i) => <img key={i.id} src={i.url} alt={i.alt} loading="lazy" className="h-20 w-20 border border-line object-cover" />)}</div></div>
    <div><p className="text-sm font-semibold text-primary">{p.category.name}</p><h1 className="type-h1 my-2">{p.name} <span className="align-middle"><WishlistButton id={p.id} /></span></h1>
      {avg > 0 && <p className="mb-2 text-sm text-muted">{avg.toFixed(1)} / 5 from {p.reviews.length} review{p.reviews.length > 1 && "s"}</p>}
      <p className="mb-4 text-2xl font-semibold tabular-nums">KES {price.toLocaleString("en-KE")} {p.discountPriceKes && <s className="ml-2 text-base font-normal text-muted">KES {p.priceKes.toLocaleString("en-KE")}</s>}</p><p className="mb-4">{p.description}</p>
      {p.ingredients && <p className="mb-2"><b>Ingredients:</b> {p.ingredients}</p>}{p.directions && <p className="mb-2"><b>Directions:</b> {p.directions}</p>}
      <p className="mb-6 text-sm font-semibold">{stock ? (stock <= 5 ? `Low stock · only ${stock} left` : "In stock") : "Out of stock"}</p><AddToCart disabled={!stock} item={{ productId: p.id, slug: p.slug, name: p.name, price }} /></div></div>
    <section className="mt-16"><h2 className="type-h2 mb-6">Reviews</h2>{p.reviews.map((r) => <div key={r.id} className="border-b border-line py-3"><p className="text-sm font-semibold">{r.rating}/5 · Verified purchase</p><p>{r.body}</p></div>)}{!p.reviews.length && <p className="mb-6 text-muted">No reviews yet.</p>}<div className="mt-6"><ReviewForm productId={p.id} /></div></section>
    {related.length > 0 && <section className="mt-16"><h2 className="type-h2 mb-6">You may also like</h2><div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div></section>}</div>);
}
