import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Card, DataTable, EmptyState, PageHeader, StatCard, StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const money = (amount: number) => `KES ${amount.toLocaleString("en-KE")}`;
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default async function Dashboard() {
  await requireAdmin();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 13);

  const [products, orders, pending, confirmed, completed, sales, inventory, recentOrders, chartOrders] = await Promise.all([
    db.product.count({ where: { isArchived: false } }),
    db.order.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "CONFIRMED" } }),
    db.order.count({ where: { status: "DELIVERED" } }),
    db.order.aggregate({ _sum: { totalKes: true }, where: { paymentStatus: "PAID" } }),
    db.inventory.findMany({ where: { product: { isArchived: false } }, include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } } }),
    db.order.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { customer: true } }),
    db.order.findMany({ where: { createdAt: { gte: start }, paymentStatus: "PAID" }, select: { totalKes: true, createdAt: true } }),
  ]);

  const lowStock = inventory.filter((item) => item.quantity <= item.lowStockAt);
  const chartDays = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dateKey(date);
    const amount = chartOrders.filter((order) => dateKey(order.createdAt) === key).reduce((sum, order) => sum + order.totalKes, 0);
    return { date, amount };
  });
  const maximum = Math.max(...chartDays.map((day) => day.amount), 1);
  const points = chartDays.map((day, index) => `${36 + (index * 768) / 13},${176 - (day.amount / maximum) * 144}`).join(" ");

  const orderColumns = [
    { key: "reference", header: "Order", render: (order: (typeof recentOrders)[number]) => <Link href="/admin/orders" className="font-semibold text-primary hover:underline">{order.reference}</Link> },
    { key: "customer", header: "Customer", render: (order: (typeof recentOrders)[number]) => <span>{order.customer.fullName}</span> },
    { key: "date", header: "Date", render: (order: (typeof recentOrders)[number]) => <span className="whitespace-nowrap text-muted">{order.createdAt.toLocaleDateString("en-KE")}</span> },
    { key: "total", header: "Total", render: (order: (typeof recentOrders)[number]) => <span className="whitespace-nowrap font-medium tabular-nums">{money(order.totalKes)}</span> },
    { key: "status", header: "Status", render: (order: (typeof recentOrders)[number]) => <StatusPill status={order.status} /> },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="A quick overview of store activity and operations." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active products" value={products} />
        <StatCard label="All orders" value={orders} />
        <StatCard label="Pending orders" value={pending} />
        <StatCard label="Confirmed orders" value={confirmed} />
        <StatCard label="Completed orders" value={completed} />
        <StatCard label="Paid sales" value={money(sales._sum.totalKes ?? 0)} />
        <StatCard label="Low-stock products" value={lowStock.length} />
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold">Paid sales - last 14 days</h2>
            <span className="text-xs text-muted">Daily totals in KES</span>
          </div>
          <div role="img" aria-label="Line chart of daily paid sales for the last 14 days" className="overflow-x-auto">
            <svg viewBox="0 0 840 220" className="h-56 min-w-[600px] w-full" aria-hidden="true">
              {[32, 80, 128, 176].map((y) => <line key={y} x1="36" x2="804" y1={y} y2={y} stroke="rgb(209 213 219)" strokeDasharray="4 5" />)}
              <polyline points={points} fill="none" stroke="rgb(29 78 216)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              {chartDays.map((day, index) => {
                const x = 36 + (index * 768) / 13;
                const y = 176 - (day.amount / maximum) * 144;
                return <circle key={dateKey(day.date)} cx={x} cy={y} r="3.5" fill="rgb(29 78 216)" />;
              })}
              <text x="36" y="207" fill="rgb(75 85 99)" fontSize="11">{chartDays[0].date.toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</text>
              <text x="804" y="207" textAnchor="end" fill="rgb(75 85 99)" fontSize="11">{chartDays[13].date.toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</text>
            </svg>
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Low stock</h2>
            <Link href="/admin/products?stock=low" className="text-sm font-semibold text-primary hover:underline">View products</Link>
          </div>
          {lowStock.length ? (
            <ul className="divide-y divide-line">
              {lowStock.slice(0, 8).map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <Link href={`/admin/products/${item.productId}`} className="min-w-0 truncate font-medium hover:text-primary">{item.product.name}</Link>
                  <span className="shrink-0 tabular-nums text-muted">{item.quantity} left</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">No products are currently below their stock threshold.</p>}
        </Card>
      </div>

      <Card>
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-semibold">Recent orders</h2>
        </div>
        <DataTable
          rows={recentOrders}
          rowKey={(order) => order.id}
          columns={orderColumns}
          empty={<EmptyState title="No orders yet" description="New customer orders will appear here." />}
        />
      </Card>
    </>
  );
}
