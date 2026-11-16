"use server";
import { z } from "zod";
import { db } from "@/lib/db";
import { allow } from "@/lib/ratelimit";
import { NEWSLETTER_CONSENT_VERSION } from "@/lib/legal";
export async function subscribe(_: unknown, fd: FormData) {
  if (!(await allow("news", 5, 3600))) return "Too many attempts. Try later.";
  if (fd.get("marketingConsent") !== "on") return "Please opt in to receive newsletter emails.";
  const e = z.string().email().safeParse(String(fd.get("email")).trim().toLowerCase()); if (!e.success) return "Enter a valid email.";
  await db.newsletterSubscriber.upsert({
    where: { email: e.data },
    update: { consentedAt: new Date(), consentVersion: NEWSLETTER_CONSENT_VERSION },
    create: { email: e.data, consentedAt: new Date(), consentVersion: NEWSLETTER_CONSENT_VERSION },
  });
  return "Thanks for subscribing. You can withdraw consent at any time from our marketing policy.";
}
export async function withdrawNewsletterConsent(_: unknown, fd: FormData) {
  if (!(await allow("news-unsubscribe", 10, 3600))) return "Too many attempts. Try again later.";
  const e = z.string().trim().email().safeParse(String(fd.get("email")).toLowerCase());
  if (!e.success) return "Enter a valid email address.";
  await db.newsletterSubscriber.deleteMany({ where: { email: e.data } });
  return "If that address had a newsletter signup, it has been removed.";
}
export async function submitReview(productId: string, _: unknown, fd: FormData) {
  if (!(await allow("review", 5, 3600))) return "Too many attempts. Try later.";
  const p = z.object({ phone: z.string().trim().regex(/^(\+?254|0)[17]\d{8}$/, "Enter the phone number you ordered with"), rating: z.coerce.number().int().min(1).max(5), body: z.string().trim().min(5).max(1000) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return p.error.issues[0].message;
  const c = await db.customer.findFirst({ where: { phone: p.data.phone, orders: { some: { status: "DELIVERED", items: { some: { productId } } } } } });
  if (!c) return "Reviews are open to customers with a delivered order of this product.";
  await db.productReview.create({ data: { productId, customerId: c.id, rating: p.data.rating, body: p.data.body, verifiedPurchase: true } });
  return "Thanks. Your review will appear after approval.";
}
