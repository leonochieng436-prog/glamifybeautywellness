import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteCollection, saveCollection } from "@/app/admin/actions2";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { Button, Card, FormField, Input, PageHeader, Toast } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
type Query = Record<string, string | string[] | undefined>;

export default async function Collections({ searchParams }: { searchParams: Promise<Query> }) {
  await requireAdmin();
  const [collections, query] = await Promise.all([
    db.collection.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    }),
    searchParams,
  ]);
  const saved = typeof query.saved === "string" ? query.saved : "";

  return (
    <>
      <PageHeader title="Collections" description="Group products for the homepage and shop filters." />
      {saved === "collection" && <div className="mb-5"><Toast message="Collection saved." /></div>}
      {saved === "deleted" && <div className="mb-5"><Toast message="Collection deleted." /></div>}
      <Card className="mb-6 p-5">
        <h2 className="mb-4 font-semibold">Add collection</h2>
        <form action={saveCollection.bind(null, "new")} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FormField label="Name" htmlFor="new-collection-name">
            <Input id="new-collection-name" name="name" minLength={2} maxLength={80} required />
          </FormField>
          <FormField label="URL slug" htmlFor="new-collection-slug" hint="Use lowercase letters, numbers and hyphens.">
            <Input id="new-collection-slug" name="slug" pattern="[a-zA-Z0-9-]{2,80}" minLength={2} maxLength={80} required />
          </FormField>
          <FormField label="Display position" htmlFor="new-collection-position">
            <Input id="new-collection-position" name="position" type="number" min={0} max={1000} defaultValue={collections.length + 1} required />
          </FormField>
          <FormField label="Description" htmlFor="new-collection-description">
            <Input id="new-collection-description" name="description" minLength={2} maxLength={300} required />
          </FormField>
          <div className="sm:col-span-2 xl:col-span-4"><Button type="submit">Add collection</Button></div>
        </form>
      </Card>
      <div className="space-y-4">
        {collections.map((collection) => (
          <Card key={collection.id} className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">{collection.name}</h2>
              <p className="text-sm text-muted">{collection._count.products} assigned products</p>
            </div>
            <form action={saveCollection.bind(null, collection.id)} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FormField label="Name" htmlFor={`collection-name-${collection.id}`}>
                <Input id={`collection-name-${collection.id}`} name="name" defaultValue={collection.name} minLength={2} maxLength={80} required />
              </FormField>
              <FormField label="URL slug" htmlFor={`collection-slug-${collection.id}`}>
                <Input id={`collection-slug-${collection.id}`} name="slug" defaultValue={collection.slug} pattern="[a-zA-Z0-9-]{2,80}" minLength={2} maxLength={80} required />
              </FormField>
              <FormField label="Display position" htmlFor={`collection-position-${collection.id}`}>
                <Input id={`collection-position-${collection.id}`} name="position" type="number" min={0} max={1000} defaultValue={collection.position} required />
              </FormField>
              <FormField label="Description" htmlFor={`collection-description-${collection.id}`}>
                <Input id={`collection-description-${collection.id}`} name="description" defaultValue={collection.description} minLength={2} maxLength={300} required />
              </FormField>
              <div className="flex flex-wrap gap-3 sm:col-span-2 xl:col-span-4">
                <Button type="submit" variant="secondary">Save collection</Button>
                <ConfirmDialog action={deleteCollection.bind(null, collection.id)} message={`Delete ${collection.name} and remove its product assignments? Products themselves will remain.`}>
                  <Button type="submit" variant="danger">Delete collection</Button>
                </ConfirmDialog>
              </div>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}
