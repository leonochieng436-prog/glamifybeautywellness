import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://glamifybeautywellness.vercel.app/";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/cart"] }, sitemap: `${base}/sitemap.xml` };
}
