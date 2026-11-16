"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useRecent, useWishlist } from "@/lib/store";
import { COOKIE_PREFERENCES_EVENT, readCookiePreferences } from "@/lib/cookie-consent";
export default function CardList({ source, title, empty }: { source: "wishlist" | "recent"; title?: string; empty?: string }) {
  const wishlistIds = useWishlist((s) => s.ids);
  const recentIds = useRecent((s) => s.ids);
  const [personalization, setPersonalization] = useState(false);
  const ids = source === "wishlist" ? wishlistIds : personalization ? recentIds : [];
  const [ps, setPs] = useState<any[] | null>(null); const [m, setM] = useState(false);
  useEffect(() => { setM(true); }, []);
  useEffect(() => {
    const refresh = () => setPersonalization(readCookiePreferences()?.personalization === true);
    refresh();
    window.addEventListener(COOKIE_PREFERENCES_EVENT, refresh);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, refresh);
  }, []);
  useEffect(() => { if (m) ids.length ? fetch(`/api/products?ids=${ids.join(",")}`).then((r) => r.json()).then(setPs) : setPs([]); }, [m, ids.join(",")]);
  if (!ps) return null; if (!ps.length) return empty ? <p>{empty}</p> : null;
  return <section className="mt-16">{title && <h2 className="type-h2 mb-6">{title}</h2>}<div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">{ps.map((p) => <ProductCard key={p.id} p={p} />)}</div></section>;
}
