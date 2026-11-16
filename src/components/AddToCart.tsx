"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
export default function AddToCart({ item, disabled }: { item: { productId: string; slug: string; name: string; price: number }; disabled?: boolean }) {
  const add = useCart((s) => s.add);
  const [notice, setNotice] = useState<{ message: string } | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  return <>
    <button disabled={disabled} onClick={() => { add(item); setNotice({ message: `${item.name} added to cart` }); }} className="whitespace-nowrap bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark active:bg-primary-dark sm:px-5 sm:text-sm">{disabled ? "Out of stock" : "Add to cart"}</button>
    {notice && <div role="status" aria-live="polite" className="fixed bottom-24 right-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-4 border border-line bg-paper px-4 py-3 text-sm text-ink shadow-lg">
      <span>{notice.message}</span><Link href="/cart" className="shrink-0 font-semibold text-primary underline underline-offset-4">View cart</Link>
    </div>}
  </>;
}
