import Link from "next/link";
import AddToCart from "./AddToCart";
import WishlistButton from "./WishlistButton";
type P = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  priceKes: number;
  discountPriceKes: number | null;
  isBestSeller?: boolean;
  createdAt?: Date | string;
  inventory: { quantity: number } | null;
  images?: { url: string; alt: string }[];
};
export default function ProductCard({ p }: { p: P }) {
  const price = p.discountPriceKes ?? p.priceKes; const out = (p.inventory?.quantity ?? 0) < 1; const im = p.images?.[0];
  const isNew = p.createdAt ? Date.now() - new Date(p.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000 : false;
  const stock = p.inventory?.quantity ?? 0;
  return (<article className="flex flex-col">
    <div className="relative">
      <Link href={`/product/${p.slug}`} className="group block aspect-[4/5] overflow-hidden border border-line bg-primary-soft focus-visible:ring-2 focus-visible:ring-primary" aria-label={p.name}>
        {im && <img src={im.url} alt={im.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]" />}
      </Link>
      <div className="absolute left-3 top-3 flex max-w-[75%] flex-wrap gap-1.5">
        {p.discountPriceKes !== null && <span className="bg-primary px-2.5 py-1 text-xs font-semibold text-white">Sale</span>}
        {p.isBestSeller && <span className="bg-white px-2.5 py-1 text-xs font-semibold text-primary">Best seller</span>}
        {isNew && <span className="bg-white px-2.5 py-1 text-xs font-semibold text-ink">New</span>}
        {out ? <span className="bg-black px-2.5 py-1 text-xs font-semibold text-white">Out of stock</span> : stock <= 5 && <span className="bg-primary-soft px-2.5 py-1 text-xs font-semibold text-ink">Low stock</span>}
      </div>
      <span className="absolute right-3 top-3 bg-white p-2 shadow-sm"><WishlistButton id={p.id} /></span>
    </div>
    <h3 className="mt-3 font-display text-lg font-semibold">{p.name}</h3>
    <p className="mb-2 text-sm text-muted">{p.shortDescription}</p>
    <p className="mb-3 tabular-nums font-semibold">KES {price.toLocaleString("en-KE")} {p.discountPriceKes !== null && <s className="ml-1 text-sm font-normal text-muted">KES {p.priceKes.toLocaleString("en-KE")}</s>}</p>
    <div className="mt-auto flex flex-wrap items-center gap-2 sm:gap-3"><AddToCart disabled={out} item={{ productId: p.id, slug: p.slug, name: p.name, price }} /><Link href={`/product/${p.slug}`} className="text-xs font-semibold text-primary underline-offset-4 hover:underline sm:text-sm">View</Link></div>
  </article>);
}
