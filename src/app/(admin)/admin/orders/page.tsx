import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { markPaid, setOrderStatus } from "@/app/admin/actions";
import { Card, DataTable, EmptyState, FormField, Input, PageHeader, Pagination, Select, StatusPill, Toast } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;
const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "DISPATCHED", "DELIVERED", "CANCELLED"] as const;
type Query = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => typeof value === "string" ? value : "";
const money = (amount: number) => `KES ${amount.toLocaleString("en-KE")}`;
const parseDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`)) ? new Date(`${value}T00:00:00`) : null;
const waPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `254${digits.slice(1)}` : digits;
};

export default async function Orders({ searchParams }: { searchParams: Promise<Query> }) {
  await requireAdmin();
  const query = await searchParams;
  const term = one(query.q).trim();
  const status = one(query.status);
  const payment = one(query.payment);
  const from = one(query.from);
  const to = one(query.to);
  const saved = one(query.saved);
  const start = parseDate(from);
  const end = parseDate(to);
  const invalidDate = Boolean((from && !start) || (to && !end));
  const requestedPage = Number(one(query.page));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const where: Prisma.OrderWhereInput = {};

  if (term) where.OR = [
    { reference: { contains: term, mode: "insensitive" } },
    { customer: { is: { phone: { contains: term } } } },
  ];
  if (STATUSES.includes(status as (typeof STATUSES)[number])) where.status = status as (typeof STATUSES)[number];
  if (payment === "PAID" || payment === "UNPAID") where.paymentStatus = payment;
  if (start || end) {
    where.createdAt = {};
    if (start) where.createdAt.gte = start;
    if (end) {
      const exclusiveEnd = new Date(end);
      exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
      where.createdAt.lt = exclusiveEnd;
    }
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.order.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const params = new URLSearchParams();
  if (term) params.set("q", term);
  if (status) params.set("status", status);
  if (payment) params.set("payment", payment);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const hrefFor = (nextPage: number) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("page", String(nextPage));
    return `/admin/orders?${nextParams.toString()}`;
  };
  const columns = [
    {
      key: "reference",
      header: "Order",
      render: (order: (typeof orders)[number]) => <div><p className="font-semibold text-primary">{order.reference}</p><p className="mt-1 whitespace-nowrap text-xs text-muted">{order.createdAt.toLocaleDateString("en-KE")}</p></div>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (order: (typeof orders)[number]) => <div><p className="font-medium">{order.customer.fullName}</p><p className="text-xs text-muted">{order.customer.phone}</p></div>,
    },
    { key: "items", header: "Items", render: (order: (typeof orders)[number]) => <span className="tabular-nums">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span> },
    { key: "total", header: "Total", render: (order: (typeof orders)[number]) => <span className="whitespace-nowrap font-semibold tabular-nums">{money(order.totalKes)}</span> },
    {
      key: "payment",
      header: "Payment",
      render: (order: (typeof orders)[number]) => <div className="space-y-1"><StatusPill status={order.status} /><StatusPill status={order.paymentStatus} /></div>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (order: (typeof orders)[number]) => {
        const whatsAppLink = `https://wa.me/${waPhone(order.customer.phone)}`;
        return (
          <details className="min-w-32">
            <summary className="min-h-11 cursor-pointer py-3 font-semibold text-primary hover:underline">View details</summary>
            <div className="min-w-[280px] space-y-4 border border-line bg-white p-4 shadow-lg sm:absolute sm:right-6 sm:z-10 sm:w-[min(42rem,calc(100vw-3rem))]">
              <div>
                <h3 className="font-semibold">Customer and delivery</h3>
                <p className="mt-1 text-sm">{order.customer.fullName} | {order.customer.phone}</p>
                <p className="text-sm text-muted">{order.address}, {order.town}, {order.county}</p>
                {order.instructions && <p className="mt-1 text-sm text-muted">Delivery note: {order.instructions}</p>}
              </div>
              <div>
                <h3 className="font-semibold">Items and totals</h3>
                <ul className="mt-1 space-y-1 text-sm">
                  {order.items.map((item) => <li key={item.id} className="flex justify-between gap-4"><span>{item.quantity} x {item.name}</span><span className="whitespace-nowrap tabular-nums">{money(item.unitPriceKes * item.quantity)}</span></li>)}
                </ul>
                <p className="mt-2 border-t border-line pt-2 text-sm font-semibold tabular-nums">Total: {money(order.totalKes)}</p>
                <p className="text-xs text-muted">Payment: {order.paymentMethod.replaceAll("_", " ")} | Terms accepted: {order.termsVersion ?? "not recorded"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Order timeline</h3>
                <ol className="mt-1 border-l border-line pl-3 text-sm">
                  <li>Order placed | {order.createdAt.toLocaleString("en-KE")}</li>
                  <li className="mt-1">Current status | {order.status.replaceAll("_", " ")}</li>
                </ol>
              </div>
              <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
                <form action={setOrderStatus.bind(null, order.id)} className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`status-${order.id}`}>Order status</label>
                  <Select id={`status-${order.id}`} name="status" defaultValue={order.status} className="min-w-[10rem]">
                    {STATUSES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
                  </Select>
                  <button type="submit" className="min-h-11 bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-dark">Update</button>
                </form>
                {order.paymentStatus === "UNPAID" && <form action={markPaid.bind(null, order.id)}><button type="submit" className="min-h-11 border border-line px-3 text-sm font-semibold hover:border-primary hover:text-primary">Record payment</button></form>}
                <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline">Message on WhatsApp</a>
              </div>
            </div>
          </details>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader title="Orders" description={`${total.toLocaleString("en-KE")} orders - manage fulfilment and payment status.`} />
      {saved && <div className="mb-5"><Toast message={saved === "payment" ? "Payment recorded." : "Order status updated."} /></div>}
      {invalidDate && <p role="alert" className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">Enter valid dates in YYYY-MM-DD format to filter orders.</p>}
      <Card className="mb-5 p-4">
        <form method="get" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <FormField label="Search" htmlFor="order-search"><Input id="order-search" name="q" defaultValue={term} placeholder="Reference or phone" /></FormField>
          <FormField label="Order status" htmlFor="order-status"><Select id="order-status" name="status" defaultValue={status}><option value="">All statuses</option>{STATUSES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</Select></FormField>
          <FormField label="Payment" htmlFor="order-payment"><Select id="order-payment" name="payment" defaultValue={payment}><option value="">All payments</option><option value="UNPAID">Unpaid</option><option value="PAID">Paid</option></Select></FormField>
          <FormField label="From" htmlFor="order-from"><Input id="order-from" name="from" type="date" defaultValue={from} /></FormField>
          <div className="flex items-end gap-2"><FormField label="To" htmlFor="order-to"><Input id="order-to" name="to" type="date" defaultValue={to} /></FormField><button type="submit" className="min-h-11 shrink-0 bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">Filter</button></div>
        </form>
      </Card>
      <Card>
        <DataTable
          rows={orders}
          rowKey={(order) => order.id}
          columns={columns}
          empty={<EmptyState title="No orders found" description="Orders that match your filters will appear here." />}
        />
        {total > 0 && <Pagination page={page} previous={page > 1 ? hrefFor(page - 1) : undefined} next={page < totalPages ? hrefFor(page + 1) : undefined} />}
      </Card>
    </>
  );
}
