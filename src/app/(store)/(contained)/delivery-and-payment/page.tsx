import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Delivery and payment",
  description: "How delivery coverage, charges, timing, and payment are confirmed for orders.",
};
export const dynamic = "force-dynamic";

const paymentMethods = ["M-Pesa", "Cash on delivery", "Bank transfer"];

export default async function DeliveryAndPaymentPage() {
  const settings = await db.storeSettings.findUnique({
    where: { id: 1 },
    select: { deliveryAreas: true, deliveryEstimate: true },
  });

  return (
    <article className="mx-auto max-w-4xl py-10 sm:py-14">
      <p className="type-caption mb-3 font-semibold uppercase tracking-[0.16em] text-primary">Customer care</p>
      <h1 className="type-h1">Delivery and payment</h1>
      <p className="type-body mt-4 max-w-3xl text-muted">Delivery and payment details are confirmed with you before the store accepts an order.</p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="type-h3">Delivery coverage</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{settings?.deliveryAreas || "Enter your delivery address at checkout. The store will confirm whether delivery is available to your area before accepting the order."}</p>
        </section>
        <section className="border-t border-line pt-6">
          <h2 className="type-h3">Delivery charge and timing</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Checkout does not calculate or collect a delivery charge. The store will confirm any applicable charge and the estimated delivery timing with you. {settings?.deliveryEstimate ? `Current estimate: ${settings.deliveryEstimate}` : "No delivery time is promised until it has been confirmed for your order."}</p>
        </section>
        <section className="border-t border-line pt-6">
          <h2 className="type-h3">Payment methods</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Select your preferred method at checkout. The store will confirm the payment arrangement after reviewing your order. Payment is handled outside this website; checkout does not collect payment credentials.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {paymentMethods.map((method) => <li key={method} className="border border-line bg-white px-3 py-2 text-sm font-medium">{method}</li>)}
          </ul>
        </section>
        <aside className="border-l-4 border-primary bg-primary-soft p-4 text-sm leading-6 text-ink">
          Never share an M-Pesa PIN, bank password, card security code, or one-time password to place an order or receive a refund.
        </aside>
        <nav aria-label="Related customer care" className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-6 text-sm">
          <Link href="/how-to-order" className="font-semibold text-primary underline underline-offset-4">How to order</Link>
          <Link href="/shipping-policy" className="font-semibold text-primary underline underline-offset-4">Full shipping information</Link>
          <Link href="/return-policy" className="font-semibold text-primary underline underline-offset-4">Return Policy</Link>
        </nav>
      </div>
    </article>
  );
}
