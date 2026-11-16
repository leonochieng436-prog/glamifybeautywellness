"use client";

import { useActionState } from "react";
import { importProducts, type ProductImportState } from "@/app/admin/product-import-actions";
import { Button, Card, FormField, Input, Toast } from "@/components/admin/ui";

const initialState: ProductImportState = {};

export default function ProductBulkImport() {
  const [state, formAction, pending] = useActionState(importProducts, initialState);

  return (
    <Card className="mb-5 p-5">
      <div className="mb-4">
        <h2 className="font-semibold">Add products from CSV</h2>
        <p className="mt-1 text-sm text-muted">
          Download the template, fill in one product per row, then upload it. Imports are all-or-nothing, with up to 500 products per file.
        </p>
      </div>
      {state.error && (
        <div className="mb-4 space-y-2">
          <Toast message={state.error} tone="error" />
          {state.rowErrors && (
            <ul className="list-inside list-disc space-y-1 text-sm text-red-900">
              {state.rowErrors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          )}
        </div>
      )}
      {state.created !== undefined && (
        <div className="mb-4"><Toast message={`${state.created} ${state.created === 1 ? "product" : "products"} imported successfully.`} /></div>
      )}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-3">
          <a
            href="/product-import-template.csv"
            download
            className="inline-flex min-h-11 items-center border border-line px-4 text-sm font-semibold text-primary hover:border-primary"
          >
            Download CSV template
          </a>
          <p className="text-xs leading-5 text-muted">
            Required columns: name, slug, categorySlug, shortDescription, description, priceKes, stock. Use existing category and collection slugs. Optional columns: discountPriceKes, ingredients, directions, imageUrl, featured, bestSeller, archived, collectionSlugs. Separate collection slugs with |; use true or false for flags.
          </p>
        </div>
        <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FormField label="CSV file" htmlFor="product-csv" hint="CSV only; maximum 750 KB.">
            <Input id="product-csv" name="file" type="file" accept=".csv,text/csv" required />
          </FormField>
          <Button type="submit" loading={pending}>Import products</Button>
        </form>
      </div>
    </Card>
  );
}
