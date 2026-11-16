"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useCart } from "@/lib/cart";
import { placeOrder } from "@/app/actions";
export default function Cart() {
  const { items, setQty, remove, clear } = useCart();
  const [m, setM] = useState(false); useEffect(() => setM(true), []);
  const [err, setErr] = useState(""); const [pending, start] = useTransition();
  if (!m) return null;
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  if (!items.length) return <div className="py-24 text-center"><p className="type-h2 mb-4">Your cart is empty</p><Link href="/shop" className="font-semibold text-primary underline underline-offset-4">Continue shopping</Link></div>;
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    start(async () => {
      const r = await placeOrder({ ...f, termsAccepted: f.termsAccepted === "true", items: items.map((i) => ({ productId: i.productId, qty: i.qty })) });
      if (!r.ok) return setErr(r.error);
      clear(); window.location.href = r.url;
    });
  }
  const inp = "w-full border border-line px-3 py-2";
  return (<div className="grid md:grid-cols-2 gap-10 pt-6">
    <section><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="type-h2">Your cart</h1><Link href="/shop" className="font-semibold text-primary underline underline-offset-4">Continue shopping</Link></div>
      {items.map((i) => <div key={i.productId} className="flex items-center justify-between border-b border-line py-3">
        <div><p className="font-semibold">{i.name}</p><p className="tabular-nums text-sm text-muted">KES {i.price.toLocaleString("en-KE")}</p></div>
        <div className="flex items-center gap-2"><button aria-label="Decrease" onClick={() => setQty(i.productId, i.qty - 1)}>−</button><span>{i.qty}</span><button aria-label="Increase" onClick={() => setQty(i.productId, i.qty + 1)}>+</button><button className="ml-3 text-sm underline" onClick={() => remove(i.productId)}>Remove</button></div></div>)}
      <p className="mt-4 text-lg font-semibold tabular-nums">Subtotal: KES {total.toLocaleString("en-KE")}</p><p className="text-sm text-muted">Delivery is confirmed by the store. Orders are subject to confirmation.</p></section>
    <form onSubmit={submit} className="space-y-3"><h2 className="type-h3">Delivery details</h2>
      <input name="fullName" required placeholder="Full name" className={inp} /><input name="phone" required placeholder="Phone, e.g. 0712345678" className={inp} />
      <div className="grid grid-cols-2 gap-3"><input name="county" required placeholder="County" className={inp} /><input name="town" required placeholder="Town or estate" className={inp} /></div>
      <input name="address" required placeholder="Delivery address" className={inp} /><textarea name="instructions" placeholder="Delivery instructions (optional)" className={inp} />
      <input name="code" placeholder="Discount code (optional)" className={inp} />
      <select name="paymentMethod" className={inp}><option value="MPESA">M-Pesa</option><option value="COD">Cash on delivery</option><option value="BANK_TRANSFER">Bank transfer</option></select>
      <label className="flex items-start gap-3 border border-line p-3 text-sm">
        <input name="termsAccepted" type="checkbox" value="true" required className="mt-1 accent-primary" />
        <span>I agree to the <Link className="font-semibold text-primary underline underline-offset-4" href="/terms-and-conditions">Terms and Conditions</Link> and have been given access to the <Link className="font-semibold text-primary underline underline-offset-4" href="/privacy-policy">Privacy Policy</Link>.</span>
      </label>
      {err && <p role="alert" className="border border-line bg-primary-soft px-3 py-2 text-sm text-ink">{err}</p>}
      <button disabled={pending} className="w-full bg-primary py-3 font-semibold text-white hover:bg-primary-dark">{pending ? "Preparing order…" : "Checkout via WhatsApp"}</button></form></div>);
}
