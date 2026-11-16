"use server";
import { z } from "zod";
import { db } from "@/lib/db";
import { allow } from "@/lib/ratelimit";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { LEGAL_POLICY_VERSION_FALLBACK } from "@/lib/legal";
import { sendStoreEmail } from "@/lib/resend";

const schema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^(\+?254|0)[17]\d{8}$/, "Enter a valid Kenyan phone number"),
  county: z.string().trim().min(2), town: z.string().trim().min(2),
  address: z.string().trim().min(5).max(200), instructions: z.string().trim().max(300).optional(),
  paymentMethod: z.enum(["MPESA", "COD", "BANK_TRANSFER"]),
  termsAccepted: z.boolean().refine((value) => value, "Accept the terms and conditions before placing an order."),
  code: z.string().trim().toUpperCase().optional(),
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().min(1).max(20) })).min(1),
});

export async function placeOrder(input: unknown) {
  const p = schema.safeParse(input);
  if (!p.success) return { ok: false as const, error: p.error.issues[0].message };
  const d = p.data;
  if (!(await allow("order", 10, 3600))) return { ok: false as const, error: "Too many orders from this connection. Try again later." };
  // Prices and stock always come from the database, never from the client.
  const products = await db.product.findMany({ where: { id: { in: d.items.map((i) => i.productId) }, isArchived: false }, include: { inventory: true } });
  const lines = [];
  for (const it of d.items) {
    const pr = products.find((x) => x.id === it.productId);
    if (!pr || (pr.inventory?.quantity ?? 0) < it.qty) return { ok: false as const, error: `${pr?.name ?? "An item"} is unavailable in that quantity.` };
    lines.push({ productId: pr.id, name: pr.name, qty: it.qty, unit: pr.discountPriceKes ?? pr.priceKes });
  }
  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
  const code = d.code ? await db.discountCode.findUnique({ where: { code: d.code } }) : null;
  if (d.code && (!code || !code.active || (code.expiresAt && code.expiresAt < new Date()))) return { ok: false as const, error: "That discount code is not valid." };
  const discount = code ? Math.round((subtotal * code.percentOff) / 100) : 0; const total = subtotal - discount;
  const reference = "ORD-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  const settings = await db.storeSettings.findUniqueOrThrow({ where: { id: 1 } });
  const customer = await db.customer.upsert({ where: { phone: d.phone }, update: { fullName: d.fullName }, create: { fullName: d.fullName, phone: d.phone } });
  await db.order.create({ data: {
    reference, customerId: customer.id, county: d.county, town: d.town, address: d.address, instructions: d.instructions,
    paymentMethod: d.paymentMethod, subtotalKes: subtotal, discountKes: discount, discountCode: code?.code, totalKes: total,
    termsVersion: settings.legalPolicyVersion || LEGAL_POLICY_VERSION_FALLBACK, termsAcceptedAt: new Date(),
    items: { create: lines.map((l) => ({ productId: l.productId, name: l.name, unitPriceKes: l.unit, quantity: l.qty })) },
  } }); if (code) await db.discountCode.update({ where: { id: code.id }, data: { usedCount: { increment: 1 } } }); // PENDING + UNPAID; stock is decremented only when an admin confirms the order.
  const notificationRecipient = settings.supportEmail || settings.email;
  if (notificationRecipient) {
    try {
      await sendStoreEmail({
        to: notificationRecipient,
        subject: `New order ${reference}`,
        text: [
          `A new order has been placed (${reference}).`,
          "",
          `Customer: ${d.fullName}`,
          `Phone: ${d.phone}`,
          `Delivery: ${d.address}, ${d.town}, ${d.county}`,
          `Payment method: ${d.paymentMethod.replace("_", " ")}`,
          "",
          "Items:",
          ...lines.map((line) => `${line.qty} x ${line.name} — KES ${(line.unit * line.qty).toLocaleString("en-KE")}`),
          "",
          `Subtotal: KES ${subtotal.toLocaleString("en-KE")}`,
          `Discount: KES ${discount.toLocaleString("en-KE")}`,
          `Total: KES ${total.toLocaleString("en-KE")}`,
          "",
          "This order is pending store confirmation.",
        ].join("\n"),
      });
    } catch (error) {
      console.error(`Failed to send Resend notification for order ${reference}.`, error);
    }
  } else {
    console.error(`No support or business email is configured for order notification ${reference}.`);
  }
  const url = buildWhatsAppUrl(settings.whatsappNumber, { brandName: settings.businessName, reference, lines, subtotal, discount, total,
    customer: { name: d.fullName, phone: d.phone, county: d.county, town: d.town, address: d.address, payment: d.paymentMethod.replace("_", " ") } });
  return { ok: true as const, url, reference };
}
