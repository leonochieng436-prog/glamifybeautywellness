import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://glamifybeautywellness.vercel.app/"; const ps = await db.product.findMany({ where: { isArchived: false }, select: { slug: true, updatedAt: true } });
  return [
    { url: base },
    { url: `${base}/shop` },
    { url: `${base}/how-to-order` },
    { url: `${base}/faq` },
    { url: `${base}/delivery-and-payment` },
    { url: `${base}/return-policy` },
    ...ps.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
