"use server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { allow } from "@/lib/ratelimit";
import { uploadImage } from "@/lib/cloudinary";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { COOKIE, createSession, requireAdmin } from "@/lib/auth";
import { getSocialStrings, isHttpsUrl } from "@/lib/socials";

export async function login(_: unknown, fd: FormData) {
  if (!(await allow("login", 5, 900))) return "Too many attempts. Try again in 15 minutes.";
  const u = await db.adminUser.findUnique({ where: { email: String(fd.get("email")).toLowerCase().trim() } });
  if (!u || !(await bcrypt.compare(String(fd.get("password")), u.passwordHash))) return "Wrong email or password.";
  await createSession(u.id, u.role); redirect("/admin");
}
export async function logout() { (await cookies()).delete(COOKIE); redirect("/admin/login"); }

const pSchema = z.object({
  name: z.string().trim().min(2), slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/), categoryId: z.string(),
  shortDescription: z.string().trim().min(3), description: z.string().trim().min(3),
  ingredients: z.string().trim().optional(), directions: z.string().trim().optional(),
  priceKes: z.coerce.number().int().min(1), discountPriceKes: z.coerce.number().int().min(1).optional().or(z.literal("").transform(() => undefined)),
  stock: z.coerce.number().int().min(0), imageUrl: z.string().url().optional().or(z.literal("")),
  collectionIds: z.array(z.string().trim().min(1)).max(50).default([]),
});
export type ProductActionState = { error?: string; fieldErrors?: Record<string, string> };
export async function saveProduct(id: string, _state: ProductActionState, fd: FormData): Promise<ProductActionState> {
  await requireAdmin();
  const parsed = pSchema.safeParse({
    ...Object.fromEntries(fd),
    collectionIds: fd.getAll("collectionIds"),
  });
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).flatMap(([field, messages]) =>
        messages?.[0] ? [[field, messages[0]]] : [],
      ),
    );
    return { error: "Review the highlighted fields and try again.", fieldErrors };
  }
  const d = parsed.data;
  const { stock, imageUrl, collectionIds, ...rest } = d;
  const collectionCount = await db.collection.count({ where: { id: { in: collectionIds } } });
  if (collectionCount !== new Set(collectionIds).size) {
    return { error: "Review the highlighted fields and try again.", fieldErrors: { collectionIds: "Choose valid collections." } };
  }
  const flags = { isFeatured: fd.has("isFeatured"), isBestSeller: fd.has("isBestSeller"), isArchived: fd.has("isArchived") };
  const data = { ...rest, ...flags, ingredients: rest.ingredients || null, directions: rest.directions || null, discountPriceKes: rest.discountPriceKes ?? null };
  let pid = id;
  if (id === "new") {
    pid = (await db.product.create({
      data: { ...data, collections: { connect: collectionIds.map((collectionId) => ({ id: collectionId })) }, inventory: { create: { quantity: 0 } } },
    })).id;
  } else {
    await db.product.update({
      where: { id },
      data: { ...data, collections: { set: collectionIds.map((collectionId) => ({ id: collectionId })) } },
    });
  }
  const inv = await db.inventory.upsert({ where: { productId: pid }, update: {}, create: { productId: pid } });
  if (inv.quantity !== stock) await db.$transaction([
    db.inventory.update({ where: { id: inv.id }, data: { quantity: stock } }),
    db.inventoryMovement.create({ data: { inventoryId: inv.id, type: "ADJUSTMENT", change: stock - inv.quantity, note: "Admin stock edit" } })]);
  if (imageUrl) { await db.productImage.deleteMany({ where: { productId: pid } }); await db.productImage.create({ data: { productId: pid, url: imageUrl, alt: data.name } }); }
  for (const f of fd.getAll("images") as File[]) if (f.size) await db.productImage.create({ data: { productId: pid, url: await uploadImage(f), alt: data.name, position: Date.now() % 1000000 } });
  revalidatePath("/", "layout"); redirect("/admin/products?saved=product");
}

