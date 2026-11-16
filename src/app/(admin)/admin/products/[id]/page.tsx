import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveProduct } from "@/app/admin/actions";
import { Card, PageHeader, Toast } from "@/components/admin/ui";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import ProductEditor from "@/components/admin/ProductEditor";
import { deleteImage as deleteProductImage } from "@/app/admin/actions2";

export const dynamic = "force-dynamic";
type Query = Record<string, string | string[] | undefined>;

export default async function EditProduct({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Query>;
}) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const [product, categories, collections] = await Promise.all([
    isNew ? null : db.product.findUnique({ where: { id }, include: { inventory: true, images: { orderBy: { position: "asc" } }, collections: { select: { id: true } } } }),
    db.productCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.collection.findMany({ orderBy: [{ position: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);
  if (!isNew && !product) notFound();

  return (
    <>
      <PageHeader title={product ? "Edit product" : "New product"} description="Update catalogue information, stock, images and storefront visibility." />
      {query.saved === "image" && <div className="mb-5"><Toast message="Product image removed." /></div>}
      <ProductEditor product={product} categories={categories} collections={collections} action={saveProduct.bind(null, id)} />
      {product && product.images.length > 0 && (
        <Card className="mt-6 p-5">
          <h2 className="mb-4 font-semibold">Current product images</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.images.map((image) => (
              <li key={image.id} className="border border-line p-3">
                <img src={image.url} alt={image.alt} className="aspect-square w-full object-cover" />
                <ConfirmDialog action={deleteProductImage.bind(null, image.id)} message="Remove this product image?">
                  <button type="submit" className="mt-2 min-h-11 w-full border border-line px-3 text-sm font-semibold text-red-800 hover:border-red-700 hover:bg-red-50">Remove image</button>
                </ConfirmDialog>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
