import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { setProductArchived } from "@/app/admin/actions2";
import ProductBulkImport from "@/components/admin/ProductBulkImport";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { Card, DataTable, EmptyState, FormField, Input, PageHeader, Pagination, Select, StatusPill, Toast } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;
type Query = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => typeof value === "string" ? value : "";
const money = (amount: number) => `KES ${amount.toLocaleString("en-KE")}`;

export default async function Products({ searchParams }: { searchParams: Promise<Query> }) {
  await requireAdmin();
  const query = await searchParams;
  const term = one(query.q).trim();
  const categoryId = one(query.category);
  const status = one(query.status);
  const stock = one(query.stock);
  const saved = one(query.saved);
  const requestedPage = Number(one(query.page));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const where: Prisma.ProductWhereInput = {};

  if (term) where.OR = [{ name: { contains: term, mode: "insensitive" } }, { slug: { contains: term, mode: "insensitive" } }];
  if (categoryId) where.categoryId = categoryId;
  if (status === "active") where.isArchived = false;
  if (status === "archived") where.isArchived = true;
  if (stock === "out") where.inventory = { is: { quantity: 0 } };
  if (stock === "in") where.inventory = { is: { quantity: { gt: 0 } } };
  if (stock === "low") {
    const inventory = await db.inventory.findMany({ select: { productId: true, quantity: true, lowStockAt: true } });
    where.id = { in: inventory.filter((item) => item.quantity > 0 && item.quantity <= item.lowStockAt).map((item) => item.productId) };
  }

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where,
      include: { inventory: true, category: true, images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
    db.productCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const params = new URLSearchParams();
  if (term) params.set("q", term);
  if (categoryId) params.set("category", categoryId);
  if (status) params.set("status", status);
  if (stock) params.set("stock", stock);
  const hrefFor = (nextPage: number) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("page", String(nextPage));
    return `/admin/products?${nextParams.toString()}`;
  };
  const columns = [
    {
      key: "product",
      header: "Product",
      render: (product: (typeof products)[number]) => (
        <div className="flex min-w-56 items-center gap-3">
          {product.images[0] ? <img src={product.images[0].url} alt="" className="h-12 w-12 shrink-0 border border-line object-cover" /> : <div aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center bg-slate-100 text-xs text-muted">No image</div>}
          <div className="min-w-0">
            <Link href={`/admin/products/${product.id}`} className="font-semibold hover:text-primary">{product.name}</Link>
            <p className="truncate text-xs text-muted">{product.slug}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {product.isFeatured && <span className="bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-900">Featured</span>}
              {product.isBestSeller && <span className="bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-900">Best seller</span>}
            </div>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (product: (typeof products)[number]) => product.category.name },
    {
      key: "price",
      header: "Price",
      render: (product: (typeof products)[number]) => (
        <div className="whitespace-nowrap tabular-nums">
          <span>{money(product.discountPriceKes ?? product.priceKes)}</span>
          {product.discountPriceKes && <span className="ml-2 text-xs text-muted line-through">{money(product.priceKes)}</span>}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (product: (typeof products)[number]) => {
        const quantity = product.inventory?.quantity ?? 0;
        const stockStatus = quantity === 0 ? "OUT OF STOCK" : quantity <= (product.inventory?.lowStockAt ?? 5) ? "LOW STOCK" : "IN STOCK";
        return <div className="space-y-1"><span className="block tabular-nums">{quantity}</span><StatusPill status={stockStatus} /></div>;
      },
    },
    { key: "status", header: "Status", render: (product: (typeof products)[number]) => <StatusPill status={product.isArchived ? "ARCHIVED" : "ACTIVE"} /> },
    {
      key: "actions",
      header: "Actions",
      render: (product: (typeof products)[number]) => (
        <div className="flex items-center gap-3 whitespace-nowrap">
          <Link href={`/admin/products/${product.id}`} className="font-semibold text-primary hover:underline">Edit</Link>
          <ConfirmDialog action={setProductArchived.bind(null, product.id, !product.isArchived)} message={`Are you sure you want to ${product.isArchived ? "restore" : "archive"} ${product.name}?`}>
            <button type="submit" className="min-h-11 px-2 text-sm font-medium text-red-800 hover:underline">{product.isArchived ? "Restore" : "Archive"}</button>
          </ConfirmDialog>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Products" description={`${total.toLocaleString("en-KE")} products in the catalogue.`} action={{ href: "/admin/products/new", label: "Add product" }} />
      {saved && <div className="mb-5"><Toast message={saved === "product" ? "Product saved." : "Product visibility updated."} /></div>}
      <ProductBulkImport />
      <Card className="mb-5 p-4">
        <form method="get" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FormField label="Search" htmlFor="product-search"><Input id="product-search" name="q" defaultValue={term} placeholder="Name or slug" /></FormField>
          <FormField label="Category" htmlFor="product-category">
            <Select id="product-category" name="category" defaultValue={categoryId}><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>
          </FormField>
          <FormField label="Visibility" htmlFor="product-status">
            <Select id="product-status" name="status" defaultValue={status}><option value="">All products</option><option value="active">Active</option><option value="archived">Archived</option></Select>
          </FormField>
          <FormField label="Stock" htmlFor="product-stock">
            <div className="flex gap-2"><Select id="product-stock" name="stock" defaultValue={stock}><option value="">All stock</option><option value="in">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></Select><button type="submit" className="min-h-11 shrink-0 bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">Filter</button></div>
          </FormField>
        </form>
      </Card>
      <Card>
        <DataTable
          rows={products}
          rowKey={(product) => product.id}
          columns={columns}
          empty={<EmptyState title="No products found" description="Try changing the filters or add a new product to the catalogue." action={{ href: "/admin/products/new", label: "Add product" }} />}
        />
        {total > 0 && <Pagination page={page} previous={page > 1 ? hrefFor(page - 1) : undefined} next={page < totalPages ? hrefFor(page + 1) : undefined} />}
      </Card>
    </>
  );
}
