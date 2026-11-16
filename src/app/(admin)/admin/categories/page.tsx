import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createCategory } from "@/app/admin/actions2";
import { Button, Card, DataTable, EmptyState, FormField, Input, PageHeader, Toast } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
type Query = Record<string, string | string[] | undefined>;

export default async function Categories({ searchParams }: { searchParams: Promise<Query> }) {
  await requireAdmin();
  const [categories, query] = await Promise.all([
    db.productCategory.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } }),
    searchParams,
  ]);
  return (
    <>
      <PageHeader title="Categories" description="Organize products into storefront categories." />
      {query.saved === "category" && <div className="mb-5"><Toast message="Category created." /></div>}
      <Card className="mb-6">
        <div className="border-b border-line px-5 py-4"><h2 className="font-semibold">Add category</h2></div>
        <form action={createCategory} className="grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <FormField label="Name" htmlFor="category-name"><Input id="category-name" name="name" required minLength={2} maxLength={80} /></FormField>
          <FormField label="URL slug" htmlFor="category-slug" hint="Use lowercase letters, numbers and hyphens.">
            <Input id="category-slug" name="slug" required minLength={2} maxLength={80} pattern="[a-zA-Z0-9-]{2,80}" />
          </FormField>
          <Button type="submit">Add category</Button>
        </form>
      </Card>
      <Card>
        <DataTable
          rows={categories}
          rowKey={(category) => category.id}
          columns={[
            { key: "name", header: "Category", render: (category: (typeof categories)[number]) => <span className="font-semibold">{category.name}</span> },
            { key: "slug", header: "URL slug", render: (category: (typeof categories)[number]) => <code className="text-xs">{category.slug}</code> },
            { key: "products", header: "Products", render: (category: (typeof categories)[number]) => <span className="tabular-nums">{category._count.products}</span> },
          ]}
          empty={<EmptyState title="No categories yet" description="Add a category before assigning products to it." />}
        />
      </Card>
    </>
  );
}
