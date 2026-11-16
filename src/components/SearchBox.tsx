"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
export default function SearchBox() {
  const [q, setQ] = useState(""); const [r, setR] = useState<{ name: string; slug: string }[]>([]);
  useEffect(() => { const t = setTimeout(() => q.trim().length > 1 ? fetch(`/api/search?q=${encodeURIComponent(q)}`).then((x) => x.json()).then(setR) : setR([]), 250); return () => clearTimeout(t); }, [q]);
  return (<form action="/shop" className="relative hidden sm:block"><input name="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search products" className="w-44 border border-line bg-paper px-4 py-1.5 text-sm" autoComplete="off" />
    {r.length > 0 && <ul className="absolute z-20 mt-1 w-64 border border-line bg-paper shadow-lg">{r.map((p) => <li key={p.slug}><Link href={`/product/${p.slug}`} onClick={() => setQ("")} className="block px-4 py-2 text-sm hover:bg-primary-soft">{p.name}</Link></li>)}</ul>}</form>);
}
