"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
async function adminOnly() { const s = await requireAdmin(); if (s.role !== "ADMIN") throw new Error("Admins only"); return s; }
const done = () => revalidatePath("/", "layout");
export async function deleteImage(id: string) {
  await requireAdmin();
  const image = await db.productImage.delete({ where: { id }, select: { productId: true } });
  revalidatePath("/admin/products/[id]", "page");
  redirect(`/admin/products/${image.productId}?saved=image`);
}
export async function setProductArchived(id: string, isArchived: boolean) {
  await requireAdmin();
  await db.product.update({ where: { id }, data: { isArchived } });
  revalidatePath("/admin/products");
  redirect("/admin/products?saved=archive");
}
export async function createUser(fd: FormData) {
  await adminOnly();
  const d = z.object({ email: z.string().email().toLowerCase(), name: z.string().min(2), role: z.enum(["ADMIN", "STAFF"]), password: z.string().min(10) }).parse(Object.fromEntries(fd));
  await db.adminUser.create({ data: { email: d.email, name: d.name, role: d.role, passwordHash: await bcrypt.hash(d.password, 12) } }); done(); redirect("/admin/users?saved=user");
}
export async function setRole(id: string, fd: FormData) {
  const s = await adminOnly(); if (s.id === id) return;
  await db.adminUser.update({ where: { id }, data: { role: z.enum(["ADMIN", "STAFF"]).parse(fd.get("role")) } }); done(); redirect("/admin/users?saved=role");
}
export async function deleteUser(id: string) { const s = await adminOnly(); if (s.id !== id) await db.adminUser.delete({ where: { id } }); done(); redirect("/admin/users?saved=delete"); }
export async function createCode(fd: FormData) {
  await requireAdmin();
  const d = z.object({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,20}$/), percentOff: z.coerce.number().int().min(1).max(90), expiresAt: z.string().optional() }).parse(Object.fromEntries(fd));
  await db.discountCode.create({ data: { code: d.code, percentOff: d.percentOff, expiresAt: d.expiresAt ? new Date(d.expiresAt) : null } }); done(); redirect("/admin/marketing?saved=code#discount-codes");
}
export async function createCategory(fd: FormData) {
  await requireAdmin();
  const d = z.object({
    name: z.string().trim().min(2).max(80),
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,80}$/),
  }).parse(Object.fromEntries(fd));
  await db.productCategory.create({ data: d });
  done();
  redirect("/admin/categories?saved=category");
}
const collectionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,80}$/),
  description: z.string().trim().min(2).max(300),
  position: z.coerce.number().int().min(0).max(1000),
});
export async function saveCollection(id: string, fd: FormData) {
  await requireAdmin();
  const data = collectionSchema.parse(Object.fromEntries(fd));
  if (id === "new") await db.collection.create({ data });
  else await db.collection.update({ where: { id }, data });
  revalidatePath("/shop");
  done();
  redirect("/admin/collections?saved=collection");
}
export async function deleteCollection(id: string) {
  await requireAdmin();
  await db.collection.delete({ where: { id } });
  revalidatePath("/shop");
  done();
  redirect("/admin/collections?saved=deleted");
}
export async function toggleCode(id: string, active: boolean) { await requireAdmin(); await db.discountCode.update({ where: { id }, data: { active } }); done(); redirect("/admin/marketing?saved=code#discount-codes"); }
export async function addItem(kind: "banner" | "testimonial" | "faq", fd: FormData) {
  await requireAdmin(); const f = Object.fromEntries(fd) as Record<string, string>;
  if (kind === "banner") await db.promotionalBanner.create({ data: { title: z.string().min(2).parse(f.title), subtitle: f.subtitle || null, href: f.href || null } });
  if (kind === "testimonial") await db.testimonial.create({ data: { name: z.string().min(2).parse(f.name), body: z.string().min(5).parse(f.body) } });
  if (kind === "faq") await db.faq.create({ data: { question: z.string().min(3).parse(f.question), answer: z.string().min(3).parse(f.answer), position: await db.faq.count() } });
  done(); redirect("/admin/content?saved=content");
}
export async function delItem(kind: "banner" | "testimonial" | "faq" | "review", id: string) {
  await requireAdmin();
  if (kind === "banner") await db.promotionalBanner.delete({ where: { id } });
  if (kind === "testimonial") await db.testimonial.delete({ where: { id } });
  if (kind === "faq") await db.faq.delete({ where: { id } });
  if (kind === "review") await db.productReview.delete({ where: { id } });
  done(); redirect("/admin/content?saved=content");
}
export async function approveReview(id: string) { await requireAdmin(); await db.productReview.update({ where: { id }, data: { approved: true } }); done(); redirect("/admin/content?saved=review"); }
