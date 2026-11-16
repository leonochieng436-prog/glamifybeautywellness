import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
export const dynamic = "force-dynamic";
type SP = { category?: string; collection?: string; sort?: string; q?: string; min?: string; max?: string; stock?: string; best?: string; fresh?: string };
const sorts: Record<string, object> = { newest: { createdAt: "desc" }, low: { priceKes: "asc" }, high: { priceKes: "desc" }, best: [{ isBestSeller: "desc" }, { createdAt: "desc" }] };
export default async function Shop({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams; const min = Number(sp.min) || undefined, max = Number(sp.max) || undefined;
  const [products, cats, collections] = await Promise.all([
    db.product.findMany({ where: { isArchived: false,
    ...(sp.category && { category: { slug: sp.category } }), ...(sp.q && { name: { contains: sp.q, mode: "insensitive" } }),
    ...(sp.collection && { collections: { some: { slug: sp.collection } } }),
    ...((min || max) && { priceKes: { ...(min && { gte: min }), ...(max && { lte: max }) } }),
    ...(sp.stock && { inventory: { quantity: { gt: 0 } } }), ...(sp.best && { isBestSeller: true }),
    ...(sp.fresh && { createdAt: { gte: new Date(Date.now() - 30 * 864e5) } }) },
    orderBy: sorts[sp.sort ?? "newest"] ?? sorts.newest, include: { inventory: true, images: { orderBy: { position: "asc" }, take: 1 } } }),
    db.productCategory.findMany({ orderBy: { name: "asc" } }),
    db.collection.findMany({ orderBy: [{ position: "asc" }, { name: "asc" }] }),
  ]);
  const inp = "border border-line px-3 py-1.5";
  return (<><h1 className="type-h1 mb-6">Shop</h1>
    <form className="mb-8 flex flex-wrap items-center gap-3 text-sm"><input name="q" defaultValue={sp.q} placeholder="Search" className={inp} />
      <select name="category" defaultValue={sp.category ?? ""} className={inp}><option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select>
      <select name="collection" defaultValue={sp.collection ?? ""} className={inp} aria-label="Collection"><option value="">All collections</option>{collections.map((collection) => <option key={collection.id} value={collection.slug}>{collection.name}</option>)}</select>
      <input name="min" type="number" defaultValue={sp.min} placeholder="Min KES" className={`${inp} w-24`} /><input name="max" type="number" defaultValue={sp.max} placeholder="Max KES" className={`${inp} w-24`} />
      <label><input type="checkbox" name="stock" value="1" defaultChecked={!!sp.stock} /> In stock</label><label><input type="checkbox" name="best" value="1" defaultChecked={!!sp.best} /> Best sellers</label><label><input type="checkbox" name="fresh" value="1" defaultChecked={!!sp.fresh} /> New arrivals</label>
      <select name="sort" defaultValue={sp.sort ?? "newest"} className={inp}><option value="newest">Newest</option><option value="best">Best selling</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
      <button className="bg-primary px-5 py-1.5 font-semibold text-white hover:bg-primary-dark">Apply filters</button></form>
    <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    {!products.length && <p className="border border-line bg-primary-soft p-6 text-muted">No products match these filters. Try widening them.</p>}</>);
}
