"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useEffect, useState } from "react";
export default function CartLink() {
  const n = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const [m, setM] = useState(false); useEffect(() => setM(true), []);
  return <Link href="/cart" className="flex items-center gap-1 hover:text-primary" aria-label={`Cart${n > 0 ? `, ${n} items` : ""}`}><ShoppingBag size={20} />{m && n > 0 && <span className="bg-primary px-1.5 text-xs text-white">{n}</span>}</Link>;
}
