import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createCode, toggleCode } from "@/app/admin/actions2";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { Button, Card, DataTable, EmptyState, FormField, Input, PageHeader, Pagination, StatusPill, Toast } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;
type Query = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => typeof value === "string" ? value : "";

export default async function Marketing({ searchParams }: { searchParams: Promise<Query> }) {
  await requireAdmin();
  const query = await searchParams;
  const requestedPage = Number(one(query.page));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const saved = one(query.saved);
  const subscriberWhere = { consentedAt: { not: null } };
  const [codes, subscribers, subscriberCount] = await Promise.all([
    db.discountCode.findMany({ orderBy: { createdAt: "desc" } }),
    db.newsletterSubscriber.findMany({
      where: subscriberWhere,
      orderBy: { consentedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.newsletterSubscriber.count({ where: subscriberWhere }),
  ]);
  const totalPages = Math.max(1, Math.ceil(subscriberCount / PAGE_SIZE));
  const columns = [
    { key: "code", header: "Code", render: (code: (typeof codes)[number]) => <span className="font-semibold">{code.code}</span> },
    { key: "discount", header: "Discount", render: (code: (typeof codes)[number]) => <span className="tabular-nums">{code.percentOff}%</span> },
    { key: "uses", header: "Uses", render: (code: (typeof codes)[number]) => <span className="tabular-nums">{code.usedCount}</span> },
    { key: "expires", header: "Expires", render: (code: (typeof codes)[number]) => code.expiresAt?.toLocaleDateString("en-KE") ?? "No expiry" },
    { key: "status", header: "Status", render: (code: (typeof codes)[number]) => <StatusPill status={code.active ? "ACTIVE" : "ARCHIVED"} /> },
    {
      key: "actions",
      header: "Actions",
      render: (code: (typeof codes)[number]) => {
        const action = toggleCode.bind(null, code.id, !code.active);
        const button = <Button type="submit" variant={code.active ? "danger" : "secondary"}>{code.active ? "Deactivate" : "Activate"}</Button>;
        return code.active
          ? <ConfirmDialog action={action} message={`Deactivate discount code ${code.code}?`}>{button}</ConfirmDialog>
          : <form action={action}>{button}</form>;
      },
    },
  ];

  return (
    <>
      <PageHeader title="Marketing" description="Manage discount codes and review newsletter opt-ins." />
      {saved === "code" && <div className="mb-5"><Toast message="Discount code updated." /></div>}
      <div className="space-y-6">
        <Card id="discount-codes" className="scroll-mt-24">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-semibold">Discount codes</h2>
            <p className="mt-1 text-sm text-muted">Create customer discount codes and control whether they can be used.</p>
          </div>
          <div className="p-5">
            <form action={createCode} className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Code" htmlFor="discount-code"><Input id="discount-code" name="code" required minLength={3} maxLength={20} pattern="[A-Za-z0-9]{3,20}" /></FormField>
              <FormField label="Percent off" htmlFor="discount-percent"><Input id="discount-percent" name="percentOff" type="number" min={1} max={90} required /></FormField>
              <FormField label="Expiry date" htmlFor="discount-expires" hint="Leave blank for no expiry."><Input id="discount-expires" name="expiresAt" type="date" /></FormField>
              <div className="flex items-end"><Button type="submit">Add discount code</Button></div>
            </form>
            <DataTable
              rows={codes}
              rowKey={(code) => code.id}
              columns={columns}
              empty={<EmptyState title="No discount codes" description="Add a code when you're ready to offer a promotion." />}
            />
          </div>
        </Card>

        <Card id="subscribers" className="scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-semibold">Newsletter subscribers</h2>
              <p className="mt-1 text-sm text-muted">{subscriberCount.toLocaleString("en-KE")} addresses with recorded consent.</p>
            </div>
            <Link href="/api/admin/subscribers" className="inline-flex min-h-11 items-center border border-line px-4 text-sm font-semibold hover:border-primary hover:text-primary">Export CSV</Link>
          </div>
          <p className="px-5 pt-4 text-sm text-muted">Only addresses with a recorded opt-in are shown. Newsletter sending is not configured in this app.</p>
          <DataTable
            rows={subscribers}
            rowKey={(subscriber) => subscriber.id}
            columns={[
              { key: "email", header: "Email", render: (subscriber: (typeof subscribers)[number]) => <span className="break-all">{subscriber.email}</span> },
              { key: "consented", header: "Consented", render: (subscriber: (typeof subscribers)[number]) => subscriber.consentedAt?.toLocaleString("en-KE") ?? "-" },
              { key: "version", header: "Consent version", render: (subscriber: (typeof subscribers)[number]) => subscriber.consentVersion ?? "-" },
            ]}
            empty={<EmptyState title="No consented subscribers" description="Subscribers who opt in will appear here." />}
          />
          {subscriberCount > 0 && <Pagination page={page} previous={page > 1 ? `/admin/marketing?page=${page - 1}#subscribers` : undefined} next={page < totalPages ? `/admin/marketing?page=${page + 1}#subscribers` : undefined} />}
        </Card>
      </div>
    </>
  );
}
