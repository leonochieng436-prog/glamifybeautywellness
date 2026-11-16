import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Answers about ordering, payment, delivery, and customer support.",
};
export const dynamic = "force-dynamic";

const commonQuestions = [
  {
    question: "How do I place an order?",
    answer: <>Add products to your cart, enter your delivery details, and submit checkout. A pre-filled WhatsApp message opens for you to send to the store. See <Link href="/how-to-order" className="text-primary underline underline-offset-4">How to order</Link>.</>,
  },
  {
    question: "Is my order confirmed when I submit checkout?",
    answer: "No. Checkout creates a pending order request. The store confirms stock, delivery coverage, any delivery charge, and timing with you before accepting it.",
  },
  {
    question: "Which payment methods are available?",
    answer: "Checkout lets you select M-Pesa, cash on delivery, or bank transfer. The store will confirm the payment arrangement with you. This website does not process payments.",
  },
  {
    question: "How much does delivery cost and when will it arrive?",
    answer: <>Delivery availability, charges, and estimated timing are confirmed for each order. See <Link href="/delivery-and-payment" className="text-primary underline underline-offset-4">Delivery and payment</Link> for details.</>,
  },
  {
    question: "What if there is a problem with my order?",
    answer: <>Contact the store using your order conversation and include your order reference. See the <Link href="/return-policy" className="text-primary underline underline-offset-4">Return Policy</Link> for how to raise an issue.</>,
  },
];

export default async function FAQPage() {
  const faqs = await db.faq.findMany({ orderBy: { position: "asc" } });
  return (
    <article className="mx-auto max-w-4xl py-10 sm:py-14">
      <p className="type-caption mb-3 font-semibold uppercase tracking-[0.16em] text-primary">Customer care</p>
      <h1 className="type-h1">Frequently asked questions</h1>
      <p className="type-body mt-4 max-w-3xl text-muted">Find answers about ordering, payment, and delivery. Contact the store if you need help with a specific order.</p>

      {faqs.length > 0 && (
        <section className="mt-8">
          <h2 className="type-h3 mb-3">Store questions</h2>
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((faq) => (
              <details key={faq.id} className="py-4">
                <summary className="min-h-11 cursor-pointer py-2 font-semibold hover:text-primary">{faq.question}</summary>
                <p className="max-w-3xl pb-2 text-sm leading-6 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="type-h3 mb-3">Ordering and delivery</h2>
        <div className="divide-y divide-line border-y border-line">
          {commonQuestions.map((faq) => (
            <details key={faq.question} className="py-4">
              <summary className="min-h-11 cursor-pointer py-2 font-semibold hover:text-primary">{faq.question}</summary>
              <div className="max-w-3xl pb-2 text-sm leading-6 text-muted">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-6 text-sm text-muted">Still need help? Start with <Link href="/how-to-order" className="font-semibold text-primary underline underline-offset-4">How to order</Link> or review our <Link href="/delivery-and-payment" className="font-semibold text-primary underline underline-offset-4">delivery information</Link>.</p>
    </article>
  );
}