const RESERVED = ["CONFIRMED", "PROCESSING", "DISPATCHED", "DELIVERED"];
export async function setOrderStatus(id: string, fd: FormData) {
  await requireAdmin();
  const next = z.enum(["PENDING", "CONFIRMED", "PROCESSING", "DISPATCHED", "DELIVERED", "CANCELLED"]).parse(fd.get("status"));
  await db.$transaction(async (tx) => {
    const o = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    const was = RESERVED.includes(o.status), will = RESERVED.includes(next);
    if (was !== will) for (const it of o.items) {
      const inv = await tx.inventory.findUniqueOrThrow({ where: { productId: it.productId } });
      const change = will ? -it.quantity : it.quantity;
      if (inv.quantity + change < 0) throw new Error(`Not enough stock for ${it.name}`);
      await tx.inventory.update({ where: { id: inv.id }, data: { quantity: { increment: change } } });
      await tx.inventoryMovement.create({ data: { inventoryId: inv.id, type: will ? "RESERVED" : "RELEASED", change, orderId: o.id, note: o.reference } });
    }
    await tx.order.update({ where: { id }, data: { status: next } });
  });
  revalidatePath("/admin", "layout");
  redirect("/admin/orders?saved=status");
}
export async function markPaid(id: string) { await requireAdmin(); await db.order.update({ where: { id }, data: { paymentStatus: "PAID" } }); revalidatePath("/admin/orders"); redirect("/admin/orders?saved=payment"); }

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  const socialUrl = z.string().trim().max(2048).refine((value) => !value || isHttpsUrl(value), "Enter a valid HTTPS URL.");
  const s = z.object({
    businessName: z.string().trim().min(2),
    whatsappNumber: z.string().trim().regex(/^\+?\d{10,15}$/, "Use digits with country code, e.g. 254712345678"),
    phone: z.string().trim().regex(/^\+?\d{10,15}$/, "Use an international phone number, e.g. +254738783355"),
    email: z.union([z.string().trim().email(), z.literal("")]),
    location: z.string().trim().max(200).optional(),
    businessHours: z.string().trim().max(200).optional(),
    announcement: z.string().optional(),
    deliveryChargeKes: z.coerce.number().int().min(0).optional().or(z.literal("").transform(() => undefined)),
    logoUrl: z.string().optional(),
    facebook: socialUrl,
    instagram: socialUrl,
  }).parse(Object.fromEntries(fd));
  const current = await db.storeSettings.findUniqueOrThrow({ where: { id: 1 }, select: { socials: true } });
  const socials = getSocialStrings(current.socials);
  socials.facebook = s.facebook;
  socials.instagram = s.instagram;
  await db.storeSettings.update({
    where: { id: 1 },
    data: {
      businessName: s.businessName,
      whatsappNumber: s.whatsappNumber,
      phone: s.phone,
      email: s.email || null,
      location: s.location || null,
      businessHours: s.businessHours || null,
      announcement: s.announcement || null,
      deliveryChargeKes: s.deliveryChargeKes ?? null,
      logoUrl: s.logoUrl || null,
      socials,
    },
  });
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=settings");
}

export async function saveLegalSettings(fd: FormData) {
  const session = await requireAdmin();
  if (session.role !== "ADMIN") throw new Error("Admins only");

  const optionalText = z.string().trim().max(800).transform((value) => value || null);
  const optionalEmail = z.union([z.string().trim().email(), z.literal("")]).transform((value) => value || null);
  const d = z.object({
    legalName: optionalText,
    tradingName: optionalText,
    registrationDetails: optionalText,
    physicalAddress: optionalText,
    supportEmail: optionalEmail,
    privacyEmail: optionalEmail,
    deliveryAreas: optionalText,
    deliveryEstimate: optionalText,
    returnPeriod: optionalText,
    refundTimeline: optionalText,
    orderRetention: optionalText,
    newsletterRetention: optionalText,
    reviewRetention: optionalText,
    securityRetention: optionalText,
    legalPolicyVersion: z.string().trim().min(1).max(40),
    legalEffectiveDate: z.string().refine(
      (value) => !value || !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)),
      "Enter a valid effective date.",
    ),
  }).parse(Object.fromEntries(fd));

  await db.storeSettings.update({
    where: { id: 1 },
    data: {
      legalName: d.legalName,
      tradingName: d.tradingName,
      registrationDetails: d.registrationDetails,
      physicalAddress: d.physicalAddress,
      supportEmail: d.supportEmail,
      privacyEmail: d.privacyEmail,
      deliveryAreas: d.deliveryAreas,
      deliveryEstimate: d.deliveryEstimate,
      returnPeriod: d.returnPeriod,
      refundTimeline: d.refundTimeline,
      orderRetention: d.orderRetention,
      newsletterRetention: d.newsletterRetention,
      reviewRetention: d.reviewRetention,
      securityRetention: d.securityRetention,
      legalPolicyVersion: d.legalPolicyVersion,
      legalEffectiveDate: d.legalEffectiveDate ? new Date(`${d.legalEffectiveDate}T00:00:00.000Z`) : null,
    },
  });

  revalidatePath("/", "layout");
  for (const path of [
    "/legal",
    "/terms-and-conditions",
    "/privacy-policy",
    "/cookie-policy",
    "/returns-and-refunds",
    "/shipping-policy",
    "/marketing-policy",
  ]) revalidatePath(path);
  redirect("/admin/settings?saved=legal");
}
