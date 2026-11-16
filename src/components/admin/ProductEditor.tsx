"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import type { ProductActionState } from "@/app/admin/actions";
import { Button, Card, Checkbox, FormField, Input, Select, Textarea, Toast } from "@/components/admin/ui";

type ProductData = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  ingredients: string | null;
  directions: string | null;
  priceKes: number;
  discountPriceKes: number | null;
  inventory: { quantity: number } | null;
  images: { id: string; url: string; alt: string }[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isArchived: boolean;
  collections: { id: string }[];
};
type Category = { id: string; name: string };
type Collection = { id: string; name: string };
type ProductEditorProps = {
  product: ProductData | null;
  categories: Category[];
  collections: Collection[];
  action: (state: ProductActionState, formData: FormData) => Promise<ProductActionState>;
};

export default function ProductEditor({ product, categories, collections, action }: ProductEditorProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setPreviews(Array.from(event.target.files ?? []).map((file) => URL.createObjectURL(file)));
  };
  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <Toast message={state.error} tone="error" />}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,1fr)]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Basic information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Product name" htmlFor="name" error={fieldError("name")}><Input id="name" name="name" required minLength={2} defaultValue={product?.name} /></FormField>
              <FormField label="URL slug" htmlFor="slug" error={fieldError("slug")}><Input id="slug" name="slug" required pattern="[a-zA-Z0-9-]+" defaultValue={product?.slug} /></FormField>
              <FormField label="Category" htmlFor="categoryId" error={fieldError("categoryId")}>
                <Select id="categoryId" name="categoryId" required defaultValue={product?.categoryId ?? ""}>
                  <option value="" disabled>Select a category</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Short description" htmlFor="shortDescription" error={fieldError("shortDescription")}><Input id="shortDescription" name="shortDescription" required minLength={3} defaultValue={product?.shortDescription} /></FormField>
              <div className="sm:col-span-2"><FormField label="Description" htmlFor="description" error={fieldError("description")}><Textarea id="description" name="description" required minLength={3} rows={5} defaultValue={product?.description} /></FormField></div>
            </div>
            <fieldset className="mt-5 border-t border-line pt-4">
              <legend className="mb-2 text-sm font-semibold">Collections</legend>
              {collections.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {collections.map((collection) => (
                    <label key={collection.id} htmlFor={`collection-${collection.id}`} className="flex min-h-11 items-center gap-3 text-sm">
                      <Checkbox
                        id={`collection-${collection.id}`}
                        name="collectionIds"
                        value={collection.id}
                        defaultChecked={product?.collections.some((item) => item.id === collection.id)}
                      />
                      {collection.name}
                    </label>
                  ))}
                </div>
              ) : <p className="text-sm text-muted">Create a collection before assigning products.</p>}
              {fieldError("collectionIds") && <p role="alert" className="mt-2 text-sm text-red-800">{fieldError("collectionIds")}</p>}
            </fieldset>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Pricing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Price (KES)" htmlFor="priceKes" error={fieldError("priceKes")}><Input id="priceKes" name="priceKes" type="number" min={1} step={1} required defaultValue={product?.priceKes} /></FormField>
              <FormField label="Discount price (KES)" htmlFor="discountPriceKes" error={fieldError("discountPriceKes")}><Input id="discountPriceKes" name="discountPriceKes" type="number" min={1} step={1} defaultValue={product?.discountPriceKes ?? ""} /></FormField>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Details</h2>
            <div className="space-y-4">
              <FormField label="Ingredients" htmlFor="ingredients" hint="Use verified product documentation only.">
                <Textarea id="ingredients" name="ingredients" defaultValue={product?.ingredients ?? ""} />
              </FormField>
              <FormField label="Directions for use" htmlFor="directions" hint="Include only directions supplied and verified for this product.">
                <Textarea id="directions" name="directions" defaultValue={product?.directions ?? ""} />
              </FormField>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Inventory</h2>
            <FormField label="Available stock" htmlFor="stock" error={fieldError("stock")}><Input id="stock" name="stock" type="number" min={0} step={1} required defaultValue={product?.inventory?.quantity ?? 0} /></FormField>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Images</h2>
            <div className="space-y-4">
              <FormField label="Image URL" htmlFor="imageUrl" error={fieldError("imageUrl")} hint="Enter a URL or upload one or more images.">
                <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://" />
              </FormField>
              <FormField label="Upload images" htmlFor="images" hint="JPG, PNG or WebP; up to 4 MB per image.">
                <Input id="images" name="images" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleFiles} className="file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold" />
              </FormField>
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((url, index) => <img key={url} src={url} alt={`Selected image ${index + 1} preview`} className="aspect-square w-full border border-line object-cover" />)}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Visibility</h2>
            <div className="space-y-3">
              {[
                ["isFeatured", "Featured product", product?.isFeatured ?? false],
                ["isBestSeller", "Best seller", product?.isBestSeller ?? false],
                ["isArchived", "Archived", product?.isArchived ?? false],
              ].map(([name, label, checked]) => (
                <label key={String(name)} htmlFor={String(name)} className="flex min-h-11 items-center gap-3 text-sm font-medium">
                  <Checkbox id={String(name)} name={String(name)} defaultChecked={Boolean(checked)} />
                  {String(label)}
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(15,23,42,0.06)] backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="submit" loading={pending}>{product ? "Save product" : "Create product"}</Button>
      </div>
    </form>
  );
}
