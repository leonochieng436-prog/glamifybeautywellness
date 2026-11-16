import "../globals.css";
import Link from "next/link";
import { Manrope, Outfit } from "next/font/google";
import { db } from "@/lib/db";
import CartLink from "@/components/CartLink";
import SearchBox from "@/components/SearchBox";
import Footer from "@/components/Footer";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import { getBrand } from "@/lib/brand";
const display = Outfit({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["400", "500", "600", "700"] });
const body = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap", weight: ["400", "500", "600", "700"] });
export const metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"), title: { default: "Beauty & Wellness Store", template: "%s | Beauty & Wellness Store" }, description: "Pills, gummies and gels for your daily wellness routine.", openGraph: { type: "website" }, verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined };
export default async function Root({ children }: { children: React.ReactNode }) {
  const [s, categories] = await Promise.all([
    db.storeSettings.findUnique({ where: { id: 1 } }),
    db.productCategory.findMany({
      where: { slug: { in: ["pills", "gummies", "gels"] } },
      select: { name: true, slug: true },
    }),
  ]);
  const brand = await getBrand(s);
  const categoryOrder = ["pills", "gummies", "gels"];
  categories.sort((a, b) => categoryOrder.indexOf(a.slug) - categoryOrder.indexOf(b.slug));
  return (<html lang="en" className={`${display.variable} ${body.variable}`}><body>
    {s?.announcement && <div className="bg-black px-4 py-2 text-center text-sm text-white">{s.announcement}</div>}
    <header id="top" className="sticky top-0 z-40 mx-auto flex max-w-6xl items-center justify-between gap-3 bg-paper px-5 py-4 shadow-sm sm:gap-4 sm:py-5">
      <Link href="/" className="truncate font-display text-xl font-semibold sm:text-2xl">{s?.businessName ?? "Store"}</Link>
      <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-3 text-sm sm:gap-5"><SearchBox /><Link href="/shop" className="hover:text-primary">Shop</Link><Link href="/wishlist" className="hover:text-primary">Wishlist</Link><CartLink /></nav></header>
    {children}
    <Footer settings={s} categories={categories} brand={brand} />
    {s && <FloatingWhatsAppButton href={`https://wa.me/${s.whatsappNumber.replace(/\D/g, "")}`} />}
  </body></html>);
}
