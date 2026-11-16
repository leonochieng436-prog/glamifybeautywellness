import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "How to order",
  description: "How to place an order and confirm it with the store on WhatsApp.",
};
export const dynamic = "force-dynamic";

export default async function HowToOrderPage() {
  const settings = await db.storeSettings.findUnique({
    where: { id: 1 },
    select: { whatsappNumber: true, phone: true, email: true },
  });
  const digits = settings?.whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = digits ? `https://wa.me/${digits}` : null;

  return (
    <article className="mx-auto max-w-4xl py-10 sm:py-14">
      <p className="type-caption mb-3 font-semibold uppercase tracking-[0.16em] text-primary">Customer care</p>
      <h1 className="type-h1">How to order</h1>
      <p className="type-body mt-4 max-w-3xl text-muted">Browse the store, send your order request, and confirm the details with our team before dispatch.</p>

      <ol className="mt-8 space-y-4">
        {[
          ["Choose your products", <>Browse <Link href="/shop" className="font-semibold text-primary underline underline-offset-4">all products</Link>, select what you want, and add each item to your cart.</>],
          ["Enter your details", <>Review your cart and provide your name, phone number, delivery address, and preferred payment method at checkout.</>],
          ["Send the WhatsApp message", <>Submit checkout to create a pending order. Your browser will open a pre-filled WhatsApp message. Send it to the store so the team can review your request.</>],
          ["Wait for confirmation", <>The team confirms product availability, delivery coverage, any delivery charge, and timing with you. Your order is not accepted until the store confirms it.</>],
        ].map(([title, description], index) => (
          <li key={String(title)} className="grid gap-3 border border-line bg-white p-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-start">
            <span aria-hidden="true" className="grid h-10 w-10 place-items-center bg-primary-soft font-semibold text-primary">{index + 1}</span>
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-8 border-t border-line pt-6">
        <h2 className="type-h3">A few things to know</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
          <li>Checkout records an order request; it does not collect payment or calculate a delivery fee.</li>
          <li>Payment method, delivery charge, and delivery timing are agreed with the store before the order is accepted.</li>
          <li>Do not send an M-Pesa PIN, bank password, card security code, or one-time password in a message.</li>
        </ul>
        <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/delivery-and-payment" className="font-semibold text-primary underline underline-offset-4">Delivery and payment</Link>
          <Link href="/return-policy" className="font-semibold text-primary underline underline-offset-4">Return Policy</Link>
          {whatsappUrl && <a href={whatsappUrl} className="font-semibold text-primary underline underline-offset-4">Contact us on WhatsApp</a>}
          {settings?.phone && <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-primary underline underline-offset-4">Call the store</a>}
          <Link href="/contact" className="font-semibold text-primary underline underline-offset-4">Email the store</Link>
        </p>
      </section>
    </article>
  );
}
